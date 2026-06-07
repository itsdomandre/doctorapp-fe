import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate, Link } from "react-router-dom";
import {
  createAppointment,
  fetchAvailableSlots,
  fetchMonthlyAvailability,
} from "@/lib/api/appointments";
import { PROCEDURE_LABELS, Procedure } from "@/types/appointment";
import CalendarPicker from "@/components/CalendarPicker";
import TimeSlotGrid from "@/components/TimeSlotGrid";

const PROCEDURES = Object.keys(PROCEDURE_LABELS) as Procedure[];

const schema = z.object({
  procedure: z.enum(PROCEDURES as [Procedure, ...Procedure[]], {
    errorMap: () => ({ message: "Selecione um procedimento" }),
  }),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewAppointment() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const monthStr = format(currentMonth, "yyyy-MM");

  const availabilityQ = useQuery({
    queryKey: ["appointment-availability", monthStr],
    queryFn: () => fetchMonthlyAvailability(monthStr),
    staleTime: 60_000,
    retry: false,
  });

  const slotsQ = useQuery({
    queryKey: ["appointment-slots", selectedDate],
    queryFn: () => fetchAvailableSlots(selectedDate!),
    enabled: !!selectedDate,
    staleTime: 30_000,
  });

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

  function handleMonthChange(newMonth: Date) {
    setCurrentMonth(newMonth);
    setSelectedDate(null);
    setSelectedSlot(null);
  }

  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => navigate("/app/appointments", { replace: true }),
    onError: () =>
      setError("root", { message: "Erro ao criar agendamento. Tente novamente." }),
  });

  const onSubmit = (data: FormData) => {
    if (!selectedDate || !selectedSlot) return;
    mutation.mutate({
      dateTime: `${selectedDate}T${selectedSlot}:00`,
      procedure: data.procedure,
      notes: data.notes || undefined,
    });
  };

  const formattedDate = selectedDate
    ? format(parseISO(selectedDate), "EEEE, d 'de' MMMM", { locale: ptBR })
    : null;

  const step = !selectedDate ? 1 : !selectedSlot ? 2 : 3;

  return (
    <div className="space-y-6 max-w-lg">

      {/* Header */}
      <div className="space-y-1">
        <Link
          to="/app/appointments"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Meus Agendamentos
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Novo Agendamento</h1>
          <p className="text-sm text-gray-500 mt-1">
            Selecione um dia disponível e escolha o horário.
          </p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: "Data" },
          { n: 2, label: "Horário" },
          { n: 3, label: "Detalhes" },
        ].map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              step > n
                ? "bg-gray-900 text-white"
                : step === n
                  ? "bg-gray-100 text-gray-800 ring-1 ring-gray-300"
                  : "bg-gray-50 text-gray-400"
            }`}>
              {step > n ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{n}</span>
              )}
              {label}
            </div>
            {i < 2 && <div className="w-5 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Calendar card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Escolha uma data</h2>
        </div>
        <div className="p-5">
          <CalendarPicker
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            month={currentMonth}
            onMonthChange={handleMonthChange}
            availability={availabilityQ.data ?? {}}
            loading={availabilityQ.isLoading}
          />
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Horários disponíveis
              {formattedDate && (
                <span className="ml-2 normal-case text-gray-500 font-medium capitalize">
                  — {formattedDate}
                </span>
              )}
            </h2>
          </div>
          <div className="p-5">
            <TimeSlotGrid
              slots={slotsQ.data ?? []}
              selectedSlot={selectedSlot}
              onSlotSelect={setSelectedSlot}
              loading={slotsQ.isLoading}
            />
          </div>
        </div>
      )}

      {/* Details form */}
      {selectedDate && selectedSlot && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Detalhes do agendamento</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Procedimento</label>
              <select
                {...register("procedure")}
                defaultValue=""
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              >
                <option value="" disabled>Selecione um procedimento</option>
                {PROCEDURES.map((p) => (
                  <option key={p} value={p}>{PROCEDURE_LABELS[p]}</option>
                ))}
              </select>
              {errors.procedure && (
                <p className="text-xs text-red-600">{errors.procedure.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Notas <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="Informações adicionais para o médico…"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              />
            </div>

            {errors.root && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.root.message}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {mutation.isPending ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Enviando…
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Solicitar agendamento
                  </>
                )}
              </button>
              <Link
                to="/app/appointments"
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
