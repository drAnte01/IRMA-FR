//help/endpoints.ts
import type {SalesData} from "../interface/interface";


const CategoryAPI_URL = "http://localhost:5000/api/Category";
const ItemAPI_URL = "http://localhost:5000/api/Item";
const OrderAPI_URL = "http://localhost:5000/api/Order";
const SalesAPI_URL = "http://localhost:5000/api/Sales";
const StaffAPI_URL = "http://localhost:5000/api/Staff";


function GetSales(url: string, type: SalesData["type"]): string {
  return `${url}/${type}`;
}

function GetItems(url: string, activeType: string): string {
  const endpoint = activeType === "All" ? url : `${url}/filter/${activeType}`;
  return endpoint;
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

function getOrdersByStatus(
  url: string,
  status: "active" | "closed",
  page: number = 1,
  pageSize: number = 20
): string {
  return `${url}/status/${status}?page=${page}&pageSize=${pageSize}`;
}


export {
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
  getOrdersByStatus,
};
