import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fetchAppointmentById, addDoctorNote } from "@/lib/api/appointments";
import { getDoctorAnamnesis } from "@/lib/api/anamnesis";
import AnamnesisForm from "@/components/AnamnesisForm";
import StatusBadge from "@/components/StatusBadge";
import { PROCEDURE_LABELS } from "@/types/appointment";

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function DoctorAppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const appointmentId = Number(id);
  const qc = useQueryClient();
  const [noteText, setNoteText] = useState("");

  const apptQ = useQuery({
    queryKey: ["doctorAppointment", appointmentId],
    queryFn: () => fetchAppointmentById(appointmentId),
  });

  const anamnesisQ = useQuery({
    queryKey: ["doctorAnamnesis", appointmentId],
    queryFn: () => getDoctorAnamnesis(appointmentId),
    enabled: !!apptQ.data?.anamnesisId,
    retry: false,
  });

  const noteMut = useMutation({
    mutationFn: (content: string) => addDoctorNote(appointmentId, content),
    onSuccess: (newNote) => {
      setNoteText("");
      qc.setQueryData<typeof apptQ.data>(["doctorAppointment", appointmentId], (prev) => {
        if (!prev) return prev;
        return { ...prev, doctorNotes: [...(prev.doctorNotes ?? []), newNote] };
      });
    },
  });

  if (apptQ.isLoading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Carregando agendamento…
      </div>
    );
  }
  if (apptQ.isError || !apptQ.data) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-red-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Erro ao carregar agendamento.
      </div>
    );
  }

  const a = apptQ.data;
  const dt = parseISO(a.dateTime);
  const hasAnamnesis = !!a.anamnesisId;

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Breadcrumb + Title */}
      <div className="space-y-1">
        <Link
          to="/doctor/appointments"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Meus Agendamentos
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Agendamento <span className="text-gray-400 font-normal">#{a.id}</span>
          </h1>
          <StatusBadge status={a.status} />
        </div>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Resumo</h2>
        </div>

        <div className="divide-y divide-gray-100 text-sm">

          {/* Patient */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Paciente
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600 select-none">
                {initials(a.patientName)}
              </div>
              <span className="font-medium text-gray-800">{a.patientName ?? "—"}</span>
            </div>
          </div>

          {/* Procedure */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Procedimento
            </div>
            <span className="font-medium text-gray-800">{PROCEDURE_LABELS[a.procedure] ?? a.procedure}</span>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Data
            </div>
            <span className="font-medium text-gray-800 capitalize">
              {format(dt, "d 'de' MMMM yyyy", { locale: ptBR })}
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Horário
            </div>
            <span className="font-medium text-gray-800">{format(dt, "HH:mm")}</span>
          </div>

        </div>
      </div>

      {/* Anamnesis gate */}
      {!hasAnamnesis ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">Anamnese pendente</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Aguardando preenchimento pelo paciente. As notas clínicas ficam disponíveis após esse passo.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Anamnesis section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Anamnese do Paciente
              </h2>
            </div>

            {anamnesisQ.isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Carregando anamnese…
              </div>
            )}
            {anamnesisQ.isError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Erro ao carregar anamnese.
              </div>
            )}
            {anamnesisQ.data && <AnamnesisForm form={anamnesisQ.data} readOnly />}
          </div>

          {/* Clinical notes section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Notas Clínicas
              </h2>
            </div>

            {/* Notes list */}
            {(!a.doctorNotes || a.doctorNotes.length === 0) ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-10 text-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nenhuma nota clínica ainda</p>
                  <p className="text-xs text-gray-400 mt-0.5">Adicione a primeira nota abaixo</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {a.doctorNotes.map((note) => (
                  <div key={note.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 space-y-2">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {note.doctorName}
                      <span className="text-gray-300">·</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {format(parseISO(note.createdAt), "dd/MM/yyyy HH:mm")}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add note form */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Nova Nota</h3>
              </div>
              <div className="p-4 space-y-3">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="Escreva a nota clínica…"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
                />
                {noteMut.isError && (
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Erro ao guardar nota. Tente novamente.
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${noteText.length >= 1000 ? "text-red-500" : "text-gray-400"}`}>
                    {noteText.length}/1000
                  </span>
                  <button
                    onClick={() => noteMut.mutate(noteText)}
                    disabled={noteMut.isPending || !noteText.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    {noteMut.isPending ? "Salvando…" : "Adicionar Nota"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
