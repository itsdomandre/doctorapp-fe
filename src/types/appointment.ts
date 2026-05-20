export type AppointmentStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED";

export type AppointmentMessage = {
  id: number;
  authorName: string;
  role: "ADMIN" | "USER";
  content: string;
  createdAt: string;
};

export type Procedure =
  | "AVALIACAO_CLINICA"
  | "DESINTOXICACAO"
  | "HARMONIZACAO_FACIAL"
  | "PREENCHIMENTO_FACIAL"
  | "LASER_LAVIEEN"
  | "LIMPEZA_DE_PELE"
  | "PEELING_QUIMICO"
  | "SUPLEMENTACAO_VITAMINA_INJETAVEL"
  | "TERAPIA_CAPILAR"
  | "TOXINA_BOTULINICA"
  | "ULTRAFORMER";

export const PROCEDURE_LABELS: Record<Procedure, string> = {
  AVALIACAO_CLINICA: "Avaliação Clínica",
  DESINTOXICACAO: "Desintoxicação",
  HARMONIZACAO_FACIAL: "Harmonização Facial",
  PREENCHIMENTO_FACIAL: "Preenchimento Facial",
  LASER_LAVIEEN: "Laser Lavieen",
  LIMPEZA_DE_PELE: "Limpeza de Pele",
  PEELING_QUIMICO: "Peeling Químico",
  SUPLEMENTACAO_VITAMINA_INJETAVEL: "Suplementação de Vitamina Injetável",
  TERAPIA_CAPILAR: "Terapia Capilar",
  TOXINA_BOTULINICA: "Toxina Botulínica",
  ULTRAFORMER: "Ultraformer",
};

export type Appointment = {
  id: number;
  patientName?: string;
  procedure: Procedure;
  dateTime: string; // "yyyy-MM-ddTHH:mm:ss"
  status: AppointmentStatus;
  updatedAt?: string;
  notes?: string;
  doctorName?: string;
  messages: AppointmentMessage[];
  anamnesisId?: number | null;
};
