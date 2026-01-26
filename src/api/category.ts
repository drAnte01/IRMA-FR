// src/api/category.ts

import axios from "axios";

const CategoryAPI_URL = "http://localhost:5000/api/Category";

const getAllCategories = async () => {
  try {
    const response = await axios.get(CategoryAPI_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

const Create = async <T>(url: string, data: T) => {
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    console.error("Error creating data:", error);
    throw error;
  }
};

const Delete = async (url: string, id: number) => {
  try {
    const deleted = await axios.delete(`${url}/${id}`);
    return deleted.data;
  } catch (error) {
    console.error("Error while deleting data:", error);
    throw error;
  }
};

const Update = async<T>(url: string, id: number, Data: T) => {
  try {
    console.log("PUT request:", `${url}/${id}`, Data);
    const update = await axios.put(`${url}/${id}`, Data);
    return update.data;
  } catch (error) {
    console.error("Error while updating category:", error);
    throw error;
  }
};

export { CategoryAPI_URL, getAllCategories, Create, Delete, Update };
