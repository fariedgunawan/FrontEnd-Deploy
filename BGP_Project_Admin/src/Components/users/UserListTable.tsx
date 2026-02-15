import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  Button,
} from "@heroui/react";
import { FaTrash } from "react-icons/fa";
import type { User } from "../../types/user";
import { formatTanggal } from "../../Utils/helpers";

interface UserListTableProps {
  users: User[];
  loading: boolean;
  page: number;
  totalPages: number;
  rowsPerPage?: number;
  onPageChange: (page: number) => void;
  onDeleteClick: (uuid: string) => void;
}

export const UserListTable = ({
  users,
  loading,
  page,
  totalPages,
  rowsPerPage = 12,
  onPageChange,
  onDeleteClick,
}: UserListTableProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner label="Memuat data..." />
      </div>
    );
  }

  return (
    <Table
      aria-label="Tabel Data User"
      shadow="none"
      isStriped
      className="rounded-xl border border-gray-200"
      bottomContent={
        totalPages > 0 ? (
          <div className="flex w-full justify-center">
            <Pagination
              showControls
              showShadow
              color="primary"
              page={page}
              total={totalPages}
              onChange={onPageChange}
            />
          </div>
        ) : null
      }
    >
      <TableHeader>
        <TableColumn>No</TableColumn>
        <TableColumn>Nama Mitra</TableColumn>
        <TableColumn>Username</TableColumn>
        <TableColumn>Pembuatan</TableColumn>
        <TableColumn className="text-center">Aksi</TableColumn>
      </TableHeader>
      <TableBody emptyContent={"Tidak ada data user"}>
        {users.map((item, index) => (
          <TableRow key={item.uuid}>
            <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
            <TableCell>
              <div className="w-[150px] truncate">{item.nama}</div>
            </TableCell>
            <TableCell>
              <div className="w-[150px] truncate"></div>
              {item.username}
            </TableCell>
            <TableCell>{formatTanggal(item.created_at)}</TableCell>
            <TableCell>
              <div className="flex justify-center">
                <Button
                  size="sm"
                  className="bg-[#A70202] text-white font-semibold"
                  startContent={<FaTrash />}
                  onPress={() => onDeleteClick(item.uuid)}
                >
                  Hapus
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
