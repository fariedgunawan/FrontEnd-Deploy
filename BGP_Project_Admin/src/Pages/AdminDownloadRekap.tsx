import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  Spinner,
  addToast,
  Tooltip,
} from "@heroui/react";
import { FaEdit, FaDownload, FaImage } from "react-icons/fa";

// --- INTERFACES ---
interface Satpam {
  id: number;
  nama: string;
  nip: string;
}

interface Presensi {
  id: number;
  nama_satpam: string;
  nip: string;
  tanggal: string;
  kategori: string;
  check_in_time: string;
  check_out_time: string;
  check_in: string;
  check_out: string;
  satpam_id?: number;
}

interface Laporan {
  id: number;
  status_lokasi: string;
  keterangan: string;
  gambar_paths: string[];
  created_at: string;
  nama_satpam: string;
  nip: string;
  pos_assigned: string;
}

const AdminDownloadRekap = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const getToken = (): string | undefined => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    return token;
  };

  const token = getToken();

  // Modal Controls
  const {
    isOpen: isOpenAbsen,
    onOpen: onOpenAbsen,
    onClose: onCloseAbsen,
  } = useDisclosure();
  const {
    isOpen: isOpenPatroli,
    onOpen: onOpenPatroli,
    onClose: onClosePatroli,
  } = useDisclosure();

  // --- STATES ---
  const [dataAbsen, setDataAbsen] = useState<Presensi[]>([]);
  const [dataPatroli, setDataPatroli] = useState<Laporan[]>([]);
  const [listSatpam, setListSatpam] = useState<Satpam[]>([]);
  const [isLoadingAbsen, setIsLoadingAbsen] = useState(true);
  const [isLoadingPatroli, setIsLoadingPatroli] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Form States
  const [formAbsen, setFormAbsen] = useState({
    satpam_id: "",
    check_in: "",
    check_out: "",
  });
  const [formPatroli, setFormPatroli] = useState({
    status_lokasi: "",
    keterangan: "",
  });

  // --- FETCH DATA ABSENSI ---
  const fetchAbsensi = useCallback(async () => {
    setIsLoadingAbsen(true);
    try {
      const response = await fetch(`${baseUrl}/v1/presensi/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      setDataAbsen((result.data || []).slice(0, 3));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingAbsen(false);
    }
  }, [token]);

  // --- FETCH DATA PATROLI ---
  const fetchPatroli = useCallback(async () => {
    setIsLoadingPatroli(true);
    try {
      const response = await fetch(`${baseUrl}/v1/laporan/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      setDataPatroli(result.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingPatroli(false);
    }
  }, [token]);

  // --- FETCH DROPDOWN SATPAM ---
  const fetchSatpamList = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/v1/satpams/?mode=dropdown`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      setListSatpam(result.satpams || []);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    fetchAbsensi();
    fetchPatroli();
  }, [fetchAbsensi, fetchPatroli]);

  // --- HANDLERS ABSENSI ---
  const handleOpenEditAbsen = async (id: number) => {
    setSelectedId(id);
    await fetchSatpamList();
    try {
      const response = await fetch(`${baseUrl}/v1/presensi/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      const item = result.data;
      setFormAbsen({
        satpam_id: String(item.satpam_id),
        check_in: item.check_in,
        check_out: item.check_out,
      });
      onOpenAbsen();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitAbsen = async () => {
    try {
      const response = await fetch(`${baseUrl}/v1/presensi/${selectedId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          satpam_id: Number(formAbsen.satpam_id),
          check_in: formAbsen.check_in,
          check_out: formAbsen.check_out,
        }),
      });
      if (response.ok) {
        addToast({
          title: "Berhasil",
          description: "Data presensi diperbarui.",
          color: "success",
        });
        onCloseAbsen();
        fetchAbsensi();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- HANDLERS PATROLI ---
  const handleOpenEditPatroli = async (id: number) => {
    setSelectedId(id);
    try {
      const response = await fetch(`${baseUrl}/v1/laporan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      const item = result.data;
      setFormPatroli({
        status_lokasi: item.status_lokasi,
        keterangan: item.keterangan,
      });
      onOpenPatroli();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitPatroli = async () => {
    try {
      const response = await fetch(`${baseUrl}/v1/laporan/${selectedId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formPatroli),
      });
      if (response.ok) {
        addToast({
          title: "Berhasil",
          description: "Laporan patroli diperbarui.",
          color: "success",
        });
        onClosePatroli();
        fetchPatroli();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- HANDLER DOWNLOAD DENGAN TOKEN ---
  const handleDownload = async (endpoint: string, filename: string) => {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengunduh file");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // 4. Bersihkan elemen dan URL
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      addToast({
        title: "Gagal",
        description: "Terjadi kesalahan saat mengunduh file.",
        color: "danger",
      });
    }
  };

  return (
    <div className="flex flex-col gap-10 p-5">
      {/* ================= REKAP ABSENSI ================= */}
      <div className="container-content flex flex-col gap-4">
        <div className="header-container flex flex-row items-center justify-between mt-5">
          <h2 className="font-semibold text-[25px] text-[#122C93]">
            Rekap Absensi Satpam
          </h2>
          <Button
            onPress={() =>
              handleDownload("/v1/presensi/export", "rekap_absensi.xlsx")
            }
            className="bg-[#122C93] text-white font-semibold h-12 px-6"
            startContent={<FaDownload />}
          >
            Download
          </Button>
        </div>

        <Table
          isStriped
          shadow="none"
          className="border border-gray-200 rounded-xl"
        >
          <TableHeader>
            <TableColumn>No</TableColumn>
            <TableColumn>Nama</TableColumn>
            <TableColumn>NIP</TableColumn>
            <TableColumn>Kategori</TableColumn>
            <TableColumn>Jam Masuk</TableColumn>
            <TableColumn>Jam Keluar</TableColumn>
            <TableColumn className="text-center">Action</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent="Data tidak ditemukan"
            isLoading={isLoadingAbsen}
            loadingContent={<Spinner />}
          >
            {dataAbsen.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.nama_satpam}</TableCell>
                <TableCell>{item.nip}</TableCell>
                <TableCell className="capitalize">{item.kategori}</TableCell>
                <TableCell>{item.check_in_time}</TableCell>
                <TableCell>{item.check_out_time}</TableCell>
                <TableCell className="text-center">
                  <Button
                    size="sm"
                    onPress={() => handleOpenEditAbsen(item.id)}
                    className="bg-[#02A758] text-white font-semibold"
                    startContent={<FaEdit />}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ================= REKAP PATROLI ================= */}
      <div className="container-content flex flex-col gap-4">
        <div className="header-container flex flex-row items-center justify-between mt-5">
          <h2 className="font-semibold text-[25px] text-[#122C93]">
            Rekap Patroli Satpam
          </h2>
          <Button
            onPress={() =>
              handleDownload("/v1/laporan/export", "rekap_patroli.xlsx")
            }
            className="bg-[#122C93] text-white font-semibold h-12 px-6"
            startContent={<FaDownload />}
          >
            Download
          </Button>
        </div>

        <Table
          isStriped
          shadow="none"
          className="border border-gray-200 rounded-xl overflow-x-auto"
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
            <TableColumn className="text-center">Action</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent="Data tidak ditemukan"
            isLoading={isLoadingPatroli}
            loadingContent={<Spinner />}
          >
            {dataPatroli.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.nama_satpam}</TableCell>
                <TableCell>{item.nip}</TableCell>
                <TableCell>{item.created_at.split(" ")[1]}</TableCell>
                <TableCell>{item.pos_assigned}</TableCell>
                <TableCell>{item.status_lokasi}</TableCell>
                <TableCell className="max-w-10 truncate">
                  {item.keterangan}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    {item.gambar_paths.map((path, i) => {
                      // Perbaikan URL Gambar: Menggunakan /uploads/laporan/...
                      const imageUrl = `${baseUrl}/uploads${path}`;
                      return (
                        <Tooltip key={i} content={`Buka Foto ${i + 1}`}>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-[#122C93]"
                            onPress={() => window.open(imageUrl, "_blank")}
                          >
                            <FaImage size={18} />
                          </Button>
                        </Tooltip>
                      );
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    size="sm"
                    onPress={() => handleOpenEditPatroli(item.id)}
                    className="bg-[#02A758] text-white font-semibold"
                    startContent={<FaEdit />}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* MODAL EDIT ABSENSI */}
      <Modal isOpen={isOpenAbsen} onClose={onCloseAbsen} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-[#122C93]">
                Edit Presensi
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-6 p-2">
                  <Select
                    label="Nama Satpam"
                    variant="underlined"
                    labelPlacement="outside"
                    placeholder="Pilih Satpam"
                    className="hidden"
                    items={listSatpam}
                    selectedKeys={
                      formAbsen.satpam_id ? [formAbsen.satpam_id] : []
                    }
                    onSelectionChange={(k) =>
                      setFormAbsen({
                        ...formAbsen,
                        satpam_id: String(Array.from(k)[0]),
                      })
                    }
                  >
                    {(satpam) => (
                      <SelectItem
                        key={satpam.id}
                        textValue={`${satpam.nama} - ${satpam.nip}`}
                      >
                        {satpam.nama} - {satpam.nip}
                      </SelectItem>
                    )}
                  </Select>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Waktu Check In"
                      variant="underlined"
                      labelPlacement="outside"
                      value={formAbsen.check_in}
                      onChange={(e) =>
                        setFormAbsen({ ...formAbsen, check_in: e.target.value })
                      }
                    />
                    <Input
                      label="Waktu Check Out"
                      variant="underlined"
                      labelPlacement="outside"
                      value={formAbsen.check_out}
                      onChange={(e) =>
                        setFormAbsen({
                          ...formAbsen,
                          check_out: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="flex justify-center pb-8">
                <Button variant="light" color="danger" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  className="bg-[#122C93] text-white px-10"
                  onPress={handleSubmitAbsen}
                >
                  Simpan Perubahan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL EDIT PATROLI */}
      <Modal isOpen={isOpenPatroli} onClose={onClosePatroli} size="xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-[#122C93]">
                Edit Laporan Patroli
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-6 p-2">
                  <Select
                    label="Status Lokasi"
                    variant="underlined"
                    labelPlacement="outside"
                    placeholder="Pilih Status"
                    selectedKeys={
                      formPatroli.status_lokasi
                        ? [formPatroli.status_lokasi]
                        : []
                    }
                    onChange={(e) =>
                      setFormPatroli({
                        ...formPatroli,
                        status_lokasi: e.target.value,
                      })
                    }
                  >
                    <SelectItem key="Aman">Aman</SelectItem>
                    <SelectItem key="Tidak Aman">Tidak Aman</SelectItem>
                  </Select>
                  <Input
                    label="Keterangan"
                    variant="underlined"
                    labelPlacement="outside"
                    value={formPatroli.keterangan}
                    onChange={(e) =>
                      setFormPatroli({
                        ...formPatroli,
                        keterangan: e.target.value,
                      })
                    }
                  />
                </div>
              </ModalBody>
              <ModalFooter className="flex justify-center pb-8">
                <Button variant="light" color="danger" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  className="bg-[#122C93] text-white px-10"
                  onPress={handleSubmitPatroli}
                >
                  Simpan Perubahan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminDownloadRekap;
