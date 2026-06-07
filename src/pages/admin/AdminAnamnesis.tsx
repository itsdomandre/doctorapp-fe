import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllPatients, type UserDTO } from "@/lib/api/users";
import { getPatientAnamneses, adminUpdateAnamnesis } from "@/lib/api/anamnesis";
import { PROCEDURE_LABELS } from "@/types/appointment";
import AnamnesisForm from "@/components/AnamnesisForm";
import type { AnamnesisData } from "@/types/anamnesis";

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return iso.slice(0, 10).split("-").reverse().join("/");
}

export default function AdminAnamnesis() {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<UserDTO | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<AnamnesisData>({});

  const qc = useQueryClient();

  const patientsQ = useQuery({
    queryKey: ["adminPatients"],
    queryFn: () => fetchAllPatients(0, 200),
  });

  const anamnesisQ = useQuery({
    queryKey: ["adminAnamnesis", selectedPatient?.id],
    queryFn: () => getPatientAnamneses(selectedPatient!.id),
    enabled: !!selectedPatient,
  });

  const updateMut = useMutation({
    mutationFn: ({ appointmentId, data }: { appointmentId: number; data: AnamnesisData }) =>
      adminUpdateAnamnesis(appointmentId, data),
    onSuccess: () => {
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ["adminAnamnesis", selectedPatient?.id] });
    },
  });

  const filteredPatients = (patientsQ.data?.content ?? []).filter((p) =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  function selectPatient(p: UserDTO) {
    setSelectedPatient(p);
    setSearch(p.fullName);
    setExpandedId(null);
    setEditingId(null);
  }

  function startEdit(entry: AnamnesisData) {
    setEditingId(entry.id!);
    setExpandedId(null);
    const { appointmentId: _a, appointmentDate: _d, procedure: _p, createdAt: _c, updatedAt: _u, id: _id, ...rest } = entry;
    setEditForm(rest);
  }

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
    setEditingId(null);
  }

  const entries = anamnesisQ.data ?? [];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Anamneses</h1>
        <p className="text-sm text-gray-500 mt-1">Histórico de anamneses por paciente.</p>
      </div>

      {/* Patient search */}
      <div className="relative max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Pesquisar paciente…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedPatient(null); }}
          className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        />
        {!selectedPatient && search.length > 0 && filteredPatients.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {filteredPatients.slice(0, 10).map((p) => (
              <li
                key={p.id}
                onClick={() => selectPatient(p)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600 select-none">
                  {initials(p.fullName)}
                </div>
                <div>
                  <span className="font-medium text-gray-800">{p.fullName}</span>
                  <span className="text-gray-400 ml-2 text-xs">{p.email}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* No patient selected */}
      {!selectedPatient && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-14 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pesquise um paciente</p>
            <p className="text-xs text-gray-400 mt-0.5">Selecione um paciente para ver o histórico de anamneses</p>
          </div>
        </div>
      )}

      {/* Patient selected */}
      {selectedPatient && (
        <div className="space-y-4">

          {/* Patient card */}
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white shadow-sm px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 select-none">
              {initials(selectedPatient.fullName)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{selectedPatient.fullName}</p>
              <p className="text-xs text-gray-400">{selectedPatient.email}</p>
            </div>
          </div>

          {/* Loading / Error */}
          {anamnesisQ.isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Carregando anamneses…
            </div>
          )}
          {anamnesisQ.isError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Erro ao carregar anamneses.
            </div>
          )}

          {/* Empty */}
          {!anamnesisQ.isLoading && entries.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-12 text-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">Nenhuma anamnese preenchida</p>
              <p className="text-xs text-gray-400">Este paciente ainda não tem anamneses registadas</p>
            </div>
          )}

          {/* Anamnesis table */}
          {entries.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Data do agendamento</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Procedimento</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Preenchida em</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map((entry) => (
                    <>
                      <tr key={entry.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-4 text-sm text-gray-800">{formatDate(entry.appointmentDate)}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {entry.procedure ? (PROCEDURE_LABELS[entry.procedure] ?? entry.procedure) : "—"}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">{formatDate(entry.createdAt)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleExpand(entry.id!)}
                              title={expandedId === entry.id ? "Fechar" : "Ver anamnese"}
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors ${
                                expandedId === entry.id
                                  ? "border-gray-300 bg-gray-100 text-gray-700"
                                  : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => startEdit(entry)}
                              title="Editar anamnese"
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors ${
                                editingId === entry.id
                                  ? "border-gray-300 bg-gray-100 text-gray-700"
                                  : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Read-only view */}
                      {expandedId === entry.id && (
                        <tr key={`${entry.id}-view`}>
                          <td colSpan={4} className="px-5 py-5 bg-gray-50/80 border-b border-gray-100">
                            <AnamnesisForm form={entry} readOnly />
                          </td>
                        </tr>
                      )}

                      {/* Edit form */}
                      {editingId === entry.id && (
                        <tr key={`${entry.id}-edit`}>
                          <td colSpan={4} className="px-5 py-5 bg-blue-50/40 border-b border-blue-100">
                            {updateMut.isError && (
                              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Erro ao guardar. Tente novamente.
                              </div>
                            )}
                            <AnamnesisForm form={editForm} onChange={setEditForm} />
                            <div className="flex justify-end gap-2 mt-4">
                              <button
                                onClick={() => setEditingId(null)}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => updateMut.mutate({ appointmentId: entry.appointmentId!, data: editForm })}
                                disabled={updateMut.isPending}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                              >
                                {updateMut.isPending ? (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Salvando…
                                  </>
                                ) : (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Guardar alterações
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
