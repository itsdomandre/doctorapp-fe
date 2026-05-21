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

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold">Novo Agendamento</h1>
        <p className="text-sm text-gray-500 mt-1">
          Selecione um dia disponível e escolha o horário.
        </p>
      </div>

      {/* Calendar */}
      <div className="rounded-2xl border bg-white shadow-sm p-5">
        <CalendarPicker
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          month={currentMonth}
          onMonthChange={handleMonthChange}
          availability={availabilityQ.data ?? {}}
          loading={availabilityQ.isLoading}
        />
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="rounded-2xl border bg-white shadow-sm p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-800 capitalize">{formattedDate}</p>
          <TimeSlotGrid
            slots={slotsQ.data ?? []}
            selectedSlot={selectedSlot}
            onSlotSelect={setSelectedSlot}
            loading={slotsQ.isLoading}
          />
        </div>
      )}

      {/* Details form — only shown after date + slot are picked */}
      {selectedDate && selectedSlot && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border bg-white shadow-sm p-5 space-y-4"
        >
          <p className="text-sm font-semibold text-gray-800">Detalhes do agendamento</p>

          <div>
            <label className="text-sm font-medium text-gray-700">Procedimento</label>
            <select
              {...register("procedure")}
              defaultValue=""
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="" disabled>
                Selecione um procedimento
              </option>
              {PROCEDURES.map((p) => (
                <option key={p} value={p}>
                  {PROCEDURE_LABELS[p]}
                </option>
              ))}
            </select>
            {errors.procedure && (
              <p className="text-xs text-red-600 mt-1">{errors.procedure.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Notas <span className="text-gray-400">(opcional)</span>
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="Informações adicionais para o médico"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-xl bg-gray-900 text-white px-4 py-2 text-sm hover:bg-gray-700 disabled:opacity-50"
            >
              {mutation.isPending ? "A enviar…" : "Solicitar agendamento"}
            </button>
            <Link
              to="/app/appointments"
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-100"
            >
              Cancelar
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
