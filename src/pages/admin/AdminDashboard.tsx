import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchPendingAppointments, fetchTodayAppointments, fetchAllAppointments } from "@/lib/api/appointments";
import { Appointment, PROCEDURE_LABELS } from "@/types/appointment";
import StatusBadge from "@/components/StatusBadge";
import AppointmentSlidePanel from "@/components/AppointmentSlidePanel";

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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Painel Administrativo</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral do sistema.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Pendentes"
          value={pendingQ.isLoading ? "…" : pendingCount}
          color="yellow"
          to="/admin/appointments"
        />
        <StatCard
          label="Hoje"
          value={todayQ.isLoading ? "…" : todayCount}
          color="blue"
          to="/admin/appointments"
        />
        <StatCard
          label="Total"
          value={allQ.isLoading ? "…" : totalCount}
          color="gray"
          to="/admin/appointments"
        />
      </div>

      {/* Pending appointments table */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-sm font-semibold">Agendamentos pendentes</h2>
          <Link to="/admin/appointments" className="text-xs text-gray-500 hover:underline">
            Ver todos
          </Link>
        </div>

        {pendingQ.isLoading ? (
          <p className="px-4 py-6 text-sm text-gray-500">A carregar…</p>
        ) : pendingCount === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">Nenhum agendamento pendente.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Paciente</th>
                <th className="px-4 py-2 font-medium">Procedimento</th>
                <th className="px-4 py-2 font-medium">Data / Hora</th>
                <th className="px-4 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingQ.data!.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelectedAppointment(a)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-2">{a.patientName ?? "—"}</td>
                  <td className="px-4 py-2">{PROCEDURE_LABELS[a.procedure] ?? a.procedure}</td>
                  <td className="px-4 py-2">{formatDateTime(a.dateTime)}</td>
                  <td className="px-4 py-2"><StatusBadge status={a.status} /></td>
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
  color,
  to,
}: {
  label: string;
  value: number | string;
  color: "yellow" | "blue" | "gray";
  to: string;
}) {
  const accent: Record<string, string> = {
    yellow: "text-yellow-600",
    blue: "text-blue-600",
    gray: "text-gray-700",
  };
  return (
    <Link
      to={to}
      className="rounded-2xl border bg-white shadow-sm p-5 flex flex-col gap-1 hover:bg-gray-50 transition"
    >
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className={`text-3xl font-bold ${accent[color]}`}>{value}</span>
    </Link>
  );
}

function formatDateTime(dt: string) {
  if (!dt) return "—";
  const [date, time] = dt.split("T");
  return `${date} ${time?.slice(0, 5)}`;
}
