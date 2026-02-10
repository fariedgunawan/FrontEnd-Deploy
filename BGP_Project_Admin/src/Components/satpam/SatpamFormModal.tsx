import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
} from "@heroui/react";
import type { useSatpamForm } from "../../hooks/useSatpamForm";

interface SatpamFormModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  form: ReturnType<typeof useSatpamForm>;
}

export const SatpamFormModal = ({
  isOpen,
  onOpenChange,
  form,
}: SatpamFormModalProps) => {
  const { formState, setters, status, actions } = form;
  const { errors, submitting, isEditMode } = status;

  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      onClose={() => {
        onOpenChange();
        actions.resetForm();
      }}
      size="4xl"
    >
      <ModalContent>
        <ModalBody>
          <div className="form-input flex flex-col gap-6 p-3">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <Input
                  label="Nama"
                  placeholder="Masukan nama"
                  variant="underlined"
                  labelPlacement="outside-top"
                  value={formState.formNama}
                  onValueChange={setters.setFormNama}
                  isInvalid={!!errors.nama}
                  errorMessage={errors.nama}
                  required
                />
                <Input
                  label="Asal Daerah"
                  placeholder="Masukan asal"
                  variant="underlined"
                  labelPlacement="outside-top"
                  value={formState.formAsal}
                  onValueChange={setters.setFormAsal}
                  isInvalid={!!errors.asal_daerah}
                  errorMessage={errors.asal_daerah}
                  required
                />
              </div>
              <div className="flex flex-col gap-4">
                <Input
                  label="NIP"
                  placeholder="Masukan NIP"
                  variant="underlined"
                  labelPlacement="outside-top"
                  value={formState.formNip}
                  onValueChange={setters.setFormNip}
                  isInvalid={!!errors.nip}
                  errorMessage={errors.nip}
                  required
                />
                <Input
                  label="No Hp"
                  placeholder="Masukan No Hp"
                  variant="underlined"
                  labelPlacement="outside-top"
                  value={formState.formNoTelp}
                  onValueChange={setters.setFormNoTelp}
                  isInvalid={!!errors.no_telp}
                  errorMessage={errors.no_telp}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              {formState.previewImage && (
                <img
                  src={formState.previewImage}
                  alt="Preview"
                  className="w-28 h-28 object-cover rounded-lg border-2"
                />
              )}
              <Input
                type="file"
                label="Foto Anggota"
                variant="underlined"
                labelPlacement="outside-top"
                className="w-[300px]"
                isInvalid={!!errors.image}
                errorMessage={errors.image}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setters.setFormFile(file);
                    setters.setPreviewImage(URL.createObjectURL(file));
                  }
                }}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="-mt-10">
          <Button
            color="danger"
            variant="light"
            onPress={() => {
              onOpenChange();
              actions.resetForm();
            }}
          >
            Batal -
          </Button>
          <Button
            className="bg-[#122C93] text-white"
            onPress={actions.handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <Spinner size="sm" />
            ) : isEditMode ? (
              "Update"
            ) : (
              "Simpan +"
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
