import api from "@/lib/api";
import type { Page } from "@/lib/api/appointments";
import type {
  FinancialEntry,
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

export async function fetchReceivables(
  page = 0,
  size = 20,
  status?: FinancialEntryStatus
): Promise<Page<FinancialEntry>> {
  const params: Record<string, unknown> = { page, size };
  if (status) params.status = status;
  const res = await api.get<Page<FinancialEntry>>("/api/financial/receivables", { params });
  return res.data;
}

export async function fetchPayables(
  page = 0,
  size = 20,
  status?: FinancialEntryStatus
): Promise<Page<FinancialEntry>> {
  const params: Record<string, unknown> = { page, size };
  if (status) params.status = status;
  const res = await api.get<Page<FinancialEntry>>("/api/financial/payables", { params });
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
