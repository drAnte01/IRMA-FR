// components/template/popupTemplates.ts
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import type { ICategory } from "../../interface/interface";

//CATEGORY POPUPS
export const createNewCategoryPopup = (type: "food" | "drink") => ({
  title: "Add new Category",
  labels: {
    name: "Category Name",
    type: "Category Type",
  },
  type: type,
});

export const editCategoryPopup = (type: "food" | "drink") => ({
  title: `Edit Category`,
  labels: {
    name: "Category Name",
    type: "Category Type",
  },
  type: type,
});

//ITEM POPUPS
// prettier-ignore
export const createNewItemPopup = ( categories: ICategory[],) => ({
  title: "Add new Item",
  labels: {
    name: "Item Name",
    type: "Category",
    description: "Description",
    price: "Price",
    imageUrl: "Image URL",
  },
    select: categories ,
});

// prettier-ignore
export const editItemPopup = (categories: ICategory[],) => ({
  title: `Edit Category`,
  labels: {
    name: "Category Name",
    type: "Category Type",
    description: "Description",
    price: "Price",
    imageUrl: "Image URL",
  },
  select: categories ,
});

//STAFF POPUPS
// prettier-ignore
export const createNewStaffPopup = () => ({
  title: "Add new Staff Member",
  labels: {
    phone: "Phone",
    adress: "Adress",
    Fname: "First Name",
    Lname: "Last Name",
    email: "Email",
    username: "Username",
    password: "Password",
    typeStaff: "Staff Type",
    dateOfBirth: "Date of Birth",
    image: "Image URL",
  },
});
