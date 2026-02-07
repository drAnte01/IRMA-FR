//hooks/useFetch.ts
import { useState, useEffect } from "react";

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
      const endpoint = activeType === "All" ? url : `${url}/filter/${activeType}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const result: T = await response.json();
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

/*
// A custom hook for fetching data from an API
export function useFetch<T>(url: string): {
  data: T | null;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const result: T = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}*/
