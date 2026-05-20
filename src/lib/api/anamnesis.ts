import api from "@/lib/api";
import type { AnamnesisData } from "@/types/anamnesis";

export async function getMyAnamnesis(appointmentId: number): Promise<AnamnesisData> {
  const res = await api.get(`/api/anamnesis/my/appointment/${appointmentId}`);
  return res.data;
}

export async function getMyTemplate(): Promise<AnamnesisData> {
  const res = await api.get("/api/anamnesis/my/template");
  return res.data;
}

export async function createMyAnamnesis(appointmentId: number, data: AnamnesisData): Promise<AnamnesisData> {
  const res = await api.post(`/api/anamnesis/my/appointment/${appointmentId}`, data);
  return res.data;
}

export async function getPatientAnamneses(patientId: string): Promise<AnamnesisData[]> {
  const res = await api.get(`/api/anamnesis/patient/${patientId}`);
  return res.data;
}

export async function adminUpdateAnamnesis(appointmentId: number, data: AnamnesisData): Promise<AnamnesisData> {
  const res = await api.patch(`/api/anamnesis/appointment/${appointmentId}`, data);
  return res.data;
}
