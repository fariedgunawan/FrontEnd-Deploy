export interface Patroli {
  uuid: string;
  nama_satpam: string;
  nip: string;
  nama_pos: string;
  status_lokasi: string;
  keterangan: string;
  created_at: string;
  images: string[];
}

export interface PatroliResponse {
  data: {
    data: Patroli[];
    pagination?: {
      total_pages: number;
      items_per_page: number;
      current_page: number;
      total_items: number;
    };
  };
  message?: string;
}

export interface UpdatePatroliPayload {
  status_lokasi: string;
  keterangan: string;
}

