import type {
  SatpamResponse,
  MitraOptionsResponse,
  Satpam,
} from "../types/satpam";
import { getToken } from "../Utils/helpers";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const getHeaders = (isMultipart: boolean = false) => {
  const headers: HeadersInit = {
    Authorization: `Bearer ${getToken()}`,
  };
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

export const satpamService = {
  getAll: async (page: number): Promise<SatpamResponse> => {
    const res = await fetch(`${API_BASE}/v1/satpam/?pid=${page}`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  getById: async (uuid: string): Promise<{ data: Satpam }> => {
    const res = await fetch(`${API_BASE}/v1/satpam/${uuid}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  create: async (formData: FormData): Promise<void> => {
    const res = await fetch(`${API_BASE}/v1/satpam/`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData,
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(result.message || "Gagal menambah data satpam");
  },

  update: async (uuid: string, formData: FormData): Promise<void> => {
    const res = await fetch(`${API_BASE}/v1/satpam/${uuid}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: formData,
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(result.message || "Gagal mengupdate data satpam");
  },

  delete: async (uuid: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/v1/satpam/${uuid}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.message || "Gagal menghapus data");
  },

  getMitraOptions: async (): Promise<MitraOptionsResponse> => {
    const res = await fetch(`${API_BASE}/v1/users/options`, {
      method: "GET",
      headers: getHeaders(),
    });
    return res.json();
  },

  assignMitra: async (satpamUuid: string, userUuid: string): Promise<void> => {
    const url =
      userUuid === "unassign"
        ? `${API_BASE}/v1/satpam/${satpamUuid}/unassign`
        : `${API_BASE}/v1/satpam/${satpamUuid}`;

    const body =
      userUuid === "unassign" ? null : JSON.stringify({ user_uuid: userUuid });

    const res = await fetch(url, {
      method: "PUT",
      headers: getHeaders(),
      body,
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(result.message || "Gagal menyimpan perubahan penugasan");
  },
};
