//pages/orders.tsx
import { useEffect, useMemo, useState } from "react";
import "../App.css";
import Table from "../components/table/table";
import Button from "../components/button/button";
import { useFetch } from "../hooks/useFetch";
import { formatDateTime24 } from "../help/customFunctions";
import { getOrdersByStatus, GetSales, OrderAPI_URL, SalesAPI_URL } from "../help/enpoints";
import style from "../styles/pages/orders.module.css";
import type { OrderRow } from "../interface/interface";
import { normalizeOrders } from "../help/customFunctions";
import { getPaginationMeta } from "../help/customFunctions";
import { normalizeSalesSummary } from "../help/customFunctions";
import AccountSummary from "../components/accountSummary/accountSummary";
import { useAuth } from "../context/AuthContext";

type OrdersStatusView = "active" | "closed";
const PAGE_SIZE = 20;

function isClosedStatus(status: string): boolean {
    return ["closed", "paid", "completed", "done"].includes(status);
}

function Orders() {
    const [statusView, setStatusView] = useState<OrdersStatusView>("closed");
    const [myOnly, setMyOnly] = useState(false);
    const [page, setPage] = useState(1);
    const { user } = useAuth();
    const waiterId = Number.isFinite(Number(user?.id)) ? Number(user?.id) : undefined;
    const shouldFetchOrders = !(myOnly && !waiterId);
    const statusParam = statusView === "active" ? "pending" : "closed";

    const ordersQuery = useFetch<unknown>(
        getOrdersByStatus(OrderAPI_URL, statusParam, page, PAGE_SIZE, myOnly ? { waiterId } : undefined),
        shouldFetchOrders,
    );
    const summaryClosedOrdersQuery = useFetch<unknown>(getOrdersByStatus(OrderAPI_URL, "closed", 1, 500));
    const { data: allSalesData } = useFetch<unknown>(GetSales(SalesAPI_URL, "all"));
    const salesSummary = useMemo(() => normalizeSalesSummary(allSalesData), [allSalesData]);

    const summaryClosedOrders = useMemo(
        () => normalizeOrders(summaryClosedOrdersQuery.data),
        [summaryClosedOrdersQuery.data],
    );

    const ordersSummary = useMemo(() => {
        const parseAmount = (value: string | number | undefined): number => {
            if (typeof value === "number") return Number.isFinite(value) ? value : 0;
            if (typeof value === "string") {
                const parsed = Number(value.replace(",", ".").trim());
                return Number.isFinite(parsed) ? parsed : 0;
            }
            return 0;
        };

        const now = new Date();
        const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const startYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

        let today = 0;
        let yesterday = 0;

        for (const order of summaryClosedOrders) {
            if (!order.createdAt) continue;
            const created = new Date(order.createdAt);
            if (Number.isNaN(created.getTime())) continue;

            const amount = parseAmount(order.totalPrice);

            if (created >= startToday && created < startTomorrow) {
                today += amount;
                continue;
            }

            if (created >= startYesterday && created < startToday) {
                yesterday += amount;
            }
        }

        return { today, yesterday };
    }, [summaryClosedOrders]);

    const dailyTotal =
        (salesSummary.daily ?? 0) > 0
            ? salesSummary.daily
            : ordersSummary.today > 0
                ? ordersSummary.today
                : salesSummary.daily;

    const yesterdayTotal =
        (salesSummary.yesterday ?? 0) > 0
            ? salesSummary.yesterday
            : ordersSummary.yesterday > 0
                ? ordersSummary.yesterday
                : salesSummary.yesterday;

    const weeklyTotal = salesSummary.weekly;
    const monthlyTotal = salesSummary.monthly;

    useEffect(() => {
        setPage(1);
    }, [statusView, myOnly]);

    const displayedOrders = useMemo(() => {
        if (myOnly && !waiterId) return [];
        return normalizeOrders(ordersQuery.data);
    }, [ordersQuery.data, myOnly, waiterId]);

    const pagination = useMemo(() => getPaginationMeta(ordersQuery.data), [ordersQuery.data]);

    const loading = ordersQuery.loading;
    const error = ordersQuery.error;

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
                <div className={style.summaryRow}>
                    <AccountSummary
                        daily={dailyTotal}
                        yesterday={yesterdayTotal}
                        weekly={weeklyTotal}
                        monthly={monthlyTotal}
                        show={{ daily: true, yesterday: true, weekly: false, monthly: false }}
                    />
                </div>
                <div className={style.ordersSection}>
                    <div className={style.filterRow}>
                        <Button
                            variant="filter"
                            size="small"
                            className={statusView === "active" ? style.activeFilter : ""}
                            onClick={() => setStatusView("active")}
                        >
                            active
                        </Button>
                        <Button
                            variant="filter"
                            size="small"
                            className={statusView === "closed" ? style.activeFilter : ""}
                            onClick={() => setStatusView("closed")}
                        >
                            closed
                        </Button>
                        <Button
                            variant="filter"
                            size="small"
                            className={myOnly ? style.activeFilter : ""}
                            onClick={() => setMyOnly((prev) => !prev)}
                        >
                            My orders
                        </Button>
                    </div>

                    {loading && <p>Loading orders...</p>}
                    {error && <p>Error loading orders: {error.message}</p>}

                    {!loading && !error && displayedOrders.length === 0 && (
                        <p>No {myOnly ? "my " : ""}{statusView} orders found.</p>
                    )}

                    {!loading && !error && displayedOrders.length > 0 && (
                        <>
                            <div className={style.tableWrap}>
                                <Table columns={columns} data={displayedOrders} size="l" />
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