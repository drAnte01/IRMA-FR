//help/customFunctions.tsx

import type { ICategory, IItem, OrderRow } from "../interface/interface";
import { OrderAPI_URL } from "./enpoints";

//sorting categories by active type
export function filterCategoriesByActiveType(
  categories: ICategory[] | null,
  type: string,
): ICategory[] {
  const filteredCategories =
    categories?.filter((cat) => cat.type === type) || [];
  return filteredCategories;
}

//sorting items by active type
export function filterItemsByActiveType(
  items: IItem[],
  categories: ICategory[] | null,
  type: string,
): IItem[] {
  const filteredCategoryByType = categories
    ?.filter((cat) => cat.type === type)
    .map((cat) => cat.name);
  const filteredItems = items.filter((item) =>
    filteredCategoryByType?.includes(String(item.categoryName)),
  );
  return filteredItems;
}

//Formatting price
export function formatPrice(price: number): string {
  return price.toFixed(2).replace(".", ",") + " BAM";
}

//incrementing and decrementing item quantity
export function updateCartItems(cartItems: number, change: number): number {
  const newQuantity = cartItems + change;
  console.log("Updated cart items:", newQuantity);
  return newQuantity < 0 ? 0 : newQuantity; // Ensure quantity doesn't go below 0
}

// Ensures order mutations run one-by-one to avoid racing API updates.
export function enqueueOrderMutation(
  queueRef: { current: Promise<void> },
  mutation: () => Promise<void>,
): void {
  queueRef.current = queueRef.current.then(mutation).catch((error) => {
    console.error("Order mutation queue error:", error);
  });
}

// Formats an ISO-like date string as MM/DD/YYYY HH:mm in 24-hour format.
export function formatDateTime24(value?: string): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${month}/${day}/${year} ${hours}:${minutes}`;
}

export type DebounceTimerMap = Record<
  number,
  ReturnType<typeof setTimeout> | undefined
>;

export function clearDebounceTimer(
  timerMap: DebounceTimerMap,
  key: number,
): void {
  const timer = timerMap[key];
  if (!timer) return;

  clearTimeout(timer);
  timerMap[key] = undefined;
}

export function scheduleDebouncedMutation(
  timerMap: DebounceTimerMap,
  key: number,
  delayMs: number,
  mutation: () => void,
): void {
  clearDebounceTimer(timerMap, key);
  timerMap[key] = setTimeout(() => {
    mutation();
    timerMap[key] = undefined;
  }, delayMs);
}

/**
 * Gets the origin (protocol + domain) from the API URL.
 * Used for building absolute URLs.
 */
export function getApiOrigin(): string {
  try {
    return new URL(OrderAPI_URL).origin;
  } catch {
    return "";
  }
}

/**
 * Builds an absolute URL for a receipt or invoice.
 *
 * - If the path is already an absolute URL, it returns it unchanged.
 * - If the path is relative (starts with "/"), it prepends the API origin.
 * - If the path is a relative file path, it resolves it using the base API URL.
 * - If anything fails, it returns the original value as fallback.
 *
 * param receiptPath - The receipt or invoice path returned from the backend.
 * returns A valid absolute URL or the original path if it cannot be resolved.
 */
export function buildAbsoluteReceiptUrl(receiptPath: string): string {
  const trimmed = receiptPath.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const origin = getApiOrigin();
  if (trimmed.startsWith("/")) {
    return origin ? `${origin}${trimmed}` : trimmed;
  }

  try {
    return new URL(trimmed, OrderAPI_URL).toString();
  } catch {
    return trimmed;
  }
}

/**
 * Resolves the PDF URL for an order from multiple possible sources.
 */

export function resolvePdfUrl(
  order: Record<string, unknown>,
  orderId: number,
): string | undefined {
  const pdfBase64 =
    typeof order.pdfBase64 === "string" ? order.pdfBase64.trim() : "";
  if (pdfBase64) {
    return `data:application/pdf;base64,${pdfBase64}`;
  }

  const receiptPath =
    typeof order.receiptPath === "string" ? order.receiptPath : "";
  if (receiptPath.trim()) {
    return buildAbsoluteReceiptUrl(receiptPath);
  }

  const candidates = [
    order.pdfUrl,
    order.invoiceUrl,
    order.invoicePdfUrl,
    order.pdfPath,
    order.invoicePath,
    order.fileUrl,
  ];

  const found = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  ) as string | undefined;
  if (found) {
    if (/^https?:\/\//i.test(found)) return found;

    try {
      return new URL(found, OrderAPI_URL).toString();
    } catch {
      return found;
    }
  }

  if (orderId > 0) {
    return `${OrderAPI_URL}/${orderId}/invoice`;
  }

  return undefined;
}

export function normalizeOrders(payload: unknown): OrderRow[] {
  const asObject = (value: unknown): Record<string, unknown> | null => {
    if (typeof value !== "object" || value === null) return null;
    return value as Record<string, unknown>;
  };

  const parseStatus = (value: unknown): string =>
    String(value ?? "")
      .toLowerCase()
      .trim();

  const source = (() => {
    if (Array.isArray(payload)) return payload;

    const root = asObject(payload);
    if (!root) return [];

    const wrapped = [root.orders, root.data, root.items].find(Array.isArray);
    if (Array.isArray(wrapped)) return wrapped;

    if (asObject(root.order) || root.id || root.orderId) {
      return [root];
    }

    return [];
  })();

  return source
    .map((entry) => {
      const row = asObject(entry);
      if (!row) return null;

      const orderData = asObject(row.order) ?? row;

      const rawId = Number(
        orderData.id ?? orderData.orderId ?? row.id ?? row.orderId ?? 0,
      );
      const status = parseStatus(orderData.status ?? row.status);

      return {
        id: rawId,
        table: String(
          orderData.table ??
            orderData.tableName ??
            row.table ??
            row.tableName ??
            "-",
        ),
        status,
        subtotal: (orderData.subtotal ?? row.subtotal) as
          | string
          | number
          | undefined,
        taxAmount: (orderData.taxAmount ?? row.taxAmount) as
          | string
          | number
          | undefined,
        totalPrice: (orderData.totalPrice ??
          orderData.total ??
          orderData.amount ??
          row.totalPrice ??
          row.total ??
          row.amount) as string | number | undefined,
        createdAt: (orderData.createdAt ?? row.createdAt) as string | undefined,
        fileName: (row.fileName ?? row.invoiceFileName) as string | undefined,
        pdfUrl: resolvePdfUrl(orderData, rawId),
      } as OrderRow;
    })
    .filter((row): row is OrderRow => Boolean(row && row.id > 0));
}


//Pagination
export function getPaginationMeta(payload: unknown): {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  pageSize: number;
} {
  if (typeof payload !== "object" || payload === null) {
    return {
      currentPage: 1,
      totalPages: 1,
      totalOrders: 0,
      pageSize: 0,
    };
  }

  const root = payload as Record<string, unknown>;

  return {
    currentPage: Number(root.currentPage ?? 1),
    totalPages: Number(root.totalPages ?? 1),
    totalOrders: Number(root.totalOrders ?? 0),
    pageSize: Number(root.pageSize ?? 0),
  };
}