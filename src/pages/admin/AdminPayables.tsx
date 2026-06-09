import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPayables, createPayable, recordPayment, cancelEntry } from "@/lib/api/financial";
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

function dueBadge(entry: FinancialEntry) {
  if (entry.status !== "PENDING") return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(entry.dueDate + "T00:00:00");
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0)
    return <span className="ml-1 inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">Vencido</span>;
  if (diffDays === 0)
    return <span className="ml-1 inline-flex items-center rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700">Vence hoje</span>;
  if (diffDays <= 7)
    return <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-700">Em {diffDays}d</span>;
  return null;
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

type NewPayableForm = { description: string; amount: string; dueDate: string };
const EMPTY_FORM: NewPayableForm = { description: "", amount: "", dueDate: "" };

export default function AdminPayables() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<FinancialEntryStatus | "ALL">("ALL");
  const [dueDateFrom, setDueDateFrom] = useState("");
  const [dueDateTo, setDueDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<NewPayableForm>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [payingEntry, setPayingEntry] = useState<FinancialEntry | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("DINHEIRO");

  const { data, isLoading } = useQuery({
    queryKey: ["financial", "payables", page, statusFilter, dueDateFrom, dueDateTo],
    queryFn: () => fetchPayables({
      page,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      dueDateFrom: dueDateFrom || undefined,
      dueDateTo: dueDateTo || undefined,
    }),
  });

  const createMut = useMutation({
    mutationFn: createPayable,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financial"] });
      setShowCreate(false);
      setForm(EMPTY_FORM);
      setFormError("");
    },
    onError: () => setFormError("Erro ao criar lançamento. Verifique os campos."),
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

  function handleCreate() {
    const amount = parseFloat(form.amount.replace(",", "."));
    if (!form.description.trim() || isNaN(amount) || amount <= 0 || !form.dueDate) {
      setFormError("Preencha todos os campos correctamente.");
      return;
    }
    setFormError("");
    createMut.mutate({ description: form.description.trim(), amount, dueDate: form.dueDate });
  }

  function clearFilters() {
    setStatusFilter("ALL");
    setDueDateFrom("");
    setDueDateTo("");
    setPage(0);
  }

  const hasActiveFilter = statusFilter !== "ALL" || dueDateFrom || dueDateTo;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Contas a Pagar</h1>
          <p className="text-sm text-gray-500 mt-1">Gerir despesas e pagamentos a fornecedores.</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setForm(EMPTY_FORM); setFormError(""); }}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          + Novo lançamento
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mr-1">Status</span>
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

        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Vencimento de</label>
            <input
              type="date"
              value={dueDateFrom}
              onChange={(e) => { setDueDateFrom(e.target.value); setPage(0); }}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">até</label>
            <input
              type="date"
              value={dueDateTo}
              onChange={(e) => { setDueDateTo(e.target.value); setPage(0); }}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Table */}
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
          <>
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Descrição</th>
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
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {fmtDate(entry.dueDate)}
                      {dueBadge(entry)}
                    </td>
                    <td className="px-5 py-4 text-sm text-right font-semibold text-gray-800">{fmt(entry.amount)}</td>
                    <td className="px-5 py-4"><StatusBadge status={entry.status} /></td>
                    <td className="px-5 py-4 text-sm text-gray-500">{entry.paymentMethodLabel ?? "—"}</td>
                    <td className="px-5 py-4">
                      {entry.status === "PENDING" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setPayingEntry(entry); setSelectedMethod("DINHEIRO"); }}
                            className="rounded-lg bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                          >
                            Pagar
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

            {/* Total bar */}
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-5 py-3">
              <span className="text-xs text-gray-400">{data.totalElements} lançamento{data.totalElements !== 1 ? "s" : ""}</span>
              <span className="text-sm font-semibold text-gray-700">
                Total filtrado: <span className="text-gray-900">{fmt(data.filteredTotal ?? 0)}</span>
              </span>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40 hover:bg-gray-50">Anterior</button>
          <span className="text-xs">{page + 1} / {data.totalPages}</span>
          <button disabled={page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40 hover:bg-gray-50">Próxima</button>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Novo lançamento a pagar</h2>
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: Material de escritório"
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Valor (R$)</label>
                <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0,00"
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Vencimento</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
            </div>
            {formError && <p className="text-xs text-red-600">{formError}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={handleCreate} disabled={createMut.isPending}
                className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors">
                {createMut.isPending ? "Guardando…" : "Criar"}
              </button>
              <button onClick={() => setShowCreate(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay modal */}
      {payingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Registar pagamento</h2>
            <p className="text-sm text-gray-500">{payingEntry.description}</p>
            <p className="text-2xl font-bold text-gray-900">{fmt(payingEntry.amount)}</p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Forma de pagamento</label>
              <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => payMut.mutate({ id: payingEntry.id, method: selectedMethod })} disabled={payMut.isPending}
                className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors">
                {payMut.isPending ? "Guardando…" : "Confirmar"}
              </button>
              <button onClick={() => setPayingEntry(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
