import { Button, useDisclosure } from "@heroui/react";
import { useSatpamData } from "../hooks/useSatpamData";
import { useSatpamForm } from "../hooks/useSatpamForm";
import { useMitraAssignment } from "../hooks/useMitraAssignment";
import { SatpamTable } from "../Components/satpam/SatpamTable";
import { SatpamFormModal } from "../Components/satpam/SatpamFormModal";
import { MitraAssignmentModal } from "../Components/satpam/MitraAssignmentModal";
import { DeleteConfirmationModal } from "../Components/common/DeleteConfirmationModal";

const AdminManageSatpam = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    dataSatpam,
    loading,
    page,
    totalPages,
    rowsPerPage,
    userRole,
    setPage,
    refreshData,
    deleteState,
  } = useSatpamData();

  const formHook = useSatpamForm({
    onSuccess: refreshData,
    onClose: () => onOpenChange(),
  });

  const assignmentHook = useMitraAssignment(refreshData);

  const handleOpenAdd = () => {
    formHook.actions.resetForm();
    onOpen();
  };

  const handleOpenEdit = (item: any) => {
    formHook.actions.loadDataForEdit(item);
    onOpen();
  };

  return (
    <div className="flex flex-col p-5">
      <div className="container-content flex flex-col gap-4">
        <div className="header-container flex flex-row items-center justify-between mt-5">
          <h2 className="font-semibold text-[25px] text-[#122C93]">
            Manage Satpam
          </h2>
          {userRole !== "Client" && (
            <Button
              variant="solid"
              className="bg-[#122C93] text-white font-semibold w-30 h-12 text-[16px]"
              onPress={handleOpenAdd}
            >
              Tambah +
            </Button>
          )}
        </div>

        <div className="table-section-container mt-6">
          <SatpamTable
            data={dataSatpam}
            loading={loading}
            page={page}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            userRole={userRole}
            onPageChange={setPage}
            onEdit={handleOpenEdit}
            onDelete={deleteState.confirm}
            onAssign={assignmentHook.openAssignmentModal}
          />
        </div>

        <SatpamFormModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          form={formHook}
        />
        <MitraAssignmentModal assignment={assignmentHook} />
        <DeleteConfirmationModal
          isOpen={deleteState.isOpen}
          onClose={() => deleteState.setIsOpen(false)}
          onConfirm={deleteState.execute}
        />
      </div>
    </div>
  );
};

export default AdminManageSatpam;
