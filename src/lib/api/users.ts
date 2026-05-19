import api from "@/lib/api";

export type Role = "USER" | "ADMIN";

export type AdminCreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  birthdate: string; // yyyy-MM-dd
  role: Role;
};

export type UserDTO = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  birthdate: string;
  role: Role;
  status: string;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export async function adminCreateUser(input: AdminCreateUserInput): Promise<UserDTO> {
  const res = await api.post<UserDTO>("/api/users", input);
  return res.data;
}

export async function fetchAllUsers(page = 0, size = 10): Promise<Page<UserDTO>> {
  const res = await api.get<Page<UserDTO>>("/api/users", { params: { page, size } });
  return res.data;
}

export async function updateUserRole(id: string, role: Role): Promise<UserDTO> {
  const res = await api.patch<UserDTO>(`/api/users/${id}/role`, { role });
  return res.data;
}

export async function fetchAllPatients(page = 0, size = 10): Promise<Page<UserDTO>> {
  const res = await api.get<Page<UserDTO>>("/api/users/all-patients", { params: { page, size } });
  return res.data;
}
