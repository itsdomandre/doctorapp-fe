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

  function formatDate(iso: string) {
    const [date, time] = iso.split("T");
    const [y, m, d] = date.split("-");
    return `${d}/${m}/${y} ${time?.slice(0, 5) ?? ""}`;
  }

  const selectedPatient = patients.find((p) => p.id === patientId);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Histórico de Paciente</h1>
        <p className="text-gray-500 text-sm mt-1">
          Relatório de atendimentos por paciente com filtro de datas e estado.
        </p>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border bg-white shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Paciente</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="">Selecionar paciente…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">De</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Até</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus | "")}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSearch}
            disabled={!patientId || loading}
            className="rounded-xl bg-gray-900 text-white px-5 py-2 text-sm hover:bg-gray-700 disabled:opacity-40 transition"
          >
            {loading ? "A carregar…" : "Gerar relatório"}
          </button>
        </div>
      </div>

      {/* Resultados */}
      {!hasSearched && (
        <p className="text-sm text-gray-400">Selecione um paciente e clique em "Gerar relatório".</p>
      )}

      {hasSearched && !loading && appointments.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum atendimento encontrado com os filtros aplicados.</p>
      )}

      {hasSearched && appointments.length > 0 && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-800">{selectedPatient?.fullName}</span>
              {" — "}
              {totalElements} {totalElements === 1 ? "atendimento" : "atendimentos"}
            </p>
          </div>

          <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Procedimento</th>
                  <th className="px-4 py-3 font-medium">Data / Hora</th>
                  <th className="px-4 py-3 font-medium">Médico</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {PROCEDURE_LABELS[a.procedure] ?? a.procedure}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(a.dateTime)}</td>
                    <td className="px-4 py-3 text-gray-600">{a.doctorName ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                      {a.notes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination page={page} totalPages={totalPages} onPage={handlePageChange} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
