import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { fetchDoctorAppointments, completeAppointment, postMessage } from "@/lib/api/appointments";
import { Appointment, AppointmentMessage, AppointmentStatus, PROCEDURE_LABELS } from "@/types/appointment";
import StatusBadge from "@/components/StatusBadge";
import Pagination from "@/components/Pagination";

const STATUS_TABS: { value: AppointmentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "APPROVED", label: "Aprovados" },
  { value: "COMPLETED", label: "Concluídos" },
];

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function DoctorAppointments() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [status, setStatus] = useState<AppointmentStatus | "ALL">("ALL");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["doctorAppointments", { page, size, status }],
    queryFn: () => fetchDoctorAppointments({ page, size, status }),
    placeholderData: keepPreviousData,
  });

  const completeMut = useMutation({
    mutationFn: (id: number) => completeAppointment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctorAppointments"] }),
  });

  const messageMut = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) => postMessage(id, content),
    onSuccess: () => {
      setReplyText("");
      qc.invalidateQueries({ queryKey: ["doctorAppointments"] });
    },
  });

  useEffect(() => { setPage(0); }, [status]);

  const rows = useMemo(() => data?.content ?? [], [data]);
  const total = data?.totalElements ?? 0;

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
    setReplyText("");
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Meus Agendamentos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie e acompanhe os atendimentos sob sua responsabilidade
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Atualizar
        </button>
      </div>

      {/* Error banner */}
      {completeMut.isError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Erro ao concluir agendamento. Tente novamente.
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              status === tab.value
                ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Paciente</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Data & Hora</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Especialidade</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">

            {isLoading && (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
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
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-red-500">
                  Erro ao carregar. Tente novamente.
                </td>
              </tr>
            )}

            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nenhum agendamento encontrado</p>
                      <p className="text-xs text-gray-400 mt-0.5">Altere o filtro ou aguarde novos agendamentos</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {rows.map((a: Appointment) => (
              <>
                <tr key={a.id} className="group hover:bg-gray-50/60 transition-colors">

                  {/* Patient */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 select-none">
                        {initials(a.patientName)}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{a.patientName ?? "—"}</span>
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {a.dateTime ? a.dateTime.slice(0, 10).split("-").reverse().join("/") : "—"}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {a.dateTime?.slice(11, 16) ?? "—"}
                      </div>
                    </div>
                  </td>

                  {/* Procedure */}
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {PROCEDURE_LABELS[a.procedure] ?? a.procedure}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={a.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">

                      {/* Messages */}
                      <button
                        onClick={() => toggleExpand(a.id)}
                        title={expandedId === a.id ? "Fechar mensagens" : "Ver mensagens"}
                        className={`relative inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors ${
                          expandedId === a.id
                            ? "border-gray-300 bg-gray-100 text-gray-700"
                            : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {a.messages.length > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-800 text-[9px] font-bold text-white leading-none">
                            {a.messages.length}
                          </span>
                        )}
                      </button>

                      {/* View detail */}
                      <Link
                        to={`/doctor/appointments/${a.id}`}
                        title="Ver detalhes"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>

                      {/* Conclude */}
                      {a.status === "APPROVED" && (
                        <button
                          onClick={() => setConfirmId(a.id)}
                          disabled={completeMut.isPending || !a.anamnesisId}
                          title={!a.anamnesisId ? "Aguardando anamnese do paciente" : "Concluir atendimento"}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Concluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {expandedId === a.id && (
                  <tr key={`${a.id}-messages`}>
                    <td colSpan={5} className="px-5 py-4 bg-gray-50/80 border-b border-gray-100">
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {!isLoading && total > 0
            ? `${total} registro${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`
            : ""}
        </p>
        <Pagination
          page={data?.number ?? 0}
          totalPages={data?.totalPages ?? 1}
          onPage={setPage}
        />
      </div>

      {/* Confirmation modal */}
      {confirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 border border-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-semibold text-gray-800">Concluir atendimento</h2>
              <p className="text-sm text-gray-500">Deseja realmente concluir o atendimento?</p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Não
              </button>
              <button
                onClick={() => {
                  completeMut.mutate(confirmId);
                  setConfirmId(null);
                }}
                disabled={completeMut.isPending}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Sim
              </button>
            </div>
          </div>
        </div>
      )}
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
    <div className="space-y-3 max-w-2xl">
      {messages.length === 0 ? (
        <p className="text-sm text-gray-400">Sem mensagens ainda.</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === "ADMIN" ? "items-start" : "items-end"}`}>
              <div className={`rounded-xl px-3 py-2 text-sm max-w-sm ${m.role === "ADMIN" ? "bg-white border border-gray-200" : "bg-gray-900 text-white"}`}>
                {m.content}
              </div>
              <span className="text-xs text-gray-400 mt-0.5">
                {m.authorName} · {m.createdAt.slice(0, 16).replace("T", " ")}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-1.5">
        <textarea
          value={replyText}
          onChange={(e) => onReplyChange(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Escreva uma mensagem…"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        />
        <div className="flex items-center justify-between">
          <span className={`text-xs ${replyText.length >= 500 ? "text-red-500" : "text-gray-400"}`}>
            {replyText.length}/500
          </span>
          <button
            onClick={onSend}
            disabled={sending || !replyText.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 text-white px-4 py-1.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            {sending ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
