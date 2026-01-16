import style from "../../styles/dashboard/popUp.module.css";
import type { ICategory } from "../../interface/category";
import React, { useState, useEffect } from "react";

type PopUpProps = {
    onSubmit?: (onSubmit: ICategory) => void,
    closemodal?: () => void;
    confirmClick?: () => Promise<void | undefined>;
    title?: string;
    type?: "food" | "drink";
    labels?: { name: string, type: string };
    input?: string;
    status?: boolean;
    options?: string[];
    content?: string;
}
function PopUp({ content, options, confirmClick, onSubmit, closemodal, title, type, labels, input, status }: PopUpProps) {

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
            name: formData.get("name") as string
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
                        {labels && (<div className={style.popupContent}>
                            <form onSubmit={handleSubmit}>
                                <label>{labels?.name}</label>
                                <input type="text" name="name" defaultValue={input} required />

                                <label>{labels?.type}</label>
                                <input type="text" name="type" readOnly value={type} />

                                <button type="submit">Save</button>
                            </form>
                        </div>)}
                        {content && (<div className={style.popupContentMessage}><h2>{content}</h2></div>)}
                        {options && (<div className={style.confirmDenied}><h2 onClick={confirmClick}>Yes</h2> <h2 onClick={() => { closemodal?.(); setIsvisible(false); }}>No</h2> </div>)}
                    </div>
                </div >)
            }


        </>

    );
}

export default PopUp;
