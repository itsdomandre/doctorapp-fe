import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchMyAppointments } from "@/lib/api/appointments";
import { Appointment, PROCEDURE_LABELS } from "@/types/appointment";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/store/auth";

function formatDateTime(dt: string) {
  if (!dt) return "—";
  const [date, time] = dt.split("T");
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year} ${time?.slice(0, 5)}`;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(" ")[0] ?? "Utilizador";

  const { data, isLoading } = useQuery({
    queryKey: ["myAppointments", "dashboard"],
    queryFn: () => fetchMyAppointments({ size: 50 }),
  });

  const all: Appointment[] = data?.content ?? [];
  const count = (status: Appointment["status"]) => all.filter((a) => a.status === status).length;

  const recent = [...all]
    .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
    .slice(0, 5);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Olá, {firstName}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">Aqui está o resumo dos seus agendamentos.</p>
        </div>
        <Link
          to="/app/appointments/new"
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Novo agendamento
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Pendentes"
          value={isLoading ? "…" : count("REQUESTED")}
          valueClass="text-yellow-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Aprovados"
          value={isLoading ? "…" : count("APPROVED")}
          valueClass="text-green-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Concluídos"
          value={isLoading ? "…" : count("COMPLETED")}
          valueClass="text-blue-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          }
        />
      </div>

      {/* Recent appointments */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Agendamentos Recentes</h2>
          <Link
            to="/app/appointments"
            className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Ver todos →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 px-5 py-8 text-sm text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Carregando…
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-5 py-14 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Ainda não tem agendamentos</p>
              <p className="text-xs text-gray-400">Faça o seu primeiro agendamento agora</p>
            </div>
            <Link
              to="/app/appointments/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Fazer primeiro agendamento
            </Link>
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Procedimento</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Data & Hora</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recent.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-gray-800">
                    {PROCEDURE_LABELS[a.procedure] ?? a.procedure}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {formatDateTime(a.dateTime)}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClass,
  icon,
}: {
  label: string;
  value: number | string;
  valueClass: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 border border-gray-100">
          {icon}
        </div>
      </div>
      <span className={`text-3xl font-bold tracking-tight ${valueClass}`}>{value}</span>
    </div>
  );
}
