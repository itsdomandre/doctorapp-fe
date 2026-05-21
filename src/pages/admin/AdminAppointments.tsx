import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { startOfWeek, format, addDays } from "date-fns";
import {
  fetchAllAppointments,
  fetchPendingAppointments,
  searchAppointments,
  type SearchParams,
} from "@/lib/api/appointments";
import { Appointment, AppointmentStatus, PROCEDURE_LABELS } from "@/types/appointment";
import StatusBadge from "@/components/StatusBadge";
import Pagination from "@/components/Pagination";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import AppointmentSlidePanel from "@/components/AppointmentSlidePanel";

type View = "calendar" | "list";

export default function AdminAppointments() {
  const [view, setView] = useState<View>("calendar");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Week range for the calendar view
  const weekFromStr = format(weekStart, "yyyy-MM-dd");
  const weekToStr = format(addDays(weekStart, 6), "yyyy-MM-dd");

  const weekQ = useQuery({
    queryKey: ["appointments", "week", weekFromStr],
    queryFn: () => searchAppointments({ fromDate: weekFromStr, toDate: weekToStr }),
    staleTime: 30_000,
    retry: false,
  });

  const pendingQ = useQuery({
    queryKey: ["appointments", "pending"],
    queryFn: fetchPendingAppointments,
    staleTime: 30_000,
    retry: false,
  });

  return (
    <div className="p-6 space-y-4">
      {/* View toggle */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setView("calendar")}
          className={[
            "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
            view === "calendar" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700",
          ].join(" ")}
        >
          Calendário
        </button>
        <button
          onClick={() => setView("list")}
          className={[
            "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
            view === "list" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700",
          ].join(" ")}
        >
          Lista
        </button>
      </div>

      {view === "calendar" ? (
        <WeeklyCalendar
          appointments={weekQ.data ?? []}
          weekStart={weekStart}
          onWeekChange={setWeekStart}
          onAppointmentClick={setSelectedAppointment}
          pendingCount={pendingQ.data?.length}
          isLoading={weekQ.isLoading}
        />
      ) : (
        <AppointmentsListView onAppointmentClick={setSelectedAppointment} />
      )}

      <AppointmentSlidePanel
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onAppointmentUpdate={setSelectedAppointment}
      />
    </div>
  );
}

// ─── List view (table) ──────────────────────────────────────────────────────

function AppointmentsListView({
  onAppointmentClick,
}: {
  onAppointmentClick: (a: Appointment) => void;
}) {
  const qc = useQueryClient();
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Agendamentos</h1>
        <div className="flex gap-2 flex-wrap">
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
      </div>

      <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Paciente</th>
              <th className="px-4 py-3 font-medium">Procedimento</th>
              <th className="px-4 py-3 font-medium">Data / Hora</th>
              <th className="px-4 py-3 font-medium">Médico</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Mensagens</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  A carregar…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-red-600">
                  Erro ao carregar.
                </td>
              </tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Nenhum agendamento encontrado.
                </td>
              </tr>
            )}
            {rows.map((a) => (
              <tr
                key={a.id}
                onClick={() => onAppointmentClick(a)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-3 font-medium">{a.patientName ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">
                  {PROCEDURE_LABELS[a.procedure] ?? a.procedure}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                  {formatDateTime(a.dateTime)}
                </td>
                <td className="px-4 py-3 text-gray-500">{a.doctorName ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3">
                  {a.messages.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                      💬 {a.messages.length}
                    </span>
                  )}
                </td>
              </tr>
            ))}
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
