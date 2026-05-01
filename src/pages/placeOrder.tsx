//pages/placeOrder.tsx

import { useParams } from "react-router-dom";
import style from "../styles/pages/placeOrder.module.css"
import Tab from "../components/tab/tab";
import { useFetch } from "../hooks/useFetch";
import type { ICategory, IItem, IOrder } from "../interface/interface";
import OrderCard from "../components/card/orderCard";
import { useEffect, useMemo, useRef, useState } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUtensils, faMartiniGlassCitrus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../components/button/button"
import PopUp from "../components/popup/popUp";
import { CategoryAPI_URL, ItemAPI_URL, GetCategories, GetItems, getActiveOrder, OrderAPI_URL } from "../help/enpoints";
import { useCreate } from "../hooks/useCreate";
import { useUpdate } from "../hooks/useUpdate";
import { useDelete } from "../hooks/useDelete";
import { clearDebounceTimer, enqueueOrderMutation, formatDateTime24, scheduleDebouncedMutation, type DebounceTimerMap } from "../help/customFunctions";
import { jsPDF } from "jspdf";

library.add(faUtensils, faMartiniGlassCitrus, faTrash);

type InvoiceSnapshot = {
    orderId: number;
    table?: string;
    createdAt?: string;
    paidAt?: string;
    subtotal?: string;
    taxAmount?: string;
    totalPrice?: string;
    items: IOrder["orderItems"];
};

