import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  DatePicker,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Input,
  Spinner,
  CheckboxGroup,
  Checkbox,
  addToast,
  Pagination,
} from "@heroui/react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { CalendarDate, parseDate } from "@internationalized/date";

// --- INTERFACES ---
interface Satpam {
  id: number;
  nama: string;
  nip: string;
}
interface Pos {
  id: number;
  kode_pos: string;
  nama_pos: string;
}
interface Jadwal {
  id: number;
  tanggal: string;
  jam_mulai_shift: string;
  jam_selesai_shift: string;
  nama_satpam: string;
  nip: string;
  nama_pos: string;
  tipe_pos: string;
  satpam_id?: number;
  pos_id?: number;
}
interface GenerateFormData {
  satpam_id: string;
  pos_id: string;
  start_date: CalendarDate | null;
  end_date: CalendarDate | null;
  days_of_week: string[];
  jam_mulai_shift: string;
  jam_selesai_shift: string;
}

const AdminManageShift = () => {
  const BASE_URL_API = import.meta.env.VITE_API_BASE_URL;
  const getToken = (): string | undefined => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    return token;
  };

  const token = getToken();

  // --- DISCLOSURES ---
  const {
    isOpen: isOpenGenerate,
    onOpen: onOpenGenerate,
    onClose: onCloseGenerate,
  } = useDisclosure();
  const {
    isOpen: isOpenForm,
    onOpen: onOpenForm,
    onClose: onCloseForm,
  } = useDisclosure();

  // --- STATES ---
  const [listSatpam, setListSatpam] = useState<Satpam[]>([]);
  const [listPos, setListPos] = useState<Pos[]>([]);
  const [dataJadwal, setDataJadwal] = useState<Jadwal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDeleteId, setLoadingDeleteId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // --- PAGINATION STATES ---
  const [page, setPage] = useState(1);
  const rowsPerPage = 12;

  // --- FORM STATES ---
  const [formData, setFormData] = useState({
    satpam_id: "",
    pos_id: "",
    tanggal: null as CalendarDate | null,
    jam_mulai_shift: "",
    jam_selesai_shift: "",
  });

  const [generateData, setGenerateData] = useState<GenerateFormData>({
    satpam_id: "",
    pos_id: "",
    start_date: null,
    end_date: null,
    days_of_week: [],
    jam_mulai_shift: "",
    jam_selesai_shift: "",
  });

  // --- PAGINATION LOGIC ---
  const pages = Math.ceil(dataJadwal.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return dataJadwal.slice(start, end);
  }, [page, dataJadwal]);

  const getHari = (dateString: string) => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    return days[new Date(dateString).getDay()];
  };

  // --- FETCH DATA ---
  const fetchJadwal = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL_API}/v1/jadwals/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      setDataJadwal(result.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [resSatpam, resPos] = await Promise.all([
          fetch(`${BASE_URL_API}/v1/satpams/?mode=dropdown`, { headers }),
          fetch(`${BASE_URL_API}/v1/poss/?tipe=utama`, { headers }),
        ]);
        const ds = await resSatpam.json();
        const dp = await resPos.json();
        setListSatpam(ds.satpams || []);
        setListPos(dp.results || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchJadwal();
    if (isOpenForm || isOpenGenerate) fetchDropdowns();
  }, [isOpenForm, isOpenGenerate, fetchJadwal, token]);

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setSelectedId(null);
    setFormData({
      satpam_id: "",
      pos_id: "",
      tanggal: null,
      jam_mulai_shift: "",
      jam_selesai_shift: "",
    });
    onOpenForm();
  };

  const handleOpenEdit = async (id: number) => {
    setSelectedId(id);
    try {
      const res = await fetch(`${BASE_URL_API}/v1/jadwals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      const item = result.data;

      // --- LOGIC CARI ID (WORKAROUND) ---
      // Karena API tidak return satpam_id, kita cari dari listSatpam berdasarkan NIP
      const foundSatpam = listSatpam.find((s) => s.nip === item.nip);
      const recoveredSatpamId = foundSatpam ? String(foundSatpam.id) : "";

      // Cari pos_id dari listPos berdasarkan nama_pos
      const foundPos = listPos.find((p) => p.nama_pos === item.nama_pos);
      const recoveredPosId = foundPos ? String(foundPos.id) : "";

      setFormData({
        satpam_id: recoveredSatpamId, // Pakai ID hasil pencarian
        pos_id: recoveredPosId, // Pakai ID hasil pencarian
        tanggal: item.tanggal ? parseDate(item.tanggal.split("T")[0]) : null,
        jam_mulai_shift: item.jam_mulai_shift || "",
        jam_selesai_shift: item.jam_selesai_shift || "",
      });
      onOpenForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitShift = async () => {
    if (!formData.tanggal) return;
    const body = {
      satpam_id: Number(formData.satpam_id),
      pos_id: Number(formData.pos_id),
      tanggal: formData.tanggal.toString(),
      jam_mulai_shift:
        formData.jam_mulai_shift.length === 5
          ? `${formData.jam_mulai_shift}:00`
          : formData.jam_mulai_shift,
      jam_selesai_shift:
        formData.jam_selesai_shift.length === 5
          ? `${formData.jam_selesai_shift}:00`
          : formData.jam_selesai_shift,
    };
    const url = selectedId
      ? `${BASE_URL_API}/v1/jadwals/${selectedId}`
      : `${BASE_URL_API}/v1/jadwals/`;
    const res = await fetch(url, {
      method: selectedId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      addToast({
        title: "Berhasil",
        description: `Data berhasil ${selectedId ? "diubah" : "ditambahkan"}`,
        color: "success",
      });
      onCloseForm();
      fetchJadwal();
    }
  };

  const handleGenerateSubmit = async () => {
    if (!generateData.start_date || !generateData.end_date) return;
    const body = {
      satpam_id: Number(generateData.satpam_id),
      pos_id: Number(generateData.pos_id),
      start_date: generateData.start_date.toString(),
      end_date: generateData.end_date.toString(),
      days_of_week: generateData.days_of_week.map(Number),
      jam_mulai_shift:
        generateData.jam_mulai_shift.length === 5
          ? `${generateData.jam_mulai_shift}:00`
          : generateData.jam_mulai_shift,
      jam_selesai_shift:
        generateData.jam_selesai_shift.length === 5
          ? `${generateData.jam_selesai_shift}:00`
          : generateData.jam_selesai_shift,
    };
    const res = await fetch(`${BASE_URL_API}/v1/jadwals/recurring`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      addToast({
        title: "Berhasil",
        description: "Jadwal rutin berhasil dibuat",
        color: "success",
      });
      onCloseGenerate();
      fetchJadwal();
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus data ini?")) return;
    setLoadingDeleteId(id);
    const res = await fetch(`${BASE_URL_API}/v1/jadwals/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      addToast({
        title: "Berhasil",
        description: "Data berhasil dihapus",
        color: "danger",
      });
      fetchJadwal();
    }
    setLoadingDeleteId(null);
  };

  return (
    <div className="flex flex-col p-5">
      <div className="container-content flex flex-col gap-4">
        <div className="header-container flex flex-row items-center justify-between mt-5">
          <h2 className="font-semibold text-[25px] text-[#122C93]">
            Manage Shift
          </h2>
          <div className="container-generate flex flex-row gap-5">
            <Button
              onPress={onOpenGenerate}
              className="bg-[#122C93] text-white font-semibold h-12"
            >
              Generate Jadwal +
            </Button>
            <Button
              onPress={handleOpenAdd}
              className="bg-[#122C93] text-white font-semibold h-12"
            >
              Tambah +
            </Button>
          </div>
        </div>

        {/* MODAL GENERATE */}
        <Modal
          backdrop="opaque"
          isOpen={isOpenGenerate}
          onClose={onCloseGenerate}
          size="4xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="text-[#122C93]">
                  Auto-Generate Jadwal Rutin
                </ModalHeader>
                <ModalBody>
                  <div className="grid grid-cols-2 gap-10 p-3">
                    <div className="flex flex-col gap-6">
                      <DatePicker
                        label="Tanggal Mulai"
                        variant="underlined"
                        labelPlacement="outside"
                        onChange={(d) =>
                          setGenerateData({
                            ...generateData,
                            start_date: d as CalendarDate,
                          })
                        }
                      />
                      <DatePicker
                        label="Tanggal Berakhir"
                        variant="underlined"
                        labelPlacement="outside"
                        onChange={(d) =>
                          setGenerateData({
                            ...generateData,
                            end_date: d as CalendarDate,
                          })
                        }
                      />
                      <Select
                        label="Pos"
                        variant="underlined"
                        labelPlacement="outside"
                        placeholder="Pilih Pos"
                        onSelectionChange={(k) =>
                          setGenerateData({
                            ...generateData,
                            pos_id: String(Array.from(k)[0]),
                          })
                        }
                      >
                        {listPos.map((p) => (
                          <SelectItem key={p.id}>{p.nama_pos}</SelectItem>
                        ))}
                      </Select>
                    </div>
                    <div className="flex flex-col gap-6">
                      <Select
                        label="Satpam"
                        variant="underlined"
                        labelPlacement="outside"
                        placeholder="Pilih Personel"
                        onSelectionChange={(k) =>
                          setGenerateData({
                            ...generateData,
                            satpam_id: String(Array.from(k)[0]),
                          })
                        }
                      >
                        {listSatpam.map((s) => (
                          <SelectItem
                            key={s.id}
                            textValue={`${s.nama} - ${s.nip}`}
                          >
                            {s.nama} - {s.nip}
                          </SelectItem>
                        ))}
                      </Select>
                      <div className="flex gap-4">
                        <Input
                          label="Masuk"
                          type="time"
                          variant="underlined"
                          labelPlacement="outside"
                          step="1"
                          onChange={(e) =>
                            setGenerateData({
                              ...generateData,
                              jam_mulai_shift: e.target.value,
                            })
                          }
                        />
                        <Input
                          label="Selesai"
                          type="time"
                          variant="underlined"
                          labelPlacement="outside"
                          step="1"
                          onChange={(e) =>
                            setGenerateData({
                              ...generateData,
                              jam_selesai_shift: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <CheckboxGroup
                        label="Pilih Hari Kerja"
                        orientation="horizontal"
                        value={generateData.days_of_week}
                        onValueChange={(v) =>
                          setGenerateData({ ...generateData, days_of_week: v })
                        }
                      >
                        <Checkbox value="1">Senin</Checkbox>
                        <Checkbox value="2">Selasa</Checkbox>
                        <Checkbox value="3">Rabu</Checkbox>
                        <Checkbox value="4">Kamis</Checkbox>
                        <Checkbox value="5">Jumat</Checkbox>
                        <Checkbox value="6">Sabtu</Checkbox>
                        <Checkbox value="0">Minggu</Checkbox>
                      </CheckboxGroup>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="flex justify-center pb-8">
                  <Button variant="light" color="danger" onPress={onClose}>
                    Batal
                  </Button>
                  <Button
                    className="bg-[#122C93] text-white px-10"
                    onPress={handleGenerateSubmit}
                  >
                    Generate Sekarang
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* MODAL ADD/EDIT */}
        <Modal
          backdrop="opaque"
          isOpen={isOpenForm}
          onClose={onCloseForm}
          size="4xl"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="text-[#122C93]">
                  {selectedId ? "Edit Shift" : "Tambah Shift Manual"}
                </ModalHeader>
                <ModalBody>
                  <div className="container-form flex flex-row justify-between gap-10 p-3">
                    <div className="flex flex-col gap-8 w-1/2">
                      <DatePicker
                        className="w-full"
                        label="Tanggal"
                        variant="underlined"
                        labelPlacement="outside"
                        value={formData.tanggal}
                        onChange={(d) =>
                          setFormData({
                            ...formData,
                            tanggal: d as CalendarDate,
                          })
                        }
                      />
                      <Select
                        className="w-full"
                        label="Pos"
                        variant="underlined"
                        labelPlacement="outside"
                        selectedKeys={formData.pos_id ? [formData.pos_id] : []}
                        onSelectionChange={(k) =>
                          setFormData({
                            ...formData,
                            pos_id: String(Array.from(k)[0]),
                          })
                        }
                      >
                        {listPos.map((p) => (
                          <SelectItem key={p.id}>{p.nama_pos}</SelectItem>
                        ))}
                      </Select>
                    </div>
                    <div className="flex flex-col gap-8 w-1/2">
                      <Select
                        className="w-full"
                        label="Nama & NIP"
                        variant="underlined"
                        labelPlacement="outside"
                        selectedKeys={
                          formData.satpam_id ? [formData.satpam_id] : []
                        }
                        onSelectionChange={(k) =>
                          setFormData({
                            ...formData,
                            satpam_id: String(Array.from(k)[0]),
                          })
                        }
                      >
                        {listSatpam.map((s) => (
                          <SelectItem
                            key={String(s.id)}
                            textValue={`${s.nama} - ${s.nip}`}
                          >
                            {s.nama} - {s.nip}
                          </SelectItem>
                        ))}
                      </Select>
                      <div className="flex gap-4 w-full">
                        <Input
                          label="Masuk"
                          type="time"
                          variant="underlined"
                          labelPlacement="outside"
                          step="1"
                          value={formData.jam_mulai_shift}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              jam_mulai_shift: e.target.value,
                            })
                          }
                        />
                        <Input
                          label="Selesai"
                          type="time"
                          variant="underlined"
                          labelPlacement="outside"
                          step="1"
                          value={formData.jam_selesai_shift}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              jam_selesai_shift: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="flex justify-center pb-8">
                  <Button variant="light" color="danger" onPress={onClose}>
                    Batal
                  </Button>
                  <Button
                    className="bg-[#122C93] text-white px-10"
                    onPress={handleSubmitShift}
                  >
                    {selectedId ? "Update" : "Simpan"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* TABLE SECTION */}
        <div className="table-section-container mt-6">
          <Table
            isStriped
            shadow="none"
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
                    onChange={(p) => setPage(p)}
                  />
                </div>
              ) : null
            }
          >
            <TableHeader>
              <TableColumn>No</TableColumn>
              <TableColumn>Hari</TableColumn>
              <TableColumn>Sesi</TableColumn>
              <TableColumn>Nama</TableColumn>
              <TableColumn>NIP</TableColumn>
              <TableColumn>Pos</TableColumn>
              <TableColumn className="text-center">Action</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent="Tidak ada data."
              isLoading={isLoading}
              loadingContent={<Spinner />}
            >
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{getHari(item.tanggal)}</TableCell>
                  <TableCell>{`${item.jam_mulai_shift.slice(
                    0,
                    5
                  )} - ${item.jam_selesai_shift.slice(0, 5)}`}</TableCell>
                  <TableCell>{item.nama_satpam}</TableCell>
                  <TableCell>{item.nip}</TableCell>
                  <TableCell>{item.nama_pos}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-3">
                      <Button
                        size="sm"
                        className="bg-[#02A758] text-white"
                        startContent={<FaEdit />}
                        onPress={() => handleOpenEdit(item.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#A70202] text-white"
                        startContent={<FaTrash />}
                        isLoading={loadingDeleteId === item.id}
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
        </div>
      </div>
    </div>
  );
};

export default AdminManageShift;
