import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReceivables, recordPayment, cancelEntry } from "@/lib/api/financial";
import type { FinancialEntry, FinancialEntryStatus, PaymentMethod } from "@/types/financial";
import { ENTRY_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/types/financial";

const STATUS_OPTIONS: Array<{ value: FinancialEntryStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendente" },
  { value: "PAID", label: "Pago" },
  { value: "CANCELLED", label: "Cancelado" },
];

const PAYMENT_METHODS: PaymentMethod[] = ["DINHEIRO", "CARTAO_DEBITO", "CARTAO_CREDITO", "PIX"];

function fmt(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function fmtDate(d: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function StatusBadge({ status }: { status: FinancialEntryStatus }) {
  const styles: Record<FinancialEntryStatus, string> = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
    PAID: "bg-green-50 text-green-700 border-green-200",
    CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {ENTRY_STATUS_LABELS[status]}
    </span>
  );
}

export default function AdminReceivables() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<FinancialEntryStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [payingEntry, setPayingEntry] = useState<FinancialEntry | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("DINHEIRO");

  const { data, isLoading } = useQuery({
    queryKey: ["financial", "receivables", page, statusFilter],
    queryFn: () => fetchReceivables(page, 20, statusFilter === "ALL" ? undefined : statusFilter),
  });

  const payMut = useMutation({
    mutationFn: ({ id, method }: { id: number; method: PaymentMethod }) => recordPayment(id, method),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financial"] });
      setPayingEntry(null);
    },
  });

  const cancelMut = useMutation({
    mutationFn: (id: number) => cancelEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financial"] }),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Contas a Receber</h1>
        <p className="text-sm text-gray-500 mt-1">Lançamentos gerados automaticamente ao concluir consultas.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value); setPage(0); }}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              statusFilter === opt.value
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center gap-2 px-5 py-10 text-sm text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Carregando…
          </div>
        ) : !data?.content.length ? (
          <div className="px-5 py-12 text-center text-sm text-gray-400">Nenhum lançamento encontrado.</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Descrição</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Paciente</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Vencimento</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Valor</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Forma Pgto</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.content.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-800">{entry.description}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{entry.patientName ?? "—"}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{fmtDate(entry.dueDate)}</td>
                  <td className="px-5 py-4 text-sm text-right font-semibold text-gray-800">{fmt(entry.amount)}</td>
                  <td className="px-5 py-4"><StatusBadge status={entry.status} /></td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {entry.paymentMethodLabel ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    {entry.status === "PENDING" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setPayingEntry(entry); setSelectedMethod("DINHEIRO"); }}
                          className="rounded-lg bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                        >
                          Receber
                        </button>
                        <button
                          onClick={() => cancelMut.mutate(entry.id)}
                          disabled={cancelMut.isPending}
                          className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{data.totalElements} lançamentos</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40 hover:bg-gray-50">Anterior</button>
            <button disabled={page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40 hover:bg-gray-50">Próxima</button>
          </div>
        </div>
      )}

      {/* Pay modal */}
      {payingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Registar recebimento</h2>
            <p className="text-sm text-gray-500">{payingEntry.description}</p>
            <p className="text-2xl font-bold text-gray-900">{fmt(payingEntry.amount)}</p>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Forma de pagamento</label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => payMut.mutate({ id: payingEntry.id, method: selectedMethod })}
                disabled={payMut.isPending}
                className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {payMut.isPending ? "Guardando…" : "Confirmar"}
              </button>
              <button
                onClick={() => setPayingEntry(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
