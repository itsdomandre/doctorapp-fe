import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchMyAppointments } from "@/lib/api/appointments";
import { Appointment, PROCEDURE_LABELS } from "@/types/appointment";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/store/auth";

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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Olá, {firstName}!</h1>
        <p className="text-sm text-gray-500 mt-1">Aqui tens um resumo dos teus agendamentos.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Pendentes" value={isLoading ? "…" : count("REQUESTED")} color="yellow" />
        <StatCard label="Aprovados" value={isLoading ? "…" : count("APPROVED")} color="green" />
        <StatCard label="Concluídos" value={isLoading ? "…" : count("COMPLETED")} color="blue" />
      </div>

      {/* Recent appointments */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-sm font-semibold">Agendamentos recentes</h2>
          <Link to="/app/appointments" className="text-xs text-gray-500 hover:underline">
            Ver todos
          </Link>
        </div>

        {isLoading ? (
          <p className="px-4 py-6 text-sm text-gray-500">A carregar…</p>
        ) : recent.length === 0 ? (
          <div className="px-4 py-8 text-center space-y-3">
            <p className="text-sm text-gray-500">Ainda não tens agendamentos.</p>
            <Link
              to="/app/appointments/new"
              className="inline-block rounded-xl bg-gray-900 text-white px-4 py-2 text-sm hover:bg-gray-700"
            >
              Fazer primeiro agendamento
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Procedimento</th>
                <th className="px-4 py-2 font-medium">Data / Hora</th>
                <th className="px-4 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recent.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{PROCEDURE_LABELS[a.procedure] ?? a.procedure}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{formatDateTime(a.dateTime)}</td>
                  <td className="px-4 py-2"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Link
        to="/app/appointments/new"
        className="inline-block rounded-xl bg-gray-900 text-white px-5 py-2 text-sm hover:bg-gray-700"
      >
        + Novo agendamento
      </Link>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: "yellow" | "green" | "blue";
}) {
  const accent: Record<string, string> = {
    yellow: "text-yellow-600",
    green: "text-green-600",
    blue: "text-blue-600",
  };
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-5 flex flex-col gap-1">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className={`text-3xl font-bold ${accent[color]}`}>{value}</span>
    </div>
  );
}

function formatDateTime(dt: string) {
  if (!dt) return "—";
  const [date, time] = dt.split("T");
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year} ${time?.slice(0, 5)}`;
}
