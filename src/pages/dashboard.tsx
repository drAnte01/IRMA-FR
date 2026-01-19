//pages/dashboard.tsx
import style from "../styles/dashboard/dashboard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUtensils, faMartiniGlassCitrus } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import AccountSummary from "../components/dashboard/accountSummary";
import Button from "../components/dashboard/button";
import { getAllCategories, CreateCategory, DeleteCategory, UpdateCategory } from "../api/category";
import { CreateItem, getAllItems } from "../api/item";
import PopUp from "../components/dashboard/popUp";
import Message from "../components/Ui/Mesage";
import type { ICategory, IFormData, IItem, IMessage, IPopUp } from "../interface/interface";

library.add(faUtensils, faMartiniGlassCitrus);

function Dashboard() {
    const [activeFilter, setActiveFilter] = useState<string>("All");
    const [Active, setActive] = useState<"food" | "drink">("food");
    const [isloading, setIsloading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isPopUpOpen, setIsPopUpOpen] = useState<boolean>(false);
    const [fetchData, setFetchData] = useState<number>(0);
    const [messageStatus, setMessageStatus] = useState<"success" | "error" | " ">(" ");
    const [showMessage, setShowMessage] = useState<number>(0);
    const [messageDetails, setMessageDetails] = useState<IMessage>({
        title: "",
        content: "",
    });
    const [popupInfo, setPopupInfo] = useState<IPopUp>({
        title: "",
        type: Active,
        labels: { name: "", type: "", description: "" },
        onSubmit: undefined,
        confirmClick: undefined,
        options: [""],
        content: "",
    });
    const currentId = useRef<number>(0)

    const ClosePopup = () => { setIsPopUpOpen(false); }

    /* FETCHING CATEGORY DATA */
    useEffect(() => {
        const fetchAllData = async () => {
            setIsloading(true);
            try {
                const [categoriesData, itemsData] = await Promise.all([
                    getAllCategories(),
                    getAllItems()
                ]);
                setCategories(categoriesData);
                setItems(itemsData);
            } catch (error) {
                console.log(error);
                setError("Failed to fetch data");
            } finally {
                setIsloading(false);
            }
        };

        fetchAllData();
    }, [fetchData]);



    /* SET FILTER TO DEFAULT VALUE */
    useEffect(() => {
        setActiveFilter("All");
    }, [Active]);

    /* >>> CATEGORY CRUD OPERATIONS <<< */
    /* CREATING NEW CATEGORY */
    const createNewCategory = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            title: "Add new Category",
            labels: {
                name: "Category Name",
                type: "Category Type"
            },
            type: Active,
            onSubmit: async (data: ICategory) => {
                if (data.name)
                    await handleSubmit({
                        name: data?.name,
                        type: Active
                    });
            }

        });
    }
    const handleSubmit = async (categoryData: ICategory) => {
        try {
            await CreateCategory(categoryData);
            setMessageStatus("success")
            setShowMessage((prev) => prev + 1)
            setMessageDetails({
                title: "success",
                content: "Category successfuly added"
            });
            setFetchData((prev) => prev + 1)
            setIsPopUpOpen(false);
        } catch (error) {
            setMessageStatus("error")
            setError("Something went wrong");
            setShowMessage((prev) => prev + 1)
            setMessageDetails({
                title: "error",
                content: "Could not add category, press f12 to see more..."
            });
            setIsPopUpOpen(false);
        }
    };

    /* DELETING CATEGORY */
    const deleteCategory = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            content: "Are you Sure you want to Delete this category?",
            options: ["Yes", "No"],
            confirmClick: async () => {
                await handleDeleteCategory(currentId.current);
            },
        });
    }
    const handleDeleteCategory = async (id: number) => {
        try {
            await DeleteCategory(id)
            setMessageStatus("success")
            setShowMessage((prev) => prev + 1)
            setMessageDetails({
                title: "success",
                content: "Category successfuly deleted"
            });
            setFetchData((prev) => prev + 1)
            setIsPopUpOpen(false);
        }
        catch (error) {
            setMessageStatus("error")
            setError("Something went wrong:" + error);
            setShowMessage((prev) => prev + 1)
            setMessageDetails({
                title: "error",
                content: "Could not delete category, press f12 to see more..."
            });
            setIsPopUpOpen(false);
        }
    }

    /* UPDATING CATEGORY */
    const updateCategory = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            title: "Update category",
            labels: {
                name: "Category Name",
                type: "Category Type"
            },
            type: Active,
            onSubmit: async (data: ICategory) => {
                await handleupdateCategory(currentId.current, {
                    name: data.name,
                    type: Active
                });
            }
        });
    }

    const handleupdateCategory = async (id: number, categoryData: ICategory) => {
        try {
            await UpdateCategory(id, categoryData)
            setMessageStatus("success")
            setShowMessage((prev) => prev + 1)
            setMessageDetails({
                title: "success",
                content: "Category successfuly updated"
            });
            setFetchData((prev) => prev + 1)
            setIsPopUpOpen(false);
        }
        catch (error) {
            setMessageStatus("error")
            setError("Something went wrong:" + error);
            setShowMessage((prev) => prev + 1)
            setMessageDetails({
                title: "error",
                content: "Could not update category, press f12 to see more..."
            });
            setIsPopUpOpen(false);
        }
    }

    /* >>> ITEM CRUD OPERATIONS <<< */
    /* CREATING NEW ITEM */
    const createNewItem = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            title: "Add new Item",
            labels: {
                name: "Item Name",
                type: "Category",
                description: "Description",
                price: "Price",
                imageUrl: "Image URL"
            },
            select: categories.filter((category) => category.type === Active),
            onSubmit: async (data: IItem) => {
                if (data.name)
                    await handleCreateNewItem({
                        name: data?.name,
                        price: data?.price,
                        description: data?.description,
                        imageUrl: data?.imageUrl,
                        categoryId: data?.categoryId
                    });
            }
        });
    }
    const handleCreateNewItem = async (itemData: IItem) => {
        console.log("categoryId: " + itemData.categoryId + " name: " + itemData.name + " desc: " + itemData.description + " price: " + itemData.price + " imageUrl: " + itemData.imageUrl);
        try {
            await CreateItem(itemData);
            setMessageStatus("success")
            setShowMessage((prev) => prev + 1)
            setMessageDetails({
                title: "success",
                content: "Item successfuly added"
            });
            setFetchData((prev) => prev + 1)
            setIsPopUpOpen(false);
        } catch (error) {
            setMessageStatus("error")
            setError("Something went wrong");
            setShowMessage((prev) => prev + 1)
            setMessageDetails({
                title: "error",
                content: "Could not add item, press f12 to see more..."
            });
            setIsPopUpOpen(false);
        }
    };

    return (
        <>
            <div className={style.dashboard}>
                <AccountSummary />
                <Message isVisible={showMessage} message={messageStatus} messageDetails={messageDetails} />
                <PopUp select={popupInfo.select} content={popupInfo.content} options={popupInfo.options} confirmClick={async () => await popupInfo.confirmClick?.()} onSubmit={async (data: IFormData) => await popupInfo.onSubmit?.(data)} title={popupInfo.title} labels={popupInfo.labels} closemodal={ClosePopup} status={isPopUpOpen} input={popupInfo.input} type={popupInfo.type} />
                <div className={style.itemsContainer}>
                    <div className={style.tabs}>
                        <div className={`${style.tab} ${Active === "food" ? style.active : ""}`} onClick={() => { setActive("food") }}><h2><FontAwesomeIcon icon={faUtensils}></FontAwesomeIcon> Food</h2></div>
                        <div className={`${style.tab} ${Active === "drink" ? style.active : ""}`} onClick={() => { setActive("drink") }}><h2><FontAwesomeIcon icon={faMartiniGlassCitrus}></FontAwesomeIcon> Drink</h2></div>
                    </div>

                    <div className={style.categoryTable}>
                        <h2>Category   <Button onClick={() => createNewCategory()} variant="add" size="medium">Add+</Button></h2>
                        <div className={style.tableWrapper}>
                            <table className={style.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Category</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {isloading ? (
                                        <>
                                            <tr><td colSpan={3}>Loading...</td></tr>
                                        </>
                                    ) : error ? (
                                        <>
                                            <tr><td colSpan={3}>{error}</td></tr>
                                        </>
                                    ) : (
                                        <>
                                            {categories.filter((category) => category.type === Active).map((category, index) => (
                                                <tr key={category.id} >
                                                    <td>{index + 1}</td>
                                                    <td>{category.name}</td>
                                                    <td>
                                                        <div className={style.actionButton}>
                                                            <Button onClick={() => { updateCategory(); currentId.current = category.id; setPopupInfo(prev => ({ ...prev, input: category.name, type: Active })) }} variant="edit" size="small">Edit</Button>
                                                            <Button onClick={() => { deleteCategory(); currentId.current = category.id; setPopupInfo(prev => ({ ...prev, input: category.name, type: Active })) }} variant="delete" size="small">Delete</Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </tbody>
                            </table>
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
                            {categories.filter((category) => category.type === Active).map((category) => (
                                <Button key={category.id} onClick={() => setActiveFilter(() => category.name)} className={activeFilter === category.name ? style.activeFilter : ""} variant="filter" size="small" >{category.name}</Button>
                            ))}
                        </div>
                        <div className={style.tableWrapper}>
                            <table className={style.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Description</th>
                                        <th>Price</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {isloading ? (
                                        <>
                                            <tr><td colSpan={7}>Loading...</td></tr>
                                        </>
                                    ) : error ? (
                                        <>
                                            <tr><td colSpan={7}>{error}</td></tr>
                                        </>
                                    ) : (
                                        <>
                                            {items.map((item, index) => (
                                                <tr key={item.id} >
                                                    <td>{index + 1}</td>
                                                    <td> <img src={item.imageUrl} alt={item.name} /></td>
                                                    <td>{item.name}</td>
                                                    <td>{item.categoryId}</td>
                                                    <td>{item.description}</td>
                                                    <td>{item.price}</td>
                                                    <td>
                                                        <div className={style.actionButton}>
                                                            <Button onClick={() => { updateCategory(); currentId.current = item.id; setPopupInfo(prev => ({ ...prev, input: item.name, type: Active })) }} variant="edit" size="small">Edit</Button>
                                                            <Button onClick={() => { deleteCategory(); currentId.current = item.id; setPopupInfo(prev => ({ ...prev, input: item.name, type: Active })) }} variant="delete" size="small">Delete</Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>


                    </div>
                </div>
            </div >



        </>
    );
}
export default Dashboard;