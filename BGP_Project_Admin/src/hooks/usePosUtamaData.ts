import { useState, useEffect, useCallback } from "react";
import { posService } from "../services/posService";
import type { Pos } from "../types/pos";
import { addToast } from "@heroui/react";

export const usePosUtamaData = () => {
  const [dataPos, setDataPos] = useState<Pos[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetUuid, setDeleteTargetUuid] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoadingTable(true);
    try {
      const response = await posService.getAll(page, "Utama");
      if (response && response.data && Array.isArray(response.data.data)) {
        setDataPos(response.data.data);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.total_pages);
          setRowsPerPage(response.data.pagination.items_per_page);
        }
      } else {
        setDataPos([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Gagal memuat data pos:", error);
      setDataPos([]);
    } finally {
      setLoadingTable(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const confirmDelete = (uuid: string) => {
    setDeleteTargetUuid(uuid);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTargetUuid) return;
    setDeleteModalOpen(false);

    try {
      await posService.delete(deleteTargetUuid);
      addToast({
        title: "Berhasil",
        description: "Data pos berhasil dihapus.",
        color: "danger",
        variant: "flat",
      });
      fetchData();
    } catch (error: any) {
      addToast({
        title: "Gagal",
        description: "Gagal menghapus data pos.",
        color: "danger",
        variant: "flat",
      });
    } finally {
      setDeleteTargetUuid(null);
    }
  };

  return {
    dataPos,
    loadingTable,
    page,
    totalPages,
    rowsPerPage,
    setPage,
    refreshData: fetchData,
    deleteState: {
      isOpen: isDeleteModalOpen,
      setIsOpen: setDeleteModalOpen,
      confirm: confirmDelete,
      execute: executeDelete,
    },
  };
};
