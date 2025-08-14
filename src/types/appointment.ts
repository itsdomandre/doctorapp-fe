export type AppointmentStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type Appointment = {
  id: string;
  date: string;          // ISO (yyyy-mm-dd) ou datetime, conforme teu backend
  time?: string;         // se a hora vier separada
  datetime?: string;     // se vier combinado (ISO)
  specialty?: string;
  reason?: string;       // descrição curta
  status: AppointmentStatus;
  createdAt?: string;
};
