import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProcedurePrices, upsertProcedurePrice } from "@/lib/api/financial";
import { ALL_PROCEDURES, PROCEDURE_LABELS, type Procedure } from "@/types/financial";

function fmt(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function fmtDateTime(dt: string) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminProcedurePrices() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Procedure | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [inputError, setInputError] = useState("");

  const { data: prices = [], isLoading } = useQuery({
    queryKey: ["procedurePrices"],
    queryFn: fetchProcedurePrices,
  });

  const priceMap = Object.fromEntries(prices.map((p) => [p.procedure, p]));

  const upsertMut = useMutation({
    mutationFn: ({ procedure, price }: { procedure: Procedure; price: number }) =>
      upsertProcedurePrice(procedure, price),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["procedurePrices"] });
      setEditing(null);
      setPriceInput("");
      setInputError("");
    },
    onError: () => setInputError("Erro ao guardar. Tente novamente."),
  });

  function handleSave() {
    if (!editing) return;
    const price = parseFloat(priceInput.replace(",", "."));
    if (isNaN(price) || price <= 0) {
      setInputError("Insira um valor válido maior que zero.");
      return;
    }
    setInputError("");
    upsertMut.mutate({ procedure: editing, price });
  }

  function openEdit(proc: Procedure) {
    const current = priceMap[proc];
    setPriceInput(current ? String(current.price) : "");
    setInputError("");
    setEditing(proc);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Preços de Procedimentos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Defina o valor cobrado por cada procedimento. Este valor é usado automaticamente ao concluir uma consulta.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center gap-2 px-5 py-10 text-sm text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Carregando…
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Procedimento</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Valor</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Última actualização</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Por</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ALL_PROCEDURES.map((proc) => {
                const entry = priceMap[proc];
                return (
                  <tr key={proc} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-800">{PROCEDURE_LABELS[proc]}</td>
                    <td className="px-5 py-4 text-sm text-right font-semibold text-gray-800">
                      {entry ? fmt(entry.price) : <span className="text-gray-300 font-normal">Não definido</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {entry ? fmtDateTime(entry.updatedAt) : "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{entry?.updatedBy ?? "—"}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openEdit(proc)}
                        className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        {entry ? "Editar" : "Definir"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Definir preço</h2>
            <p className="text-sm text-gray-500">{PROCEDURE_LABELS[editing]}</p>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Valor (R$)</label>
              <input
                autoFocus
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="0,00"
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              {inputError && <p className="text-xs text-red-600">{inputError}</p>}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={upsertMut.isPending}
                className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {upsertMut.isPending ? "Guardando…" : "Guardar"}
              </button>
              <button
                onClick={() => setEditing(null)}
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
