import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllPatients, type UserDTO } from "@/lib/api/users";
import { getPatientAnamneses, adminUpdateAnamnesis } from "@/lib/api/anamnesis";
import { PROCEDURE_LABELS } from "@/types/appointment";
import AnamnesisForm from "@/components/AnamnesisForm";
import type { AnamnesisData } from "@/types/anamnesis";

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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Anamneses</h1>
        <p className="text-sm text-gray-500 mt-1">Histórico de anamneses por paciente.</p>
      </div>

      {/* Patient selector */}
      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Pesquisar paciente…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedPatient(null); }}
          className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        {!selectedPatient && search.length > 0 && filteredPatients.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {filteredPatients.slice(0, 10).map((p) => (
              <li
                key={p.id}
                onClick={() => selectPatient(p)}
                className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
              >
                <span className="font-medium">{p.fullName}</span>
                <span className="text-gray-400 ml-2">{p.email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* No patient selected */}
      {!selectedPatient && (
        <p className="text-sm text-gray-400">Seleccione um paciente para ver o histórico de anamneses.</p>
      )}

      {/* Patient selected */}
      {selectedPatient && (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white shadow-sm px-4 py-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
              {selectedPatient.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{selectedPatient.fullName}</p>
              <p className="text-xs text-gray-400">{selectedPatient.email}</p>
            </div>
          </div>

          {anamnesisQ.isLoading && (
            <p className="text-sm text-gray-500">A carregar…</p>
          )}
          {anamnesisQ.isError && (
            <p className="text-sm text-red-600">Erro ao carregar anamneses.</p>
          )}

          {!anamnesisQ.isLoading && entries.length === 0 && (
            <p className="text-sm text-gray-400">Este paciente ainda não tem anamneses preenchidas.</p>
          )}

          {entries.length > 0 && (
            <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Data do agendamento</th>
                    <th className="px-4 py-3 font-medium">Procedimento</th>
                    <th className="px-4 py-3 font-medium">Preenchida em</th>
                    <th className="px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map((entry) => (
                    <>
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {entry.appointmentDate ? entry.appointmentDate.slice(0, 10) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {entry.procedure ? (PROCEDURE_LABELS[entry.procedure] ?? entry.procedure) : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {entry.createdAt ? entry.createdAt.slice(0, 10) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleExpand(entry.id!)}
                              className={`rounded-lg border px-2 py-1 text-xs hover:bg-gray-50 ${expandedId === entry.id ? "bg-gray-100" : ""}`}
                            >
                              {expandedId === entry.id ? "Fechar" : "Ver"}
                            </button>
                            <button
                              onClick={() => startEdit(entry)}
                              className={`rounded-lg border px-2 py-1 text-xs hover:bg-gray-50 ${editingId === entry.id ? "bg-gray-100" : ""}`}
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Read-only view */}
                      {expandedId === entry.id && (
                        <tr key={`${entry.id}-view`}>
                          <td colSpan={4} className="px-4 py-4 bg-gray-50">
                            <AnamnesisForm form={entry} readOnly />
                          </td>
                        </tr>
                      )}

                      {/* Edit form */}
                      {editingId === entry.id && (
                        <tr key={`${entry.id}-edit`}>
                          <td colSpan={4} className="px-4 py-4 bg-blue-50">
                            {updateMut.isError && (
                              <p className="text-sm text-red-600 mb-3">Erro ao guardar. Tente novamente.</p>
                            )}
                            <AnamnesisForm form={editForm} onChange={setEditForm} />
                            <div className="flex justify-end gap-2 mt-4">
                              <button
                                onClick={() => setEditingId(null)}
                                className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-100"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => updateMut.mutate({ appointmentId: entry.appointmentId!, data: editForm })}
                                disabled={updateMut.isPending}
                                className="rounded-xl bg-gray-900 text-white px-3 py-1.5 text-sm hover:bg-gray-700 disabled:opacity-50"
                              >
                                {updateMut.isPending ? "A guardar…" : "Guardar alterações"}
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
