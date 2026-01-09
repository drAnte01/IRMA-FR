//pages/dashboard.tsx
import style from "../styles/dashboard/dashboard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUtensils, faMartiniGlassCitrus } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import AccountSummary from "../components/dashboard/accountSummary";
import Button from "../components/dashboard/button";
import { getAllCategories } from "../api/category";
import PopUp from "../components/dashboard/popUp";
import Message from "../components/Ui/Mesage";

library.add(faUtensils, faMartiniGlassCitrus);

function Dashboard() {
    const [Active, setActive] = useState<"food" | "drink">("food");
    const [isloading, setIsloading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isPopUpOpen, setIsPopUpOpen] = useState<boolean>(false);
    const [fetchDataStatus, setFetchData] = useState<number>(0);
    const [errorfetchDataStatus, seterrorFetchData] = useState<number>(0);
    const [messageStatus, setMessageStatus] = useState<"success" | "error" | " ">(" ");
    const [contentMessage, setContentMessage] = useState<"Category successfuly added" | "Something went wrong" | " ">(" ");
    const [showMessage, setShowMessage] = useState<number>(0);

    const ClosePopup = () => { setIsPopUpOpen(false); }

    /* FETCHING CATEGORY DATA */
    useEffect(() => {
        setIsloading(true);
        const fetchAllCategories = async () => {
            try {
                console.log("ovoliko iznosi brojac: " + fetchDataStatus)
                if (fetchDataStatus > 0) {
                    setMessageStatus("success");
                    setContentMessage("Category successfuly added");
                    setShowMessage((prev) => prev + 1);
                };
                const data = await getAllCategories();
                setCategories(data);
            } catch (error) {
                console.log("ovooo je brojac: " + errorfetchDataStatus)
                if (errorfetchDataStatus <= 0) {
                    setMessageStatus("error");
                    setContentMessage("Something went wrong");
                    setShowMessage((prev) => prev + 1);
                }
                setError("Failed to fetch categories");

            } finally {
                setIsloading(false);
            }
        }
        fetchAllCategories();
    }, [fetchDataStatus, errorfetchDataStatus]);


    return (
        <>
            <div className={style.dashboard}>
                <AccountSummary />
                <Message isVisible={showMessage} message={messageStatus} title={messageStatus} content={contentMessage} />
                <PopUp fetchData={() => setFetchData(prev => prev + 1)} errorStatusmessage={() => seterrorFetchData(prev => prev - 1)} title={`Category ${Active}`} labels={{ name: "Category Name", type: "Category Type" }} closemodal={ClosePopup} status={isPopUpOpen} input={""} type={Active} />
                <div className={style.itemsContainer}>
                    <div className={style.tabs}>
                        <div className={`${style.tab} ${Active === "food" ? style.active : ""}`} onClick={() => { setActive("food") }}><h2><FontAwesomeIcon icon={faUtensils}></FontAwesomeIcon> Food</h2></div>
                        <div className={`${style.tab} ${Active === "drink" ? style.active : ""}`} onClick={() => { setActive("drink") }}><h2><FontAwesomeIcon icon={faMartiniGlassCitrus}></FontAwesomeIcon> Drink</h2></div>
                    </div>

                    <div className={style.categoryTable}>
                        <h2>Category   <Button onClick={() => setIsPopUpOpen(true)} variant="add" size="medium">Add+</Button></h2>
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
                                                <tr key={category.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{category.name}</td>
                                                    <td>
                                                        <Button variant="edit" size="small">Edit</Button>
                                                        <Button variant="delete" size="small">Delete</Button>
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