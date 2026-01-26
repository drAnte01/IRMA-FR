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