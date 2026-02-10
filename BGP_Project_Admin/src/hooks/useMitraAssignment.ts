import { useState, useEffect } from "react";
import { satpamService } from "../services/satpamService";
import type { MitraOption, Satpam } from "../types/satpam";
import { addToast, useDisclosure } from "@heroui/react";

export const useMitraAssignment = (onSuccess: () => void) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSatpam, setSelectedSatpam] = useState<Satpam | null>(null);
  const [mitraOptions, setMitraOptions] = useState<MitraOption[]>([]);
  const [formMitraId, setFormMitraId] = useState<string>("");
  const [loadingMitra, setLoadingMitra] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchMitraOptions = async () => {
    setLoadingMitra(true);
    try {
      const res = await satpamService.getMitraOptions();
      if (res && Array.isArray(res.data)) {
        setMitraOptions(res.data);
      } else {
        setMitraOptions([]);
      }
    } catch (error) {
      console.error("Fetch mitra options error:", error);
      setMitraOptions([]);
    } finally {
      setLoadingMitra(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedSatpam && mitraOptions.length > 0) {
      if (selectedSatpam.nama_client) {
        const matchedMitra = mitraOptions.find(
          (m) => m.nama === selectedSatpam.nama_client,
        );
        setFormMitraId(matchedMitra ? matchedMitra.uuid : "unassign");
      } else {
        setFormMitraId("unassign");
      }
    }
  }, [isOpen, selectedSatpam, mitraOptions]);

  const openAssignmentModal = (item: Satpam) => {
    setSelectedSatpam(item);
    setFormMitraId("");
    fetchMitraOptions();
    onOpen();
  };

  const handleAssignMitra = async () => {
    if (!selectedSatpam || !formMitraId) return;
    setSubmitting(true);
    try {
      await satpamService.assignMitra(selectedSatpam.uuid, formMitraId);
      addToast({
        title: "Berhasil",
        description:
          formMitraId === "unassign"
            ? "Penugasan dilepas."
            : "Satpam berhasil ditugaskan.",
        color: "success",
        variant: "flat",
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      addToast({
        title: "Gagal",
        description: error.message,
        color: "danger",
        variant: "flat",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isOpen,
    onClose,
    openAssignmentModal,
    mitraData: { mitraOptions, formMitraId, loadingMitra, submitting },
    setFormMitraId,
    handleAssignMitra,
  };
};
