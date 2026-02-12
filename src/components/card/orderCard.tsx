//components/card/orderCard.tsx
import style from "../../styles/components/orderCard.module.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

library.add(faCartPlus);

type OrderCardProps = {
    index?: number;
    name?: string;
    description?: string;
    price?: number;
    selected?: boolean;
    onSelect?: () => void;
    inputId?: string;
    radioName?: string;
    itemsCount?: number;
}

const colors = ["#b53e3e", "#5a45b0", "#801680", "#735e31", "#1d2469", "#285431"];



function OrderCard({ price, itemsCount, index = 0, name, selected = false, onSelect, inputId, radioName = "category" }: OrderCardProps) {
    const handleClick = () => {
        onSelect?.();
    };

    const color = colors[index % colors.length]

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
                        <button><FontAwesomeIcon icon="cart-plus" /></button>
                    </div>
                </div>
                <div className={style.content}>
                    <span className={style.price}><p>{price} BAM</p></span>
                    <div className={style.count}> <button>-</button><input type="number" readOnly value={0} /><button>+</button></div>
                </div>
            </div >)}

        </>

    );
}


export default OrderCard;