import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createAppointment, fetchAvailableSlots } from "@/lib/api/appointments";
import { PROCEDURE_LABELS, Procedure } from "@/types/appointment";
import { useNavigate, Link } from "react-router-dom";

const PROCEDURES = Object.keys(PROCEDURE_LABELS) as Procedure[];

const schema = z.object({
  date: z.string().min(10, "Selecione a data"),
  slot: z.string().min(1, "Selecione um horário"),
  procedure: z.enum(PROCEDURES as [Procedure, ...Procedure[]], {
    errorMap: () => ({ message: "Selecione um procedimento" }),
  }),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewAppointment() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [noSlots, setNoSlots] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, setError } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  async function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const date = e.target.value;
    setValue("slot", "");
    setSlots([]);
    setNoSlots(false);
    if (!date) return;
    setLoadingSlots(true);
    try {
      const available = await fetchAvailableSlots(date);
      setSlots(available);
      setNoSlots(available.length === 0);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => navigate("/app/appointments", { replace: true }),
    onError: () => setError("root", { message: "Erro ao criar agendamento. Tente novamente." }),
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      dateTime: `${data.date}T${data.slot}:00`,
      procedure: data.procedure,
      notes: data.notes || undefined,
    });
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Novo Agendamento</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 max-w-xl">
        {/* Data */}
        <div>
          <label className="text-sm font-medium text-gray-700">Data</label>
          <input
            type="date"
            min={today}
            {...register("date")}
            onChange={handleDateChange}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date.message}</p>}
        </div>

        {/* Horário */}
        <div>
          <label className="text-sm font-medium text-gray-700">Horário</label>
          {loadingSlots ? (
            <p className="mt-1 text-sm text-gray-500">A carregar horários…</p>
          ) : noSlots ? (
            <p className="mt-1 text-sm text-red-600">Sem horários disponíveis para esta data.</p>
          ) : (
            <select
              {...register("slot")}
              disabled={slots.length === 0}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
            >
              <option value="">Selecione um horário</option>
              {slots.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
          {errors.slot && <p className="text-xs text-red-600 mt-1">{errors.slot.message}</p>}
        </div>

        {/* Procedimento */}
        <div>
          <label className="text-sm font-medium text-gray-700">Procedimento</label>
          <select
            {...register("procedure")}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">Selecione um procedimento</option>
            {PROCEDURES.map((p) => (
              <option key={p} value={p}>{PROCEDURE_LABELS[p]}</option>
            ))}
          </select>
          {errors.procedure && <p className="text-xs text-red-600 mt-1">{errors.procedure.message}</p>}
        </div>

        {/* Notas */}
        <div>
          <label className="text-sm font-medium text-gray-700">Notas <span className="text-gray-400">(opcional)</span></label>
          <textarea
            {...register("notes")}
            rows={3}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            placeholder="Informações adicionais para o médico"
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
          <Link to="/app/appointments" className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-100">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
