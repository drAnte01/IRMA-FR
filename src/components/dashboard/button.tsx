//components/dashboard/button.tsx

import style from "../../styles/dashboard/button.module.css";

type ButtonProps = {
    onClick?: () => void;
    children: React.ReactNode;
    variant?: "add" | "edit" | "delete" | "success" | "error" | "submit" | "filter";
    size?: "small" | "medium" | "large";
    className?: string;
};

function Button({ onClick, children, variant, size, className }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`${style.button} ${variant ? style[variant] : ""} ${size ? style[size] : ""} ${className ?? ""}`}
        >
            {children}
        </button>
    );
}

export default Button;