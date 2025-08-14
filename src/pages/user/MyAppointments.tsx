import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyAppointments, cancelAppointment } from "@/lib/api/appointments";
import { Appointment } from "@/types/appointment";
import StatusBadge from "@/components/StatusBadge";
import Pagination from "@/components/Pagination";

export default function MyAppointments() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [status, setStatus] = useState<string>("ALL");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["myAppointments", { page, size, status }],
    queryFn: () => fetchMyAppointments({ page, size, status }),
    keepPreviousData: true,
  });

  // cancelar (opcional)
  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelAppointment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myAppointments"] });
    },
  });

  useEffect(() => {
    // sempre que mudar status, volta página 0
    setPage(0);
  }, [status]);

  const rows = useMemo(() => data?.content ?? [], [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Meus Appointments</h1>
        <a
          href="/app/appointments/new"
          className="rounded-xl border px-3 py-2 hover:bg-gray-50"
        >
          Novo Appointment
        </a>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border px-3 py-2"
        >
          <option value="ALL">Todos</option>
          <option value="PENDING">Pendentes</option>
          <option value="APPROVED">Aprovados</option>
          <option value="REJECTED">Rejeitados</option>
          <option value="CANCELLED">Cancelados</option>
        </select>
        <button
          onClick={() => refetch()}
          className="rounded-xl border px-3 py-2 hover:bg-gray-50"
        >
          Atualizar
        </button>
      </div>

      {/* Tabela */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50 text-left text-sm text-gray-600">
            <tr>
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Hora</th>
              <th className="px-4 py-2">Especialidade</th>
              <th className="px-4 py-2">Motivo</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 w-1">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                  Carregando...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td className="px-4 py-6 text-center text-red-600" colSpan={6}>
                  Erro ao carregar. Tente novamente.
                </td>
              </tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                  Nenhum appointment encontrado.
                </td>
              </tr>
            )}
            {rows.map((a: Appointment) => {
              const date = a.date || a.datetime?.slice(0, 10) || "";
              const time = a.time || a.datetime?.slice(11, 16) || "";
              return (
                <tr key={a.id}>
                  <td className="px-4 py-2">{date}</td>
                  <td className="px-4 py-2">{time}</td>
                  <td className="px-4 py-2">{a.specialty ?? "-"}</td>
                  <td className="px-4 py-2">{a.reason ?? "-"}</td>
                  <td className="px-4 py-2"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-2 text-right">
                    {(a.status === "PENDING" || a.status === "APPROVED") && (
                      <button
                        onClick={() => cancelMut.mutate(a.id)}
                        className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-end">
        <Pagination
          page={data?.number ?? 0}
          totalPages={data?.totalPages ?? 1}
          onPage={setPage}
        />
      </div>
    </div>
  );
}
