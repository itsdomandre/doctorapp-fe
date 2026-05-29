import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, PROCEDURE_LABELS } from "@/types/appointment";
import { updateAppointmentStatus, postMessage } from "@/lib/api/appointments";
import { fetchAllDoctors } from "@/lib/api/users";
import StatusBadge from "@/components/StatusBadge";

type Props = {
  appointment: Appointment | null;
  onClose: () => void;
  onAppointmentUpdate: (a: Appointment) => void;
};

export default function AppointmentSlidePanel({
  appointment,
  onClose,
  onAppointmentUpdate,
}: Props) {
  const qc = useQueryClient();

  const [pendingStatus, setPendingStatus] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [replyText, setReplyText] = useState("");

  const { data: doctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => fetchAllDoctors(),
    enabled: pendingStatus === "APPROVED",
    staleTime: 60_000,
  });

  const updateMut = useMutation({
    mutationFn: ({ status }: { status: "APPROVED" | "REJECTED"; note: string }) =>
      updateAppointmentStatus(
        appointment!.id,
        status,
        status === "APPROVED" ? selectedDoctorId : undefined
      ),
    onSuccess: async (_, vars) => {
      if (vars.note.trim()) {
        await postMessage(appointment!.id, vars.note.trim());
      }
      setPendingStatus(null);
      setSelectedDoctorId("");
      setActionNote("");
      qc.invalidateQueries({ queryKey: ["appointments"] });
      onClose();
    },
  });

  const messageMut = useMutation({
    mutationFn: (content: string) => postMessage(appointment!.id, content),
    onSuccess: (newMessage) => {
      setReplyText("");
      if (appointment) {
        onAppointmentUpdate({
          ...appointment,
          messages: [...appointment.messages, newMessage],
        });
      }
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  if (!appointment) return null;

  const dt = parseISO(appointment.dateTime);
  const initials = appointment.patientName
    ? appointment.patientName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[380px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-800">Detalhes do agendamento</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Patient */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{appointment.patientName ?? "—"}</p>
              {appointment.doctorName && (
                <p className="text-xs text-gray-500">Dr. {appointment.doctorName}</p>
              )}
            </div>
          </div>

          {/* Info table */}
          <div className="rounded-xl border divide-y text-sm">
            <div className="flex justify-between items-center px-3 py-2.5">
              <span className="text-gray-500">Procedimento</span>
              <span className="font-medium text-right max-w-[200px]">
                {PROCEDURE_LABELS[appointment.procedure] ?? appointment.procedure}
              </span>
            </div>
            <div className="flex justify-between items-center px-3 py-2.5">
              <span className="text-gray-500">Data</span>
              <span className="font-medium capitalize">
                {format(dt, "d 'de' MMMM yyyy", { locale: ptBR })}
              </span>
            </div>
            <div className="flex justify-between items-center px-3 py-2.5">
              <span className="text-gray-500">Horário</span>
              <span className="font-medium">{format(dt, "HH:mm")}</span>
            </div>
            <div className="flex justify-between items-center px-3 py-2.5">
              <span className="text-gray-500">Estado</span>
              <StatusBadge status={appointment.status} />
            </div>
          </div>

          {/* Patient notes */}
          {appointment.notes && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Notas
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2">
                {appointment.notes}
              </p>
            </div>
          )}

          {/* Approve / Reject */}
          {appointment.status === "REQUESTED" && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ação</p>

              {!pendingStatus ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setPendingStatus("APPROVED")}
                    className="flex-1 rounded-xl bg-green-600 text-white py-2 text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => setPendingStatus("REJECTED")}
                    className="flex-1 rounded-xl bg-white border border-red-200 text-red-600 py-2 text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    Rejeitar
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border p-3 space-y-2 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700">
                    {pendingStatus === "APPROVED" ? "Confirmar aprovação" : "Confirmar rejeição"}
                  </p>

                  {pendingStatus === "APPROVED" && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Profissional <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                      >
                        <option value="">Selecionar profissional…</option>
                        {doctors?.content.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    maxLength={500}
                    rows={2}
                    placeholder="Mensagem para o paciente (opcional)…"
                    className="w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                  {updateMut.isError && (
                    <p className="text-xs text-red-600">Erro ao atualizar. Tente novamente.</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateMut.mutate({ status: pendingStatus, note: actionNote })}
                      disabled={
                        updateMut.isPending ||
                        (pendingStatus === "APPROVED" && !selectedDoctorId)
                      }
                      className={[
                        "flex-1 rounded-xl py-2 text-sm font-medium text-white disabled:opacity-50 transition-colors",
                        pendingStatus === "APPROVED"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700",
                      ].join(" ")}
                    >
                      {updateMut.isPending ? "…" : "Confirmar"}
                    </button>
                    <button
                      onClick={() => {
                        setPendingStatus(null);
                        setSelectedDoctorId("");
                        setActionNote("");
                      }}
                      className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message thread */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mensagens</p>

            {appointment.messages.length === 0 ? (
              <p className="text-sm text-gray-400">Sem mensagens ainda.</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {appointment.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.role === "ADMIN" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={[
                        "rounded-xl px-3 py-2 text-sm max-w-[260px]",
                        m.role === "ADMIN"
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-800",
                      ].join(" ")}
                    >
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
                onChange={(e) => setReplyText(e.target.value)}
                maxLength={500}
                rows={2}
                placeholder="Escrever mensagem para o paciente…"
                className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs ${replyText.length >= 500 ? "text-red-500" : "text-gray-400"}`}
                >
                  {replyText.length}/500
                </span>
                <button
                  onClick={() => messageMut.mutate(replyText)}
                  disabled={messageMut.isPending || !replyText.trim()}
                  className="rounded-xl bg-gray-900 text-white px-3 py-1.5 text-sm hover:bg-gray-700 disabled:opacity-50"
                >
                  {messageMut.isPending ? "…" : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
