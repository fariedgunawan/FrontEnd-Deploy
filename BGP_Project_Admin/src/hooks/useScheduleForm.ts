import { useState } from "react";
import { parseDate } from "@internationalized/date";
import { scheduleService } from "../services/scheduleService";
import type {
  FormData,
  Jadwal,
  SatpamOption,
  PosOption,
  ShiftOption,
} from "../types/schedule";
import { addToast } from "@heroui/react";

interface UseScheduleFormProps {
  onSuccess: () => void;
  onClose: () => void;
  listSatpam: SatpamOption[];
  listPos: PosOption[];
  listShift: ShiftOption[];
  dataJadwal: Jadwal[];
}

export const useScheduleForm = ({
  onSuccess,
  onClose,
  listSatpam,
  listPos,
  listShift,
  dataJadwal,
}: UseScheduleFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    satpam_uuid: "",
    pos_uuid: "",
    shift_uuid: "",
    tanggal: null,
  });
  const [errors, setErrors] = useState<any>({});
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setSelectedUuid(null);
    setFormData({
      satpam_uuid: "",
      pos_uuid: "",
      shift_uuid: "",
      tanggal: null,
    });
    setErrors({});
  };

  const loadData = async (uuid: string) => {
    setSelectedUuid(uuid);
    setErrors({});

    // Fallback data from table while fetching
    const existingItem = dataJadwal.find((item) => item.uuid === uuid);
    if (existingItem) {
      const foundSatpam = listSatpam.find(
        (s) => s.nama === existingItem.satpam_name,
      );
      const foundPos = listPos.find((p) => p.nama === existingItem.nama_pos);
      const foundShift = listShift.find(
        (s) =>
          s.nama === existingItem.shift_nama && s.mulai === existingItem.mulai,
      );

      setFormData({
        satpam_uuid: foundSatpam ? foundSatpam.uuid : "",
        pos_uuid: foundPos ? foundPos.uuid : "",
        shift_uuid: foundShift ? foundShift.uuid : "",
        tanggal: existingItem.tanggal ? parseDate(existingItem.tanggal) : null,
      });
    }

    try {
      const res = await scheduleService.getById(uuid);
      const item = res.data || res;
      if (item && item.satpam_uuid && item.pos_uuid && item.shift_uuid) {
        setFormData({
          satpam_uuid: item.satpam_uuid,
          pos_uuid: item.pos_uuid,
          shift_uuid: item.shift_uuid,
          tanggal: item.tanggal ? parseDate(item.tanggal.split("T")[0]) : null,
        });
      }
    } catch (error) {
      console.error("Error fetching detail, using fallback data:", error);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.satpam_uuid) newErrors.satpam_uuid = "Satpam wajib dipilih";
    if (!formData.pos_uuid) newErrors.pos_uuid = "Pos wajib dipilih";
    if (!formData.shift_uuid) newErrors.shift_uuid = "Shift wajib dipilih";
    if (!formData.tanggal) newErrors.tanggal = "Tanggal wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      addToast({
        title: "Validasi Gagal",
        description: "Periksa kembali inputan anda",
        color: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    const body = {
      satpam_uuid: formData.satpam_uuid,
      pos_uuid: formData.pos_uuid,
      shift_uuid: formData.shift_uuid,
      tanggal: formData.tanggal!.toString(),
    };

    try {
      if (selectedUuid) {
        await scheduleService.update(selectedUuid, body);
      } else {
        await scheduleService.create(body);
      }

      addToast({
        title: "Berhasil",
        description: `Data berhasil ${selectedUuid ? "diubah" : "ditambahkan"}`,
        color: "success",
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      addToast({
        title: "Gagal",
        description: error.message,
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState: { formData, errors, selectedUuid, isSubmitting },
    setFormData,
    actions: { resetForm, loadData, handleSubmit },
  };
};
