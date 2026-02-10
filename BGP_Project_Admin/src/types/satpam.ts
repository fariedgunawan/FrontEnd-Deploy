export interface Satpam {
  uuid: string;
  nama: string;
  asal_daerah: string;
  nip: string;
  no_telp: string;
  image_url?: string;
  created_at?: string;
  nama_client?: string;
}

export interface MitraOption {
  uuid: string;
  nama: string;
}

export interface SatpamResponse {
  data: {
    data: Satpam[];
    pagination?: {
      total_pages: number;
      items_per_page: number;
      current_page: number;
      total_items: number;
    };
  };
  message?: string;
}

export interface MitraOptionsResponse {
  data: MitraOption[];
}

export interface FormErrors {
  nama?: string;
  asal_daerah?: string;
  nip?: string;
  no_telp?: string;
  image?: string;
}

export interface CreateSatpamPayload {
  nama: string;
  asal_daerah: string;
  nip: string;
  no_telp: string;
  image?: File | null;
}
