import style from "../../styles/dashboard/popUp.module.css";
import type { ICategory } from "../../interface/category";
import { CreateCategory } from "../../api/category";
import { useState, useEffect } from "react";

type PopUpProps = {
    closemodal?: () => void;
    fetchData?: () => void;
    errorStatusmessage?: () => void;
    title?: string;
    type?: "food" | "drink";
    labels?: { name: string, type: string };
    input?: string;
    status?: boolean
}
function PopUp({ errorStatusmessage, fetchData, closemodal, title, type, labels, input, status }: PopUpProps) {

    const [isVisible, setIsvisible] = useState(false);

    useEffect(() => {
        if (status) {
            setIsvisible(true);
        }
    }, [status]);


    //create category form submit handler
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const name = formData.get("name") as string;
        const categoryType = formData.get("type") as "food" | "drink";

        if (!name || !categoryType) {
            console.error("Form data is incomplete");
        }

        const data: ICategory = {
            name: name,
            type: categoryType
        };
        try {
            const result = await CreateCategory(data);
            console.log("Category created:", result);
            closemodal?.()
            setIsvisible(false);
            fetchData?.();
        } catch (error) {
            console.log("tu sammm")
            errorStatusmessage?.();
            console.error("Error creating category:", error);

        }
    };


    return (
        <>
            {isVisible && (
                <div className={style.popupBackdrop} onClick={() => { closemodal?.(); setIsvisible(false); }}>
                    <div className={style.popUp} onClick={e => e.stopPropagation()}>
                        <div className={style.popupClose} onClick={() => { closemodal?.(); setIsvisible(false); }}>X</div>
                        {title && <div className={style.popupTitle}><h2>{title}</h2></div>}
                        <div className={style.popupContent}>
                            <form onSubmit={handleSubmit}>
                                <label>{labels?.name}</label>
                                <input type="text" name="name" defaultValue={input} required />

                                <label>{labels?.type}</label>
                                <input type="text" name="type" readOnly value={type} />

                                <button type="submit">Save</button>
                            </form>
                        </div>
                    </div>
                </div >)
            }


        </>

    );
}

export default PopUp;
