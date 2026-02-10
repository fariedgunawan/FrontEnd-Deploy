import { useState } from "react";
import { addToast } from "@heroui/react";
import { userService } from "../services/userService";
import type { FormErrors } from "../types/user";

interface UseUserFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const useUserForm = ({ onSuccess, onClose }: UseUserFormProps) => {
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!nama.trim()) {
      newErrors.nama = "Nama wajib diisi.";
      isValid = false;
    } else if (nama.length > 150) {
      newErrors.nama = "Nama maksimal 150 karakter.";
      isValid = false;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!username) {
      newErrors.username = "Username wajib diisi.";
      isValid = false;
    } else if (username.length < 5) {
      newErrors.username = "Username minimal 5 karakter.";
      isValid = false;
    } else if (username.length > 100) {
      newErrors.username = "Username maksimal 100 karakter.";
      isValid = false;
    } else if (!usernameRegex.test(username)) {
      newErrors.username = "Hanya huruf, angka, dan underscore (_).";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password wajib diisi.";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password minimal 8 karakter.";
      isValid = false;
    } else if (password.length > 16) {
      newErrors.password = "Password maksimal 16 karakter.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setNama("");
    setUsername("");
    setPassword("");
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      addToast({
        title: "Peringatan",
        description: "Mohon periksa inputan anda kembali.",
        variant: "flat",
        color: "warning",
      });
      return;
    }

    try {
      await userService.create({ nama, username, password });
      addToast({
        title: "Berhasil",
        description: "User berhasil ditambahkan.",
        variant: "flat",
        timeout: 3000,
        color: "success",
      });
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      addToast({
        title: "Gagal",
        description: error.message || "Gagal menambahkan user.",
        variant: "flat",
        color: "danger",
      });
    }
  };

  return {
    formState: { nama, username, password },
    setters: { setNama, setUsername, setPassword },
    errors,
    resetForm,
    handleSubmit,
  };
};
