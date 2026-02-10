export interface User {
  uuid: string;
  nama: string;
  username: string;
  created_at: string;
  is_active?: number;
}

export interface CreateUserPayload {
  nama: string;
  username: string;
  password?: string;
}

export interface UserResponse {
  data: {
    data: User[];
    pagination?: {
      total_pages: number;
      current_page: number;
      total_items: number;
    };
  };
  message?: string;
}

export interface FormErrors {
  nama?: string;
  username?: string;
  password?: string;
}
