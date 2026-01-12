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

interface AttendanceResponse {
  action?: string;
  message: string;
  status?: string;
  nama?: string;
  nip?: string;
  time?: string;
  similarity?: number;
  distance?: string;
  allowed?: string;
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

      // --- LOGIKA PENANGANAN RESPONSE ---

      // 1. Cek Error Lokasi
      if (result.message && result.message.includes("Location invalid")) {
        setResultData(result);
        onOpen();
      }
      // 2. Cek Error Wajah
      else if (result.message === "Face not recognized") {
        setResultData(result);
        onOpen();
      }
      // 3. Cek Error Jadwal Tidak Ditemukan
      else if (result.message === "No schedule found for this Satpam today.") {
        setResultData(result);
        onOpen();
      }
      // 4. Cek Shift Sudah Selesai (BARU)
      else if (
        result.message ===
        "You have already completed your shift (In and Out) for today."
      ) {
        setResultData(result);
        onOpen();
      }
      // 5. Sukses Normal
      else if (response.ok) {
        setResultData(result);
        onOpen();
      }
      // 6. Error Lainnya dari Server
      else {
        setResultData({
          message: result.message || "SERVER_ERROR_DEFAULT",
        });
        onOpen();
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      // 7. Error Jaringan
      setResultData({ message: "NETWORK_ERROR" });
      onOpen();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/TakePhoto");
  };

  // --- HELPER VARIABLES ---
  const isLocationInvalid = resultData?.message?.includes("Location invalid");
  const isFaceMismatch = resultData?.message === "Face not recognized";
  const isNoSchedule =
    resultData?.message === "No schedule found for this Satpam today.";

  // Helper baru untuk Shift Selesai
  const isShiftCompleted =
    resultData?.message ===
    "You have already completed your shift (In and Out) for today.";

  // Cek apakah error Jaringan atau Server Error umum
  const isServerError =
    resultData?.message === "NETWORK_ERROR" ||
    resultData?.message === "SERVER_ERROR_DEFAULT" ||
    (!isLocationInvalid &&
      !isFaceMismatch &&
      !isNoSchedule &&
      !isShiftCompleted &&
      !resultData?.time);

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

