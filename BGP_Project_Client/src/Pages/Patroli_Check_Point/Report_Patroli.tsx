import {
  Button,
  Select,
  SelectItem,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface SatpamOption {
  uuid: string;
  nama: string;
  nip: string;
}

interface PosOption {
  uuid: string;
  nama: string;
}

interface ReportResponse {
  message: string;
  distance?: string;
  allowed?: string;
}

const ReportPatroli = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [photos, setPhotos] = useState<string[]>(
    routeLocation.state?.allPhotos || Array(4).fill(""),
  );

  const [listSatpam, setListSatpam] = useState<SatpamOption[]>([]);
  const [listPos, setListPos] = useState<PosOption[]>([]);

  const [selectedSatpam, setSelectedSatpam] = useState("");
  const [selectedPos, setSelectedPos] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  const [coords, setCoords] = useState({ latitude: 0, longitude: 0 });
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [resultData, setResultData] = useState<ReportResponse | null>(null);
  const [alertMessage, setAlertMessage] = useState("");

  const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

  const dataURLtoBlob = (dataurl: string) => {
    if (!dataurl || !dataurl.includes(",")) return null;
    try {
      const arr = dataurl.split(",");
      const match = arr[0].match(/:(.*?);/);
      if (!match) return null;

      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);

      return new Blob([u8arr], { type: "image/jpeg" });
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (routeLocation.state?.newPhoto) {
      const { newPhoto, indexToReplace } = routeLocation.state;
      setPhotos((prev) => {
        const updated = [...prev];
        if (indexToReplace !== undefined && indexToReplace >= 0) {
          updated[indexToReplace] = newPhoto;
        }
        return updated;
      });
      window.history.replaceState({}, document.title);
    }
  }, [routeLocation.state]);

  useEffect(() => {
    fetch(`${BASE_API_URL}/v1/patroli/options`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setListSatpam(res.data);
        }
      })
      .catch(() => {});

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          setAlertMessage("Gagal mendapatkan lokasi GPS.");
          onOpen();
        },
        { enableHighAccuracy: true },
      );
    }
  }, []);

  useEffect(() => {
    if (selectedSatpam) {
      fetch(`${BASE_API_URL}/v1/patroli/options/${selectedSatpam}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.data && Array.isArray(res.data)) {
            setListPos(res.data);
            setSelectedPos("");
          } else {
            setListPos([]);
          }
        })
        .catch(() => setListPos([]));
    } else {
      setListPos([]);
      setSelectedPos("");
    }
  }, [selectedSatpam]);

  const handleCapture = (index: number) => {
    navigate("/TakePhotoPatroli", {
      state: { indexToReplace: index, allPhotos: photos },
    });
  };

  const handleSubmit = async () => {
    setAlertMessage("");
    setResultData(null);

    if (photos.some((p) => !p)) {
      setAlertMessage("Harap lengkapi 4 foto!");
      onOpen();
      return;
    }
    if (!selectedSatpam || !selectedPos || !status) {
      setAlertMessage("Harap lengkapi semua pilihan!");
      onOpen();
      return;
    }
    if (coords.latitude === 0 && coords.longitude === 0) {
      setAlertMessage("Lokasi GPS belum terdeteksi.");
      onOpen();
      return;
    }

    setLoading(true);

    try {
      setLoadingMessage("1/3 Meminta Slot Upload...");

      const urlRes = await fetch(`${BASE_API_URL}/v1/patroli/upload-urls`);
      if (!urlRes.ok) throw new Error("Gagal generate upload URL dari server.");

      const urlData = await urlRes.json();
      const { upload_urls, filenames } = urlData.data;

      setLoadingMessage("2/3 Mengunggah Foto...");

      const uploadPromises = photos.map(async (photoBase64, index) => {
        const blob = dataURLtoBlob(photoBase64);
        if (!blob) throw new Error(`Foto ke-${index + 1} rusak.`);

        const uploadRes = await fetch(upload_urls[index], {
          method: "PUT",
          headers: {
            "Content-Type": "image/jpeg",
          },
          body: blob,
        });

        if (!uploadRes.ok) {
          throw new Error(`Gagal mengunggah foto ke-${index + 1}.`);
        }

        return uploadRes;
      });

      await Promise.all(uploadPromises);

      setLoadingMessage("3/3 Menyimpan Laporan...");

      const payload = {
        satpam_uuid: selectedSatpam,
        pos_uuid: selectedPos,
        lat: Number(coords.latitude),
        lng: Number(coords.longitude),
        status_lokasi: status,
        keterangan: notes || "Situasi aman terkendali.",
        filenames: filenames,
      };

      const reportRes = await fetch(`${BASE_API_URL}/v1/patroli`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const reportData = await reportRes.json();
      setResultData(reportData);

      if (reportRes.ok) {
        onOpen();
      } else {
        setAlertMessage(reportData.message || "Gagal menyimpan laporan.");
        onOpen();
      }
    } catch (error: any) {
      setAlertMessage(error.message || "Terjadi kesalahan sistem.");
      onOpen();
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const isLocationError = resultData?.message
    ?.toLowerCase()
    .includes("location");
  const isValidationError = alertMessage !== "";

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-[#F5F7FF] px-6 py-10 text-[#122C93]">
      <div className="text-center mb-6">
        <h2 className="text-[20px] font-bold">Data Hasil Patroli</h2>
        <p className="text-[14px] opacity-80">
          {coords.latitude !== 0
            ? `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
            : "Mencari GPS..."}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 w-full mb-6">
        {photos.map((p, i) => (
          <div
            key={i}
            onClick={() => handleCapture(i)}
            className="aspect-[3/4] bg-white rounded-xl border-2 border-dashed border-[#122C93] flex items-center justify-center overflow-hidden cursor-pointer"
          >
            {p ? (
              <img
                src={p}
                className="w-full h-full object-cover"
                alt={`foto-${i}`}
              />
            ) : (
              <span className="text-xl font-bold">+</span>
            )}
          </div>
        ))}
      </div>
      <h2 className="text-sm mb-4">Tekan kotak di atas untuk foto</h2>

      <div className="w-full flex flex-col gap-4">
        <Select
          label="Petugas"
          placeholder="Pilih Nama"
          selectedKeys={selectedSatpam ? [selectedSatpam] : []}
          onSelectionChange={(k) =>
            setSelectedSatpam(Array.from(k)[0] as string)
          }
        >
          {listSatpam.map((s) => (
            <SelectItem key={s.uuid} textValue={s.nama}>
              {s.nama}
            </SelectItem>
          ))}
        </Select>

        <Select
          label="Lokasi Pos"
          placeholder={selectedSatpam ? "Pilih Pos" : "Pilih Petugas Dulu"}
          isDisabled={!selectedSatpam}
          selectedKeys={selectedPos ? [selectedPos] : []}
          onSelectionChange={(k) => setSelectedPos(Array.from(k)[0] as string)}
        >
          {listPos.map((p) => (
            <SelectItem key={p.uuid} textValue={p.nama}>
              {p.nama}
            </SelectItem>
          ))}
        </Select>

        <Select
          label="Status Lokasi"
          placeholder="Pilih Kondisi"
          selectedKeys={status ? [status] : []}
          onSelectionChange={(k) => setStatus(Array.from(k)[0] as string)}
        >
          <SelectItem key="Aman">Aman</SelectItem>
          <SelectItem key="Tidak Aman">Tidak Aman</SelectItem>
        </Select>

        <Textarea
          label="Keterangan"
          placeholder="Tambahkan catatan..."
          value={notes}
          onValueChange={setNotes}
        />

        <Button
          className="bg-[#122C93] text-white font-bold h-12 mt-4"
          onPress={handleSubmit}
          isLoading={loading}
        >
          {loading ? loadingMessage : "Laporkan"}
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        backdrop="blur"
        hideCloseButton
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              {isValidationError ? (
                <>
                  <ModalHeader className="flex flex-col items-center text-[#F59E0B] pt-8">
                    <h2 className="text-[22px] font-bold">Gagal Memproses</h2>
                  </ModalHeader>
                  <ModalBody className="text-center pb-4">
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <p className="text-[#B45309]">{alertMessage}</p>
                    </div>
                  </ModalBody>
                  <ModalFooter className="flex justify-center pb-8">
                    <Button
                      className="bg-[#F59E0B] text-white w-full"
                      onPress={onClose}
                    >
                      Tutup
                    </Button>
                  </ModalFooter>
                </>
              ) : isLocationError ? (
                <>
                  <ModalHeader className="flex flex-col items-center text-[#A80808] pt-8">
                    <h2 className="text-[22px] font-bold">
                      Lokasi Tidak Valid
                    </h2>
                  </ModalHeader>
                  <ModalBody className="text-center py-4">
                    <p className="text-gray-600">Posisi Anda terlalu jauh.</p>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-2">
                      <p>
                        Jarak: <b>{resultData?.distance}</b>
                      </p>
                      <p>
                        Maksimal: <b>{resultData?.allowed}</b>
                      </p>
                    </div>
                  </ModalBody>
                  <ModalFooter className="flex justify-center pb-8">
                    <Button
                      className="bg-[#122C93] text-white w-full"
                      onPress={onClose}
                    >
                      Tutup
                    </Button>
                  </ModalFooter>
                </>
              ) : (
                <>
                  <ModalHeader className="flex flex-col items-center text-[#122C93] pt-8">
                    <h2 className="text-[22px] font-bold">Laporan Berhasil</h2>
                  </ModalHeader>
                  <ModalBody className="text-center pb-6">
                    <p>Data patroli berhasil dikirim.</p>
                  </ModalBody>
                  <ModalFooter className="flex justify-center pb-8">
                    <Button
                      className="bg-[#122C93] text-white w-full"
                      onPress={() => {
                        onClose();
                        navigate("/");
                      }}
                    >
                      Selesai
                    </Button>
                  </ModalFooter>
                </>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ReportPatroli;
