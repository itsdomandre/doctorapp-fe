import api from "@/lib/api";
import type {
  FinancialEntry,
  FinancialEntryPageResponse,
  FinancialEntryStatus,
  FinancialSummary,
  PaymentMethod,
  Procedure,
  ProcedurePrice,
} from "@/types/financial";

export async function fetchFinancialSummary(): Promise<FinancialSummary> {
  const res = await api.get<FinancialSummary>("/api/financial/summary");
  return res.data;
}

export type EntryListParams = {
  page?: number;
  size?: number;
  status?: FinancialEntryStatus;
  dueDateFrom?: string;
  dueDateTo?: string;
};

export async function fetchReceivables(params: EntryListParams = {}): Promise<FinancialEntryPageResponse> {
  const { page = 0, size = 20, status, dueDateFrom, dueDateTo } = params;
  const query: Record<string, unknown> = { page, size };
  if (status) query.status = status;
  if (dueDateFrom) query.dueDateFrom = dueDateFrom;
  if (dueDateTo) query.dueDateTo = dueDateTo;
  const res = await api.get<FinancialEntryPageResponse>("/api/financial/receivables", { params: query });
  return res.data;
}

export async function fetchPayables(params: EntryListParams = {}): Promise<FinancialEntryPageResponse> {
  const { page = 0, size = 20, status, dueDateFrom, dueDateTo } = params;
  const query: Record<string, unknown> = { page, size };
  if (status) query.status = status;
  if (dueDateFrom) query.dueDateFrom = dueDateFrom;
  if (dueDateTo) query.dueDateTo = dueDateTo;
  const res = await api.get<FinancialEntryPageResponse>("/api/financial/payables", { params: query });
  return res.data;
}

export async function createPayable(data: {
  description: string;
  amount: number;
  dueDate: string;
}): Promise<FinancialEntry> {
  const res = await api.post<FinancialEntry>("/api/financial/payables", data);
  return res.data;
}

export async function recordPayment(id: number, paymentMethod: PaymentMethod): Promise<FinancialEntry> {
  const res = await api.patch<FinancialEntry>(`/api/financial/${id}/pay`, { paymentMethod });
  return res.data;
}

export async function cancelEntry(id: number): Promise<FinancialEntry> {
  const res = await api.patch<FinancialEntry>(`/api/financial/${id}/cancel`, {});
  return res.data;
}

export async function fetchProcedurePrices(): Promise<ProcedurePrice[]> {
  const res = await api.get<ProcedurePrice[]>("/api/admin/procedure-prices");
  return res.data;
}

export async function upsertProcedurePrice(procedure: Procedure, price: number): Promise<ProcedurePrice> {
  const res = await api.put<ProcedurePrice>("/api/admin/procedure-prices", { procedure, price });
  return res.data;
}
