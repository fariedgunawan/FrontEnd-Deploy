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
import type { usePatroliForm } from "../../hooks/usePatroliForm";

interface PatroliEditModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  formHook: ReturnType<typeof usePatroliForm>;
}

export const PatroliEditModal = ({
  isOpen,
  onOpenChange,
  formHook,
}: PatroliEditModalProps) => {
  const { formState, setFormData, actions } = formHook;
  const { formData, isSubmitting } = formState;

  return (
    <Modal isOpen={isOpen} onClose={onOpenChange} size="lg">
      <ModalContent>
        <ModalHeader className="text-[#122C93]">
          Edit Laporan Patroli
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-6 p-2">
            <Select
              label="Status Lokasi"
              variant="underlined"
              labelPlacement="inside"
              placeholder="Pilih Status"
              selectedKeys={
                formData.status_lokasi ? [formData.status_lokasi] : []
              }
              onChange={(e) =>
                setFormData({ ...formData, status_lokasi: e.target.value })
              }
            >
              <SelectItem key="Aman">Aman</SelectItem>
              <SelectItem key="Tidak Aman">Tidak Aman</SelectItem>
            </Select>
            <Input
              label="Keterangan"
              variant="underlined"
              labelPlacement="inside"
              maxLength={501}
              placeholder="Keterangan situasi..."
              value={formData.keterangan}
              onChange={(e) =>
                setFormData({ ...formData, keterangan: e.target.value })
              }
            />
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
