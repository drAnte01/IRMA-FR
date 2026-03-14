//components/dashboard/button.tsx

import style from "../../styles/components/button.module.css";

type ButtonProps = {
    onClick?: () => void;
    children: React.ReactNode;
    variant?: "add" | "edit" | "delete" | "success" | "error" | "submit" | "filter" | "pay";
    size?: "small" | "medium" | "large";
    className?: string;
    disabled?: boolean;
};

function Button({ onClick, children, variant, size, className, disabled = false }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${style.button} ${variant ? style[variant] : ""} ${size ? style[size] : ""} ${disabled ? style.disabled : ""} ${className ?? ""}`}
        >
            {children}
        </button>
    );
}

export default Button;