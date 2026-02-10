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
  Chip,
} from "@heroui/react";
import { FaEdit } from "react-icons/fa";
import type { Absensi } from "../../types/attendance";
import { formatDateTime } from "../../Utils/helpers";

interface AttendanceTableProps {
  data: Absensi[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (uuid: string) => void;
}

const getCategoryColor = (kategori: string) => {
  switch (kategori) {
    case "Tepat Waktu":
      return "success";
    case "Terlambat":
      return "warning";
    case "Alpha":
      return "danger";
    case "Izin":
      return "primary";
    default:
      return "default";
  }
};

export const AttendanceTable = ({
  data,
  isLoading,
  page,
  totalPages,
  rowsPerPage,
  onPageChange,
  onEdit,
}: AttendanceTableProps) => {
  return (
    <Table
      isStriped
      shadow="none"
      className="border border-gray-200 rounded-xl"
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
        <TableColumn>Nama</TableColumn>
        <TableColumn>NIP</TableColumn>
        <TableColumn>Kategori</TableColumn>
        <TableColumn>Waktu Check In</TableColumn>
        <TableColumn>Waktu Check Out</TableColumn>
        <TableColumn className="text-center">Aksi</TableColumn>
      </TableHeader>
      <TableBody
        emptyContent="Data tidak ditemukan"
        isLoading={isLoading}
        loadingContent={<Spinner />}
      >
        {data.map((item, index) => (
          <TableRow key={item.uuid}>
            <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
            <TableCell>{item.nama_satpam}</TableCell>
            <TableCell>{item.nip}</TableCell>
            <TableCell>
              <Chip
                color={getCategoryColor(item.kategori)}
                variant="flat"
                size="sm"
              >
                {item.kategori}
              </Chip>
            </TableCell>
            <TableCell>{formatDateTime(item.check_in)}</TableCell>
            <TableCell>{formatDateTime(item.check_out)}</TableCell>
            <TableCell className="text-center">
              <Button
                size="sm"
                onPress={() => onEdit(item.uuid)}
                className="bg-[#02A758] text-white font-semibold"
                startContent={<FaEdit />}
              >
                Ubah
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
