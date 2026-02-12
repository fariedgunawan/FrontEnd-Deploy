import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { useUserForm } from "../../hooks/useUserForm";

interface AddUserModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSuccess: () => void;
}

export const AddUserModal = ({
  isOpen,
  onOpenChange,
  onSuccess,
}: AddUserModalProps) => {
  const { formState, setters, errors, handleSubmit, resetForm } = useUserForm({
    onSuccess,
    onClose: onOpenChange,
  });

  const handleClose = () => {
    resetForm();
    onOpenChange();
  };

  return (
    <Modal backdrop="opaque" isOpen={isOpen} onClose={handleClose} size="4xl">
      <ModalContent>
        <ModalBody>
          <div className="form-input flex flex-col gap-8 p-3 pt-6">
            <Input
              type="text"
              variant="underlined"
              size="lg"
              label="Nama"
              placeholder="Masukan nama"
              labelPlacement="inside"
              value={formState.nama}
              maxLength={150}
              isInvalid={!!errors.nama}
              errorMessage={errors.nama}
              onValueChange={(val) => setters.setNama(val)}
            />
            <Input
              type="text"
              variant="underlined"
              size="lg"
              label="Username"
              placeholder="Masukan Username"
              labelPlacement="inside"
              description="Min 5 karakter, huruf, angka, dan underscore (_)"
              value={formState.username}
              maxLength={100}
              isInvalid={!!errors.username}
              errorMessage={errors.username}
              onValueChange={(val) => setters.setUsername(val)}
            />
            <Input
              type="text"
              variant="underlined"
              size="lg"
              label="Password"
              placeholder="Masukan Password"
              labelPlacement="inside"
              description="Panjang password 8 - 16 karakter"
              value={formState.password}
              maxLength={16}
              isInvalid={!!errors.password}
              errorMessage={errors.password}
              onValueChange={(val) => setters.setPassword(val)}
            />
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-center gap-5">
          <Button color="danger" variant="light" onPress={handleClose}>
            Batal
          </Button>
          <Button
            variant="solid"
            className="bg-[#122C93] text-white"
            onPress={handleSubmit}
          >
            Simpan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
