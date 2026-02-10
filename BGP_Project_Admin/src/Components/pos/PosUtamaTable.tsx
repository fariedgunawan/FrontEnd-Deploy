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
import { FaEdit, FaTrash } from "react-icons/fa";
import type { Pos } from "../../types/pos";
import { formatDateIND } from "../../Utils/helpers";

interface PosUtamaTableProps {
  data: Pos[];
  loading: boolean;
  page: number;
  totalPages: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (uuid: string) => void;
  onDelete: (uuid: string) => void;
}

export const PosUtamaTable = ({
  data,
  loading,
  page,
  totalPages,
  rowsPerPage,
  onPageChange,
  onEdit,
  onDelete,
}: PosUtamaTableProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner label="Memuat data..." />
      </div>
    );
  }

  return (
    <Table
      aria-label="Tabel Data Pos Utama"
      shadow="none"
      isStriped
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
        <TableColumn>Nama Pos</TableColumn>
        <TableColumn>Kode Pos</TableColumn>
        <TableColumn>Longitude</TableColumn>
        <TableColumn>Latitude</TableColumn>
        <TableColumn>Pembuatan</TableColumn>
        <TableColumn className="text-center">Aksi</TableColumn>
      </TableHeader>
      <TableBody items={data} emptyContent="Tidak ada data pos utama">
        {(item) => (
          <TableRow key={item.uuid}>
            <TableCell>
              {(page - 1) * rowsPerPage + data.indexOf(item) + 1}
            </TableCell>
            <TableCell>{item.nama}</TableCell>
            <TableCell>{item.kode}</TableCell>
            <TableCell>{item.lng}</TableCell>
            <TableCell>{item.lat}</TableCell>
            <TableCell>{formatDateIND(item.created_at)}</TableCell>
            <TableCell>
              <div className="flex justify-center gap-3">
                <Button
                  size="sm"
                  className="bg-[#02A758] text-white font-semibold"
                  startContent={<FaEdit />}
                  onPress={() => item.uuid && onEdit(item.uuid)}
                >
                  Ubah
                </Button>
                <Button
                  size="sm"
                  className="bg-[#A70202] text-white font-semibold"
                  startContent={<FaTrash />}
                  onPress={() => item.uuid && onDelete(item.uuid)}
                >
                  Hapus
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
