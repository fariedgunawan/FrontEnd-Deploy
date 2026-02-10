import type {
  AttendanceResponse,
  UpdateAttendancePayload,
} from "../types/attendance";
import { getToken } from "../Utils/helpers";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const attendanceService = {
  getAll: async (page: number): Promise<AttendanceResponse> => {
    const res = await fetch(`${BASE_URL}/v1/absensi/?pid=${page}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Gagal memuat data absensi");
    return res.json();
  },

  getById: async (uuid: string): Promise<{ data: any }> => {
    const res = await fetch(`${BASE_URL}/v1/absensi/${uuid}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil detail data");
    return res.json();
  },

  update: async (
    uuid: string,
    payload: UpdateAttendancePayload,
  ): Promise<void> => {
    const res = await fetch(`${BASE_URL}/v1/absensi/${uuid}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Gagal update data");
    }
  },

  export: async (): Promise<Blob> => {
    const res = await fetch(`${BASE_URL}/v1/absensi/export`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Gagal mengunduh file");
    return res.blob();
  },
};
