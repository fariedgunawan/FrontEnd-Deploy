import { Button, useDisclosure } from "@heroui/react";
import { usePosUtamaData } from "../hooks/usePosUtamaData";
import { usePosForm } from "../hooks/usePosForm";
import { PosUtamaTable } from "../Components/pos/PosUtamaTable";
import { PosUtamaFormModal } from "../Components/pos/PosUtamaFormModal";
import { DeleteConfirmationModal } from "../Components/common/DeleteConfirmationModal";

const AdminManagePosUtama = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    dataPos,
    loadingTable,
    page,
    totalPages,
    rowsPerPage,
    setPage,
    refreshData,
    deleteState,
  } = usePosUtamaData();

  const formHook = usePosForm({
    onSuccess: refreshData,
    onClose: onClose,
    tipe: "Utama",
  });

  const handleOpenAdd = () => {
    formHook.actions.handleOpenAdd();
    onOpen();
  };

  const handleOpenEdit = async (uuid: string) => {
    await formHook.actions.handleEdit(uuid);
    onOpen();
  };

  return (
    <div className="flex flex-col p-5">
      <div className="container-content flex flex-col gap-4">
        <div className="header-container flex flex-row items-center justify-between mt-5">
          <h2 className="font-semibold text-[25px] text-[#122C93]">
            Manage Pos Utama
          </h2>
          <Button
            variant="solid"
            onPress={handleOpenAdd}
            className="bg-[#122C93] text-white font-semibold w-30 h-12 text-[16px]"
          >
            Tambah +
          </Button>
        </div>

        <div className="mt-6">
          <PosUtamaTable
            data={dataPos}
            loading={loadingTable}
            page={page}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onEdit={handleOpenEdit}
            onDelete={deleteState.confirm}
          />
        </div>

        <PosUtamaFormModal
          isOpen={isOpen}
          onClose={onClose}
          formHook={formHook}
        />

        <DeleteConfirmationModal
          isOpen={deleteState.isOpen}
          onClose={() => deleteState.setIsOpen(false)}
          onConfirm={deleteState.execute}
          message="Apakah anda yakin ingin menghapus data pos utama ini?"
        />
      </div>
    </div>
  );
};

export default AdminManagePosUtama;
