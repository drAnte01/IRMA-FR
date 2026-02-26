//help/endpoints.ts

const CategoryAPI_URL = "http://localhost:5000/api/Category";
const ItemAPI_URL = "http://localhost:5000/api/Item";
const OrderAPI_URL = "http://localhost:5000/api/Order";

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


export {
  CategoryAPI_URL,
  ItemAPI_URL,
  OrderAPI_URL,
  GetItems,
  GetCategories,
  getActiveOrder,
};
