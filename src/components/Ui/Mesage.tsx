//components/Ui/message
import { useEffect, useState } from "react";
import style from "../../styles/Ui/message.module.css"

type MessageProp = {
    isVisible: number
    title?: "success" | "error" | " "
    content?: string;
    message: "success" | "error" | " "
}


function Message({ isVisible, message, title, content }: MessageProp) {
    const [show, setShow] = useState<number>(isVisible)

    useEffect(() => {
        setShow(isVisible);
        if (isVisible != 0) {
            const timer = setTimeout(() => setShow(0), 3000); // nestaje nakon 3s
            return () => clearTimeout(timer);
        }
    }, [isVisible]);
    if (!show) return null;

    return (
        <div className={`${style.messageContainer} ${style[message]}`}>
            <div className={style.close} onClick={() => setShow(0)}>X</div>
            {title && <div className={style.title}>{title}</div>}
            {content && <div className={style.content}>{content}</div>}
        </div>
    );
}

export default Message;