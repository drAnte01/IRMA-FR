//hooks/useFetch.ts
import { useCallback, useEffect, useState } from "react";
import { Fetch } from "../api/API";

export function useFetch<T>(
  url: string,
  enabled: boolean = true,
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>; // dodamo refetch
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const isCanceledRequest = (err: unknown): boolean => {
    if (!err || typeof err !== "object") return false;

    const maybeAxiosError = err as { code?: string; name?: string };
    return maybeAxiosError.code === "ERR_CANCELED" || maybeAxiosError.name === "AbortError";
  };

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const result = await Fetch<T>(url, signal);
      if (signal?.aborted) return;
      setData(result);
    } catch (err) {
      if (isCanceledRequest(err)) {
        return;
      }
      setError(err as Error);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [url]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    fetchData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [enabled, fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch }; // vraćamo refetch
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
