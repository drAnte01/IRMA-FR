//pages/dashboard.tsx
import style from "../styles/pages/dashboard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUtensils, faMartiniGlassCitrus } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AccountSummary from "../components/accountSummary/accountSummary";
import Button from "../components/button/button";
import { CategoryAPI_URL, ItemAPI_URL, GetCategories, GetItems, SalesAPI_URL, GetSales, StaffAPI_URL, getTopSellingItemsEndpoint, getWaitersEarningsEndpoint, getReceiptsCountEndpoint } from "../help/enpoints";
import PopUp from "../components/popup/popUp";
import Message from "../components/Ui/Mesage";
import type { ICategory, IFormData, IItem, IPopUp, IStaff, IAllSalesResponse, IIncomeRow, ITopSellingRequest, ITopSellingResponse, IWaitersEarningsRequest, IWaitersEarningsResponse, IReceiptsCountRequest, IReceiptsCountResponse, TopSellingPeriod } from "../interface/interface";
import Table from "../components/table/table";
import { useFetch } from "../hooks/useFetch";
import { useCreate } from "../hooks/useCreate";
import { useDelete } from "../hooks/useDelete";
import { useUpdate } from "../hooks/useUpdate";
import { createNewCategoryPopup, editCategoryPopup, createNewItemPopup, editItemPopup, createNewStaffPopup } from "../components/template/popupTemplates";
import { confirmMessage, deleteErrorMessage, deleteSuccessMessage, errorMessage, successMessage, updateErrorMessage, updateSuccessMessage } from "../components/template/messageTemplates";
import { filterItemsByActiveType, normalizeSalesSummary } from "../help/customFunctions";
import Tab from "../components/tab/tab";
import YearPicker from "../components/yearPicker/yearPicker";
import "../App.css"

library.add(faUtensils, faMartiniGlassCitrus);

