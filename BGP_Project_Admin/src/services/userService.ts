import type { CreateUserPayload, UserResponse } from "../types/user";
import { getToken } from "../Utils/helpers";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const userService = {
  getAll: async (page: number): Promise<UserResponse> => {
    const res = await fetch(`${API_BASE_URL}/v1/users/?pid=${page}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return res.json();
  },

  create: async (payload: CreateUserPayload): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/v1/users/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Gagal menambahkan user");
    }
  },

  delete: async (uuid: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/v1/users/${uuid}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Gagal menghapus user");
    }
  },
};
