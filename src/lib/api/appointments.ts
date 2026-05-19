import api from "@/lib/api";
import { Appointment, AppointmentStatus, Procedure } from "@/types/appointment";

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type ListMineParams = {
  page?: number;
  size?: number;
  status?: AppointmentStatus | "ALL";
};

export type CreateAppointmentInput = {
  dateTime: string;   // "yyyy-MM-ddTHH:mm:ss"
  procedure: Procedure;
  notes?: string;
};

export async function fetchMyAppointments(params: ListMineParams): Promise<Page<Appointment>> {
  const { page = 0, size = 10, status } = params;
  const query: Record<string, unknown> = { page, size };
  if (status && status !== "ALL") query.status = status;
  const res = await api.get<Page<Appointment>>("/api/appointment/my-appointments", { params: query });
  return res.data;
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const res = await api.post<Appointment>("/api/appointment", input);
  return res.data;
}

export async function cancelAppointment(id: number): Promise<Appointment> {
  const res = await api.put<Appointment>(`/api/appointment/${id}/cancel`);
  return res.data;
}

export async function fetchAvailableSlots(date: string): Promise<string[]> {
  const res = await api.get<string[]>("/api/appointment/slots", { params: { date } });
  return res.data;
}
