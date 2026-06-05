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
    return <div className="p-6 text-sm text-gray-500">A carregar…</div>;
  }
  if (apptQ.isError || !apptQ.data) {
    return <div className="p-6 text-sm text-red-600">Erro ao carregar agendamento.</div>;
  }

  const a = apptQ.data;
  const dt = parseISO(a.dateTime);
  const hasAnamnesis = !!a.anamnesisId;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link to="/doctor/appointments" className="text-sm text-gray-500 hover:underline">
          ← Meus Agendamentos
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-semibold">Agendamento #{a.id}</h1>
      </div>

      {/* Resumo */}
      <div className="rounded-2xl border bg-white shadow-sm divide-y text-sm">
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-gray-500">Paciente</span>
          <span className="font-medium">{a.patientName ?? "—"}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-gray-500">Procedimento</span>
          <span className="font-medium">{PROCEDURE_LABELS[a.procedure] ?? a.procedure}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-gray-500">Data</span>
          <span className="font-medium capitalize">
            {format(dt, "d 'de' MMMM yyyy", { locale: ptBR })}
          </span>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-gray-500">Horário</span>
          <span className="font-medium">{format(dt, "HH:mm")}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-gray-500">Estado</span>
          <StatusBadge status={a.status} />
        </div>
      </div>

      {/* Trava: anamnese não preenchida */}
      {!hasAnamnesis ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Aguardando preenchimento da anamnese pelo paciente. As notas clínicas ficam disponíveis após esse passo.
        </div>
      ) : (
        <>
          {/* Anamnese do paciente */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Anamnese do Paciente
            </h2>
            {anamnesisQ.isLoading && (
              <p className="text-sm text-gray-400">A carregar anamnese…</p>
            )}
            {anamnesisQ.isError && (
              <p className="text-sm text-red-600">Erro ao carregar anamnese.</p>
            )}
            {anamnesisQ.data && <AnamnesisForm form={anamnesisQ.data} readOnly />}
          </div>

          {/* Notas clínicas */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Notas Clínicas
            </h2>

            {(!a.doctorNotes || a.doctorNotes.length === 0) ? (
              <p className="text-sm text-gray-400">Sem notas clínicas ainda.</p>
            ) : (
              <div className="space-y-2">
                {a.doctorNotes.map((note) => (
                  <div key={note.id} className="rounded-xl border bg-white p-3 space-y-1">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-gray-400">
                      {note.doctorName} · {format(parseISO(note.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Adicionar nota */}
            <div className="rounded-xl border bg-white p-3 space-y-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Adicionar nota clínica…"
                className="w-full rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              {noteMut.isError && (
                <p className="text-xs text-red-600">Erro ao guardar nota. Tente novamente.</p>
              )}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs ${noteText.length >= 1000 ? "text-red-500" : "text-gray-400"}`}
                >
                  {noteText.length}/1000
                </span>
                <button
                  onClick={() => noteMut.mutate(noteText)}
                  disabled={noteMut.isPending || !noteText.trim()}
                  className="rounded-xl bg-gray-900 text-white px-4 py-1.5 text-sm hover:bg-gray-700 disabled:opacity-50"
                >
                  {noteMut.isPending ? "A guardar…" : "Adicionar Nota"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
