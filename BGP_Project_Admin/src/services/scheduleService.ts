import { getToken } from "../Utils/helpers";
import type {
  ScheduleResponse,
  SatpamOption,
  ShiftOption,
  PosOption,
} from "../types/schedule";

const BASE_URL_API = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const scheduleService = {
  getAll: async (page: number): Promise<ScheduleResponse> => {
    const res = await fetch(`${BASE_URL_API}/v1/jadwal/?pid=${page}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  getById: async (uuid: string) => {
    const res = await fetch(`${BASE_URL_API}/v1/jadwal/${uuid}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  getOptions: async (): Promise<{
    satpam: SatpamOption[];
    shifts: ShiftOption[];
    pos: PosOption[];
  }> => {
    const headers = { Authorization: `Bearer ${getToken()}` };
    const [resSatpam, resShift, resPos] = await Promise.all([
      fetch(`${BASE_URL_API}/v1/satpam/options`, { headers }),
      fetch(`${BASE_URL_API}/v1/shifts/options`, { headers }),
      fetch(`${BASE_URL_API}/v1/pos/options/utama`, { headers }),
    ]);

    const dSatpam = await resSatpam.json();
    const dShift = await resShift.json();
    const dPos = await resPos.json();

    return {
      satpam: dSatpam.data || [],
      shifts: dShift.data || [],
      pos: dPos.data || [],
    };
  },

  create: async (payload: any) => {
    const res = await fetch(`${BASE_URL_API}/v1/jadwal/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Gagal menyimpan");
    }
    return res;
  },

  update: async (uuid: string, payload: any) => {
    const res = await fetch(`${BASE_URL_API}/v1/jadwal/${uuid}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Gagal menyimpan");
    }
    return res;
  },

  delete: async (uuid: string) => {
    const res = await fetch(`${BASE_URL_API}/v1/jadwal/${uuid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Gagal menghapus");
    return res;
  },

  generate: async (payload: any) => {
    const res = await fetch(`${BASE_URL_API}/v1/jadwal/generate`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Gagal generate jadwal");
    }
    return res;
  },
};
