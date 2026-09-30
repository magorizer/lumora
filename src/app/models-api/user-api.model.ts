export interface UserApiResponse {
  id: string;
  email: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  roles: string[];
}

export interface UserApiUpdate {
  first_name?: string;
  last_name?: string;
}
