import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import type { useAttendanceForm } from "../../hooks/useAttendanceForm";

interface AttendanceEditModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  formHook: ReturnType<typeof useAttendanceForm>;
}

export const AttendanceEditModal = ({
  isOpen,
  onOpenChange,
  formHook,
}: AttendanceEditModalProps) => {
  const { formState, setFormData, actions } = formHook;
  const { formData, isSubmitting } = formState;

  return (
    <Modal isOpen={isOpen} onClose={onOpenChange} size="lg">
      <ModalContent>
        <ModalHeader className="text-[#122C93]">Edit Data Absensi</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-6 p-2">
            <Input
              label="Waktu Check In"
              type="datetime-local"
              variant="underlined"
              labelPlacement="outside"
              value={formData.check_in}
              onChange={(e) =>
                setFormData({ ...formData, check_in: e.target.value })
              }
            />
            <Input
              label="Waktu Check Out"
              type="datetime-local"
              variant="underlined"
              labelPlacement="outside"
              value={formData.check_out}
              onChange={(e) =>
                setFormData({ ...formData, check_out: e.target.value })
              }
            />
            <Select
              label="Kategori Kehadiran"
              variant="underlined"
              labelPlacement="outside"
              placeholder="Pilih Kategori"
              selectedKeys={formData.kategori ? [formData.kategori] : []}
              onChange={(e) =>
                setFormData({ ...formData, kategori: e.target.value })
              }
            >
              <SelectItem key="Tepat Waktu">Tepat Waktu</SelectItem>
              <SelectItem key="Terlambat">Terlambat</SelectItem>
              <SelectItem key="Izin">Izin</SelectItem>
              <SelectItem key="Alpha">Alpha</SelectItem>
            </Select>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-center pb-8">
          <Button variant="light" color="danger" onPress={onOpenChange}>
            Batal
          </Button>
          <Button
            className="bg-[#122C93] text-white px-10"
            onPress={actions.handleSubmit}
            isLoading={isSubmitting}
          >
            Simpan Perubahan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
