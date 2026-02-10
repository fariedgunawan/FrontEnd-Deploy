import type { PatroliResponse, UpdatePatroliPayload } from "../types/patroli";
import { getToken } from "../Utils/helpers";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const patroliService = {
  getAll: async (page: number): Promise<PatroliResponse> => {
    const res = await fetch(`${BASE_URL}/v1/patroli/?pid=${page}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Gagal memuat data patroli");
    return res.json();
  },

  update: async (
    uuid: string,
    payload: UpdatePatroliPayload,
  ): Promise<void> => {
    const res = await fetch(`${BASE_URL}/v1/patroli/${uuid}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Gagal update data");
  },

  export: async (): Promise<Blob> => {
    const res = await fetch(`${BASE_URL}/v1/patroli/export`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Gagal mengunduh file");
    return res.blob();
  },
};
