import style from "../../styles/dashboard/popUp.module.css";
import type { IFormData, IInput } from "../../interface/interface";
import React, { useState, useEffect } from "react";
import { text } from "@fortawesome/fontawesome-svg-core";

type PopUpProps = {
    onSubmit?: (onSubmit: IFormData) => void,
    closemodal?: () => void;
    confirmClick?: () => Promise<void | undefined>;
    title?: string;
    type?: "food" | "drink";
    labels?: { name?: string, type?: string, description?: string, price?: string, imageUrl?: string };
    input?: IInput;
    status?: boolean;
    options?: string[];
    content?: string;
    select?: any[];
}
function PopUp({ content, options, confirmClick, onSubmit, closemodal, title, type, labels, input, status, select }: PopUpProps) {

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
        const data: IFormData = {
            name: formData.get("name") as string,
            type: formData.get("type") as "food" | "drink",
            description: formData.get("description") as string,
            price: formData.get("price") ? Number(formData.get("price")) : undefined,
            categoryId: formData.get("categoryId") ? Number(formData.get("categoryId")) : undefined,
            imageUrl: formData.get("imageUrl") as string,
        }
        console.log(data);
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
                                <input type="text" name="name" defaultValue={input?.name} required />

                                <label>{labels?.type}</label>
                                {type && (<input type="text" name="type" readOnly value={type} />)}
                                { select && (<select name="categoryId" defaultValue={input?.categoryId ?? ""} required>
                                    <option value="" disabled>Odaberi kategoriju</option>
                                    {select?.map((item) => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))}
                                </select>)}
                                <label>{labels?.description}</label>
                                {labels.description && (<textarea
                                    id="description"
                                    name="description"
                                    defaultValue={input?.description}
                                    required
                                />)}
                                {labels.imageUrl && (<label>{labels?.imageUrl}</label>)}
                                {labels.imageUrl && (<input defaultValue={input?.imageUrl} type="text" name="imageUrl" id="imageUrl" required placeholder="Image URL" />)}
                                {labels.price && (<label>{labels?.price}</label>)}
                                {labels.price && (<div className={style.priceInput}> <input defaultValue={input?.price} type="number" name="price" id="price" required placeholder="0" /><p>BAM</p> </div>)}

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
