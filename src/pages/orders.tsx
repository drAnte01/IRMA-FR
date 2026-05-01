//pages/orders.tsx
import { useEffect, useMemo, useState } from "react";
import "../App.css";
import Table from "../components/table/table";
import Button from "../components/button/button";
import { useFetch } from "../hooks/useFetch";
import { formatDateTime24 } from "../help/customFunctions";
import { getOrdersByStatus, GetSales, OrderAPI_URL, SalesAPI_URL } from "../help/enpoints";
import style from "../styles/pages/orders.module.css";
import type { IAllSalesResponse, OrderRow } from "../interface/interface";
import { normalizeOrders } from "../help/customFunctions";
import { getPaginationMeta } from "../help/customFunctions";
import AccountSummary from "../components/accountSummary/accountSummary";

type StatusFilter = "active" | "closed";
const PAGE_SIZE = 20;

function isClosedStatus(status: string): boolean {
    return ["closed", "paid", "completed", "done"].includes(status);
}

function Orders() {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("closed");
    const [page, setPage] = useState(1);
    const { data, loading, error } = useFetch<unknown>(getOrdersByStatus(OrderAPI_URL, statusFilter, page, PAGE_SIZE));
    const { data: allSalesData } = useFetch<IAllSalesResponse>(GetSales(SalesAPI_URL, "all"));

    const dailyTotal = allSalesData?.daily?.totalSales ?? null;
    const weeklyTotal = allSalesData?.weekly?.totalSales ?? null;
    const monthlyTotal = allSalesData?.monthly?.totalSales ?? null;

    useEffect(() => {
        setPage(1);
    }, [statusFilter]);

    const filteredOrders = useMemo(() => normalizeOrders(data), [data]);
    const pagination = useMemo(() => getPaginationMeta(data), [data]);

    const canGoPrev = pagination.currentPage > 1;
    const canGoNext = pagination.currentPage < pagination.totalPages;

    const columns = [
        { header: "Order #", render: (row: OrderRow) => row.id, textalignment: "center" as const, headerAlignment: "center" as const },
        { header: "Table", render: (row: OrderRow) => row.table, textalignment: "center" as const, headerAlignment: "center" as const },
        { header: "Status", render: (row: OrderRow) => row.status || "-", textalignment: "center" as const, headerAlignment: "center" as const },
        { header: "Created", render: (row: OrderRow) => formatDateTime24(row.createdAt), textalignment: "center" as const, headerAlignment: "center" as const },
        { header: "Total", render: (row: OrderRow) => `${row.totalPrice ?? "0"} BAM`, textalignment: "center" as const, headerAlignment: "center" as const },
        {
            header: "Invoice PDF",
            render: (row: OrderRow) => {
                const canOpenPdf = isClosedStatus(row.status) && row.pdfUrl;
                if (!canOpenPdf) return "-";

                return (
                    <a
                        href={row.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={style.pdfLink}
                    >
                        {row.fileName || `racun-${row.id}.pdf`}
                    </a>
                );
            },
            textalignment: "center" as const,
            headerAlignment: "center" as const,
        },
    ];

    return (
        <>
            <div className="orders">
                <AccountSummary daily={dailyTotal} weekly={weeklyTotal} monthly={monthlyTotal} show={{ daily: true, weekly: false, monthly: false }} />
                <div className={style.ordersSection}>
                    <div className={style.filterRow}>
                        <Button
                            variant="filter"
                            size="small"
                            className={statusFilter === "active" ? style.activeFilter : ""}
                            onClick={() => setStatusFilter("active")}
                        >
                            active
                        </Button>
                        <Button
                            variant="filter"
                            size="small"
                            className={statusFilter === "closed" ? style.activeFilter : ""}
                            onClick={() => setStatusFilter("closed")}
                        >
                            closed
                        </Button>
                    </div>

                    {loading && <p>Loading orders...</p>}
                    {error && <p>Error loading orders: {error.message}</p>}

                    {!loading && !error && filteredOrders.length === 0 && (
                        <p>No {statusFilter} orders found.</p>
                    )}

                    {!loading && !error && filteredOrders.length > 0 && (
                        <>
                            <div className={style.tableWrap}>
                                <Table columns={columns} data={filteredOrders} size="l" />
                            </div>

                            <div className={style.paginationRow}>
                                <p className={style.paginationMeta}>
                                    Page {pagination.currentPage} of {pagination.totalPages} | Total orders: {pagination.totalOrders} | Page size: {pagination.pageSize}
                                </p>
                                <div className={style.paginationActions}>
                                    <Button
                                        variant="filter"
                                        size="small"
                                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                        disabled={!canGoPrev}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="filter"
                                        size="small"
                                        onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                                        disabled={!canGoNext}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>);
}

export default Orders;