function PlaceOrder() {
    const { tableName } = useParams();
    //const [activeFilter, setActiveFilter] = useState<string>("All");
    const [Active, setActive] = useState<"food" | "drink">("food");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
    const { data: categoryData, loading: categoryLoading, error: categoryError, refetch: _refetchCategories } = useFetch<ICategory[]>(GetCategories(CategoryAPI_URL, Active)); // Fetch categories
    const { data: itemData, loading: _itemLoading, error: _itemError, refetch: _refetchItems } = useFetch<IItem[]>(GetItems(ItemAPI_URL, "All")); // Fetch items
    const { data: orderData, loading: orderLoading, error: orderError, refetch: refetchOrders } = useFetch<IOrder>(getActiveOrder(OrderAPI_URL, tableName || "")); // Fetch Orders  
    const { createNewData: createNewOrder, loading: _creating, error: _createError } = useCreate<any>(); // Create 
    const { updateData: updateOrderItem, loading: _updating, error: _updateError } = useUpdate<any>(); // Update order item quantity
    const { deleteData: deleteOrderItem, loading: _deleting, error: _deleteError } = useDelete(); // Delete order item
    const updateQueueRef = useRef<Promise<void>>(Promise.resolve());
    const quantityDebounceTimersRef = useRef<DebounceTimerMap>({});
    const [isInvoicePopupOpen, setIsInvoicePopupOpen] = useState(false);
    const [invoiceSnapshot, setInvoiceSnapshot] = useState<InvoiceSnapshot | null>(null);
    const [isPaying, setIsPaying] = useState(false);

    // Render order items in a stable order to avoid UI jumps when backend returns items in a different sequence.
    const stableOrderItems = useMemo(() => {
        return [...(orderData?.orderItems ?? [])].sort((a, b) => Number(a.id ?? 0) - Number(b.id ?? 0));
    }, [orderData?.orderItems]);
    const isCartEmpty = stableOrderItems.length === 0;

    useEffect(() => {
        return () => {
            Object.keys(quantityDebounceTimersRef.current).forEach((key) => {
                clearDebounceTimer(quantityDebounceTimersRef.current, Number(key));
            });
        };
    }, []);

    async function createOrder(quantity: number, itemId: number) {
        try {
            await createNewOrder(OrderAPI_URL, {
                orderItem: {
                    itemId: itemId,
                    quantity: quantity
                },
                order: {
                    table: tableName
                }
            });
            refetchOrders();
        } catch (error) {
            console.error("Error adding to cart:", error);
        }
    }

    //order payment and closing logic
    async function closeOrder(orderId: number, status: string, invoicePdf: { pdfBase64: string; fileName?: string }) {
        if (!orderId) return;

        try {
            await updateOrderItem(`${OrderAPI_URL}/close`, orderId, {
                status,
                pdfBase64: invoicePdf.pdfBase64,
                fileName: invoicePdf.fileName,
            });
            refetchOrders();
        } catch (error) {
            console.error("URL: ", `${OrderAPI_URL}/${orderId}/close`);
            console.error("Something went wrong:", error);
        }
    }

    async function updateItemsQuantity(orderId: number, itemId: number, newQuantity: number) {
        if (!orderId || !itemId) return;

        scheduleDebouncedMutation(quantityDebounceTimersRef.current, itemId, 220, () => {
            enqueueOrderMutation(updateQueueRef, async () => {
                try {
                    if (newQuantity <= 0) {
                        await deleteOrderItem(`${OrderAPI_URL}/${orderId}/item`, itemId);
                    } else {
                        await updateOrderItem(`${OrderAPI_URL}/${orderId}/item`, itemId, { quantity: newQuantity });
                    }

                    await refetchOrders();
                } catch (error) {
                    console.error("Error updating item quantity:", error);
                }
            });
        });
    }

    async function deleteItemFromOrder(orderId: number, itemId: number) {
        if (!orderId || !itemId) return;

        clearDebounceTimer(quantityDebounceTimersRef.current, itemId);

        enqueueOrderMutation(updateQueueRef, async () => {
            try {
                await deleteOrderItem(`${OrderAPI_URL}/${orderId}/item`, itemId);
                await refetchOrders();
            } catch (error) {
                console.error("Error deleting item from order:", error);
            }
        });
    }

    function arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const chunkSize = 0x8000;

        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode(...chunk);
        }

        return btoa(binary);
    }

    async function buildInvoicePdfBase64(snapshot: InvoiceSnapshot): Promise<string> {
        const doc = new jsPDF({ unit: "mm", format: "a4" });
        const left = 14;
        let cursorY = 16;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("IRMA Invoice", left, cursorY);

        cursorY += 10;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Order: #${snapshot.orderId}`, left, cursorY);
        cursorY += 6;
        doc.text(`Table: ${snapshot.table ?? tableName ?? "-"}`, left, cursorY);
        cursorY += 6;
        doc.text(`Created: ${formatDateTime24(snapshot.createdAt)}`, left, cursorY);
        cursorY += 6;
        doc.text(`Paid: ${formatDateTime24(snapshot.paidAt)}`, left, cursorY);
        cursorY += 8;

        doc.setFont("helvetica", "bold");
        doc.text("Item", left, cursorY);
        doc.text("Qty", 145, cursorY);
        doc.text("Price", 175, cursorY);
        cursorY += 4;
        doc.line(left, cursorY, 196, cursorY);
        cursorY += 6;

        doc.setFont("helvetica", "normal");
        (snapshot.items ?? []).forEach((item) => {
            if (cursorY > 270) {
                doc.addPage();
                cursorY = 20;
            }

            const itemName = item.itemName ?? "Unknown item";
            const qty = String(item.quantity ?? 0);
            const price = `${item.price ?? 0} BAM`;

            doc.text(itemName, left, cursorY);
            doc.text(qty, 147, cursorY);
            doc.text(price, 175, cursorY);
            cursorY += 6;
        });

        cursorY += 4;
        doc.line(left, cursorY, 196, cursorY);
        cursorY += 8;
        doc.setFont("helvetica", "bold");
        doc.text(`Subtotal: ${snapshot.subtotal ?? "0"} BAM`, left, cursorY);
        cursorY += 6;
        doc.text(`Tax: ${snapshot.taxAmount ?? "0"} BAM`, left, cursorY);
        cursorY += 6;
        doc.text(`Total: ${snapshot.totalPrice ?? "0"} BAM`, left, cursorY);

        const pdfArrayBuffer = doc.output("arraybuffer");
        return arrayBufferToBase64(pdfArrayBuffer);
    }

    async function handlePayClick() {
        if (isCartEmpty || isPaying) return;

        const orderId = Number(orderData?.order?.id ?? 0);
        if (!orderId) return;

        const snapshot: InvoiceSnapshot = {
            orderId,
            table: orderData?.order?.table,
            createdAt: orderData?.order?.createdAt,
            paidAt: new Date().toISOString(),
            subtotal: orderData?.order?.subtotal,
            taxAmount: orderData?.order?.taxAmount,
            totalPrice: orderData?.order?.totalPrice,
            items: stableOrderItems,
        };

        setInvoiceSnapshot(snapshot);
        setIsPaying(true);

        try {
            const pdfBase64 = await buildInvoicePdfBase64(snapshot);
            await closeOrder(orderId, "paid", {
                pdfBase64,
                fileName: `racun-${orderId}.pdf`,
            });
            setIsInvoicePopupOpen(true);
        } catch (error) {
            console.error("Failed to close order with invoice PDF:", error);
            alert("Placanje nije uspjelo. PDF nije sacuvan na backend-u.");
        } finally {
            setIsPaying(false);
        }
    }

    async function handlePrintInvoice() {
        if (!invoiceSnapshot?.orderId) return;

        window.print();
        setIsInvoicePopupOpen(false);
    }

    return (
        <>
            <div className={style.PlaceOrder}>
                <div className={style.orderDetails}>
                    <div className={style.categoryList}>
                        <div className={style.tabs}>
                            <Tab value="food" onclick={() => { setActive("food"); setSelectedCategoryId(undefined); }} active={Active}><FontAwesomeIcon icon={faUtensils}></FontAwesomeIcon> Food</Tab>
                            <Tab value="drink" onclick={() => { setActive("drink"); setSelectedCategoryId(undefined); }} active={Active}><FontAwesomeIcon icon={faMartiniGlassCitrus}></FontAwesomeIcon> Drink</Tab>
                        </div>
                        <div className={style.categories}>
                            {categoryData && categoryData.filter((category) => category.type === Active).map((category, i) => (
                                <OrderCard
                                    itemsCount={itemData?.filter((item) => item.categoryName === category.name).length}
                                    key={category.id}
                                    name={category.name}
                                    selected={selectedCategoryId === category.name}
                                    onSelect={() => setSelectedCategoryId(category.name)}
                                    inputId={`category-${category.id}`}
                                    index={i}
                                />
                            ))}
                        </div>
                        {categoryLoading && <p>Loading categories...</p>}
                        {categoryError && <p>Error loading categories: {categoryError.message}</p>}
                    </div>
                    <div className={style.line}></div>
                    <div className={style.itemList}>
                        {itemData && itemData.filter((item) => item.categoryName === selectedCategoryId).map((item) => (
                            <OrderCard
                                key={item.id}
                                name={item.name}
                                price={item.price}
                                itemID={item.id}
                                cardValue={createOrder}
                            />
                        ))}
                    </div>
                </div>
                <div className={style.orderSummary}>
                    <div className={style.billToPay}>
                        <div className={style.orderHeader}>
                            <div className={style.row}><p>Order ID: {orderData?.order?.id == 0 ? "order not created yet" : orderData?.order?.id}</p></div>
                            <div className={style.row}><p>Waiter: {orderData?.order?.createdAt}</p></div>
                            <div className={style.row}><p>Date: {formatDateTime24(orderData?.order?.createdAt)}</p></div>
                        </div>
                        <div className={style.orderBody}>
                            <div className={style.orderTitle}><p>Order Details</p></div>
                            <div className={style.orderItems}>
                                {stableOrderItems.map((order) => {
                                    // Backend can return either itemId or id for the order-item route parameter.
                                    const orderItemId = Number(order.itemId ?? order.id ?? 0);
                                    const orderId = Number(orderData?.order?.id ?? 0);
                                    const currentQuantity = Number(order.quantity ?? 0);

                                    return (
                                        <div key={orderItemId || order.id} className={style.orderItem}>
                                            <div className={style.orderRow}>
                                                <span>{order.itemName}</span>
                                                <span>x{order.quantity}</span>
                                            </div>
                                            <div className={style.orderRow}>
                                                <span className={style.deleteIcon}>
                                                    <FontAwesomeIcon icon={faTrash} onClick={() => { deleteItemFromOrder(orderId, orderItemId) }} />
                                                </span>
                                                <div className={style.itemCount}>
                                                    <span
                                                        className={style.itemDecrement}
                                                        onClick={() => {
                                                            updateItemsQuantity(orderId, orderItemId, currentQuantity - 1);
                                                        }}
                                                    >
                                                        -
                                                    </span>
                                                    <span
                                                        className={style.itemIncrement}
                                                        onClick={() => {
                                                            updateItemsQuantity(orderId, orderItemId, currentQuantity + 1);
                                                        }}
                                                    >
                                                        +
                                                    </span>
                                                </div>
                                                <span>{order.price} BAM</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {orderLoading && <p>Loading orders...</p>}
                                {orderError && <p>Error loading orders: {orderError.message}</p>}
                            </div>
                        </div>
                        <div className={style.orderFooter}>
                            <div className={style.priceDetails}>
                                <div className={style.row}><p>Items: {orderData?.order?.subtotal} <span>BAM</span></p></div>
                                <div className={style.row}><p>Tax: {orderData?.order?.taxAmount} <span>BAM</span></p></div>
                                <div className={style.row}><p>Total with Tax: {orderData?.order?.totalPrice} <span>BAM</span></p></div>
                            </div>
                            <div className={style.actionSection}>
                                <Button onClick={handlePayClick} disabled={isCartEmpty || isPaying} variant="pay" size="large">{isPaying ? "Processing..." : "Pay"}</Button>


                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PopUp
                status={isInvoicePopupOpen}
                closemodal={() => setIsInvoicePopupOpen(false)}
                title="Invoice"
            >
                <div className={style.invoiceReceipt}>
                    <div className={style.invoiceMeta}>
                        <p><strong>Order:</strong> #{invoiceSnapshot?.orderId ?? "-"}</p>
                        <p><strong>Table:</strong> {invoiceSnapshot?.table ?? tableName ?? "-"}</p>
                        <p><strong>Created:</strong> {formatDateTime24(invoiceSnapshot?.createdAt)}</p>
                        <p><strong>Paid:</strong> {formatDateTime24(invoiceSnapshot?.paidAt)}</p>
                    </div>

                    <div className={style.invoiceList}>
                        {(invoiceSnapshot?.items ?? []).map((item) => (
                            <div key={item.id ?? item.itemId} className={style.invoiceRow}>
                                <span>{item.itemName}</span>
                                <span>x{item.quantity}</span>
                                <span>{item.price} BAM</span>
                            </div>
                        ))}
                    </div>

                    <div className={style.invoiceTotals}>
                        <p>Items: {invoiceSnapshot?.subtotal ?? "0"} BAM</p>
                        <p>Tax: {invoiceSnapshot?.taxAmount ?? "0"} BAM</p>
                        <p><strong>Total: {invoiceSnapshot?.totalPrice ?? "0"} BAM</strong></p>
                    </div>

                    <button className={style.printInvoiceButton} onClick={handlePrintInvoice}>Print PDF</button>
                </div>
            </PopUp>
        </>
    );
}

export default PlaceOrder;