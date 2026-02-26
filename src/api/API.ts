// src/api/API.ts

import axios from "axios";
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

const Update = async <T>(url: string, id: number, Data: T) => {
  try {
    console.log("PUT request:", `${url}/${id}`, Data);
    const update = await axios.put(`${url}/${id}`, Data);
    return update.data;
  } catch (error) {
    console.error("Error while updating data:", error);
    throw error;
  }
};

const Fetch = async <T>(url: string): Promise<T | null> => {
  try {
    const response = await axios.get<T>(url);
    return response.data;
  } catch (error: any) {
    console.log("STATUS:", error.response?.status);
    console.log("BACKEND SAYS:", error.response?.data);
    throw error;
  }
};

export { Create, Delete, Update, Fetch };
