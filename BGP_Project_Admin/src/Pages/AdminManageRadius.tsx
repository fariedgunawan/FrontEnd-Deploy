import {
  Button,
  Input,
  Spinner,
  Card,
  CardBody,
  addToast,
} from "@heroui/react";
import { useEffect, useState } from "react";

const AdminManageRadius = () => {
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  // State untuk menyimpan nilai radius
  const [radiusUtama, setRadiusUtama] = useState("");
  const [radiusPatroli, setRadiusPatroli] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const getToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
  };

  // --- FETCH DATA SAAT INI ---
  const fetchRadiusSettings = async () => {
    setLoadingData(true);
    try {
      // Ganti endpoint ini sesuai dengan API backend Anda
      const res = await fetch(`${API_BASE_URL}/v1/settings/radius`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        // Asumsi response data memiliki field radius_utama dan radius_patroli
        setRadiusUtama(data.radius_utama || "");
        setRadiusPatroli(data.radius_patroli || "");
      } else {
        console.log("Gagal mengambil data radius");
      }
    } catch (error) {
      console.log("Error fetch radius:", error);
    }
    setLoadingData(false);
  };

  useEffect(() => {
    fetchRadiusSettings();
  }, []);

  // --- UPDATE DATA ---
  const handleUpdate = async () => {
    if (!radiusUtama || !radiusPatroli) {
      addToast({
        title: "Peringatan",
        description: "Nilai radius tidak boleh kosong.",
        variant: "flat",
        color: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      // Ganti endpoint ini sesuai dengan API backend Anda
      const res = await fetch(`${API_BASE_URL}/v1/settings/radius`, {
        method: "PUT", // Atau POST tergantung backend
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          radius_utama: parseInt(radiusUtama),
          radius_patroli: parseInt(radiusPatroli),
        }),
      });

      const result = await res.json();

      if (res.ok) {
        addToast({
          title: "Berhasil",
          description: "Radius berhasil diperbarui.",
          variant: "flat",
          timeout: 3000,
          color: "success",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      addToast({
        title: "Gagal",
        description: error.message || "Gagal memperbarui radius.",
        variant: "flat",
        color: "danger",
      });
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col p-5">
      <div className="container-content flex flex-col gap-6">
        {/* HEADER */}
        <div className="header-container mt-5">
          <h2 className="font-semibold text-[25px] text-[#122C93]">
            Konfigurasi Radius Absensi & Patroli
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Atur jarak maksimal yang diizinkan untuk melakukan absensi dan patroli (dalam
            satuan meter).
          </p>
        </div>

        {/* CONTENT CARD */}
        <Card className="max-w-2xl border border-gray-200 shadow-none rounded-xl">
          <CardBody className="p-8 gap-8">
            {loadingData ? (
              <div className="flex justify-center py-10">
                <Spinner label="Memuat pengaturan..." />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Input Radius Pos Utama */}
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-[#122C93]">
                    Radius Maksimum Pos Utama
                  </label>
                  <Input
                    type="number"
                    variant="bordered"
                    size="lg"
                    placeholder="Contoh: 100"
                    value={radiusUtama}
                    onChange={(e) => setRadiusUtama(e.target.value)}
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">
                          meter
                        </span>
                      </div>
                    }
                    description="Jarak toleransi GPS untuk absen di Pos Utama."
                  />
                </div>

                {/* Input Radius Pos Patroli */}
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-[#122C93]">
                    Radius Maksimum Pos Patroli
                  </label>
                  <Input
                    type="number"
                    variant="bordered"
                    size="lg"
                    placeholder="Contoh: 50"
                    value={radiusPatroli}
                    onChange={(e) => setRadiusPatroli(e.target.value)}
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">
                          meter
                        </span>
                      </div>
                    }
                    description="Jarak toleransi GPS untuk absen keliling di Pos Patroli."
                  />
                </div>

                {/* Action Button */}
                <div className="flex justify-end mt-4">
                  <Button
                    isLoading={saving}
                    variant="solid"
                    onPress={handleUpdate}
                    className="bg-[#122C93] text-white font-semibold w-40 h-12 text-[16px] rounded-lg"
                  >
                    Update Radius
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminManageRadius;
