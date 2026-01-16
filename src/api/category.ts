// src/api/category.ts

import axios from "axios";
import type { ICategory } from "../interface/category";

const API_URL = "http://localhost:5000/api/Category";

const getAllCategories = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

const CreateCategory = async (categoryData: ICategory) => {
  try {
    const response = await axios.post(API_URL, categoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

const DeleteCategory = async (id: number) => {
  try {
    const deleted = await axios.delete(`${API_URL}/${id}`);
    return deleted.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

const UpdateCategory = async (id: number, CategryData: ICategory) => {
  try {
    const update = await axios.put(`${API_URL}/${id}`, CategryData);
    return update.data;
  } catch (error) {
    console.log("ovo je id: " + id);
    console.log("ovo su podaci: " + CategryData.name + " " + CategryData.type);

    console.error("Error while updating category:", error);
    throw error;
  }
};

export { getAllCategories, CreateCategory, DeleteCategory, UpdateCategory };
