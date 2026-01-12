import style from "../../styles/dashboard/popUp.module.css";
import type { ICategory } from "../../interface/category";
import React, { useState, useEffect } from "react";

type PopUpProps = {
    onSubmit?: (onSubmit: ICategory) => void,
    closemodal?: () => void;
    title?: string;
    type?: "food" | "drink";
    labels?: { name: string, type: string };
    input?: string;
    status?: boolean
}
function PopUp({ onSubmit, closemodal, title, type, labels, input, status }: PopUpProps) {

    const [isVisible, setIsvisible] = useState(status);

    useEffect(() => {
        if (status) {
            setIsvisible(true);
        }
        else {
            setIsvisible(false);
        }
    }, [status]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const data: ICategory = {
            name: formData.get("name") as string,
            type: type as "food" | "drink"
        }
        if (onSubmit)
            onSubmit(data)

    }


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
