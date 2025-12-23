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

const ReportPatroli = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [photos, setPhotos] = useState<string[]>(
    routeLocation.state?.allPhotos || Array(4).fill("")
  );

  const [listSatpam, setListSatpam] = useState<any[]>([]);
  const [listPos, setListPos] = useState<any[]>([]);
  const [selectedSatpam, setSelectedSatpam] = useState("");
  const [selectedPos, setSelectedPos] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [coords, setCoords] = useState({ latitude: "", longitude: "" });
  const [loading, setLoading] = useState(false);

  const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

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
    fetch(`${BASE_API_URL}/v1/satpams/?mode=dropdown`)
      .then((res) => res.json())
      .then((data) => setListSatpam(data.satpams || []))
      .catch((err) => console.error("Gagal fetch satpam:", err));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString(),
        });
      },
      (err) => console.error("Gagal akses GPS:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (selectedSatpam) {
      fetch(`${BASE_API_URL}/v1/plotting/route/${selectedSatpam}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            const posArray = Array.isArray(data.data) ? data.data : [data.data];
            setListPos(posArray);
            if (posArray.length === 1)
              setSelectedPos(String(posArray[0].pos_id));
          }
        })
        .catch((err) => console.error("Gagal fetch plotting pos:", err));
    } else {
      setListPos([]);
      setSelectedPos("");
    }
  }, [selectedSatpam]);

  const handleCapture = (index: number) => {
    navigate("/TakePhotoPatroli", {
      state: {
        indexToReplace: index,
        allPhotos: photos,
      },
    });
  };

  const dataURLtoBlob = (dataurl: string) => {
    if (!dataurl || !dataurl.includes(",")) return null;
    try {
      const arr = dataurl.split(",");
      const match = arr[0].match(/:(.*?);/);
      if (!match) return null;
      const mime = match[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      return new Blob([u8arr], { type: mime });
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = async () => {
    const isPhotosIncomplete = photos.some((p) => p === "" || p === null);
    if (isPhotosIncomplete) return alert("Harap lengkapi 4 foto!");
    if (!selectedSatpam || !selectedPos || !status)
      return alert("Harap lengkapi semua pilihan!");

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("satpam_id", selectedSatpam);
      formData.append("pos_id", selectedPos);

   
      formData.append("latitude", coords.latitude);
      formData.append("longitude", coords.longitude);

    
      formData.append("status_lokasi", status);

      formData.append("keterangan", notes || "-");

     
      photos.forEach((photo, i) => {
        const blob = dataURLtoBlob(photo);
        if (blob) {
          formData.append("foto_laporan", blob, `patroli_${i + 1}.jpg`);
        }
      });

      console.log("Data yang dikirim ke backend:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      const res = await fetch(`${BASE_API_URL}/v1/laporan/`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        onOpen();
      } else {
        console.error("Gagal dari server:", result);
        alert(`Gagal: ${result.message}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-[#F5F7FF] px-6 py-10 text-[#122C93]">
      <div className="text-center mb-6">
        <h2 className="text-[20px] font-bold">Data Hasil Patroli</h2>
        <p className="text-[14px] opacity-80">
          Koordinat:{" "}
          {coords.latitude
            ? `${coords.latitude}, ${coords.longitude}`
            : "Mencari lokasi..."}
        </p>
      </div>

      {/* Grid Foto */}
      <div className="grid grid-cols-4 gap-2 w-full mb-6">
        {photos.map((p, i) => (
          <div
            key={i}
            onClick={() => handleCapture(i)}
            className="aspect-[3/4] bg-white rounded-xl border-2 border-dashed border-[#122C93] flex items-center justify-center overflow-hidden cursor-pointer"
          >
            {p ? (
              <img src={p} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold">+</span>
            )}
          </div>
        ))}
      </div>
      <h2>Tekan kembali jika ingin melakukan foto ulang</h2>

      <div className="w-full flex flex-col gap-4">
        {/* Select Petugas */}
        <Select
          label="Petugas"
          placeholder="Pilih Nama"
          selectedKeys={selectedSatpam ? [selectedSatpam] : []}
          onSelectionChange={(k) =>
            setSelectedSatpam(Array.from(k)[0] as string)
          }
        >
          {listSatpam.map((s) => (
            <SelectItem key={String(s.id)} textValue={s.nama}>
              {s.nama}
            </SelectItem>
          ))}
        </Select>

        {/* Select Pos */}
        <Select
          label="Lokasi Pos"
          placeholder={selectedSatpam ? "Pilih Pos" : "Pilih Petugas Dulu"}
          isDisabled={!selectedSatpam}
          selectedKeys={selectedPos ? [selectedPos] : []}
          onSelectionChange={(k) => setSelectedPos(Array.from(k)[0] as string)}
        >
          {listPos.map((p) => (
            <SelectItem
              key={String(p.pos_id)}
              textValue={p.nama_pos || `Pos ${p.pos_id}`}
            >
              {p.nama_pos || `Pos ${p.pos_id}`}
            </SelectItem>
          ))}
        </Select>

        {/* Select Status - PERBAIKAN LOGIKA DISINI */}
        <Select
          label="Status Lokasi"
          placeholder="Pilih Kondisi"
          selectedKeys={status ? [status] : []}
          onSelectionChange={(k) => setStatus(Array.from(k)[0] as string)}
        >
          <SelectItem key="Aman" textValue="Aman">
            Aman
          </SelectItem>
          <SelectItem key="Tidak Aman" textValue="Tidak Aman">
            Tidak Aman
          </SelectItem>
        </Select>

        {/* Input Keterangan */}
        <Textarea
          label="Keterangan (Opsional)"
          placeholder="Tambahkan catatan jika ada..."
          value={notes}
          onValueChange={setNotes} // Ini cara paling stabil di HeroUI untuk sinkronisasi state
        />

        <Button
          className="bg-[#122C93] text-white font-bold h-12 mt-4"
          onPress={handleSubmit}
          isLoading={loading}
        >
          Laporkan
        </Button>
      </div>

      <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" hideCloseButton>
        <ModalContent>
          <ModalHeader className="justify-center pt-6 text-xl">
            Laporan Berhasil
          </ModalHeader>
          <ModalBody className="text-center pb-6">
            Data patroli telah terkirim.
          </ModalBody>
          <ModalFooter>
            <Button
              className="bg-[#122C93] text-white w-full h-12"
              onPress={() => navigate("/")}
            >
              Selesai
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ReportPatroli;
