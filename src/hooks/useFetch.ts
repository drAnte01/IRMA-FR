//hooks/useFetch.ts
import { useState, useEffect } from "react";
import { Fetch } from "../api/API";

export function useFetch<T>(
  url: string,
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>; // dodamo refetch
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await Fetch<T>(url);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData }; // vraćamo refetch
}



/*
export function useFetch<T>(
  url: string,
  activeType: string,
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>; // dodamo refetch
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeType === "All" ? url : `${url}/filter/${activeType}`; // problem je ovdje
      const result = await Fetch<T>(endpoint);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url, activeType]);

  return { data, loading, error, refetch: fetchData }; // vraćamo refetch
}
*/
