import { useState } from "react";
import { satpamService } from "../services/satpamService";
import type { FormErrors, Satpam } from "../types/satpam";
import { addToast } from "@heroui/react";

interface UseSatpamFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const useSatpamForm = ({ onSuccess, onClose }: UseSatpamFormProps) => {
  const [formNama, setFormNama] = useState<string>("");
  const [formAsal, setFormAsal] = useState<string>("");
  const [formNip, setFormNip] = useState<string>("");
  const [formNoTelp, setFormNoTelp] = useState<string>("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setFormNama("");
    setFormAsal("");
    setFormNip("");
    setFormNoTelp("");
    setFormFile(null);
    setPreviewImage(null);
    setErrors({});
    setIsEditMode(false);
    setEditingId(null);
  };

  const loadDataForEdit = async (item: Satpam) => {
    setIsEditMode(true);
    setEditingId(item.uuid);
    setErrors({});
    try {
      const res = await satpamService.getById(item.uuid);
      const s = res.data;
      if (s) {
        setFormNama(s.nama ?? "");
        setFormAsal(s.asal_daerah ?? "");
        setFormNip(s.nip ?? "");
        setFormNoTelp(s.no_telp ?? "");
        setFormFile(null);
        setPreviewImage(s.image_url ?? null);
      }
    } catch (err) {
      console.error("Error fetching detail:", err);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formNama || formNama.trim().length < 4) {
      newErrors.nama = "Nama minimal 4 karakter.";
      isValid = false;
    } else if (formNama.length > 150) {
      newErrors.nama = "Nama maksimal 150 karakter.";
      isValid = false;
    }

    if (!formAsal || formAsal.trim().length < 4) {
      newErrors.asal_daerah = "Asal Daerah minimal 4 karakter.";
      isValid = false;
    } else if (formAsal.length > 32) {
      newErrors.asal_daerah = "Asal Daerah maksimal 32 karakter.";
      isValid = false;
    }

    if (!formNip || formNip.trim().length < 1) {
      newErrors.nip = "NIP wajib diisi.";
      isValid = false;
    } else if (formNip.length > 50) {
      newErrors.nip = "NIP maksimal 50 karakter.";
      isValid = false;
    }

    if (!formNoTelp || formNoTelp.trim().length < 8) {
      newErrors.no_telp = "No Telp minimal 8 karakter.";
      isValid = false;
    } else if (formNoTelp.length > 20) {
      newErrors.no_telp = "No Telp maksimal 20 karakter.";
      isValid = false;
    }

    if (formFile) {
      const MAX_SIZE = 5 * 1024 * 1024;
      const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
      if (formFile.size > MAX_SIZE) {
        newErrors.image = "Ukuran file maksimal 5MB.";
        isValid = false;
      } else if (!ACCEPTED_TYPES.includes(formFile.type)) {
        newErrors.image = "Format file harus .jpg, .jpeg, atau .png.";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      addToast({
        title: "Validasi Gagal",
        description: "Mohon periksa inputan anda kembali.",
        variant: "flat",
        color: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("nama", formNama);
      fd.append("asal_daerah", formAsal);
      fd.append("nip", formNip);
      fd.append("no_telp", formNoTelp);
      if (formFile) fd.append("image", formFile);

      if (isEditMode && editingId) {
        await satpamService.update(editingId, fd);
        addToast({
          title: "Berhasil",
          description: "Data satpam berhasil diupdate.",
          variant: "flat",
          color: "success",
        });
      } else {
        await satpamService.create(fd);
        addToast({
          title: "Berhasil",
          description: "Data satpam berhasil ditambahkan.",
          variant: "flat",
          color: "success",
        });
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      addToast({
        title: "Gagal",
        description: error.message,
        variant: "flat",
        color: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formState: {
      formNama,
      formAsal,
      formNip,
      formNoTelp,
      formFile,
      previewImage,
    },
    setters: {
      setFormNama,
      setFormAsal,
      setFormNip,
      setFormNoTelp,
      setFormFile,
      setPreviewImage,
    },
    status: { errors, submitting, isEditMode },
    actions: { resetForm, loadDataForEdit, handleSubmit },
  };
};
