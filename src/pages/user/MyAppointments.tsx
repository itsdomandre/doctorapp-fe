import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchMyAppointments, cancelAppointment, postMessage } from "@/lib/api/appointments";

import { Appointment, AppointmentMessage, AppointmentStatus, PROCEDURE_LABELS } from "@/types/appointment";
import StatusBadge from "@/components/StatusBadge";
import Pagination from "@/components/Pagination";

export default function MyAppointments() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [status, setStatus] = useState<AppointmentStatus | "ALL">("ALL");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["myAppointments", { page, size, status }],
    queryFn: () => fetchMyAppointments({ page, size, status }),
    placeholderData: keepPreviousData,
  });

  const cancelMut = useMutation({
    mutationFn: (id: number) => cancelAppointment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myAppointments"] }),
  });

  const messageMut = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) => postMessage(id, content),
    onSuccess: () => {
      setReplyText("");
      qc.invalidateQueries({ queryKey: ["myAppointments"] });
    },
  });

  useEffect(() => { setPage(0); }, [status]);

  const rows = useMemo(() => data?.content ?? [], [data]);

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
    setReplyText("");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Meus Agendamentos</h1>
        <Link to="/app/appointments/new" className="rounded-xl border px-3 py-2 hover:bg-gray-50">
          Novo Agendamento
        </Link>
      </div>

      {cancelMut.isError && (
        <p className="text-red-600 text-sm">Erro ao cancelar. Tente novamente.</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AppointmentStatus | "ALL")}
          className="rounded-xl border px-3 py-2"
        >
          <option value="ALL">Todos</option>
          <option value="REQUESTED">Pendentes</option>
          <option value="APPROVED">Aprovados</option>
          <option value="REJECTED">Rejeitados</option>
          <option value="CANCELLED">Cancelados</option>
          <option value="COMPLETED">Concluídos</option>
        </select>
        <button onClick={() => refetch()} className="rounded-xl border px-3 py-2 hover:bg-gray-50">
          Atualizar
        </button>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50 text-left text-sm text-gray-600">
            <tr>
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Hora</th>
              <th className="px-4 py-2">Especialidade</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 w-1">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={5}>Carregando...</td></tr>
            )}
            {isError && (
              <tr><td className="px-4 py-6 text-center text-red-600" colSpan={5}>Erro ao carregar. Tente novamente.</td></tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={5}>Nenhum agendamento encontrado.</td></tr>
            )}
            {rows.map((a: Appointment) => (
              <>
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{a.dateTime ? a.dateTime.slice(0, 10).split("-").reverse().join("/") : ""}</td>
                  <td className="px-4 py-2">{a.dateTime?.slice(11, 16) ?? ""}</td>
                  <td className="px-4 py-2">{PROCEDURE_LABELS[a.procedure] ?? a.procedure}</td>
                  <td className="px-4 py-2"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-2 text-right whitespace-nowrap flex gap-2 justify-end">
                    <button
                      onClick={() => toggleExpand(a.id)}
                      className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50 flex items-center gap-1"
                    >
                      💬 {a.messages.length > 0 && <span className="text-xs text-gray-500">{a.messages.length}</span>}
                    </button>
                    {a.status === "APPROVED" && (
                      <Link
                        to={`/app/appointments/${a.id}/anamnesis`}
                        className={`rounded-lg border px-2 py-1 text-sm hover:bg-gray-50 ${
                          !a.anamnesisId ? "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100" : ""
                        }`}
                      >
                        {a.anamnesisId ? "Ver Anamnese" : "Preencher Anamnese"}
                      </Link>
                    )}
                    {(a.status === "REQUESTED" || a.status === "APPROVED") && (
                      <button
                        onClick={() => cancelMut.mutate(a.id)}
                        className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
                {expandedId === a.id && (
                  <tr key={`${a.id}-messages`}>
                    <td colSpan={5} className="px-4 py-3 bg-gray-50">
                      <MessageThread
                        messages={a.messages}
                        replyText={replyText}
                        onReplyChange={setReplyText}
                        onSend={() => messageMut.mutate({ id: a.id, content: replyText })}
                        sending={messageMut.isPending}
                      />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

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

function MessageThread({
  messages,
  replyText,
  onReplyChange,
  onSend,
  sending,
}: {
  messages: AppointmentMessage[];
  replyText: string;
  onReplyChange: (v: string) => void;
  onSend: () => void;
  sending: boolean;
}) {
  return (
    <div className="space-y-3">
      {messages.length === 0 ? (
        <p className="text-sm text-gray-400">Sem mensagens ainda.</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === "ADMIN" ? "items-start" : "items-end"}`}>
              <div className={`rounded-xl px-3 py-2 text-sm max-w-sm ${m.role === "ADMIN" ? "bg-white border" : "bg-gray-900 text-white"}`}>
                {m.content}
              </div>
              <span className="text-xs text-gray-400 mt-0.5">
                {m.authorName} · {m.createdAt.slice(0, 16).replace("T", " ")}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-1">
        <textarea
          value={replyText}
          onChange={(e) => onReplyChange(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Escreva uma mensagem…"
          className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <div className="flex items-center justify-between">
          <span className={`text-xs ${replyText.length >= 500 ? "text-red-500" : "text-gray-400"}`}>
            {replyText.length}/500
          </span>
          <button
            onClick={onSend}
            disabled={sending || !replyText.trim()}
            className="rounded-xl bg-gray-900 text-white px-3 py-1.5 text-sm hover:bg-gray-700 disabled:opacity-50"
          >
            {sending ? "…" : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
