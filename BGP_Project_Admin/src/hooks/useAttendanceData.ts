import { useState, useEffect, useCallback } from "react";
import { attendanceService } from "../services/attendanceService";
import type { Absensi } from "../types/attendance";
import { addToast } from "@heroui/react";

export const useAttendanceData = () => {
  const [dataAbsen, setDataAbsen] = useState<Absensi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 12;

  const fetchAbsensi = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await attendanceService.getAll(page);
      if (result.data && Array.isArray(result.data.data)) {
        setDataAbsen(result.data.data);
        if (result.data.pagination) {
          setTotalPages(result.data.pagination.total_pages);
        }
      } else {
        setDataAbsen([]);
      }
    } catch (error: any) {
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
    fetchAbsensi();
  }, [fetchAbsensi]);

  return {
    data: { dataAbsen, isLoading, page, totalPages, rowsPerPage },
    setPage,
    refreshData: fetchAbsensi,
  };
};
