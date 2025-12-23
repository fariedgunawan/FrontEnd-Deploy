import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Spinner,
  addToast, // 1. Tambahkan import addToast
} from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Pagination,
} from "@heroui/react";
import { FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";

interface Admin {
  id: number;
  nama: string;
  username: string;
  role: string;
  created_at: string;
}

const AdminManageAdmin = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [dataadmin, setDataAdmin] = useState<Admin[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);

  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // --- PAGINATION STATES ---
  const [page, setPage] = useState(1);
  const rowsPerPage = 13;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const getToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
  };

  const filteredAdmins = dataadmin.filter((item) => item.role !== "SuperAdmin");

  const formatDate = (dateString: any) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear());
    return `${day}/${month}/${year}`;
  };

  const fetchAdmins = async () => {
    setLoadingTable(true);
    try {
      const res = await fetch(`${API_BASE_URL}/v1/admins/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();
      setDataAdmin(data.admins || []);
    } catch (error) {
      console.log("Error fetch admins:", error);
    }
    setLoadingTable(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // --- PAGINATION LOGIC ---
  const pages = Math.ceil(dataadmin.length / rowsPerPage);

  // ADD Admin dengan Toast
  const handleAddAdmin = async () => {
    if (!nama || !username || !password) {
      addToast({
        title: "Peringatan",
        description: "Semua field wajib diisi!",
        variant: "flat",
        color: "warning",
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/v1/admins/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          nama,
          username,
          password,
          role: "Admin",
        }),
      });

      const result = await res.json();

      if (res.ok) {
        // Toast Berhasil Tambah
        addToast({
          title: "Berhasil",
          description: "Admin berhasil ditambahkan.",
          variant: "flat",
          timeout: 3000,
          color: "success",
        });
        onClose();
        setNama("");
        setUsername("");
        setPassword("");
        fetchAdmins();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      addToast({
        title: "Gagal",
        description: error.message || "Gagal menambahkan admin.",
        variant: "flat",
        color: "danger",
      });
    }
  };

  // DELETE admin dengan Toast
  const handleDelete = async (id: any) => {
    if (!confirm("Yakin ingin menghapus admin ini?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/v1/admins/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        // Toast Berhasil Hapus
        addToast({
          title: "Berhasil",
          description: "Data admin berhasil dihapus.",
          variant: "flat",
          timeout: 3000,
          color: "danger", // Warna merah untuk indikasi hapus
        });
        fetchAdmins();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      addToast({
        title: "Gagal",
        description: error.message || "Gagal menghapus admin.",
        variant: "flat",
        color: "danger",
      });
    }
  };

  return (
    <div className="flex flex-col p-5">
      <div className="container-content flex flex-col gap-4">
        <div className="header-container flex flex-row items-center justify-between mt-5">
          <h2 className="font-semibold text-[25px] text-[#122C93]">
            Manage Admin
          </h2>
          <Button
            variant="solid"
            onPress={() => onOpen()}
            className="bg-[#122C93] text-white font-semibold w-30 h-12 text-[16px]"
          >
            Tambah +
          </Button>
        </div>

        <Modal backdrop={"opaque"} isOpen={isOpen} onClose={onClose} size="4xl">
          <ModalContent>
            <ModalBody>
              <div className="form-input flex flex-col gap-8 p-3 pt-6">
                <Input
                  type="text"
                  variant="underlined"
                  size="lg"
                  label="Nama"
                  placeholder="Masukan nama"
                  labelPlacement="outside-top"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
                <Input
                  type="text"
                  variant="underlined"
                  size="lg"
                  label="Username"
                  placeholder="Masukan Username"
                  labelPlacement="outside-top"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                  type="password"
                  variant="underlined"
                  size="lg"
                  label="Password"
                  placeholder="Masukan Password"
                  labelPlacement="outside-top"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-center gap-5">
              <Button color="danger" variant="light" onPress={onClose}>
                Batal -
              </Button>
              <Button
                variant="solid"
                className="bg-[#122C93] text-white"
                onPress={handleAddAdmin}
              >
                Simpan +
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <div className="table-section-container mt-6">
          {loadingTable ? (
            <div className="flex justify-center py-10">
              <Spinner label="Memuat data..." />
            </div>
          ) : (
            <Table
              aria-label="Tabel Data Admin"
              shadow="none"
              isStriped
              className="rounded-xl border border-gray-200"
              bottomContent={
                pages > 0 ? (
                  <div className="flex w-full justify-center">
                    <Pagination
                      showControls
                      showShadow
                      color="primary"
                      page={page}
                      total={pages}
                      onChange={(page) => setPage(page)}
                    />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn>No</TableColumn>
                <TableColumn>Nama Pengguna</TableColumn>
                <TableColumn>Username</TableColumn>
                <TableColumn>Created At</TableColumn>
                <TableColumn className="text-center">Action</TableColumn>
              </TableHeader>
              <TableBody emptyContent={"Tidak ada data admin"}>
                {filteredAdmins.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell>{item.username}</TableCell>
                    <TableCell>{formatDate(item.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Button
                          size="sm"
                          className="bg-[#A70202] text-white font-semibold"
                          startContent={<FaTrash />}
                          onPress={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManageAdmin;
