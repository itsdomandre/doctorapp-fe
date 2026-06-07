import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchPendingAppointments, fetchTodayAppointments, fetchAllAppointments } from "@/lib/api/appointments";
import { Appointment, PROCEDURE_LABELS } from "@/types/appointment";
import StatusBadge from "@/components/StatusBadge";
import AppointmentSlidePanel from "@/components/AppointmentSlidePanel";

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

export default function AdminDashboard() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [pendingQ, todayQ, allQ] = useQueries({
    queries: [
      { queryKey: ["appointments", "pending"], queryFn: fetchPendingAppointments },
      { queryKey: ["appointments", "today"], queryFn: () => fetchTodayAppointments(0, 5) },
      { queryKey: ["appointments", "all"], queryFn: () => fetchAllAppointments(0, 1) },
    ],
  });

  const pendingCount = pendingQ.data?.length ?? 0;
  const todayCount = todayQ.data?.totalElements ?? 0;
  const totalCount = allQ.data?.totalElements ?? 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Painel Administrativo</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral e métricas do sistema.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Pendentes"
          value={pendingQ.isLoading ? "…" : pendingCount}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          valueClass="text-yellow-600"
          to="/admin/appointments"
        />
        <StatCard
          label="Hoje"
          value={todayQ.isLoading ? "…" : todayCount}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          valueClass="text-blue-600"
          to="/admin/appointments"
        />
        <StatCard
          label="Total"
          value={allQ.isLoading ? "…" : totalCount}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          valueClass="text-gray-700"
          to="/admin/appointments"
        />
      </div>

      {/* Pending appointments */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Agendamentos Pendentes</h2>
          <Link
            to="/admin/appointments"
            className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Ver todos →
          </Link>
        </div>

        {pendingQ.isLoading ? (
          <div className="flex items-center gap-2 px-5 py-8 text-sm text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Carregando…
          </div>
        ) : pendingCount === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center text-gray-400">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">Nenhum agendamento pendente</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Paciente</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Procedimento</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Data & Hora</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingQ.data!.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelectedAppointment(a)}
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
                  <td className="px-5 py-4 text-sm text-gray-600">{formatDateTime(a.dateTime)}</td>
                  <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AppointmentSlidePanel
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onAppointmentUpdate={setSelectedAppointment}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  valueClass,
  to,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  valueClass: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 flex flex-col gap-3 hover:bg-gray-50/60 transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 border border-gray-100">
          {icon}
        </div>
      </div>
      <span className={`text-3xl font-bold tracking-tight ${valueClass}`}>{value}</span>
    </Link>
  );
}
