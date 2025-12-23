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
  addToast,
  Pagination,
} from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L, { LatLng } from "leaflet";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationMarkerProps {
  position: LatLng | null;
  setPosition: (position: LatLng) => void;
}

function LocationMarker({ position, setPosition }: LocationMarkerProps) {
  const map = useMapEvents({
    click(e: L.LeafletMouseEvent) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position ? (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend(e: L.DragEndEvent) {
          setPosition(e.target.getLatLng());
        },
      }}
    />
  ) : null;
}

const AdminManagePos = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPosition, setSelectedPosition] = useState<LatLng | null>(null);
  const [dataPos, setDataPos] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    id: null,
    nama_pos: "",
    kode_pos: "",
    latitude: "",
    longitude: "",
    created_at: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);

  const [page, setPage] = useState(1);
  const rowsPerPage = 13;

  const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
  const API_URL = `${BASE_API_URL}/v1/poss`;

  // Ambil token dari cookie
  const getToken = () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    return token;
  };

  // Fetch semua data pos
  const fetchData = async () => {
    try {
      setLoadingTable(true);
      // GET All tetap menggunakan query param tipe=jaga sesuai aturan awal
      const res = await fetch(`${API_URL}?tipe=jaga`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();

      // Sesuai respons JSON Anda: data.results
      if (data && Array.isArray(data.results)) {
        setDataPos(data.results);
      } else {
        setDataPos([]);
      }
    } catch (error) {
      console.error("Gagal memuat data pos:", error);
      setDataPos([]);
    } finally {
      setLoadingTable(false);
    }
  };

  const pages = Math.ceil(dataPos.length / rowsPerPage);

  useEffect(() => {
    fetchData();
  }, []);

  // Buka modal tambah
  const handleOpenAdd = () => {
    setFormData({
      id: null,
      nama_pos: "",
      kode_pos: "",
      latitude: "",
      longitude: "",
      created_at: "",
    });
    setSelectedPosition(null);
    onOpen();
  };

  const handleEdit = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();

      const item = data.pos;

      if (item) {
        setFormData({
          id: item.id,
          nama_pos: item.nama_pos || "",
          kode_pos: item.kode_pos || "",
          latitude: item.latitude || "",
          longitude: item.longitude || "",
          created_at: item.created_at || "",
        });

        const lat = parseFloat(item.latitude);
        const lng = parseFloat(item.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          setSelectedPosition(new LatLng(lat, lng));
        } else {
          setSelectedPosition(null);
          console.error(
            "Koordinat tidak valid:",
            item.latitude,
            item.longitude
          );
        }

        onOpen();
      }
    } catch (error) {
      console.error("Gagal mengambil detail pos:", error);
      addToast({
        title: "Error",
        description: "Gagal memuat detail pos.",
        color: "danger",
      });
    }
  };

  const handleSave = async () => {
    if (!formData.kode_pos || !formData.nama_pos || !selectedPosition) return;

    const payload = {
      kode_pos: formData.kode_pos,
      nama_pos: formData.nama_pos,
      tipe_pos: "jaga",
      latitude: selectedPosition.lat,
      longitude: selectedPosition.lng,
    };

    setLoading(true);
    try {
      const isEdit = !!formData.id;
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `${API_URL}/${formData.id}?tipe=jaga` : API_URL;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan!");

      await fetchData();
      onClose();
      addToast({
        title: "Berhasil",
        description: "Data tersimpan",
        color: "success",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Hapus pos
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus pos ini?")) return;
    try {
      // Tambahkan query param tipe=jaga
      await fetch(`${API_URL}/${id}?tipe=jaga`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      fetchData();

      addToast({
        title: "Data Dihapus",
        description: "Data pos berhasil dihapus.",
        color: "danger",
      });
    } catch (error) {
      console.error("Gagal menghapus pos:", error);
    }
  };

  return (
    <div className="flex flex-col p-5">
      <div className="container-content flex flex-col gap-4">
        {/* Header */}
        <div className="header-container flex flex-row items-center justify-between mt-5">
          <h2 className="font-semibold text-[25px] text-[#122C93]">
            Manage Pos Patroli
          </h2>
          <Button
            variant="solid"
            onPress={handleOpenAdd}
            className="bg-[#122C93] text-white font-semibold w-30 h-12 text-[16px]"
          >
            Tambah +
          </Button>
        </div>

        {/* Modal ADD / EDIT */}
        <Modal backdrop="opaque" isOpen={isOpen} onClose={onClose} size="4xl">
          <ModalContent>
            <>
              <ModalBody>
                <div className="form-input flex flex-col gap-8 p-3">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <Input
                      type="text"
                      variant="underlined"
                      size="lg"
                      label="Nama Pos"
                      placeholder="Masukan nama"
                      value={formData.nama_pos}
                      onChange={(e) =>
                        setFormData({ ...formData, nama_pos: e.target.value })
                      }
                    />
                    <Input
                      type="text"
                      variant="underlined"
                      size="lg"
                      label="Kode Pos"
                      placeholder="Masukan Kode Pos"
                      value={formData.kode_pos}
                      onChange={(e) =>
                        setFormData({ ...formData, kode_pos: e.target.value })
                      }
                    />
                    <Input
                      type="text"
                      variant="underlined"
                      size="lg"
                      label="Latitude"
                      value={
                        selectedPosition
                          ? selectedPosition.lat.toString()
                          : formData.latitude
                      }
                      readOnly
                    />
                    <Input
                      type="text"
                      variant="underlined"
                      size="lg"
                      label="Longitude"
                      value={
                        selectedPosition
                          ? selectedPosition.lng.toString()
                          : formData.longitude
                      }
                      readOnly
                    />
                  </div>

                  {/* Map */}
                  <div className="flex flex-col items-start w-full gap-2">
                    <h2 className="text-lg font-semibold">
                      Titik Koordinat Maps
                    </h2>
                    <p className="text-sm text-gray-500">
                      Klik di peta untuk memilih lokasi, atau drag marker.
                    </p>
                    <div className="w-full h-[400px] rounded-lg overflow-hidden z-10">
                      <MapContainer
                        center={
                          selectedPosition
                            ? [selectedPosition.lat, selectedPosition.lng]
                            : [-6.9175, 107.6191]
                        }
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker
                          position={selectedPosition}
                          setPosition={setSelectedPosition}
                        />
                      </MapContainer>
                    </div>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="flex justify-center gap-5">
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  className="bg-[#122C93] text-white font-semibold"
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner classNames={{ label: "text-white ml-2" }} />
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </ModalFooter>
            </>
          </ModalContent>
        </Modal>

        {/* Table */}
        <div className="mt-6">
          {loadingTable ? (
            <div className="flex justify-center py-10">
              <Spinner label="Memuat data..." />
            </div>
          ) : (
            <Table
              aria-label="Tabel Data Pos"
              shadow="none"
              isStriped
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
                <TableColumn>Nama Pos</TableColumn>
                <TableColumn>Kode Pos</TableColumn>
                <TableColumn>Longitude</TableColumn>
                <TableColumn>Latitude</TableColumn>
                <TableColumn>Created At</TableColumn>
                <TableColumn className="text-center">Action</TableColumn>
              </TableHeader>
              <TableBody>
                {dataPos.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.nama_pos}</TableCell>
                    <TableCell>{item.kode_pos}</TableCell>
                    <TableCell>{item.longitude}</TableCell>
                    <TableCell>{item.latitude}</TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-3">
                        <Button
                          size="sm"
                          className="bg-[#02A758] text-white font-semibold"
                          startContent={<FaEdit />}
                          onPress={() => handleEdit(item.id)}
                        >
                          Edit
                        </Button>
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

export default AdminManagePos;
