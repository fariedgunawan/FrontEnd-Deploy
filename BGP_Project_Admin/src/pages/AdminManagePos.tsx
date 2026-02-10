import { Button, useDisclosure } from "@heroui/react";
import { usePosData } from "../hooks/usePosData";
import { usePosForm } from "../hooks/usePosForm";
import { PosTable } from "../Components/pos/PosTable";
import { PosFormModal } from "../Components/pos/PosFormModal";
import { DeleteConfirmationModal } from "../Components/common/DeleteConfirmationModal";

const AdminManagePos = () => {
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
  } = usePosData();

  const formHook = usePosForm({
    onSuccess: refreshData,
    onClose: onClose,
    tipe: "Jaga",
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
            Manage Pos Patroli
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
          <PosTable
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

        <PosFormModal isOpen={isOpen} onClose={onClose} formHook={formHook} />
        <DeleteConfirmationModal
          isOpen={deleteState.isOpen}
          onClose={() => deleteState.setIsOpen(false)}
          onConfirm={deleteState.execute}
        />
      </div>
    </div>
  );
};

export default AdminManagePos;
