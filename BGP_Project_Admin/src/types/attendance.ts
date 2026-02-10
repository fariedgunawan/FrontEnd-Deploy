export interface Absensi {
  uuid: string;
  nama_satpam: string;
  nip: string;
  check_in: string | null;
  check_out: string | null;
  kategori: string;
  created_at: string;
}

export interface AttendanceResponse {
  data: {
    data: Absensi[];
    pagination?: {
      total_pages: number;
      items_per_page: number;
      current_page: number;
      total_items: number;
    };
  };
  message?: string;
}

export interface UpdateAttendancePayload {
  check_in?: string;
  check_out?: string;
  kategori?: string;
}

export interface FormData {
  check_in: string;
  check_out: string;
  kategori: string;
}
