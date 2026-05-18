import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createAppointment, CreateAppointmentInput } from "@/lib/api/appointments";
import { useNavigate, Link } from "react-router-dom";

const schema = z.object({
  date: z.string().min(10, "Informe a data"),
  time: z.string().optional(),
  specialty: z.string().min(2, "Informe a especialidade"),
  reason: z.string().min(3, "Descreva o motivo"),
});
type FormData = z.infer<typeof schema>;

export default function NewAppointment() {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setError } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (payload: CreateAppointmentInput) => createAppointment(payload),
    onSuccess: () => {
      reset();
      navigate("/app/appointments", { replace: true });
    },
    onError: () => {
      setError("root", { message: "Erro ao criar agendamento. Tente novamente." });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      date: data.date,
      time: data.time || undefined,
      specialty: data.specialty,
      reason: data.reason,
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Novo Appointment</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 max-w-xl">
        <div>
          <label className="text-sm">Data</label>
          <input type="date" {...register("date")} className="mt-1 w-full rounded-xl border px-3 py-2" />
          {errors.date && <div className="text-xs text-red-600 mt-1">{errors.date.message}</div>}
        </div>

        <div>
          <label className="text-sm">Hora (opcional)</label>
          <input type="time" {...register("time")} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </div>

        <div>
          <label className="text-sm">Especialidade</label>
          <input type="text" {...register("specialty")} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Clínica geral, Cardiologia..." />
          {errors.specialty && <div className="text-xs text-red-600 mt-1">{errors.specialty.message}</div>}
        </div>

        <div>
          <label className="text-sm">Motivo</label>
          <textarea {...register("reason")} className="mt-1 w-full rounded-xl border px-3 py-2" rows={3} placeholder="Descreva brevemente os sintomas ou motivo do agendamento" />
          {errors.reason && <div className="text-xs text-red-600 mt-1">{errors.reason.message}</div>}
        </div>

        {errors.root && <div className="text-xs text-red-600">{errors.root.message}</div>}

        <div className="flex gap-2">
          <button type="submit" disabled={isSubmitting || mutation.isPending} className="rounded-xl border px-4 py-2 disabled:opacity-50">
            {mutation.isPending ? "Enviando..." : "Solicitar"}
          </button>
          <Link to="/app/appointments" className="rounded-xl border px-4 py-2">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
