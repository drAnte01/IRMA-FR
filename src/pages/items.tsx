//pages/items.tsx
import "../App.css"
import Tab from "../components/tab/tab";
import style from "../styles/pages/items.module.css";
import { useState } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUtensils, faMartiniGlassCitrus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CategoryAPI_URL, ItemAPI_URL } from "../api/API";
import type { ICategory } from "../interface/interface";
import { useFetch } from "../hooks/useFetch";
import type { IItem } from "../interface/interface";
import Button from "../components/button/button";
import Card from "../components/card/card";
import { filterItemsByActiveType } from "../help/customFunctions";


library.add(faUtensils, faMartiniGlassCitrus);

function Items() {

    const [activeFilter, setActiveFilter] = useState<string>("All");
    const [Active, setActive] = useState<"food" | "drink">("food");
    const { data: categoryData, loading: categoryLoading, error: categoryError, refetch: refetchCategories } = useFetch<ICategory[]>(`${CategoryAPI_URL}`, Active); // Fetch categories
    const { data: itemData, loading: itemLoading, error: itemError, refetch: refetchItems } = useFetch<IItem[]>(`${ItemAPI_URL}`, activeFilter); // Fetch items

    return (
        <>
            <div className="itemsSection">
                <div className={style.tabs}>
                    <Tab value="food" onclick={() => setActive("food")} active={Active}><FontAwesomeIcon icon={faUtensils}></FontAwesomeIcon> Food</Tab>
                    <Tab value="drink" onclick={() => setActive("drink")} active={Active}><FontAwesomeIcon icon={faMartiniGlassCitrus}></FontAwesomeIcon> Drink</Tab>
                </div>
                <div className={style.filterSection}>
                    <div className={style.filterOptions}>
                        <Button onClick={() => setActiveFilter(() => "All")} variant="filter" size="small" className={activeFilter === "All" ? style.activeFilter : ""}>All</Button>
                        {categoryData ? categoryData.filter((category) => category.type === Active).map((category) => (
                            <Button key={category.id} onClick={() => { setActiveFilter(() => category.name!); console.log("KLIKNUO SI NA: " + category.name) }} className={activeFilter === category.name ? style.activeFilter : ""} variant="filter" size="small" >{category.name}</Button>
                        )) : null}
                    </div>
                    <div className={style.searchItems}><input type="text" name="search" id="search" placeholder="Search items" />
                    </div>
                </div>
                <div className={style.cardSection}>
                    {itemLoading && <p>Loading items...</p>}
                    {itemError && <p>Error loading items: {itemError.message}</p>}
                    {!itemLoading && !itemError && itemData && itemData.length === 0 && <p>No items found.</p>}
                    {!itemLoading && !itemError && itemData && filterItemsByActiveType(itemData, categoryData, Active).map((item) => (
                        <Card
                            key={item.id}
                            imageUrl={item.imageUrl}
                            title={item.name}
                            description={item.description}
                            price={item.price}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
export default Items;