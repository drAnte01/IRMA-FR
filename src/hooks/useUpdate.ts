//hooks/useUpdate.ts
import { useState } from "react";
import { Update } from "../api/category";

export function useUpdate<T>() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const updateData = async (URL_Endpoint: string, id: number, data: T) => {
    setLoading(true);
    setError(null);
    try {
      const updatedData = await Update(URL_Endpoint, id, data);
      setLoading(false);
      return updatedData;
    } catch (err) {
      setError("Error updating data");
      setLoading(false);
      throw err;
    }
  };
  return { updateData, loading, error };
}
