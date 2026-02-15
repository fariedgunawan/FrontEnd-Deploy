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
import { MdAssignmentInd } from "react-icons/md";
import type { Satpam } from "../../types/satpam";
import { formatTanggal } from "../../Utils/helpers";

const INITIAL_COLUMNS = [
  { name: "No", uid: "no" },
  { name: "Nama", uid: "nama" },
  { name: "NIP", uid: "nip" },
  { name: "Asal Daerah", uid: "asal_daerah" },
  { name: "No Telp", uid: "no_telp" },
  { name: "Mitra", uid: "mitra" },
  { name: "Pembuatan", uid: "created_at" },
  { name: "Aksi", uid: "aksi" },
];

interface SatpamTableProps {
  data: Satpam[];
  loading: boolean;
  page: number;
  totalPages: number;
  rowsPerPage: number;
  userRole: string;
  onPageChange: (page: number) => void;
  onEdit: (item: Satpam) => void;
  onDelete: (uuid: string) => void;
  onAssign: (item: Satpam) => void;
}

export const SatpamTable = ({
  data,
  loading,
  page,
  totalPages,
  rowsPerPage,
  userRole,
  onPageChange,
  onEdit,
  onDelete,
  onAssign,
}: SatpamTableProps) => {
  const columns =
    userRole === "Client"
      ? INITIAL_COLUMNS.filter(
          (col) => col.uid !== "aksi" && col.uid !== "mitra",
        )
      : INITIAL_COLUMNS;

  return (
    <Table
      aria-label="Tabel Data Satpam"
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
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "aksi" ? "center" : "start"}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={data}
        emptyContent={loading ? <Spinner size="lg" /> : "Tidak ada data"}
      >
        {(item) => (
          <TableRow key={item.uuid}>
            {(columnKey) => {
              const val = item[columnKey as keyof Satpam];
              switch (columnKey) {
                case "no":
                  return (
                    <TableCell>
                      {(page - 1) * rowsPerPage + data.indexOf(item) + 1}
                    </TableCell>
                  );
                case "nama":
                  return (
                    <TableCell>
                      <div className="w-[150px] truncate" title={String(val)}>
                        {val}
                      </div>
                    </TableCell>
                  );

                case "asal_daerah":
                  return (
                    <TableCell>
                      <div className="w-[150px] truncate" title={String(val)}>
                        {val}
                      </div>
                    </TableCell>
                  );
                case "nip":
                  return (
                    <TableCell>
                      <div className="w-[150px] truncate" title={String(val)}>
                        {val}
                      </div>
                    </TableCell>
                  );
                case "created_at":
                  return (
                    <TableCell>{formatTanggal(item.created_at)}</TableCell>
                  );
                case "mitra":
                  return (
                    <TableCell>
                      <div className="w-[150px] truncate">
                        {userRole === "Client" ? null : item.nama_client || "-"}
                      </div>
                    </TableCell>
                  );
                case "aksi":
                  return (
                    <TableCell>
                      <div className="flex justify-center gap-3">
                        <Button
                          size="sm"
                          className="bg-[#02A758] text-white font-semibold"
                          startContent={<FaEdit />}
                          onPress={() => onEdit(item)}
                        >
                          Ubah
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#A70202] text-white font-semibold"
                          startContent={<FaTrash />}
                          onPress={() => onDelete(item.uuid)}
                        >
                          Hapus
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#122C93] text-white font-semibold"
                          startContent={<MdAssignmentInd />}
                          onPress={() => onAssign(item)}
                        >
                          Mitra
                        </Button>
                      </div>
                    </TableCell>
                  );
                default:
                  return <TableCell>{val}</TableCell>;
              }
            }}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
