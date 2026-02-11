import { CalendarDate } from "@internationalized/date";

export interface SatpamOption {
  uuid: string;
  nama: string;
  nip: string;
}

export interface ShiftOption {
  uuid: string;
  nama: string;
  mulai: string;
  selesai: string;
}

export interface PosOption {
  uuid: string;
  nama: string;
}

export interface Jadwal {
  uuid: string;
  tanggal: string;
  satpam_id: number;
  user_id: number;
  satpam_name: string;
  shift_nama: string;
  mulai: string;
  selesai: string;
  nama_pos: string;
}

export interface ScheduleResponse {
  data: {
    data: Jadwal[];
    pagination?: {
      total_pages: number;
      items_per_page: number;
    };
  };
}

export interface FormData {
  satpam_uuid: string;
  pos_uuid: string;
  shift_uuid: string;
  tanggal: CalendarDate | null;
}

export interface GenerateFormData {
  satpam_uuid: string;
  pos_uuid: string;
  shift_uuid: string;
  start_date: CalendarDate | null;
  end_date: CalendarDate | null;
  days_of_week: string[];
}
