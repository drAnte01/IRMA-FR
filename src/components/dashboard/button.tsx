//components/dashboard/button.tsx

import style from "../../styles/dashboard/button.module.css";

type ButtonProps = {
    onClick?: () => void;
    children: React.ReactNode;
    variant?: "add" | "edit" | "delete" | "success" | "error" | "submit";
    size?: "small" | "medium" | "large";
};

function Button({ onClick, children, variant, size }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`${style.button} ${variant ? style[variant] : ""} ${size ? style[size] : ""}`}
        >
            {children}
        </button>
    );
}

export default Button;