import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  fetchAllAppointments,
  searchAppointments,
  updateAppointmentStatus,
  postMessage,
  type SearchParams,
} from "@/lib/api/appointments";
import { Appointment, AppointmentMessage, AppointmentStatus, PROCEDURE_LABELS } from "@/types/appointment";
import StatusBadge from "@/components/StatusBadge";
import Pagination from "@/components/Pagination";
import { useAuth } from "@/store/auth";

type PendingAction = { id: number; status: "APPROVED" | "REJECTED"; note: string };

export default function AdminAppointments() {
  const qc = useQueryClient();
  const { user } = useAuth();
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

  // pending action: show confirm panel for approve/reject
  const [pending, setPending] = useState<PendingAction | null>(null);
  // expanded messages thread per row
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AppointmentStatus }) =>
      updateAppointmentStatus(id, status, status === "APPROVED" ? user?.id : undefined),
    onSuccess: async (_, vars) => {
      if (pending?.note.trim()) {
        await postMessage(vars.id, pending.note.trim());
      }
      setPending(null);
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const messageMut = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) => postMessage(id, content),
    onSuccess: () => {
      setReplyText("");
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  function startAction(id: number, status: "APPROVED" | "REJECTED") {
    setPending({ id, status, note: "" });
    setExpandedId(null);
  }

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
    setPending(null);
    setReplyText("");
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Agendamentos</h1>
        <p className="text-sm text-gray-500 mt-1">Gestão de todos os agendamentos.</p>
      </div>

      <div className="flex flex-wrap gap-3">
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

      {updateMut.isError && (
        <p className="text-sm text-red-600">Erro ao atualizar estado. Tente novamente.</p>
      )}

      <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Paciente</th>
              <th className="px-4 py-3 font-medium">Procedimento</th>
              <th className="px-4 py-3 font-medium">Data / Hora</th>
              <th className="px-4 py-3 font-medium">Médico</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">A carregar…</td></tr>
            )}
            {isError && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-red-600">Erro ao carregar.</td></tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Nenhum agendamento encontrado.</td></tr>
            )}
            {rows.map((a) => (
              <>
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{a.patientName ?? "—"}</td>
                  <td className="px-4 py-3">{PROCEDURE_LABELS[a.procedure] ?? a.procedure}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(a.dateTime)}</td>
                  <td className="px-4 py-3 text-gray-500">{a.doctorName ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => toggleExpand(a.id)}
                        className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50 flex items-center gap-1"
                      >
                        💬 {a.messages.length > 0 && <span className="text-gray-500">{a.messages.length}</span>}
                      </button>
                      {a.status === "REQUESTED" && (
                        <>
                          <button
                            onClick={() => startAction(a.id, "APPROVED")}
                            className="rounded-lg bg-green-50 border border-green-200 text-green-700 px-2 py-1 text-xs hover:bg-green-100"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => startAction(a.id, "REJECTED")}
                            className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-2 py-1 text-xs hover:bg-red-100"
                          >
                            Rejeitar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Approval / rejection confirm panel */}
                {pending?.id === a.id && (
                  <tr key={`${a.id}-action`}>
                    <td colSpan={6} className="px-4 py-3 bg-green-50 border-b border-green-100">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          {pending.status === "APPROVED" ? "Confirmar aprovação" : "Confirmar rejeição"} — mensagem opcional:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pending.note}
                            onChange={(e) => setPending({ ...pending, note: e.target.value })}
                            placeholder="Adicionar mensagem para o paciente (opcional)…"
                            className="flex-1 rounded-xl border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                          />
                          <button
                            onClick={() => updateMut.mutate({ id: a.id, status: pending.status })}
                            disabled={updateMut.isPending}
                            className={`rounded-xl px-3 py-1.5 text-sm text-white disabled:opacity-50 ${pending.status === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                          >
                            {updateMut.isPending ? "…" : "Confirmar"}
                          </button>
                          <button
                            onClick={() => setPending(null)}
                            className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-100"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Messages thread */}
                {expandedId === a.id && (
                  <tr key={`${a.id}-messages`}>
                    <td colSpan={6} className="px-4 py-3 bg-gray-50">
                      <AdminMessageThread
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

      {!isFiltered && totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      )}
    </div>
  );
}

function AdminMessageThread({
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
            <div key={m.id} className={`flex flex-col ${m.role === "ADMIN" ? "items-end" : "items-start"}`}>
              <div className={`rounded-xl px-3 py-2 text-sm max-w-sm ${m.role === "ADMIN" ? "bg-gray-900 text-white" : "bg-white border"}`}>
                {m.content}
              </div>
              <span className="text-xs text-gray-400 mt-0.5">
                {m.authorName} · {m.createdAt.slice(0, 16).replace("T", " ")}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={replyText}
          onChange={(e) => onReplyChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !sending && replyText.trim() && onSend()}
          placeholder="Escrever mensagem para o paciente…"
          className="flex-1 rounded-xl border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <button
          onClick={onSend}
          disabled={sending || !replyText.trim()}
          className="rounded-xl bg-gray-900 text-white px-3 py-1.5 text-sm hover:bg-gray-700 disabled:opacity-50"
        >
          {sending ? "…" : "Enviar"}
        </button>
      </div>
    </div>
  );
}

function formatDateTime(dt: string) {
  if (!dt) return "—";
  const [date, time] = dt.split("T");
  return `${date} ${time?.slice(0, 5)}`;
}
