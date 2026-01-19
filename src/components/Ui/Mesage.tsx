//components/Ui/message
import { useEffect, useState } from "react";
import style from "../../styles/Ui/message.module.css"
import type { IMessage } from "../../interface/interface"

type MessageProp = {
    isVisible: number,
    messageDetails: IMessage,
    message: "success" | "error" | " "
}


function Message({ isVisible, message, messageDetails }: MessageProp) {
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
            {messageDetails.title && <div className={style.title}>{messageDetails.title}</div>}
            {messageDetails.content && <div className={style.content}>{messageDetails.content}</div>}
        </div>
    );
}

export default Message;