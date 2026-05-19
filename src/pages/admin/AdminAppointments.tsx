import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  fetchAllAppointments,
  searchAppointments,
  updateAppointmentStatus,
  type SearchParams,
} from "@/lib/api/appointments";
import { Appointment, AppointmentStatus, PROCEDURE_LABELS } from "@/types/appointment";
import StatusBadge from "@/components/StatusBadge";
import Pagination from "@/components/Pagination";
import { useAuth } from "@/store/auth";

export default function AdminAppointments() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [page, setPage] = useState(0);

  const [patientName, setPatientName] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "ALL">("ALL");

  const isFiltered = patientName.trim() !== "" || statusFilter !== "ALL";

  const allQ = useQuery({
    queryKey: ["appointments", "all", page],
    queryFn: () => fetchAllAppointments(page, 15),
    placeholderData: keepPreviousData,
    enabled: !isFiltered,
  });

  const searchQ = useQuery({
    queryKey: ["appointments", "search", patientName, statusFilter],
    queryFn: () => {
      const params: SearchParams = {};
      if (patientName.trim()) params.patientName = patientName.trim();
      if (statusFilter !== "ALL") params.status = statusFilter;
      return searchAppointments(params);
    },
    enabled: isFiltered,
  });

  const rows: Appointment[] = isFiltered
    ? (searchQ.data ?? [])
    : (allQ.data?.content ?? []);

  const isLoading = isFiltered ? searchQ.isLoading : allQ.isLoading;
  const isError = isFiltered ? searchQ.isError : allQ.isError;
  const totalPages = isFiltered ? 1 : (allQ.data?.totalPages ?? 1);

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AppointmentStatus }) =>
      updateAppointmentStatus(id, status, status === "APPROVED" ? user?.id : undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Agendamentos</h1>
        <p className="text-sm text-gray-500 mt-1">Gestão de todos os agendamentos.</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Pesquisar por paciente…"
          value={patientName}
          onChange={(e) => { setPatientName(e.target.value); setPage(0); }}
          className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as AppointmentStatus | "ALL"); setPage(0); }}
          className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="ALL">Todos os estados</option>
          <option value="REQUESTED">Pendentes</option>
          <option value="APPROVED">Aprovados</option>
          <option value="REJECTED">Rejeitados</option>
          <option value="CANCELLED">Cancelados</option>
          <option value="COMPLETED">Concluídos</option>
        </select>
      </div>

      {updateMut.isError && (
        <p className="text-sm text-red-600">Erro ao atualizar estado. Tente novamente.</p>
      )}

      {/* Tabela */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Paciente</th>
              <th className="px-4 py-3 font-medium">Procedimento</th>
              <th className="px-4 py-3 font-medium">Data / Hora</th>
              <th className="px-4 py-3 font-medium">Médico</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">A carregar…</td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-red-600">Erro ao carregar.</td>
              </tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Nenhum agendamento encontrado.</td>
              </tr>
            )}
            {rows.map((a) => {
              const isPending = updateMut.isPending && updateMut.variables?.id === a.id;
              return (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{a.patientName ?? "—"}</td>
                  <td className="px-4 py-3">{PROCEDURE_LABELS[a.procedure] ?? a.procedure}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(a.dateTime)}</td>
                  <td className="px-4 py-3 text-gray-500">{a.doctorName ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3">
                    {a.status === "REQUESTED" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateMut.mutate({ id: a.id, status: "APPROVED" })}
                          disabled={isPending}
                          className="rounded-lg bg-green-50 border border-green-200 text-green-700 px-2 py-1 text-xs hover:bg-green-100 disabled:opacity-50"
                        >
                          {isPending ? "…" : "Aprovar"}
                        </button>
                        <button
                          onClick={() => updateMut.mutate({ id: a.id, status: "REJECTED" })}
                          disabled={isPending}
                          className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-2 py-1 text-xs hover:bg-red-100 disabled:opacity-50"
                        >
                          {isPending ? "…" : "Rejeitar"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!isFiltered && totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      )}
    </div>
  );
}

function formatDateTime(dt: string) {
  if (!dt) return "—";
  const [date, time] = dt.split("T");
  return `${date} ${time?.slice(0, 5)}`;
}
