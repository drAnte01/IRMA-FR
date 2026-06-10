// src/api/API.ts

import axios, { AxiosHeaders } from "axios";

const apiClient = axios.create();

let accessToken: string | null = null;
let refreshAccessTokenHandler: (() => Promise<string | null>) | null = null;

function readStoredAccessToken(): string | null {
  if (typeof window === "undefined") {
    return accessToken;
  }

  return accessToken ?? window.localStorage.getItem("irma.auth.token");
}

function setAccessToken(token: string | null) {
  accessToken = token;

  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem("irma.auth.token", token);
    return;
  }

  window.localStorage.removeItem("irma.auth.token");
}

function setRefreshAccessTokenHandler(handler: (() => Promise<string | null>) | null) {
  refreshAccessTokenHandler = handler;
}

apiClient.interceptors.request.use((config) => {
  const token = readStoredAccessToken();

  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      !refreshAccessTokenHandler ||
      (typeof originalRequest.url === "string" &&
        (originalRequest.url.includes("/auth/login") || originalRequest.url.includes("/auth/refresh")))
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const nextAccessToken = await refreshAccessTokenHandler();

      if (!nextAccessToken) {
        return Promise.reject(error);
      }

      const headers = AxiosHeaders.from(originalRequest.headers);
      headers.set("Authorization", `Bearer ${nextAccessToken}`);
      originalRequest.headers = headers;
      return apiClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

const Create = async <T>(url: string, data: T) => {
  try {
    const response = await apiClient.post(url, data);
    return response.data;
  } catch (error) {
    console.error("Error creating data:", error);
    throw error;
  }
};

const Delete = async (url: string, id: number) => {
  try {
    const deleted = await apiClient.delete(`${url}/${id}`);
    return deleted.data;
  } catch (error) {
    console.error("Error while deleting data:", error);
    throw error;
  }
};

const Update = async <T>(url: string, id: number, Data: T) => {
  try {
    console.log("PUT request:", `${url}/${id}`, Data);
    const update = await apiClient.put(`${url}/${id}`, Data);
    return update.data;
  } catch (error) {
    console.error("Error while updating data:", error);
    throw error;
  }
};

const Fetch = async <T>(url: string, signal?: AbortSignal): Promise<T | null> => {
  try {
    const response = await apiClient.get<T>(url, { signal });
    return response.data;
  } catch (error: any) {
    console.log("STATUS:", error.response?.status);
    console.log("BACKEND SAYS:", error.response?.data);
    throw error;
  }
};

export { apiClient, setAccessToken, setRefreshAccessTokenHandler, Create, Delete, Update, Fetch };
