export type PaymentMethod = "DINHEIRO" | "CARTAO_DEBITO" | "CARTAO_CREDITO" | "PIX";
export type FinancialEntryType = "RECEIVABLE" | "PAYABLE";
export type FinancialEntryStatus = "PENDING" | "PAID" | "CANCELLED";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  DINHEIRO: "Dinheiro",
  CARTAO_DEBITO: "Cartão de débito",
  CARTAO_CREDITO: "Cartão de crédito",
  PIX: "PIX",
};

export const ENTRY_STATUS_LABELS: Record<FinancialEntryStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  CANCELLED: "Cancelado",
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

export const ALL_PROCEDURES: Procedure[] = [
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

export const PROCEDURE_LABELS: Record<Procedure, string> = {
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

export type ProcedurePrice = {
  id: number;
  procedure: Procedure;
  procedureLabel: string;
  price: number;
  updatedAt: string;
  updatedBy?: string;
};

export type FinancialEntry = {
  id: number;
  type: FinancialEntryType;
  typeLabel: string;
  status: FinancialEntryStatus;
  statusLabel: string;
  amount: number;
  description: string;
  dueDate: string;
  createdAt: string;
  paymentMethod?: PaymentMethod;
  paymentMethodLabel?: string;
  paidAt?: string;
  appointmentId?: number;
  patientName?: string;
};

export type FinancialEntryPageResponse = {
  content: FinancialEntry[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  filteredTotal: number;
};

export type FinancialSummary = {
  totalReceivablePending: number;
  totalReceivablePaid: number;
  totalPayablePending: number;
  totalPayablePaid: number;
  netBalance: number;
  pendingReceivablesCount: number;
  pendingPayablesCount: number;
  receivablePaidThisMonth: number;
  payablePaidThisMonth: number;
};
