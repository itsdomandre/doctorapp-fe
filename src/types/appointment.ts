export type AppointmentStatus =
  | "SOLICITADO"
  | "APROVADO"
  | "REJEITADO"
  | "CANCELADO"
  | "COMPLETO";

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

export interface AppointmentDTO {
  id: number;
  appointmentDate: string; // ISO (ex: 2025-08-21T14:00:00)
  status: AppointmentStatus;
  procedure: Procedure;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  patient?: { id: string; firstName?: string; lastName?: string; email: string };
  doctor?: { id: string; firstName?: string; lastName?: string; email: string } | null;
}

export interface CreateAppointmentPayload {
  // backend espera LocalDateTime (YYYY-MM-DDTHH:mm:ss)
  dateTime: string;
  procedure: Procedure;
  notes?: string;
}

export const PROCEDURE_LABEL: Record<Procedure, string> = {
  AVALIACAO_CLINICA: "Avaliação clínica",
  DESINTOXICACAO: "Desintoxicação",
  HARMONIZACAO_FACIAL: "Harmonização facial",
  PREENCHIMENTO_FACIAL: "Preenchimento facial",
  LASER_LAVIEEN: "Laser Lavieen",
  LIMPEZA_DE_PELE: "Limpeza de pele",
  PEELING_QUIMICO: "Peeling químico",
  SUPLEMENTACAO_VITAMINA_INJETAVEL: "Suplementação de vitamina injetável",
  TERAPIA_CAPILAR: "Terapia capilar",
  TOXINA_BOTULINICA: "Toxina botulínica",
  ULTRAFORMER: "Ultraformer",
};

export const PROCEDURES: Procedure[] = [
  "AVALIACAO_CLINICA",
  "DESINTOXICACAO",
  "HARMONIZACAO_FACIAL",
  "PREENCHIMENTO_FACIAL",
  "LASER_LAVIEEN",
  "LIMPEZA_DE_PELE",
  "PEELING_QUIMICO",
  "SUPLEMENTACAO_VITAMINA_INJETAVEL",
  "TERAPIA_CAPILAR",
  "TOXINA_BOTULINICA",
  "ULTRAFORMER",
];
