//components/tab/tab.tsx
import React from "react";
import style from "../../styles/components/tab.module.css";

type TabProps = {
    onclick: () => void;
    active: string;
    children?: React.ReactNode;
    value?: string;
};


function tab({ onclick, active, children, value }: TabProps) {
    return (
        <>
            <div className={`${style.tab} ${active === value ? style.active : ""}`} onClick={onclick}><h2>{children}</h2></div>
        </>
    );
}
export default tab;