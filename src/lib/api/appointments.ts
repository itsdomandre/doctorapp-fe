import api from "@/lib/api";
import { Appointment } from "@/types/appointment";

const ENDPOINTS = {
  // GET lista dos appointments do usuário logado (com paginação e filtro de status)
  // Edite para: "/api/appointment/my-appointments" ou outro que tiveres
  listMine: "/api/appointment/my-appointments",

  // POST criação de novo appointment (payload do form)
  create: "/api/appointment",

  // (opcional) cancelar pedido do usuário
  cancel: (id: string) => `/api/appointment/${id}/cancel`,
};

export type ListMineParams = {
  page?: number;   // 0-based
  size?: number;   // itens por página
  status?: string; // PENDING|APPROVED|REJECTED|CANCELLED|ALL
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;       // current page (0-based)
  size: number;
};

export async function fetchMyAppointments(params: ListMineParams) {
  const { page = 0, size = 10, status = "ALL" } = params;
  const res = await api.get<Page<Appointment>>(ENDPOINTS.listMine, {
    params: { page, size, status },
    withCredentials: true,
  });
  return res.data;
}

export type CreateAppointmentInput = {
  date: string;       // yyyy-mm-dd
  time?: string;      // HH:mm (se teu backend precisa separado)
  specialty: string;
  reason: string;
};

export async function createAppointment(input: CreateAppointmentInput) {
  const res = await api.post(ENDPOINTS.create, input, { withCredentials: true });
  return res.data;
}

export async function cancelAppointment(id: string) {
  const res = await api.post(ENDPOINTS.cancel(id), null, { withCredentials: true });
  return res.data;
}