function Dashboard() {
    const currentYear = new Date().getFullYear();
    const selectableYears = useMemo(() => {
        const minYear = 2000;
        const length = Math.max(1, currentYear - minYear + 1);
        return Array.from({ length }, (_value, index) => currentYear - index);
    }, [currentYear]);

    const [Active, setActive] = useState<"food" | "drink">("food");
    const [activeFilter, setActiveFilter] = useState<string>("All");
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [incomePeriod, setIncomePeriod] = useState<"daily" | "monthly" | "yearly">("daily");
    const [incomeYear, setIncomeYear] = useState<number>(currentYear);
    const [incomeDate, setIncomeDate] = useState("");
    const [incomeRangeData, setIncomeRangeData] = useState<IIncomeRow[] | null>(null);
    const [incomeRangeLoading, setIncomeRangeLoading] = useState(false);
    const [incomeRangeError, setIncomeRangeError] = useState<string | null>(null);
    const [topSellingPeriod, setTopSellingPeriod] = useState<TopSellingPeriod>("daily");
    const [topSellingYear, setTopSellingYear] = useState<number>(currentYear);
    const [topSellingMonth, setTopSellingMonth] = useState<string>(String(new Date().getMonth() + 1).padStart(2, "0"));
    const [topSellingDate, setTopSellingDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [topSellingData, setTopSellingData] = useState<ITopSellingResponse | null>(null);
    const [topSellingLoading, setTopSellingLoading] = useState(false);
    const [topSellingError, setTopSellingError] = useState<string | null>(null);
    const [waitersPeriod, setWaitersPeriod] = useState<TopSellingPeriod>("daily");
    const [waitersYear, setWaitersYear] = useState<number>(currentYear);
    const [waitersMonth, setWaitersMonth] = useState<string>(String(new Date().getMonth() + 1).padStart(2, "0"));
    const [waitersDate, setWaitersDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [waitersData, setWaitersData] = useState<IWaitersEarningsResponse | null>(null);
    const [waitersLoading, setWaitersLoading] = useState(false);
    const [waitersError, setWaitersError] = useState<string | null>(null);
    const [receiptsPeriod, setReceiptsPeriod] = useState<TopSellingPeriod>("daily");
    const [receiptsYear, setReceiptsYear] = useState<number>(currentYear);
    const [receiptsDate, setReceiptsDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [receiptsRows, setReceiptsRows] = useState<Array<{ period: string; totalReceipts: number }>>([]);
    const [receiptsLoading, setReceiptsLoading] = useState(false);
    const [receiptsError, setReceiptsError] = useState<string | null>(null);
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            setSearchQuery(searchInput.trim());
        }, 350);
        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        };
    }, [searchInput]);

    const { data: categoryData, loading: categoryLoading, error: categoryError, refetch: refetchCategories } = useFetch<ICategory[]>(GetCategories(CategoryAPI_URL, Active)); // Fetch categories
    const { data: itemData, loading: itemLoading, error: itemError, refetch: refetchItems } = useFetch<IItem[]>(GetItems(ItemAPI_URL, activeFilter, searchQuery)); // Fetch items
    const { data: staffData, loading: staffLoading, error: staffError, refetch: refetchStaff } = useFetch<IStaff[]>(StaffAPI_URL); // Fetch staff
    const { createNewData: createIncomeRange } = useCreate<any>();
    const { createNewData: createTopSellingItems } = useCreate<ITopSellingRequest>();
    const { createNewData: createWaitersEarnings } = useCreate<IWaitersEarningsRequest>();
    const { createNewData: createReceiptsCount } = useCreate<IReceiptsCountRequest>();

    const topSellingReferenceDate = useMemo(() => {
        if (topSellingPeriod === "daily") {
            return topSellingDate.trim() || undefined;
        }

        if (topSellingPeriod === "monthly") {
            const currentYear = new Date().getFullYear();
            return `${currentYear}-${topSellingMonth}-01`;
        }

        return `${topSellingYear}-01-01`;
    }, [topSellingDate, topSellingMonth, topSellingPeriod, topSellingYear]);

    const waitersReferenceDate = useMemo(() => {
        if (waitersPeriod === "daily") {
            return waitersDate.trim() || undefined;
        }

        if (waitersPeriod === "monthly") {
            const currentYear = new Date().getFullYear();
            return `${currentYear}-${waitersMonth}-01`;
        }

        return `${waitersYear}-01-01`;
    }, [waitersDate, waitersMonth, waitersPeriod, waitersYear]);

    const incomePeriodUrl = GetSales(SalesAPI_URL, "income", {
        period: incomePeriod,
        year: incomePeriod === "monthly" || incomePeriod === "yearly" ? incomeYear : undefined,
    });

    const { data: incomeDataByPeriod, loading: incomeLoadingByPeriod, error: incomeErrorByPeriod } = useFetch<IIncomeRow[]>(
        incomePeriodUrl,
        !incomeDate.trim(),
    );

    useEffect(() => {
        if (!incomeDate.trim()) {
            setIncomeRangeData(null);
            setIncomeRangeError(null);
            setIncomeRangeLoading(false);
            return;
        }

        let cancelled = false;
        setIncomeRangeLoading(true);
        setIncomeRangeError(null);

        createIncomeRange(`${SalesAPI_URL}/income/range`, {
            startDate: incomeDate,
            endDate: incomeDate,
        })
            .then((result) => {
                if (cancelled) return;
                setIncomeRangeData(Array.isArray(result) ? result : []);
            })
            .catch((error) => {
                if (cancelled) return;
                setIncomeRangeData([]);
                setIncomeRangeError(error instanceof Error ? error.message : "Error loading income range");
            })
            .finally(() => {
                if (!cancelled) setIncomeRangeLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [incomeDate, createIncomeRange]);

    useEffect(() => {
        let cancelled = false;
        setTopSellingLoading(true);
        setTopSellingError(null);

        createTopSellingItems(getTopSellingItemsEndpoint(SalesAPI_URL), {
            period: topSellingPeriod,
            referenceDate: topSellingReferenceDate,
            limit: 5,
        })
            .then((result) => {
                if (cancelled) return;

                const fallback: ITopSellingResponse = {
                    period: topSellingPeriod,
                    startDate: "",
                    endDate: "",
                    limit: 5,
                    items: [],
                };

                setTopSellingData(result && typeof result === "object" ? (result as ITopSellingResponse) : fallback);
            })
            .catch((error) => {
                if (cancelled) return;
                setTopSellingData({
                    period: topSellingPeriod,
                    startDate: "",
                    endDate: "",
                    limit: 5,
                    items: [],
                });
                setTopSellingError(error instanceof Error ? error.message : "Error loading top selling items");
            })
            .finally(() => {
                if (!cancelled) setTopSellingLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [createTopSellingItems, topSellingPeriod, topSellingReferenceDate]);

    useEffect(() => {
        let cancelled = false;
        setWaitersLoading(true);
        setWaitersError(null);

        createWaitersEarnings(getWaitersEarningsEndpoint(SalesAPI_URL), {
            period: waitersPeriod,
            referenceDate: waitersReferenceDate,
            limit: 5,
            includeAll: true,
        })
            .then((result) => {
                if (cancelled) return;

                const fallback: IWaitersEarningsResponse = {
                    period: waitersPeriod,
                    startDate: "",
                    endDate: "",
                    limit: 5,
                    includeAll: true,
                    waiters: [],
                };

                setWaitersData(result && typeof result === "object" ? (result as IWaitersEarningsResponse) : fallback);
            })
            .catch((error) => {
                if (cancelled) return;
                setWaitersData({
                    period: waitersPeriod,
                    startDate: "",
                    endDate: "",
                    limit: 5,
                    includeAll: true,
                    waiters: [],
                });
                setWaitersError(error instanceof Error ? error.message : "Error loading waiters earnings");
            })
            .finally(() => {
                if (!cancelled) setWaitersLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [createWaitersEarnings, waitersPeriod, waitersReferenceDate]);

    useEffect(() => {
        let cancelled = false;
        setReceiptsLoading(true);
        setReceiptsError(null);

        const monthLabels = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        const buildRequests = (): Array<{ label: string; payload: IReceiptsCountRequest }> => {
            if (receiptsPeriod === "daily") {
                const base = receiptsDate.trim() ? new Date(receiptsDate) : new Date();
                if (Number.isNaN(base.getTime())) {
                    return [];
                }

                return Array.from({ length: 10 }, (_unused, index) => {
                    const current = new Date(base);
                    current.setDate(base.getDate() - index);
                    const isoDate = current.toISOString().slice(0, 10);

                    return {
                        label: isoDate,
                        payload: {
                            period: "daily",
                            referenceDate: isoDate,
                        },
                    };
                });
            }

            if (receiptsPeriod === "monthly") {
                return monthLabels.map((label, monthIndex) => {
                    const month = String(monthIndex + 1).padStart(2, "0");

                    return {
                        label,
                        payload: {
                            period: "monthly",
                            referenceDate: `${receiptsYear}-${month}-01`,
                        },
                    };
                });
            }

            return Array.from({ length: 10 }, (_unused, index) => {
                const year = receiptsYear - index;

                return {
                    label: String(year),
                    payload: {
                        period: "yearly",
                        referenceDate: `${year}-01-01`,
                    },
                };
            });
        };

        const run = async () => {
            try {
                const requests = buildRequests();
                const responseRows = await Promise.all(
                    requests.map(async (request) => {
                        const response = await createReceiptsCount(getReceiptsCountEndpoint(SalesAPI_URL), request.payload);
                        const parsed = response as IReceiptsCountResponse | null;

                        return {
                            period: request.label,
                            totalReceipts: parsed?.totalReceipts ?? 0,
                        };
                    }),
                );

                if (cancelled) return;
                setReceiptsRows(responseRows);
            } catch (error) {
                if (cancelled) return;
                setReceiptsRows([]);
                setReceiptsError(error instanceof Error ? error.message : "Error loading receipts count");
            } finally {
                if (!cancelled) setReceiptsLoading(false);
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [createReceiptsCount, receiptsDate, receiptsPeriod, receiptsYear]);

    const incomeData = incomeDate.trim() ? incomeRangeData : incomeDataByPeriod;
    const incomeLoading = incomeDate.trim() ? incomeRangeLoading : incomeLoadingByPeriod;
    const incomeError = incomeDate.trim() ? incomeRangeError : (incomeErrorByPeriod ? incomeErrorByPeriod.message : null);

    const incomeRows = incomeData ?? [];
    const topSellingRows = topSellingData?.items ?? [];
    const waitersRows = waitersData?.waiters ?? [];

    const incomeColumns = [
        {
            header: "#",
            render: (_row: IIncomeRow, rowIndex: number) => rowIndex + 1,
            textalignment: "center" as const,
            headerAlignment: "center" as const,
        },
        {
            header: "Date",
            render: (row: IIncomeRow) => {
                if (!row.date) return "-";
                const parsed = new Date(row.date);

                if (incomePeriod === "monthly") {
                    return Number.isNaN(parsed.getTime())
                        ? row.date
                        : new Intl.DateTimeFormat("en-US", { month: "long" }).format(parsed);
                }

                if (incomePeriod === "yearly") {
                    return Number.isNaN(parsed.getTime()) ? row.date : String(parsed.getFullYear());
                }

                return Number.isNaN(parsed.getTime()) ? row.date : parsed.toISOString().slice(0, 10);
            },
            textalignment: "center" as const,
            headerAlignment: "center" as const,
        },
        {
            header: "Income",
            render: (row: IIncomeRow) => `${row.income ?? "0"} BAM`,
            textalignment: "center" as const,
            headerAlignment: "center" as const,
        },
    ];

    const topSellingColumns = [
        {
            header: "#",
            render: (_row: { itemId: number }, rowIndex: number) => rowIndex + 1,
            textalignment: "center" as const,
            headerAlignment: "center" as const,
        },
        {
            header: "Item",
            render: (row: { itemName: string }) => row.itemName || "-",
            textalignment: "center" as const,
            headerAlignment: "center" as const,
        },
        {
            header: "Quantity Sold",
            render: (row: { quantitySold: number }) => row.quantitySold ?? 0,
            textalignment: "center" as const,
            headerAlignment: "center" as const,
        },
        {
            header: "Revenue",
            render: (row: { revenue: number }) => `${Number(row.revenue ?? 0).toFixed(2)} BAM`,
            textalignment: "center" as const,
            headerAlignment: "center" as const,
        },
    ];

    const waitersColumns = [
        {
            header: "#",
            render: (_row: { waiterId: number }, rowIndex: number) => rowIndex + 1,
            textalignment: "center" as const,
            headerAlignment: "center" as const,
        },
        {
            header: "Waiter",
            render: (row: { waiterFullName: string }) => row.waiterFullName || "-",
            textalignment: "center" as const,
            headerAlignment: "center" as const,
        },
        {
            header: "Orders",
            render: (row: { ordersCount: number }) => row.ordersCount ?? 0,
            textalignment: "center" as const,
            headerAlignment: "center" as const,
        },
        {
            header: "Revenue",
            render: (row: { revenue: number }) => `${Number(row.revenue ?? 0).toFixed(2)} BAM`,
            textalignment: "center" as const,
            headerAlignment: "center" as const,
        },
    ];

    const receiptsColumns = [
        {
            header: "Period",
            render: (row: { period: string }) => row.period,
            textalignment: "center" as const,
            headerAlignment: "center" as const,
        },
        {
            header: "Total Receipts",
            render: (row: { totalReceipts: number }) => row.totalReceipts ?? 0,
            textalignment: "center" as const,
            headerAlignment: "center" as const,
        },
    ];

    useEffect(() => {
        if (incomePeriod !== "monthly" && incomePeriod !== "yearly") return;
        if (incomeYear > currentYear) setIncomeYear(currentYear);
    }, [currentYear, incomePeriod, incomeYear]);

    const { data: allSalesData } = useFetch<IAllSalesResponse>(GetSales(SalesAPI_URL, "all"));
    const salesSummary = normalizeSalesSummary(allSalesData);

    const dailyTotal = salesSummary.daily;
    const weeklyTotal = salesSummary.weekly;
    const monthlyTotal = salesSummary.monthly;

    const { createNewData, loading: _creating, error: _createError } = useCreate<any>(); // Create 
    const { deleteData, loading: _deleting, error: _deleteError } = useDelete();   // Delete
    const { updateData, loading: _updating, error: _updateError } = useUpdate<any>(); // Update
    const [MessageProps, setMessageProps] = useState<{ isVisible: number, title: string; content: string, status: "success" | "error" | " " }>({ isVisible: 0, title: "", content: "", status: " " });

    const [isPopUpOpen, setIsPopUpOpen] = useState<boolean>(false);
    const [popupInfo, setPopupInfo] = useState<IPopUp>({
        title: "",
        type: Active,
        labels: { name: "", type: "", description: "", price: "", imageUrl: "", phone: "", adress: "", firstName: "", lastName: "", phoneNumber: "", position: "", dateOfEmployment: "", role: "", createdAt: "" },
        onSubmit: undefined,
        confirmClick: undefined,
        options: [""],
        roleOptions: ["Admin", "none"],
        content: "",
    });
    const currentId = useRef<number>(0)

    const ClosePopup = () => { setIsPopUpOpen(false); }

    /* SET FILTER TO DEFAULT VALUE */
    useEffect(() => {
        setActiveFilter("All");
    }, [Active]);

    /* >>> CRUD OPERATIONS FOR CATEGORY <<< */
    const createNewCategory = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            ...createNewCategoryPopup(Active as "food" | "drink"),
            onSubmit: async (data: ICategory) => {
                if (data.name) {
                    try {
                        await createNewData(CategoryAPI_URL, {
                            name: data.name,
                            type: Active
                        });
                        setMessageProps({
                            ...successMessage("category"),
                            isVisible: MessageProps.isVisible + 1,
                        });
                        setIsPopUpOpen(false);
                        await refetchCategories();
                    } catch (err) {
                        setMessageProps({
                            ...errorMessage("category"),
                            isVisible: MessageProps.isVisible + 1,
                        });
                        setIsPopUpOpen(false);
                    }
                }
            }
        });

    }
    const deleteCategory = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            ...confirmMessage("category"),
            confirmClick: async () => {
                try {
                    await deleteData(CategoryAPI_URL, currentId.current);
                    setMessageProps({
                        ...deleteSuccessMessage("category"),
                        isVisible: MessageProps.isVisible + 1,
                    });
                    setIsPopUpOpen(false);
                    await refetchCategories();
                } catch (err) {
                    setMessageProps({
                        ...deleteErrorMessage("category"),
                        isVisible: MessageProps.isVisible + 1,
                    });
                    setIsPopUpOpen(false);
                }
            },
        });
    }
    const updateCategory = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            ...editCategoryPopup(Active as "food" | "drink"),
            onSubmit: async (data: ICategory) => {
                try {
                    await updateData(CategoryAPI_URL, currentId.current, {
                        name: data.name,
                        type: Active
                    });
                    setMessageProps({
                        ...updateSuccessMessage("category"),
                        isVisible: MessageProps.isVisible + 1,
                    });
                    setIsPopUpOpen(false);
                    await refetchCategories();
                } catch (err) {
                    setMessageProps({
                        ...updateErrorMessage("category"),
                        isVisible: MessageProps.isVisible + 1,
                    });
                    setIsPopUpOpen(false);
                }
            },
        });
    }

    /* >>> CRUD OPERATIONS FOR ITEM <<< */
    const createNewItem = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            ...createNewItemPopup(categoryData ? categoryData.filter((category: ICategory) => category.type === Active) : []),
            onSubmit: async (data: IItem) => {
                if (data.name)
                    try {
                        await createNewData(ItemAPI_URL, {
                            name: data?.name,
                            price: data?.price,
                            description: data?.description,
                            imageUrl: data?.imageUrl,
                            categoryId: data?.categoryId
                        });
                        setMessageProps({
                            ...successMessage("item"),
                            isVisible: MessageProps.isVisible + 1,
                        });
                        setIsPopUpOpen(false);
                        await refetchItems();
                    } catch (err) {
                        setMessageProps({
                            ...errorMessage("item"),
                            isVisible: MessageProps.isVisible + 1,
                        });
                        setIsPopUpOpen(false);
                    }
            }
        });
    }

    const deleteItem = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            ...confirmMessage("item"),
            confirmClick: async () => {
                try {
                    await deleteData(ItemAPI_URL, currentId.current);
                    setMessageProps({
                        ...deleteSuccessMessage("item"),
                        isVisible: MessageProps.isVisible + 1,
                    });
                    setIsPopUpOpen(false);
                    await refetchItems();
                }
                catch (err) {
                    setMessageProps({
                        ...deleteErrorMessage("item"),
                        isVisible: MessageProps.isVisible + 1,
                    });
                    setIsPopUpOpen(false);
                }
            }
        });
    }

    const updateItem = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            ...editItemPopup(categoryData ? categoryData.filter((category: ICategory) => category.type === Active) : []),
            onSubmit: async (data: IItem) => {
                try {
                    await updateData(ItemAPI_URL, currentId.current, {
                        name: data.name,
                        price: data.price,
                        description: data.description,
                        imageUrl: data.imageUrl,
                        categoryId: data.categoryId
                    });
                    setMessageProps({
                        ...updateSuccessMessage("item"),
                        isVisible: MessageProps.isVisible + 1,
                    });
                    setIsPopUpOpen(false);
                    await refetchItems();
                } catch (err) {
                    setMessageProps({
                        ...updateErrorMessage("item"),
                        isVisible: MessageProps.isVisible + 1,
                    });
                    setIsPopUpOpen(false);
                }
            },
        });
    }


    /* >>> CRUD OPERATIONS FOR STAFF <<< */
    const createStaffMember = () => {
        setIsPopUpOpen(true);
        setPopupInfo({
            ...createNewStaffPopup(),
            onSubmit: async (data: IStaff) => {
                if (data.firstName && data.lastName && data.phoneNumber && data.email && data.username && data.position && data.dateOfEmployment && data.password && data.role && data.createdAt) {
                    try {
                        await createNewData(StaffAPI_URL, {
                            firstName: data.firstName,
                            lastName: data.lastName,
                            phoneNumber: data.phoneNumber,
                            email: data.email,
                            username: data.username,
                            position: data.position,
                            dateOfEmployment: data.dateOfEmployment,
                            password: data.password,
                            role: data.role,
                            createdAt: data.createdAt,
                        });
                        setMessageProps({
                            ...successMessage("staff member"),
                            isVisible: MessageProps.isVisible + 1,
                        });
                        setIsPopUpOpen(false);
                        await refetchStaff();
                    } catch (err) {
                        setMessageProps({
                            ...errorMessage("staff member"),
                            isVisible: MessageProps.isVisible + 1,
                        });
                        setIsPopUpOpen(false);
                    }
                }
            }
        });

    }
    return (
        <>
            <div className="dashboard">
                <AccountSummary daily={dailyTotal} weekly={weeklyTotal} monthly={monthlyTotal} show={{ daily: true, weekly: true, monthly: true }} />
                <Message isVisible={MessageProps.isVisible} message={MessageProps.status} messageDetails={MessageProps} />
                <PopUp select={popupInfo.select} roleOptions={popupInfo.roleOptions} content={popupInfo.content} options={popupInfo.options} confirmClick={async () => await popupInfo.confirmClick?.()} onSubmit={async (data: IFormData) => await popupInfo.onSubmit?.(data)} title={popupInfo.title} labels={popupInfo.labels} closemodal={ClosePopup} status={isPopUpOpen} input={popupInfo.input} type={popupInfo.type} />
                <div className={style.itemsContainer}>
                    <div className={style.tabs}>
                        <Tab value="food" onclick={() => setActive("food")} active={Active}><FontAwesomeIcon icon={faUtensils}></FontAwesomeIcon> Food</Tab>
                        <Tab value="drink" onclick={() => setActive("drink")} active={Active}><FontAwesomeIcon icon={faMartiniGlassCitrus}></FontAwesomeIcon> Drink</Tab>
                    </div>

                    <div className={style.categorySection}>
                        <h2>Category   <Button onClick={() => createNewCategory()} variant="add" size="medium">Add+</Button></h2>
                        <div className={style.tableWrapper}>



                            <Table<ICategory> size="xs" data={categoryData ? categoryData : []} columns={[
                                { header: "ID", render: (_row: ICategory, rowIndex: number) => (rowIndex + 1), textalignment: "center", headerAlignment: "center" },
                                { header: "Name", accessor: "name", textalignment: "center", headerAlignment: "center" },
                                {
                                    header: "Actions", render: (row: ICategory) => (
                                        <div className={style.actionButton}>
                                            <Button onClick={() => { updateCategory(); currentId.current = row.id!; setPopupInfo(prev => ({ ...prev, input: { name: row.name }, type: Active })) }} variant="edit" size="small">Edit</Button>
                                            <Button onClick={() => { deleteCategory(); currentId.current = row.id!; setPopupInfo(prev => ({ ...prev, input: { name: row.name }, type: Active })) }} variant="delete" size="small">Delete</Button>
                                        </div>
                                    ), textalignment: "left", headerAlignment: "center"
                                },

                            ]
                            }
                            />
                            {categoryLoading && <p>Loading categories...</p>}
                            {categoryError && <p className={style.error}>Error loading categories: {categoryError.message}</p>}
                        </div>
                    </div>
                    <div className={style.itemsSection}>
                        <div className={style.itemsNavigationBar}>
                            <h2>Items </h2>
                            <Button onClick={() => createNewItem()} variant="add" size="medium">Add</Button>
                            <input
                                type="text"
                                name="search"
                                id="search"
                                placeholder="Search items"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                        <div className={style.filterOptions}>
                            <Button onClick={() => setActiveFilter(() => "All")} variant="filter" size="small" className={activeFilter === "All" ? style.activeFilter : ""}>All</Button>
                            {categoryData ? categoryData.filter((category) => category.type === Active).map((category) => (
                                <Button key={category.id} onClick={() => { setActiveFilter(() => category.name!); console.log("KLIKNUO SI NA: " + category.name) }} className={activeFilter === category.name ? style.activeFilter : ""} variant="filter" size="small" >{category.name}</Button>
                            )) : null}
                        </div>
                        <div className={style.tableWrapper}>

                            <Table<IItem> size="l" data={itemData ? filterItemsByActiveType(itemData, categoryData, Active) : []} columns={[
                                { header: "ID", render: (_row: IItem, rowIndex: number) => (rowIndex + 1), textalignment: "center", headerAlignment: "center" },
                                { header: "Image", render: (row: IItem) => <img src={row.imageUrl} alt={row.name} />, textalignment: "center", headerAlignment: "center" },
                                { header: "Name", accessor: "name", textalignment: "center", headerAlignment: "center" },
                                { header: "Category", accessor: "categoryName", textalignment: "center", headerAlignment: "center" },
                                { header: "Description", accessor: "description", textalignment: "left", headerAlignment: "center" },
                                { header: "Price", render: (row: IItem) => <span>{row.price} BAM</span>, textalignment: "center", headerAlignment: "center" },
                                {
                                    header: "Actions", render: (row: IItem) => (
                                        <div className={style.actionButton}>
                                            <Button onClick={() => { updateItem(); currentId.current = row.id!; setPopupInfo(prev => ({ ...prev, select: categoryData ? categoryData.filter(c => c.type === Active) : [], input: { name: row.name, description: row.description, price: row.price, imageUrl: row.imageUrl, categoryId: row.categoryId ?? categoryData?.find(c => c.name === row.categoryName)?.id }, type: Active })) }} variant="edit" size="small">Edit</Button>
                                            <Button onClick={() => { deleteItem(); currentId.current = row.id!; setPopupInfo(prev => ({ ...prev, input: { name: row.name }, type: Active })) }} variant="delete" size="small">Delete</Button>
                                        </div>
                                    ), textalignment: "left", headerAlignment: "center"
                                }

                            ]
                            }
                            />
                            {itemLoading && <p>Loading items...</p>}
                            {itemError && <p className={style.error}>Error loading items: {itemError.message}</p>}
                        </div>
                    </div>
                    <div className={style.staffSection}>
                        <h2>Staff members <Button onClick={() => createStaffMember()} variant="add" size="medium">Add+</Button></h2>
                        <div className={style.tableWrapper}>

                            <Table<IStaff> size="l" data={staffData ?? []} columns={[
                                { header: "ID", render: (_row: IStaff, rowIndex: number) => (rowIndex + 1), textalignment: "center", headerAlignment: "center" },
                                { header: "First name", accessor: "firstName", textalignment: "center", headerAlignment: "center" },
                                { header: "Lastname", accessor: "lastName", textalignment: "center", headerAlignment: "center" },
                                { header: "E-mail", accessor: "email", textalignment: "center", headerAlignment: "center" },
                                {
                                    header: "See more", render: (row: IStaff) => (
                                        <Link to={`/staff/${row.id}`}>See more</Link>
                                    ), textalignment: "center", headerAlignment: "center"
                                }

                            ]
                            }
                            />
                            {staffLoading && <p>Loading staff members...</p>}
                            {staffError && <p className={style.error}>Error loading staff members: {staffError.message}</p>}
                        </div>
                    </div>

                    <div className={style.incomeSection}>
                        <div className={style.incomeNavigationBar}>
                            <h2>Income</h2>
                            {incomePeriod === "daily" && (
                                <input
                                    type="date"
                                    name="incomeDate"
                                    id="incomeDate"
                                    value={incomeDate}
                                    onChange={(e) => setIncomeDate(e.target.value)}
                                />
                            )}
                            {(incomePeriod === "monthly" || incomePeriod === "yearly") && (
                                <YearPicker
                                    value={incomeYear}
                                    years={selectableYears}
                                    onChange={setIncomeYear}
                                />
                            )}
                        </div>
                        <div className={style.filterOptions}>
                            <Button
                                onClick={() => {
                                    setIncomePeriod("daily");
                                    setIncomeDate("");
                                }}
                                variant="filter"
                                size="small"
                                className={incomePeriod === "daily" ? style.activeFilter : ""}
                            >
                                daily
                            </Button>
                            <Button
                                onClick={() => {
                                    setIncomePeriod("monthly");
                                    setIncomeDate("");
                                }}
                                variant="filter"
                                size="small"
                                className={incomePeriod === "monthly" ? style.activeFilter : ""}
                            >
                                monthly
                            </Button>
                            <Button
                                onClick={() => {
                                    setIncomePeriod("yearly");
                                    setIncomeDate("");
                                }}
                                variant="filter"
                                size="small"
                                className={incomePeriod === "yearly" ? style.activeFilter : ""}
                            >
                                yearly
                            </Button>
                        </div>
                        <div className={style.tableWrapper}>
                            <Table<IIncomeRow>
                                size="l"
                                data={incomeRows}
                                columns={incomeColumns}
                            />
                            {incomeLoading && <p>Loading income...</p>}
                            {incomeError && <p className={style.error}>Error loading income: {incomeError}</p>}
                        </div>
                    </div>

                    <div className={style.incomeSection}>
                        <div className={style.incomeNavigationBar}>
                            <h2>Top Selling Items</h2>
                            {topSellingPeriod === "daily" && (
                                <input
                                    type="date"
                                    name="topSellingDate"
                                    id="topSellingDate"
                                    value={topSellingDate}
                                    onChange={(e) => setTopSellingDate(e.target.value)}
                                />
                            )}
                            {topSellingPeriod === "monthly" && (
                                <select
                                    value={topSellingMonth}
                                    onChange={(e) => setTopSellingMonth(e.target.value)}
                                >
                                    <option value="01">January</option>
                                    <option value="02">February</option>
                                    <option value="03">March</option>
                                    <option value="04">April</option>
                                    <option value="05">May</option>
                                    <option value="06">June</option>
                                    <option value="07">July</option>
                                    <option value="08">August</option>
                                    <option value="09">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                </select>
                            )}
                            {topSellingPeriod === "yearly" && (
                                <YearPicker
                                    value={topSellingYear}
                                    years={selectableYears}
                                    onChange={setTopSellingYear}
                                />
                            )}
                        </div>
                        <div className={style.filterOptions}>
                            <Button
                                onClick={() => {
                                    setTopSellingPeriod("daily");
                                }}
                                variant="filter"
                                size="small"
                                className={topSellingPeriod === "daily" ? style.activeFilter : ""}
                            >
                                daily
                            </Button>
                            <Button
                                onClick={() => {
                                    setTopSellingPeriod("monthly");
                                }}
                                variant="filter"
                                size="small"
                                className={topSellingPeriod === "monthly" ? style.activeFilter : ""}
                            >
                                monthly
                            </Button>
                            <Button
                                onClick={() => {
                                    setTopSellingPeriod("yearly");
                                }}
                                variant="filter"
                                size="small"
                                className={topSellingPeriod === "yearly" ? style.activeFilter : ""}
                            >
                                yearly
                            </Button>
                        </div>
                        <div className={style.tableWrapper}>
                            <Table
                                size="l"
                                data={topSellingRows}
                                columns={topSellingColumns}
                            />
                            {topSellingLoading && <p>Loading top selling items...</p>}
                            {topSellingError && <p className={style.error}>Error loading top selling items: {topSellingError}</p>}
                            {!topSellingLoading && !topSellingError && topSellingRows.length === 0 && <p>No top selling items found for selected period.</p>}
                        </div>
                    </div>

                    <div className={style.incomeSection}>
                        <div className={style.incomeNavigationBar}>
                            <h2>Top Earnings by Waiters</h2>
                            {waitersPeriod === "daily" && (
                                <input
                                    type="date"
                                    name="waitersDate"
                                    id="waitersDate"
                                    value={waitersDate}
                                    onChange={(e) => setWaitersDate(e.target.value)}
                                />
                            )}
                            {waitersPeriod === "monthly" && (
                                <select
                                    value={waitersMonth}
                                    onChange={(e) => setWaitersMonth(e.target.value)}
                                >
                                    <option value="01">January</option>
                                    <option value="02">February</option>
                                    <option value="03">March</option>
                                    <option value="04">April</option>
                                    <option value="05">May</option>
                                    <option value="06">June</option>
                                    <option value="07">July</option>
                                    <option value="08">August</option>
                                    <option value="09">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                </select>
                            )}
                            {waitersPeriod === "yearly" && (
                                <YearPicker
                                    value={waitersYear}
                                    years={selectableYears}
                                    onChange={setWaitersYear}
                                />
                            )}
                        </div>
                        <div className={style.filterOptions}>
                            <Button
                                onClick={() => {
                                    setWaitersPeriod("daily");
                                }}
                                variant="filter"
                                size="small"
                                className={waitersPeriod === "daily" ? style.activeFilter : ""}
                            >
                                daily
                            </Button>
                            <Button
                                onClick={() => {
                                    setWaitersPeriod("monthly");
                                }}
                                variant="filter"
                                size="small"
                                className={waitersPeriod === "monthly" ? style.activeFilter : ""}
                            >
                                monthly
                            </Button>
                            <Button
                                onClick={() => {
                                    setWaitersPeriod("yearly");
                                }}
                                variant="filter"
                                size="small"
                                className={waitersPeriod === "yearly" ? style.activeFilter : ""}
                            >
                                yearly
                            </Button>
                        </div>
                        <div className={style.tableWrapper}>
                            <Table
                                size="l"
                                data={waitersRows}
                                columns={waitersColumns}
                            />
                            {waitersLoading && <p>Loading waiters earnings...</p>}
                            {waitersError && <p className={style.error}>Error loading waiters earnings: {waitersError}</p>}
                            {!waitersLoading && !waitersError && waitersRows.length === 0 && <p>No waiters earnings found for selected period.</p>}
                        </div>
                    </div>

                    <div className={style.incomeSection}>
                        <div className={style.incomeNavigationBar}>
                            <h2>Total Receipts</h2>
                            {receiptsPeriod === "daily" && (
                                <input
                                    type="date"
                                    name="receiptsDate"
                                    id="receiptsDate"
                                    value={receiptsDate}
                                    onChange={(e) => setReceiptsDate(e.target.value)}
                                />
                            )}
                            {receiptsPeriod === "monthly" && (
                                <YearPicker
                                    value={receiptsYear}
                                    years={selectableYears}
                                    onChange={setReceiptsYear}
                                />
                            )}
                            {receiptsPeriod === "yearly" && (
                                <YearPicker
                                    value={receiptsYear}
                                    years={selectableYears}
                                    onChange={setReceiptsYear}
                                />
                            )}
                        </div>
                        <div className={style.filterOptions}>
                            <Button
                                onClick={() => {
                                    setReceiptsPeriod("daily");
                                }}
                                variant="filter"
                                size="small"
                                className={receiptsPeriod === "daily" ? style.activeFilter : ""}
                            >
                                daily
                            </Button>
                            <Button
                                onClick={() => {
                                    setReceiptsPeriod("monthly");
                                }}
                                variant="filter"
                                size="small"
                                className={receiptsPeriod === "monthly" ? style.activeFilter : ""}
                            >
                                monthly
                            </Button>
                            <Button
                                onClick={() => {
                                    setReceiptsPeriod("yearly");
                                }}
                                variant="filter"
                                size="small"
                                className={receiptsPeriod === "yearly" ? style.activeFilter : ""}
                            >
                                yearly
                            </Button>
                        </div>
                        <div className={style.tableWrapper}>
                            <Table
                                size="l"
                                data={receiptsRows}
                                columns={receiptsColumns}
                            />
                            {receiptsLoading && <p>Loading receipts count...</p>}
                            {receiptsError && <p className={style.error}>Error loading receipts count: {receiptsError}</p>}
                            {!receiptsLoading && !receiptsError && receiptsRows.length === 0 && <p>No receipts data found for selected period.</p>}
                        </div>
                    </div>

                </div>
            </div >



        </>
    );
}
export default Dashboard;