//help/customFunctions.tsx

import type { ICategory, IItem } from "../interface/interface";

//sorting categories by active type
export function filterCategoriesByActiveType(categories: ICategory[] | null, type: string): ICategory[] {
  const filteredCategories = categories?.filter((cat) => cat.type === type) || [];
  return filteredCategories;
}


//sorting items by active type
export function filterItemsByActiveType(items: IItem[], categories: ICategory[] | null, type: string): IItem[] {
  const filteredCategoryByType = categories?.filter((cat) => cat.type === type).map(cat => cat.name);
  const filteredItems = items.filter((item) => filteredCategoryByType?.includes(String(item.categoryName)));
  return filteredItems;
}

//Formatting price
export function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',') + ' BAM';
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
  mutation: () => Promise<void>
): void {
  queueRef.current = queueRef.current
    .then(mutation)
    .catch((error) => {
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

export type DebounceTimerMap = Record<number, ReturnType<typeof setTimeout> | undefined>;

export function clearDebounceTimer(timerMap: DebounceTimerMap, key: number): void {
  const timer = timerMap[key];
  if (!timer) return;

  clearTimeout(timer);
  timerMap[key] = undefined;
}

export function scheduleDebouncedMutation(
  timerMap: DebounceTimerMap,
  key: number,
  delayMs: number,
  mutation: () => void
): void {
  clearDebounceTimer(timerMap, key);
  timerMap[key] = setTimeout(() => {
    mutation();
    timerMap[key] = undefined;
  }, delayMs);
}