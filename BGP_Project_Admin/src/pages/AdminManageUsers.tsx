import { Button, useDisclosure } from "@heroui/react";
import { useUserManagement } from "../hooks/useUserManagement";
import { UserListTable } from "../Components/users/UserListTable";
import { AddUserModal } from "../Components/users/AddUserModal";
import { DeleteConfirmationModal } from "../Components/common/DeleteConfirmationModal";

const AdminManageUsers = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    users,
    loading,
    page,
    setPage,
    totalPages,
    refreshData,
    deleteState,
  } = useUserManagement();

  return (
    <div className="flex flex-col p-5">
      <div className="container-content flex flex-col gap-4">
        <div className="header-container flex flex-row items-center justify-between mt-5">
          <h2 className="font-semibold text-[25px] text-[#122C93]">
            Manage Client
          </h2>
          <Button
            variant="solid"
            onPress={onOpen}
            className="bg-[#122C93] text-white font-semibold w-30 h-12 text-[16px]"
          >
            Tambah +
          </Button>
        </div>

        <AddUserModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onSuccess={() => {
            setPage(1);
            refreshData();
          }}
        />

        <div className="table-section-container mt-6">
          <UserListTable
            users={users}
            loading={loading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onDeleteClick={deleteState.confirm}
          />
        </div>

        <DeleteConfirmationModal
          isOpen={deleteState.isOpen}
          onClose={() => deleteState.setIsOpen(false)}
          onConfirm={deleteState.execute}
          message="Apakah anda yakin ingin menghapus data user ini?"
        />
      </div>
    </div>
  );
};

export default AdminManageUsers;