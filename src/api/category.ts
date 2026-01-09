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

export { getAllCategories, CreateCategory };
