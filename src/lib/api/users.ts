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
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status: string;
};

export async function adminCreateUser(input: AdminCreateUserInput): Promise<UserDTO> {
  const res = await api.post<UserDTO>("/api/users", input);
  return res.data;
}
