// src/pages/user/NewAppointment.tsx
import { useEffect, useState } from "react";
import { fetchSlots, createAppointment } from "@/lib/appointment";
import { PROCEDURES, PROCEDURE_LABEL, Procedure } from "@/types/appointment";
import { useNavigate } from "react-router-dom";
export default function NewAppointment() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState("");
  const [procedure, setProcedure] = useState<Procedure | "">("");
  const [notes, setNotes] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    (async () => {
      if (!date) return;
      setLoadingSlots(true);
      setError("");
      try {
        const list = await fetchSlots(date);
        // normaliza para HH:mm
        const normalized = list.map((t) => (t.length >= 5 ? t.slice(0, 5) : t));
        setSlots(normalized);
        setSlot("");
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Falha ao carregar horários.");
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [date]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !slot || !procedure) {
      setError("Selecione data, horário e procedimento.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const dateTime = `${date}T${slot}:00`; // LocalDateTime que o backend espera
      await createAppointment({ dateTime, procedure: procedure as Procedure, notes });
      setOk("Pedido enviado! Você receberá confirmação em até 24h.");
      setTimeout(() => navigate("/app/appointments"), 1200);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Não foi possível enviar o pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Novo agendamento</h1>

      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Data</span>
            <input
              type="date"
              className="border rounded-xl px-3 py-2"
              min={new Date().toISOString().slice(0, 10)}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Horário</span>
            <select
              className="border rounded-xl px-3 py-2 disabled:opacity-50"
              disabled={!date || loadingSlots}
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              required
            >
              <option value="">{loadingSlots ? "Carregando..." : "Selecione"}</option>
              {slots.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Procedimento</span>
          <select
            className="border rounded-xl px-3 py-2"
            value={procedure}
            onChange={(e) => setProcedure(e.target.value as Procedure)}
            required
          >
            <option value="">Selecione</option>
            {PROCEDURES.map((p) => (
              <option key={p} value={p}>{PROCEDURE_LABEL[p]}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Observações (opcional)</span>
          <textarea
            className="border rounded-xl px-3 py-2 min-h-[92px]"
            placeholder="Informações adicionais, alergias, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {ok && <p className="text-sm text-green-700">{ok}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" className="px-4 py-2 rounded-xl border" onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50">
            {submitting ? "Enviando..." : "Solicitar"}
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-500">Cada atendimento é de 1 hora. O pedido ficará em <b>REQUESTED</b> até aprovação.</p>
      </form>
    </div>
  );
}
