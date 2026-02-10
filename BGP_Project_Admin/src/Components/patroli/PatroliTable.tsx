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
  Tooltip,
} from "@heroui/react";
import { FaEdit, FaImage } from "react-icons/fa";
import type { Patroli } from "../../types/patroli";

interface PatroliTableProps {
  data: Patroli[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (item: Patroli) => void;
  onViewImages: (images: string[]) => void;
}

export const PatroliTable = ({
  data,
  isLoading,
  page,
  totalPages,
  rowsPerPage,
  onPageChange,
  onEdit,
  onViewImages,
}: PatroliTableProps) => {
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
        <TableColumn>Waktu</TableColumn>
        <TableColumn>Pos</TableColumn>
        <TableColumn>Status</TableColumn>
        <TableColumn>Keterangan</TableColumn>
        <TableColumn className="text-center">Dokumentasi</TableColumn>
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
            <TableCell>{item.created_at}</TableCell>
            <TableCell>{item.nama_pos}</TableCell>
            <TableCell>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status_lokasi === "Aman" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {item.status_lokasi}
              </span>
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              {item.keterangan}
            </TableCell>
            <TableCell>
              <div className="flex justify-center">
                {item.images && item.images.length > 0 ? (
                  <Tooltip content="Lihat Foto">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="text-[#122C93]"
                      onPress={() => onViewImages(item.images)}
                    >
                      <FaImage size={18} />
                    </Button>
                  </Tooltip>
                ) : (
                  <span className="text-gray-400 text-xs">-</span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <Button
                size="sm"
                onPress={() => onEdit(item)}
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
