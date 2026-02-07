//components/card/card.tsx

import style from "../../styles/components/card.module.css";

type CardProps = {
    imageUrl?: string;
    title?: string;
    description?: string;
    price?: number;
}

function Card({ imageUrl, title, description, price }: CardProps) {
    const formattedPrice = price !== undefined ? price.toFixed(2) : null;

    return (
        <div className={style.card}>
            {imageUrl ? (
                <img src={imageUrl} alt={title ?? "card image"} className={style.image} />
            ) : (
                <div className={style.imagePlaceholder} />
            )}

            <div className={style.content}>
                {title && <h3 className={style.title}>{title}</h3>}
                {description && <p className={style.description}>{description}</p>}
                {formattedPrice !== null && (
                    <div className={style.price}>${formattedPrice}</div>
                )}
            </div>
        </div>
    );
}

export default Card;