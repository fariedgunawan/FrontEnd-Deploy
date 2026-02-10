export interface Pos {
  uuid: string | null;
  nama: string;
  kode: string;
  lat: string;
  lng: string;
  created_at?: string;
  tipe?: string;
}

export interface PosResponse {
  data: {
    data: Pos[];
    pagination?: {
      total_pages: number;
      items_per_page: number;
      current_page: number;
      total_items: number;
    };
  };
  message?: string;
}

export interface CreatePosPayload {
  nama: string;
  kode: string;
  lat: number;
  lng: number;
  tipe: string;
}
