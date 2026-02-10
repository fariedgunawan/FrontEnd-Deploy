import { useState, useEffect, useCallback } from "react";
import { patroliService } from "../services/patroliService";
import type { Patroli } from "../types/patroli";
import { addToast } from "@heroui/react";

export const usePatroliData = () => {
  const [dataPatroli, setDataPatroli] = useState<Patroli[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 12;

  const fetchPatroli = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await patroliService.getAll(page);
      if (result.data && Array.isArray(result.data.data)) {
        setDataPatroli(result.data.data);
        if (result.data.pagination) {
          setTotalPages(result.data.pagination.total_pages);
        }
      } else {
        setDataPatroli([]);
      }
    } catch (error: any) {
      console.error(error);
      addToast({
        title: "Gagal",
        description: error.message,
        color: "danger",
        variant: "flat",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPatroli();
  }, [fetchPatroli]);

  return {
    data: { dataPatroli, isLoading, page, totalPages, rowsPerPage },
    setPage,
    refreshData: fetchPatroli,
  };
};
