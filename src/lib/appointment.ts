import api from "@/lib/api";
import type { AppointmentDTO, CreateAppointmentPayload } from "@/types/appointment";

const ROOT = "/api/appointment"; // casa com @RequestMapping("/api/appointment")

export async function fetchMyAppointments(): Promise<AppointmentDTO[]> {
  const { data } = await api.get(`${ROOT}/my-appointments`);
  return data;
}

export async function fetchSlots(dateISO: string): Promise<string[]> {
  const { data } = await api.get(`${ROOT}/slots`, { params: { date: dateISO } });
  return data;
}

export async function createAppointment(payload: CreateAppointmentPayload): Promise<AppointmentDTO> {
  const { data } = await api.post(`${ROOT}/create`, payload);
  return data;
}
