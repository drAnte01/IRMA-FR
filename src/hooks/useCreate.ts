//hooks/create.ts
import { useState } from "react";
import { Create } from "../api/category";

export function useCreate<T>() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const createNewData = async (URL_Endpoint: string, data: T) => {
    setLoading(true);
    setError(null);
    try {
      const newData = await Create(URL_Endpoint, data);
      setLoading(false);
      return newData;
    } catch (err) {
      setError("Error creating data");
      setLoading(false);
      throw err;
    }
  };

  return { createNewData, loading, error };
}
