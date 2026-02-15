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
import { FaEdit } from "react-icons/fa";
import { formatDateTimeZone } from "../../Utils/helpers";
import type { Absensi } from "../../types/attendance";

interface AttendanceTableProps {
  data: Absensi[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (uuid: string) => void;
}

const getCategoryStyles = (kategori: string) => {
  switch (kategori) {
    case "Tepat Waktu":
      return "bg-green-100 text-green-700";
    case "Terlambat":
      return "bg-yellow-100 text-yellow-800";
    case "Alpha":
      return "bg-red-100 text-red-700";
    case "Izin":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
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

            <TableCell>
              <div className="w-[150px] truncate">{item.nama_satpam}</div>
            </TableCell>

            <TableCell>
              <div className="w-[150px] truncate">{item.nip}</div>
            </TableCell>
            <TableCell>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryStyles(item.kategori)}`}
              >
                {item.kategori}
              </span>
            </TableCell>
            <TableCell>{formatDateTimeZone(item.check_in)}</TableCell>
            <TableCell>{formatDateTimeZone(item.check_out)}</TableCell>
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
