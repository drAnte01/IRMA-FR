//pages/dashboard.tsx
import style from "../styles/dashboard/dashboard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUtensils, faMartiniGlassCitrus } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import AccountSummary from "../components/accountSummary/accountSummary";
import Button from "../components/button/button";
import { CategoryAPI_URL } from "../api/category";
import { ItemAPI_URL } from "../api/item";
import PopUp from "../components/popup/popUp";
import Message from "../components/Ui/Mesage";
import type { ICategory, IFormData, IItem, IPopUp } from "../interface/interface";
import Table from "../components/table/table";
import { useFetch } from "../hooks/useFetch";
import { useCreate } from "../hooks/useCreate";
import { useDelete } from "../hooks/useDelete";
import { useUpdate } from "../hooks/useUpdate";
import { createNewCategoryPopup, editCategoryPopup, createNewItemPopup, editItemPopup } from "../components/template/popupTemplates";
import { confirmMessage, deleteErrorMessage, deleteSuccessMessage, errorMessage, successMessage, updateErrorMessage, updateSuccessMessage } from "../components/template/messageTemplates";
import { filterItemsByActiveType } from "../help/customFunctions";

library.add(faUtensils, faMartiniGlassCitrus);

function Dashboard() {
    const [Active, setActive] = useState<"food" | "drink">("food");
    const [activeFilter, setActiveFilter] = useState<string>("All");
    const { data: categoryData, loading: categoryLoading, error: categoryError, refetch: refetchCategories } = useFetch<ICategory[]>(`${CategoryAPI_URL}`, Active); // Fetch categories
    const { data: itemData, loading: itemLoading, error: itemError, refetch: refetchItems } = useFetch<IItem[]>(`${ItemAPI_URL}`, activeFilter); // Fetch items
    const { createNewData, loading: _creating, error: _createError } = useCreate<any>(); // Create 
    const { deleteData, loading: _deleting, error: _deleteError } = useDelete();   // Delete
    const { updateData, loading: _updating, error: _updateError } = useUpdate<any>(); // Update
    const [MessageProps, setMessageProps] = useState<{ isVisible: number, title: string; content: string, status: "success" | "error" | " " }>({ isVisible: 0, title: "", content: "", status: " " });

    const [isPopUpOpen, setIsPopUpOpen] = useState<boolean>(false);
    const [popupInfo, setPopupInfo] = useState<IPopUp>({
        title: "",
        type: Active,
        labels: { name: "", type: "", description: "", price: "", imageUrl: "" },
        onSubmit: undefined,
        confirmClick: undefined,
        options: [""],
        content: "",
    });
    const currentId = useRef<number>(0)

    const ClosePopup = () => { setIsPopUpOpen(false); }

    /* SET FILTER TO DEFAULT VALUE */
    useEffect(() => {
        setActiveFilter("All");
    }, [Active]);

    /* >>> CRUD OPERATIONS FOR CATEGORY <<< */
    const createNewCategory = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            ...createNewCategoryPopup(Active as "food" | "drink"),
            onSubmit: async (data: ICategory) => {
                if (data.name) {
                    try {
                        await createNewData(CategoryAPI_URL, {
                            name: data.name,
                            type: Active
                        });
                        setMessageProps({
                            ...successMessage("category"),
                            isVisible: MessageProps.isVisible + 1,
                        });
                        setIsPopUpOpen(false);
                        await refetchCategories();
                    } catch (err) {
                        setMessageProps({
                            ...errorMessage("category"),
                            isVisible: MessageProps.isVisible + 1,
                        });
                        setIsPopUpOpen(false);
                    }
                }
            }
        });

    }
    const deleteCategory = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            ...confirmMessage("category"),
            confirmClick: async () => {
                try {
                    await deleteData(CategoryAPI_URL, currentId.current);
                    setMessageProps({
                        ...deleteSuccessMessage("category"),
                        isVisible: MessageProps.isVisible + 1,
                    });
                    setIsPopUpOpen(false);
                    await refetchCategories();
                } catch (err) {
                    setMessageProps({
                        ...deleteErrorMessage("category"),
                        isVisible: MessageProps.isVisible + 1,
                    });
                    setIsPopUpOpen(false);
                }
            },
        });
    }
    const updateCategory = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            ...editCategoryPopup(Active as "food" | "drink"),
            onSubmit: async (data: ICategory) => {
                try {
                    await updateData(CategoryAPI_URL, currentId.current, {
                        name: data.name,
                        type: Active
                    });
                    setMessageProps({
                        ...updateSuccessMessage("category"),
                        isVisible: MessageProps.isVisible + 1,
                    });
                    setIsPopUpOpen(false);
                    await refetchCategories();
                } catch (err) {
                    setMessageProps({
                        ...updateErrorMessage("category"),
                        isVisible: MessageProps.isVisible + 1,
                    });
                    setIsPopUpOpen(false);
                }
            },
        });
    }

    /* >>> CRUD OPERATIONS FOR ITEM <<< */
    const createNewItem = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            ...createNewItemPopup(categoryData ? categoryData.filter((category: ICategory) => category.type === Active) : []),
            onSubmit: async (data: IItem) => {
                if (data.name)
                    try {
                        await createNewData(ItemAPI_URL, {
                            name: data?.name,
                            price: data?.price,
                            description: data?.description,
                            imageUrl: data?.imageUrl,
                            categoryId: data?.categoryId
                        });
                        setMessageProps({
                            ...successMessage("item"),
                            isVisible: MessageProps.isVisible + 1,
                        });
                        setIsPopUpOpen(false);
                        await refetchItems();
                    } catch (err) {
                        setMessageProps({
                            ...errorMessage("item"),
                            isVisible: MessageProps.isVisible + 1,
                        });
                        setIsPopUpOpen(false);
                    }
            }
        });
    }

    const deleteItem = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            ...confirmMessage("item"),
            confirmClick: async () => {
                try {
                    await deleteData(ItemAPI_URL, currentId.current);
                    setMessageProps({
                        ...deleteSuccessMessage("item"),
                        isVisible: MessageProps.isVisible + 1,
                    });
                    setIsPopUpOpen(false);
                    await refetchItems();
                }
                catch (err) {
                    setMessageProps({
                        ...deleteErrorMessage("item"),
                        isVisible: MessageProps.isVisible + 1,
                    });
                    setIsPopUpOpen(false);
                }
            }
        });
    }

    const updateItem = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            ...editItemPopup(categoryData ? categoryData.filter((category: ICategory) => category.type === Active) : []),
            onSubmit: async (data: IItem) => {
                try {
                    await updateData(ItemAPI_URL, currentId.current, {
                        name: data.name,
                        price: data.price,
                        description: data.description,
                        imageUrl: data.imageUrl,
                        categoryId: data.categoryId
                    });
                    setMessageProps({
                        ...updateSuccessMessage("item"),
                        isVisible: MessageProps.isVisible + 1,
                    });
                    setIsPopUpOpen(false);
                    await refetchItems();
                } catch (err) {
                    setMessageProps({
                        ...updateErrorMessage("item"),
                        isVisible: MessageProps.isVisible + 1,
                    });
                    setIsPopUpOpen(false);
                }
            },
        });
    }
    return (
        <>
            <div className={style.dashboard}>
                <AccountSummary />
                <Message isVisible={MessageProps.isVisible} message={MessageProps.status} messageDetails={MessageProps} />
                <PopUp select={popupInfo.select} content={popupInfo.content} options={popupInfo.options} confirmClick={async () => await popupInfo.confirmClick?.()} onSubmit={async (data: IFormData) => await popupInfo.onSubmit?.(data)} title={popupInfo.title} labels={popupInfo.labels} closemodal={ClosePopup} status={isPopUpOpen} input={popupInfo.input} type={popupInfo.type} />
                <div className={style.itemsContainer}>
                    <div className={style.tabs}>
                        <div className={`${style.tab} ${Active === "food" ? style.active : ""}`} onClick={() => { setActive("food") }}><h2><FontAwesomeIcon icon={faUtensils}></FontAwesomeIcon> Food</h2></div>
                        <div className={`${style.tab} ${Active === "drink" ? style.active : ""}`} onClick={() => { setActive("drink") }}><h2><FontAwesomeIcon icon={faMartiniGlassCitrus}></FontAwesomeIcon> Drink</h2></div>
                    </div>

                    <div className={style.categoryTable}>
                        <h2>Category   <Button onClick={() => createNewCategory()} variant="add" size="medium">Add+</Button></h2>
                        <div className={style.tableWrapper}>



                            <Table<ICategory> size="xs" data={categoryData ? categoryData : []} columns={[
                                { header: "ID", render: (_row: ICategory, rowIndex: number) => (rowIndex + 1), textalignment: "center", headerAlignment: "center" },
                                { header: "Name", accessor: "name", textalignment: "center", headerAlignment: "center" },
                                {
                                    header: "Actions", render: (row: ICategory) => (
                                        <div className={style.actionButton}>
                                            <Button onClick={() => { updateCategory(); currentId.current = row.id!; setPopupInfo(prev => ({ ...prev, input: { name: row.name }, type: Active })) }} variant="edit" size="small">Edit</Button>
                                            <Button onClick={() => { deleteCategory(); currentId.current = row.id!; setPopupInfo(prev => ({ ...prev, input: { name: row.name }, type: Active })) }} variant="delete" size="small">Delete</Button>
                                        </div>
                                    ), textalignment: "left", headerAlignment: "center"
                                },

                            ]
                            }
                            />
                            {categoryLoading && <p>Loading categories...</p>}
                            {categoryError && <p className={style.error}>Error loading categories: {categoryError.message}</p>}
                        </div>
                    </div>
                    <div className={style.itemsTable}>
                        <div className={style.itemsNavigationBar}>
                            <h2>Items </h2>
                            <Button onClick={() => createNewItem()} variant="add" size="medium">Add</Button>
                            <input type="text" name="search" id="search" placeholder="Search items" />
                        </div>
                        <div className={style.filterOptions}>
                            <Button onClick={() => setActiveFilter(() => "All")} variant="filter" size="small" className={activeFilter === "All" ? style.activeFilter : ""}>All</Button>
                            {categoryData ? categoryData.filter((category) => category.type === Active).map((category) => (
                                <Button key={category.id} onClick={() => { setActiveFilter(() => category.name!); console.log("KLIKNUO SI NA: " + category.name) }} className={activeFilter === category.name ? style.activeFilter : ""} variant="filter" size="small" >{category.name}</Button>
                            )) : null}
                        </div>
                        <div className={style.tableWrapper}>

                            <Table<IItem> size="l" data={itemData ? filterItemsByActiveType(itemData, categoryData, Active) : []} columns={[
                                { header: "ID", render: (_row: IItem, rowIndex: number) => (rowIndex + 1), textalignment: "center", headerAlignment: "center" },
                                { header: "Image", render: (row: IItem) => <img src={row.imageUrl} alt={row.name} />, textalignment: "center", headerAlignment: "center" },
                                { header: "Name", accessor: "name", textalignment: "center", headerAlignment: "center" },
                                { header: "Category", accessor: "categoryName", textalignment: "center", headerAlignment: "center" },
                                { header: "Description", accessor: "description", textalignment: "left", headerAlignment: "center" },
                                { header: "Price", render: (row: IItem) => <span>{row.price} BAM</span>, textalignment: "center", headerAlignment: "center" },
                                {
                                    header: "Actions", render: (row: IItem) => (
                                        <div className={style.actionButton}>
                                            <Button onClick={() => { updateItem(); currentId.current = row.id!; setPopupInfo(prev => ({ ...prev, select: categoryData ? categoryData.filter(c => c.type === Active) : [], input: { name: row.name, description: row.description, price: row.price, imageUrl: row.imageUrl, categoryId: row.categoryId ?? categoryData?.find(c => c.name === row.categoryName)?.id }, type: Active })) }} variant="edit" size="small">Edit</Button>
                                            <Button onClick={() => { deleteItem(); currentId.current = row.id!; setPopupInfo(prev => ({ ...prev, input: { name: row.name }, type: Active })) }} variant="delete" size="small">Delete</Button>
                                        </div>
                                    ), textalignment: "left", headerAlignment: "center"
                                }

                            ]
                            }
                            />
                            {itemLoading && <p>Loading items...</p>}
                            {itemError && <p className={style.error}>Error loading items: {itemError.message}</p>}
                        </div>


                    </div>
                </div>
            </div >



        </>
    );
}
export default Dashboard;