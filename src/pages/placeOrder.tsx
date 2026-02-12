//pages/placeOrder.tsx

import { useParams } from "react-router-dom";
import style from "../styles/pages/placeOrder.module.css"
import Tab from "../components/tab/tab";
import { useFetch } from "../hooks/useFetch";
import { CategoryAPI_URL, ItemAPI_URL } from "../api/API";
import type { ICategory, IItem, IOrder } from "../interface/interface";
import OrderCard from "../components/card/orderCard";
import { useState } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUtensils, faMartiniGlassCitrus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../components/button/button"

library.add(faUtensils, faMartiniGlassCitrus);

function PlaceOrder() {
    const { tableId } = useParams();
    const [activeFilter, setActiveFilter] = useState<string>("All");
    const [Active, setActive] = useState<"food" | "drink">("food");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
    const { data: categoryData, loading: categoryLoading, error: categoryError, refetch: refetchCategories } = useFetch<ICategory[]>(`${CategoryAPI_URL}`, Active); // Fetch categories
    const { data: itemData, loading: _itemLoading, error: _itemError, refetch: _refetchItems } = useFetch<IItem[]>(`${ItemAPI_URL}`, activeFilter); // Fetch items
    //const { data: orderData, loading: orderLoading, error: orderError, refetch: refetchOrders } = useFetch<IOrder[]>(`${ItemAPI_URL}`, activeFilter); // Fetch Orders


    console.log("oznaceno je : ", selectedCategoryId);

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
                        {itemData && itemData.filter((item) => item.categoryName === selectedCategoryId).map((item, i) => (
                            <OrderCard
                                key={item.id}
                                name={item.name}
                                index={i}
                                price={item.price}
                            />
                        ))}
                    </div>
                </div>
                <div className={style.orderSummary}>
                    <div className={style.billToPay}>
                        <div className={style.orderHeader}></div>
                        <div className={style.orderBody}>
                            <div className={style.orderTitle}><p>Order Details</p></div>
                        </div>
                        <div className={style.orderFooter}>
                            <div className={style.priceDetails}>
                                <div className={style.row}><p>Items: </p></div>
                                <div className={style.row}><p>Tax: </p></div>
                                <div className={style.row}><p>Total with Tax: </p></div>
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