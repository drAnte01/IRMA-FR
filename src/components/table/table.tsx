//dashboard/table.tsx
import tableStyle from "../../styles/components/table.module.css";

type Column<T> = {
    header: string;
    accessor?: keyof T;
    render?: (row: T, rowIndex: number) => React.ReactNode;
    textalignment?: "left" | "center" | "right";
    headerAlignment?: "left" | "center" | "right";
};

type TableProps<T> = {
    columns: Column<T>[];
    data: T[]
    size?: "xs" | "s" | "xm" | "m" | "xl" | "l";

};

function Table<T>({ columns, data, size }: TableProps<T>) {
    return (
        <div className={tableStyle[size ? size : "medium"]}>
            <table className={tableStyle.table}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={String(col.header)} style={{ textAlign: col.headerAlignment ?? "left" }} >{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((col, colIndex) => (
                                <td key={col.accessor ? String(col.accessor) : String(col.header) + colIndex} style={{ textAlign: col.textalignment ?? "left" }}>{col.render ? col.render(row, rowIndex) : String(row ? row[col.accessor!] : "")}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table >
        </div >
    );
}

export default Table;