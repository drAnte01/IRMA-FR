import style from "../../styles/components/popUp.module.css";
import type { IFormData, IInput, ILabels } from "../../interface/interface";
import React, { useState, useEffect } from "react";

type PopUpProps = {
    onSubmit?: (onSubmit: IFormData) => void,
    closemodal?: () => void;
    confirmClick?: () => Promise<void | undefined>;
    title?: string;
    type?: "food" | "drink";
    labels?: ILabels;
    input?: IInput;
    status?: boolean;
    options?: string[];
    content?: string;
    select?: any[];
    children?: React.ReactNode;
}
function PopUp(props: PopUpProps) {

    const [isVisible, setIsvisible] = useState(props.status);
    const labels = props.labels ?? {};
    const isStaff = Boolean(labels.Fname || labels.Lname || labels.email || labels.username || labels.password || labels.typeStaff || labels.dateOfBirth || labels.image || labels.phone || labels.adress);

    useEffect(() => {
        if (props.status) {
            setIsvisible(true);
        }
        else {
            setIsvisible(false);
        }
    }, [props.status]);

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
            Fname: formData.get("Fname") as string,
            Lname: formData.get("Lname") as string,
            email: formData.get("email") as string,
            username: formData.get("username") as string,
            password: formData.get("password") as string,
            typeStaff: formData.get("typeStaff") as string,
            dateOfBirth: formData.get("dateOfBirth") as string,
            image: formData.get("image") as string,
            adress: formData.get("adress") as string,
            phone: formData.get("phone") as string,
        }
        console.log(data);
        if (props.onSubmit)
            props.onSubmit(data)
    }


    return (
        <>
            {isVisible && (
                <div className={style.popupBackdrop} onClick={() => { props.closemodal?.(); setIsvisible(false); }}>
                    <div className={`${style.popUp} ${isStaff ? style.staffPopup : ""}`} onClick={e => e.stopPropagation()}>
                        <div className={style.popupClose} onClick={() => { props.closemodal?.(); setIsvisible(false); }}>X</div>
                        {props.title && <div className={style.popupTitle}><h2>{props.title}</h2></div>}
                        {props.labels && (<div className={`${style.popupContent} ${isStaff ? style.staffGrid : ""}`}>
                            <form onSubmit={handleSubmit}>
                                {labels.name && (<label htmlFor="name">{labels.name}</label>)}
                                {labels.name && (<input id="name" type="text" name="name" defaultValue={props.input?.name} required />)}

                                {labels.type && (props.type || props.select) && (
                                    <label htmlFor={props.type ? "type" : "categoryId"}>{labels.type}</label>
                                )}
                                {props.type && (<input id="type" type="text" name="type" readOnly value={props.type} />)}
                                {props.select && (
                                    <select id="categoryId" name="categoryId" defaultValue={props.input?.categoryId ? String(props.input.categoryId) : ""} required>
                                        <option value="" disabled>Odaberi kategoriju</option>
                                        {props.select?.map((item) => (
                                            <option key={item.id} value={item.id}>{item.name}</option>
                                        ))}
                                    </select>
                                )}
                                {labels.description && (<label htmlFor="description">{labels.description}</label>)}
                                {labels.description && (<textarea
                                    id="description"
                                    name="description"
                                    defaultValue={props.input?.description}
                                    required
                                />)}
                                {labels.imageUrl && (<label htmlFor="imageUrl">{labels.imageUrl}</label>)}
                                {labels.imageUrl && (<input defaultValue={props.input?.imageUrl} type="text" name="imageUrl" id="imageUrl" required placeholder="Image URL" />)}
                                {labels.price && (<label htmlFor="price">{labels.price}</label>)}
                                {labels.price && (<div className={style.priceInput}> <input defaultValue={props.input?.price} type="number" name="price" id="price" required placeholder="0" /><p>BAM</p> </div>)}


                                {/* staff member fields - grouped for two-column layout when isStaff */}
                                {labels.Fname && (
                                    <div className={style.staffField}>
                                        <label htmlFor="Fname">{labels.Fname}</label>
                                        <input id="Fname" type="text" name="Fname" defaultValue={props.input?.Fname} required />
                                    </div>
                                )}
                                {labels.Lname && (
                                    <div className={style.staffField}>
                                        <label htmlFor="Lname">{labels.Lname}</label>
                                        <input id="Lname" type="text" name="Lname" defaultValue={props.input?.Lname} required />
                                    </div>
                                )}
                                {labels.email && (
                                    <div className={style.staffField}>
                                        <label htmlFor="email">{labels.email}</label>
                                        <input id="email" type="email" name="email" defaultValue={props.input?.email} required />
                                    </div>
                                )}
                                {labels.username && (
                                    <div className={style.staffField}>
                                        <label htmlFor="username">{labels.username}</label>
                                        <input id="username" type="text" name="username" defaultValue={props.input?.username} required />
                                    </div>
                                )}
                                {labels.password && (
                                    <div className={style.staffField}>
                                        <label htmlFor="password">{labels.password}</label>
                                        <input id="password" type="password" name="password" defaultValue={props.input?.password} required />
                                    </div>
                                )}
                                {labels.typeStaff && (
                                    <div className={style.staffField}>
                                        <label htmlFor="typeStaff">{labels.typeStaff}</label>
                                        <input id="typeStaff" type="text" name="typeStaff" defaultValue={props.input?.typeStaff} required />
                                    </div>
                                )}

                                {labels.phone && (
                                    <div className={style.staffField}>
                                        <label htmlFor="phone">{labels.phone}</label>
                                        <input id="phone" type="text" name="phone" defaultValue={props.input?.phone} required />
                                    </div>
                                )}

                                {labels.adress && (
                                    <div className={style.staffField}>
                                        <label htmlFor="adress">{labels.adress}</label>
                                        <input id="adress" type="text" name="adress" defaultValue={props.input?.adress} required />
                                    </div>
                                )}
                                {labels.dateOfBirth && (
                                    <div className={style.staffField}>
                                        <label htmlFor="dateOfBirth">{labels.dateOfBirth}</label>
                                        <input id="dateOfBirth" type="date" name="dateOfBirth" defaultValue={props.input?.dateOfBirth} required />
                                    </div>
                                )}
                                {labels.image && (
                                    <div className={style.staffField}>
                                        <label htmlFor="image">{labels.image}</label>
                                        <input id="image" type="text" name="image" defaultValue={props.input?.image} required />
                                    </div>
                                )}



                                <button type="submit">Save</button>
                            </form>
                        </div>)}
                        {props.content && (<div className={style.popupContentMessage}><h2>{props.content}</h2></div>)}
                        {props.children && (<div className={style.popupCustomContent}>{props.children}</div>)}
                        {props.options && (<div className={style.confirmDenied}><h2 onClick={props.confirmClick}>Yes</h2> <h2 onClick={() => { props.closemodal?.(); setIsvisible(false); }}>No</h2> </div>)}
                    </div>
                </div >)
            }


        </>

    );
}

export default PopUp;
