//help/endpoints.ts
import type {SalesData} from "../interface/interface";


const CategoryAPI_URL = "http://localhost:5000/api/Category";
const ItemAPI_URL = "http://localhost:5000/api/Item";
const OrderAPI_URL = "http://localhost:5000/api/Order";
const SalesAPI_URL = "http://localhost:5000/api/Sales";
const StaffAPI_URL = "http://localhost:5000/api/Staff";
const AuthAPI_URL = "http://localhost:5000/api/auth";


function GetSales(
  url: string,
  type: SalesData["type"],
  filters?: {
    period?: "daily" | "monthly" | "yearly";
    year?: number;
    date?: string;
  }
): string {
  if (type === "income") {
    const incomePeriod = filters?.period ?? "daily";
    const base = `${url}/income/${incomePeriod}`;

    if ((incomePeriod !== "monthly" && incomePeriod !== "yearly") || typeof filters?.year !== "number") {
      return base;
    }

    const params = new URLSearchParams({ year: String(filters.year) });
    return `${base}?${params.toString()}`;
  }

  const base = `${url}/${type}`;

  if (!filters?.period && !filters?.date) {
    return base;
  }

  const params = new URLSearchParams();

  if (filters.period) {
    params.set("period", filters.period);
  }

  if (filters.date?.trim()) {
    params.set("date", filters.date.trim());
  }

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

function GetItems(url: string, activeType: string, search?: string): string {
  const base = activeType === "All" ? url : `${url}/filter/${activeType}`;
  if (!search?.trim()) return base;
  const params = new URLSearchParams({ search: search.trim() });
  return `${base}?${params.toString()}`;
}

function GetCategories(url: string, activeType: string): string {
  const endpoint = `${url}/filter/${activeType}`;
  return endpoint;
}

function getActiveOrder(url: string, table: string): string {
  return `${url}/table/${table}`;
}

function getOrderInvoiceUploadEndpoint(url: string, orderId: number): string {
  return `${url}/${orderId}/invoice`;
}

function getTopSellingItemsEndpoint(url: string): string {
  return `${url}/top-items`;
}

function getWaitersEarningsEndpoint(url: string): string {
  return `${url}/waiters-earnings`;
}

function getReceiptsCountEndpoint(url: string): string {
  return `${url}/receipts-count`;
}

function getWaiterChartsEndpoint(url: string): string {
  return `${url}/waiter-charts`;
}

function getOrdersByStatus(
  url: string,
  status: "pending" | "closed",
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    waiterId?: number;
    waiterUsername?: string;
    waiterName?: string;
  }
): string {
  const params = new URLSearchParams({
    status,
    page: String(page),
    pageSize: String(pageSize),
  });

  if (typeof filters?.waiterId === "number" && Number.isFinite(filters.waiterId)) {
    params.set("waiterId", String(filters.waiterId));
  }

  if (filters?.waiterUsername?.trim()) {
    params.set("waiterUsername", filters.waiterUsername.trim());
  }

  if (filters?.waiterName?.trim()) {
    params.set("waiterName", filters.waiterName.trim());
  }

  return `${url}/status/${status}?${params.toString()}`;
}


export {
  AuthAPI_URL,
  SalesAPI_URL,
  CategoryAPI_URL,
  ItemAPI_URL,
  OrderAPI_URL,
  StaffAPI_URL,
  GetSales,
  GetItems,
  GetCategories,
  getActiveOrder,
  getOrderInvoiceUploadEndpoint,
  getTopSellingItemsEndpoint,
  getWaitersEarningsEndpoint,
  getReceiptsCountEndpoint,
  getWaiterChartsEndpoint,
  getOrdersByStatus,
};
