//pages/placeOrder.tsx

import { useParams } from "react-router-dom";
import style from "../styles/pages/placeOrder.module.css"
import Tab from "../components/tab/tab";
import { useFetch } from "../hooks/useFetch";
import type { ICategory, IItem, IOrder } from "../interface/interface";
import OrderCard from "../components/card/orderCard";
import { useState } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUtensils, faMartiniGlassCitrus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../components/button/button"
import { CategoryAPI_URL, ItemAPI_URL, GetCategories, GetItems, getActiveOrder, OrderAPI_URL } from "../help/enpoints";
import { useCreate } from "../hooks/useCreate";

library.add(faUtensils, faMartiniGlassCitrus, faTrash);

function PlaceOrder() {
    const { tableName } = useParams();
    //const [activeFilter, setActiveFilter] = useState<string>("All");
    const [Active, setActive] = useState<"food" | "drink">("food");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
    const { data: categoryData, loading: categoryLoading, error: categoryError, refetch: refetchCategories } = useFetch<ICategory[]>(GetCategories(CategoryAPI_URL, Active)); // Fetch categories
    const { data: itemData, loading: _itemLoading, error: _itemError, refetch: _refetchItems } = useFetch<IItem[]>(GetItems(ItemAPI_URL, "All")); // Fetch items
    const { data: orderData, loading: orderLoading, error: orderError, refetch: refetchOrders } = useFetch<IOrder>(getActiveOrder(OrderAPI_URL, tableName || "")); // Fetch Orders  
    const { createNewData: createNewOrder, loading: _creating, error: _createError } = useCreate<any>(); // Create 

    async function createOrder(quantity: number, itemId: number) {
        console.log("Kolicina: ", quantity, " Item ID: ", itemId, "tablename: ", tableName);
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
                            <div className={style.row}><p>Order ID: {orderData?.order?.id}</p></div>
                            <div className={style.row}><p>Waiter: {orderData?.order?.createdAt}</p></div>
                            <div className={style.row}><p>Date: {orderData?.order?.createdAt}</p></div>
                        </div>
                        <div className={style.orderBody}>
                            <div className={style.orderTitle}><p>Order Details</p></div>
                            <div className={style.orderItems}>
                                {orderData?.orderItems && orderData.orderItems.map((order) => (
                                    <div key={order.id} className={style.orderItem}>
                                        <div className={style.orderRow}><span>{order.itemName}</span><span>x{order.quantity}</span></div>
                                        <div className={style.orderRow}><span className={style.deleteIcon}><FontAwesomeIcon icon={faTrash} /></span> <span>{order.price} BAM</span></div>
                                    </div>
                                ))}
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
                                <Button variant="pay" size="large">Pay</Button>


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PlaceOrder;