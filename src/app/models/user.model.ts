export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  roles: string[];
}
