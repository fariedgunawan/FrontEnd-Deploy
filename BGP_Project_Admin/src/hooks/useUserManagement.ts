import { useState, useEffect, useCallback } from "react";
import { addToast } from "@heroui/react";
import { userService } from "../services/userService";
import type { User } from "../types/user";

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTargetUuid, setDeleteTargetUuid] = useState<string | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const responseData = await userService.getAll(page);
      if (responseData.data && Array.isArray(responseData.data.data)) {
        setUsers(responseData.data.data);
        if (responseData.data.pagination) {
          setTotalPages(responseData.data.pagination.total_pages);
        }
      } else {
        setUsers([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const confirmDelete = (uuid: string) => {
    setDeleteTargetUuid(uuid);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTargetUuid) return;
    setDeleteModalOpen(false);

    try {
      await userService.delete(deleteTargetUuid);
      addToast({
        title: "Berhasil",
        description: "Data user berhasil dihapus.",
        variant: "flat",
        timeout: 3000,
        color: "danger",
      });
      fetchUsers();
    } catch (error: any) {
      addToast({
        title: "Gagal",
        description: error.message || "Gagal menghapus user.",
        variant: "flat",
        color: "danger",
      });
    } finally {
      setDeleteTargetUuid(null);
    }
  };

  return {
    users,
    loading,
    page,
    setPage,
    totalPages,
    refreshData: fetchUsers,
    deleteState: {
      isOpen: isDeleteModalOpen,
      setIsOpen: setDeleteModalOpen,
      confirm: confirmDelete,
      execute: executeDelete,
    },
  };
};
