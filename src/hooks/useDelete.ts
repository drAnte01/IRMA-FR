//hooks/useDelete.ts

import { useState } from "react";
import { Delete } from "../api/API";

export function useDelete() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const deleteData = async (URL_Endpoint: string, id: number) => {
    setLoading(true);
    setError(null);
    try {
      const deletedData = await Delete(URL_Endpoint, id);
      setLoading(false);
      return deletedData;
    } catch (err) {
      setError("Error deleting data");
      setLoading(false);
      throw err;
    }
  };
  return { deleteData, loading, error };
}
