import { getToken } from "../Utils/helpers";
import type { RadiusSettings } from "../types/radius";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const radiusService = {
  getSettings: async (): Promise<RadiusSettings> => {
    const res = await fetch(`${API_BASE_URL}/v1/auth/settings`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok && data.userSetting) {
      return data.userSetting;
    }
    throw new Error("Gagal mengambil data pengaturan");
  },

  updateSettings: async (settings: {
    radius_utama: number;
    radius_jaga: number;
  }): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/v1/auth/settings`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Gagal update pengaturan");
    }
  },
};
