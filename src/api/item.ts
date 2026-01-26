// src/api/category.ts

import axios from "axios";
import type { IItem } from "../interface/interface";

const ItemAPI_URL = "http://localhost:5000/api/Item";

const getAllItems = async () => {
  try {
    const response = await axios.get(ItemAPI_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};
const CreateItem = async (itemData: IItem) => {
  try {
    const response = await axios.post(ItemAPI_URL, itemData);
    return response.data;
  } catch (error) {
    console.error("Error creating item:", error);
    throw error;
  }
};
const DeleteItem = async (id: number) => {
  try {
    const deleted = await axios.delete(`${ItemAPI_URL}/${id}`);
    return deleted.data;
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};

const UpdateItem = async (id: number, itemData: IItem) => {
  try {
    const update = await axios.put(`${ItemAPI_URL}/${id}`, itemData);
    return update.data;
  } catch (error) {
    console.log("Item id: " + id);
    console.log(
      "Item data: " +
        itemData.name +
        " " +
        itemData.categoryId +
        "   " +
        itemData.description +
        " " +
        itemData.price +
        " " +
        itemData.imageUrl,
    );
    console.error("Error updating item:", error);
    throw error;
  }
};

export { ItemAPI_URL, getAllItems, CreateItem, DeleteItem, UpdateItem };