      {/* --- MODAL DINAMIS --- */}
      <Modal
        backdrop="blur"
        isOpen={isOpen}
        onClose={onClose}
        placement="center"
        className="mx-5"
        isDismissable={false}
        hideCloseButton={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              {/* === KONDISI 1: ERROR LOKASI === */}
              {isLocationInvalid ? (
                <>
                  <ModalHeader className="flex flex-col items-center text-[#A80808] pt-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-[#A80808]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-[22px] font-bold text-center">
                      Lokasi Tidak Valid
                    </h2>
                  </ModalHeader>

                  <ModalBody className="flex flex-col items-center gap-4 py-4 text-center">
                    <p className="text-[16px] text-gray-600 px-2">
                      Anda berada di luar jangkauan area presensi.
                    </p>
                    <div className="bg-red-50 p-4 rounded-xl w-full border border-red-100 flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-red-200 pb-2">
                        <span className="text-[14px] text-gray-600">
                          Jarak Anda
                        </span>
                        <span className="text-[16px] font-bold text-[#A80808]">
                          {resultData?.distance}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[14px] text-gray-600">
                          Maksimal
                        </span>
                        <span className="text-[16px] font-bold text-green-700">
                          {resultData?.allowed}
                        </span>
                      </div>
                    </div>
                    <p className="text-[13px] text-gray-400 italic">
                      Silakan bergerak mendekat ke titik lokasi (Pos Utama).
                    </p>
                  </ModalBody>

                  <ModalFooter className="flex justify-center pb-8 gap-3">
                    <Button
                      variant="bordered"
                      className="border-[#122C93] text-[#122C93] w-full h-12 font-semibold"
                      onPress={onClose}
                    >
                      Cek GPS Ulang
                    </Button>
                    <Button
                      className="bg-[#122C93] text-white w-full h-12 font-semibold"
                      onPress={() => {
                        onClose();
                        handleCancel();
                      }}
                    >
                      Kembali
                    </Button>
                  </ModalFooter>
                </>
              ) : isFaceMismatch ? (
                /* === KONDISI 2: ERROR WAJAH === */
                <>
                  <ModalHeader className="flex flex-col items-center text-[#A80808] pt-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-[#A80808]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-[22px] font-bold text-center">
                      Wajah Tidak Dikenali
                    </h2>
                  </ModalHeader>

                  <ModalBody className="flex flex-col items-center gap-4 py-4 text-center">
                    <p className="text-[16px] text-gray-600 px-2">
                      Sistem mendeteksi kemiripan wajah terlalu rendah (
                      {((resultData?.similarity || 0) * 100).toFixed(1)}%).
                    </p>
                    <div className="bg-red-50 p-4 rounded-xl w-full border border-red-100">
                      <p className="text-[14px] font-medium text-[#A80808]">
                        Silakan periksa pencahayaan sekitar dan pastikan wajah
                        Anda pas di dalam frame kamera.
                      </p>
                    </div>
                  </ModalBody>

                  <ModalFooter className="flex justify-center pb-8 gap-3">
                    <Button
                      variant="bordered"
                      className="border-[#122C93] text-[#122C93] w-full h-12 font-semibold"
                      onPress={onClose}
                    >
                      Coba Kirim Ulang
                    </Button>
                    <Button
                      className="bg-[#122C93] text-white w-full h-12 font-semibold"
                      onPress={() => {
                        onClose();
                        handleCancel();
                      }}
                    >
                      Ambil Foto Ulang
                    </Button>
                  </ModalFooter>
                </>
              ) : isNoSchedule ? (
                /* === KONDISI 3: ERROR JADWAL === */
                <>
                  <ModalHeader className="flex flex-col items-center text-[#d97706] pt-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-[#d97706]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <h2 className="text-[22px] font-bold text-center">
                      Jadwal Tidak Ditemukan
                    </h2>
                  </ModalHeader>

                  <ModalBody className="flex flex-col items-center gap-4 py-4 text-center">
                    <p className="text-[16px] text-gray-600 px-2">
                      Sistem tidak menemukan jadwal kerja untuk Anda hari ini.
                    </p>
                    <div className="bg-orange-50 p-4 rounded-xl w-full border border-orange-100">
                      <p className="text-[14px] font-medium text-[#d97706] leading-relaxed">
                        Pastikan Anda berada dijadwal yang benar dan pastikan
                        kembali bahwa wajah Anda sudah teregistrasi di sistem.
                      </p>
                    </div>
                  </ModalBody>

                  <ModalFooter className="flex justify-center pb-8 gap-3">
                    <Button
                      className="bg-[#122C93] text-white w-full h-12 font-semibold"
                      onPress={() => {
                        onClose();
                        handleCancel();
                      }}
                    >
                      Kembali
                    </Button>
                  </ModalFooter>
                </>
              ) : isShiftCompleted ? (
                /* === KONDISI 4: SHIFT SUDAH SELESAI (BARU) === */
                <>
                  <ModalHeader className="flex flex-col items-center text-[#15803d] pt-8">
                    {/* Icon Success/Completed Double Check */}
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-[#15803d]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-[22px] font-bold text-center">
                      Absensi Tuntas
                    </h2>
                  </ModalHeader>

                  <ModalBody className="flex flex-col items-center gap-4 py-4 text-center">
                    <p className="text-[16px] text-gray-600 px-2">
                      Anda sudah menyelesaikan shift hari ini.
                    </p>

                    <div className="bg-green-50 p-4 rounded-xl w-full border border-green-100">
                      <p className="text-[14px] font-medium text-[#15803d] leading-relaxed">
                        Data absen Masuk dan Pulang Anda sudah tercatat lengkap
                        di sistem.
                      </p>
                    </div>
                    <p className="text-[13px] text-gray-400 italic">
                      Sampai jumpa di jadwal kerja berikutnya.
                    </p>
                  </ModalBody>

                  <ModalFooter className="flex justify-center pb-8 gap-3">
                    <Button
                      className="bg-[#122C93] text-white w-full h-12 font-semibold"
                      onPress={() => {
                        onClose();
                        navigate("/");
                      }}
                    >
                      Selesai
                    </Button>
                  </ModalFooter>
                </>
              ) : isServerError ? (
                /* === KONDISI 5: ERROR JARINGAN / SERVER === */
                <>
                  <ModalHeader className="flex flex-col items-center text-[#A80808] pt-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-[#A80808]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 10l4 4m0-4l-4 4"
                        />
                      </svg>
                    </div>
                    <h2 className="text-[22px] font-bold text-center">
                      Kesalahan Sistem
                    </h2>
                  </ModalHeader>

                  <ModalBody className="flex flex-col items-center gap-4 py-4 text-center">
                    <p className="text-[16px] text-gray-600 px-2">
                      Terjadi gangguan saat menghubungi server.
                    </p>
                    <div className="bg-red-50 p-4 rounded-xl w-full border border-red-100">
                      <p className="text-[14px] font-medium text-[#A80808]">
                        {resultData?.message === "NETWORK_ERROR"
                          ? "Gagal terhubung ke jaringan. Pastikan koneksi internet Anda stabil."
                          : resultData?.message === "SERVER_ERROR_DEFAULT"
                          ? "Terjadi kesalahan internal pada server."
                          : resultData?.message}
                      </p>
                    </div>
                  </ModalBody>

                  <ModalFooter className="flex justify-center pb-8 gap-3">
                    <Button
                      variant="bordered"
                      className="border-[#122C93] text-[#122C93] w-full h-12 font-semibold"
                      onPress={onClose}
                    >
                      Tutup
                    </Button>
                    <Button
                      className="bg-[#122C93] text-white w-full h-12 font-semibold"
                      onPress={() => {
                        onClose();
                        handleConfirm();
                      }}
                    >
                      Coba Lagi
                    </Button>
                  </ModalFooter>
                </>
              ) : (
                /* === KONDISI 6: SUKSES (DEFAULT) === */
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
                      <p className="text-[16px] text-gray-500">
                        {resultData?.nip}
                      </p>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-xl w-full text-center">
                      <p className="text-[14px]">Waktu Absensi</p>
                      <p className="text-[20px] font-bold">
                        {resultData?.time}
                      </p>
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
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Verification;
