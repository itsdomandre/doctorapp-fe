import { useState, useMemo } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
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

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDateTime(dt: string) {
  if (!dt) return "—";
  const [date, time] = dt.split("T");
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year} ${time?.slice(0, 5)}`;
}

export default function AdminAppointments() {
  const [view, setView] = useState<View>("calendar");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

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

  const calendarAppointments = useMemo(() => {
    const weekAppts = weekQ.data ?? [];
    const pending = pendingQ.data ?? [];
    const weekApptIds = new Set(weekAppts.map((a) => a.id));
    const pendingInWeek = pending.filter((a) => {
      if (weekApptIds.has(a.id)) return false;
      const apptDate = a.dateTime.slice(0, 10);
      return apptDate >= weekFromStr && apptDate <= weekToStr;
    });
    return [...weekAppts, ...pendingInWeek];
  }, [weekQ.data, pendingQ.data, weekFromStr, weekToStr]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Agendamentos</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie todos os agendamentos do sistema</p>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit">
        <button
          onClick={() => setView("calendar")}
          className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
            view === "calendar"
              ? "bg-white text-gray-900 shadow-sm border border-gray-200"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Calendário
        </button>
        <button
          onClick={() => setView("list")}
          className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
            view === "list"
              ? "bg-white text-gray-900 shadow-sm border border-gray-200"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Lista
        </button>
      </div>

      {view === "calendar" ? (
        <WeeklyCalendar
          appointments={calendarAppointments}
          weekStart={weekStart}
          onWeekChange={setWeekStart}
          onAppointmentClick={setSelectedAppointment}
          pendingCount={pendingQ.data?.length}
          isLoading={weekQ.isLoading && pendingQ.isLoading}
        />
      ) : (
        <AppointmentsListView
          onAppointmentClick={setSelectedAppointment}
          initials={initials}
          formatDateTime={formatDateTime}
        />
      )}

      <AppointmentSlidePanel
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onAppointmentUpdate={setSelectedAppointment}
      />
    </div>
  );
}

function AppointmentsListView({
  onAppointmentClick,
  initials,
  formatDateTime,
}: {
  onAppointmentClick: (a: Appointment) => void;
  initials: (name?: string | null) => string;
  formatDateTime: (dt: string) => string;
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

  const rows: Appointment[] = isFiltered ? (searchQ.data ?? []) : (allQ.data?.content ?? []);
  const isLoading = isFiltered ? searchQ.isLoading : allQ.isLoading;
  const isError = isFiltered ? searchQ.isError : allQ.isError;
  const totalPages = isFiltered ? 1 : (allQ.data?.totalPages ?? 1);
  const total = isFiltered ? rows.length : (allQ.data?.totalElements ?? 0);

  return (
    <div className="space-y-4">

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Pesquisar por paciente…"
            value={patientName}
            onChange={(e) => { setPatientName(e.target.value); setPage(0); }}
            className="rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as AppointmentStatus | "ALL"); setPage(0); }}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        >
          <option value="ALL">Todos os estados</option>
          <option value="REQUESTED">Pendentes</option>
          <option value="APPROVED">Aprovados</option>
          <option value="REJECTED">Rejeitados</option>
          <option value="CANCELLED">Cancelados</option>
          <option value="COMPLETED">Concluídos</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Paciente</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Procedimento</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Data & Hora</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Médico</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Msgs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm">Carregando agendamentos…</span>
                  </div>
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-red-500">
                  Erro ao carregar. Tente novamente.
                </td>
              </tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nenhum agendamento encontrado</p>
                      <p className="text-xs text-gray-400 mt-0.5">Tente ajustar os filtros</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {rows.map((a) => (
              <tr
                key={a.id}
                onClick={() => onAppointmentClick(a)}
                className="hover:bg-gray-50/60 cursor-pointer transition-colors"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600 select-none">
                      {initials(a.patientName)}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{a.patientName ?? "—"}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{PROCEDURE_LABELS[a.procedure] ?? a.procedure}</td>
                <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDateTime(a.dateTime)}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{a.doctorName ?? "—"}</td>
                <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                <td className="px-5 py-4">
                  {a.messages.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {a.messages.length}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {!isLoading && total > 0
            ? `${total} registro${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`
            : ""}
        </p>
        {!isFiltered && totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        )}
      </div>
    </div>
  );
}
