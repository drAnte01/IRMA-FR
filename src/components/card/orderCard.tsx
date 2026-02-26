//components/card/orderCard.tsx
import style from "../../styles/components/orderCard.module.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

library.add(faCartPlus);

type OrderCardProps = {
    index?: number;
    itemID?: number;
    name?: string;
    description?: string;
    price?: number;
    selected?: boolean;
    onSelect?: () => void;
    inputId?: string;
    radioName?: string;
    itemsCount?: number;
    cardValue?: (quantity: number, itemId: number) => void;
}

const colors = ["#b53e3e", "#5a45b0", "#801680", "#735e31", "#1d2469", "#285431"];



function OrderCard({ price, itemsCount, index = 0, name, selected = false, onSelect, inputId, radioName = "category", cardValue, itemID }: OrderCardProps) {
    const handleClick = () => {
        onSelect?.();
    };
    const [cartItems, setCartItems] = useState<number>(0);
    const color = colors[index % colors.length]

    function addToCart() {
        cardValue?.(cartItems, itemID ?? 0);
        setCartItems(0);
    }




    return (
        <>
            {/* FOR CATEGORY */}
            {inputId && (<div className={style.categoryCard} style={{ backgroundColor: color }} onClick={handleClick} >
                <div className={style.cardHeader}>
                    <div className={style.title}><h4>{name}</h4></div>
                    <div className={style.radioButton}>
                        <input type="radio" name={radioName} id={inputId} checked={selected} readOnly />
                    </div>
                </div>
                <div className={style.content}><p>Items:{itemsCount}</p></div>
            </div >)}

            {/* FOR ITEM */}
            {price && (<div className={style.itemCard} onClick={handleClick} >
                <div className={style.cardHeader} style={{ height: "auto", alignItems: "center" }}>
                    <div className={style.title} ><h4>{name}</h4></div>
                    <div className={style.cartButton}>
                        <button onClick={addToCart}><FontAwesomeIcon icon="cart-plus" /></button>
                    </div>
                </div>
                <div className={style.content}>
                    <span className={style.price}><p>{price} BAM</p></span>
                    <div className={style.count}> <button onClick={() => {
                        if (cartItems > 0)
                            if (cartItems > 0)
                                setCartItems(cartItems - 1);
                    }}>-</button>
                        <input type="number" readOnly value={cartItems} /><button
                            onClick={() => { setCartItems(cartItems + 1); }}>+</button>
                    </div>
                </div>
            </div >)}

        </>

    );
}


export default OrderCard;