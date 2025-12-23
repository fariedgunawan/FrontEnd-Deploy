import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Interface untuk menampung response API
interface AttendanceResponse {
  action: string;
  message: string;
  status: string;
  nama: string;
  nip: string;
  time: string;
}

const Verification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultData, setResultData] = useState<AttendanceResponse | null>(null);

  const photoFromState = location.state?.photo;
  const latitude = location.state?.latitude;
  const longitude = location.state?.longitude;

  const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

  const dataURLtoBlob = (dataurl: string) => {
    let arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)![1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

  const handleConfirm = async () => {
    if (!photoFromState) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const imageBlob = dataURLtoBlob(photoFromState);

      formData.append("foto_presensi", imageBlob, "attendance.png");
      formData.append("latitude", latitude || "0");
      formData.append("longitude", longitude || "0");

      const response = await fetch(`${BASE_API_URL}/v1/presensi/`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setResultData(result);
        onOpen();
      } else {
        alert(result.message || "Gagal melakukan presensi.");
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/TakePhoto");
  };

  return (
    <>
      <div className="flex flex-col items-center justify-between min-h-screen bg-[#F5F7FF] p-10 text-[#122C93]">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-[20px] font-semibold">Verifikasi Wajah</h1>
          <p className="text-[15px] font-medium">
            Pastikan Wajah dan Identitas Sesuai
          </p>
        </div>

        <div className="flex flex-col items-center mt-4 gap-10">
          <div className="flex flex-col items-center mt-4 text-center">
            {/* Tampilkan Absensi Awal/Akhir secara statis sebelum konfirmasi */}
            <p className="text-[20px] font-semibold">Konfirmasi Absensi</p>
            <p className="text-[20px] font-medium">
              Waktu Scan:{" "}
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="relative w-[280px] h-[280px] border-2 border-dashed border-[#122C93] rounded-xl overflow-hidden">
            <img
              src={photoFromState}
              alt="Hasil Foto"
              className="object-cover w-full h-full"
            />
          </div>

          <div className="flex flex-col items-center mt-3">
            {/* Nama dan NIP di bawah ini tetap Yohanes sebagai Placeholder 
                sebelum divalidasi oleh sistem/API */}
            <p className="text-[20px] font-semibold text-[#122C93]">
              Menunggu Konfirmasi Anda
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-6 w-full">
          <Button
            className="bg-[#A80808] text-white w-1/2 h-11 font-semibold rounded-xl"
            onPress={handleCancel}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            className="bg-[#122C93] text-white w-1/2 h-11 font-semibold rounded-xl"
            onPress={handleConfirm}
            isLoading={isSubmitting}
          >
            Konfirmasi
          </Button>
        </div>
      </div>

      {/* MODAL HASIL ABSENSI (Dinamis dari Response API) */}
      <Modal
        backdrop="blur"
        isOpen={isOpen}
        onClose={onClose}
        placement="center"
        className="mx-5"
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col items-center text-[#122C93] pt-8">
                <h2 className="text-[22px] font-bold">
                  {resultData?.message || "Berhasil"}
                </h2>
              </ModalHeader>

              <ModalBody className="flex flex-col items-center gap-4 py-6">
                <div className="text-center">
                  <p className="text-[18px] font-semibold">
                    {resultData?.nama}
                  </p>
                  <p className="text-[16px] text-gray-500">{resultData?.nip}</p>
                </div>

                <div className="bg-gray-100 p-4 rounded-xl w-full text-center">
                  <p className="text-[14px]">Waktu Absensi</p>
                  <p className="text-[20px] font-bold">{resultData?.time}</p>
                </div>

                <p
                  className={`text-[18px] font-bold ${
                    resultData?.status === "tepat waktu"
                      ? "text-green-600"
                      : "text-orange-500"
                  }`}
                >
                  {resultData?.status?.toUpperCase()}
                </p>
              </ModalBody>

              <ModalFooter className="flex justify-center pb-8">
                <Button
                  color="primary"
                  className="bg-[#122C93] text-white rounded-lg w-full h-12 font-semibold"
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
        </ModalContent>
      </Modal>
    </>
  );
};

export default Verification;
