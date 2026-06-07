import { useEffect, useState } from "react";
import { fetchAllPatients, type UserDTO } from "@/lib/api/users";
import { fetchPatientHistory } from "@/lib/api/appointments";
import { type Appointment, type AppointmentStatus, PROCEDURE_LABELS } from "@/types/appointment";
import Pagination from "@/components/Pagination";
import StatusBadge from "@/components/StatusBadge";

const STATUS_OPTIONS: { value: AppointmentStatus | ""; label: string }[] = [
  { value: "", label: "Todos os estados" },
  { value: "REQUESTED", label: "Pendente" },
  { value: "APPROVED", label: "Aprovado" },
  { value: "REJECTED", label: "Rejeitado" },
  { value: "CANCELLED", label: "Cancelado" },
  { value: "COMPLETED", label: "Concluído" },
];

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(iso: string) {
  const [date, time] = iso.split("T");
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y} ${time?.slice(0, 5) ?? ""}`;
}

export default function AdminPatientHistory() {
  const [patients, setPatients] = useState<UserDTO[]>([]);

  const [patientId, setPatientId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<AppointmentStatus | "">("");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchAllPatients(0, 200).then((d) => setPatients(d.content));
  }, []);

  function load(p: number) {
    if (!patientId) return;
    setLoading(true);
    fetchPatientHistory({
      patientId,
      from: from || undefined,
      to: to || undefined,
      status: status || undefined,
      page: p,
      size: 10,
    })
      .then((d) => {
        setAppointments(d.content);
        setTotalPages(d.totalPages);
        setTotalElements(d.totalElements);
      })
      .finally(() => setLoading(false));
  }

  function handleSearch() {
    setPage(0);
    setHasSearched(true);
    load(0);
  }

  function handlePageChange(p: number) {
    setPage(p);
    load(p);
  }

  const selectedPatient = patients.find((p) => p.id === patientId);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Histórico de Paciente</h1>
        <p className="text-sm text-gray-500 mt-1">
          Relatório de atendimentos por paciente com filtro de datas e estado.
        </p>
      </div>

      {/* Filter card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Filtros</h2>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Paciente</label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              >
                <option value="">Selecionar paciente…</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">De</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Até</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus | "")}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSearch}
              disabled={!patientId || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              {loading ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Gerando…
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Gerar relatório
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Placeholder */}
      {!hasSearched && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-14 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Aguardando seleção</p>
            <p className="text-xs text-gray-400 mt-0.5">Selecione um paciente e clique em "Gerar relatório"</p>
          </div>
        </div>
      )}

      {/* No results */}
      {hasSearched && !loading && appointments.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white py-14 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Nenhum atendimento encontrado</p>
            <p className="text-xs text-gray-400 mt-0.5">Tente ajustar os filtros e gerar novamente</p>
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && appointments.length > 0 && (
        <div className="space-y-4">

          {/* Result meta */}
          <div className="flex items-center gap-3">
            {selectedPatient && (
              <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-sm">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600 select-none">
                  {initials(selectedPatient.fullName)}
                </div>
                <span className="text-sm font-medium text-gray-800">{selectedPatient.fullName}</span>
              </div>
            )}
            <span className="text-sm text-gray-400">
              {totalElements} {totalElements === 1 ? "atendimento" : "atendimentos"}
            </span>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Procedimento</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Data & Hora</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Médico</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-800">
                      {PROCEDURE_LABELS[a.procedure] ?? a.procedure}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(a.dateTime)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{a.doctorName ?? "—"}</td>
                    <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                    <td className="px-5 py-4 text-sm text-gray-500 max-w-xs truncate">{(a as any).notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-end">
              <Pagination page={page} totalPages={totalPages} onPage={handlePageChange} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
