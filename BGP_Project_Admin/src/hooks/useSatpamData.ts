import { useState, useEffect, useCallback } from "react";
import { satpamService } from "../services/satpamService";
import type { Satpam } from "../types/satpam";
import { getRole } from "../Utils/helpers";
import { addToast } from "@heroui/react";

export const useSatpamData = () => {
  const [dataSatpam, setDataSatpam] = useState<Satpam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [userRole, setUserRole] = useState<string>("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    const role = getRole();
    if (role) setUserRole(role);
  }, []);

  const fetchSatpam = useCallback(async () => {
    setLoading(true);
    try {
      const response = await satpamService.getAll(page);
      if (response && response.data && Array.isArray(response.data.data)) {
        setDataSatpam(response.data.data);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.total_pages);
          setRowsPerPage(response.data.pagination.items_per_page);
        }
      } else {
        setDataSatpam([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Fetch satpam error:", error);
      setDataSatpam([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchSatpam();
  }, [fetchSatpam]);

  const confirmDelete = (uuid: string) => {
    setDeleteTargetId(uuid);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteModalOpen(false);
    try {
      await satpamService.delete(deleteTargetId);
      addToast({
        title: "Berhasil",
        description: "Data satpam berhasil dihapus.",
        variant: "flat",
        timeout: 3000,
        color: "danger",
      });
      fetchSatpam();
    } catch (error: any) {
      addToast({
        title: "Gagal",
        description: error.message || "Gagal menghapus satpam.",
        variant: "flat",
        color: "danger",
      });
    } finally {
      setDeleteTargetId(null);
    }
  };

  return {
    dataSatpam,
    loading,
    page,
    totalPages,
    rowsPerPage,
    userRole,
    setPage,
    refreshData: fetchSatpam,
    deleteState: {
      isOpen: isDeleteModalOpen,
      setIsOpen: setDeleteModalOpen,
      confirm: confirmDelete,
      execute: executeDelete,
    },
  };
};
