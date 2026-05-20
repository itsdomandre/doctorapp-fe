import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getMyAnamnesis, getMyTemplate, createMyAnamnesis } from "@/lib/api/anamnesis";
import AnamnesisForm from "@/components/AnamnesisForm";
import type { AnamnesisData } from "@/types/anamnesis";

export default function MyAnamnesis() {
  const { id } = useParams<{ id: string }>();
  const appointmentId = Number(id);

  const existingQ = useQuery({
    queryKey: ["myAnamnesis", appointmentId],
    queryFn: () => getMyAnamnesis(appointmentId),
    retry: false,
  });

  const templateQ = useQuery({
    queryKey: ["myAnamnesisTemplate"],
    queryFn: getMyTemplate,
    enabled: existingQ.isError,
  });

  const [form, setForm] = useState<AnamnesisData>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (existingQ.isError && templateQ.data) {
      const { id: _id, createdAt: _c, updatedAt: _u, appointmentId: _a, appointmentDate: _d, procedure: _p, ...rest } = templateQ.data;
      setForm(rest);
    }
  }, [existingQ.isError, templateQ.data]);

  const createMut = useMutation({
    mutationFn: (data: AnamnesisData) => createMyAnamnesis(appointmentId, data),
    onSuccess: (saved) => { setForm(saved); setSubmitted(true); },
  });

  const isLoading = existingQ.isLoading || (existingQ.isError && templateQ.isLoading);

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500">A carregar…</div>;
  }

  const savedData = existingQ.data ?? (submitted ? createMut.data : undefined);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link to="/app/appointments" className="text-sm text-gray-500 hover:underline">
          ← Agendamentos
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-semibold">
          {savedData ? "Anamnese" : "Preencher Anamnese"}
        </h1>
      </div>

      {savedData ? (
        <>
          <div className="rounded-2xl border bg-white shadow-sm p-4 space-y-1">
            <p className="text-sm font-medium text-green-700 bg-green-50 rounded-xl px-3 py-2">
              A sua anamnese está registada. Apenas o médico pode efectuar alterações futuras.
            </p>
            {savedData.createdAt && (
              <p className="text-xs text-gray-400 pt-1">Preenchida em {savedData.createdAt.slice(0, 10)}</p>
            )}
          </div>
          <AnamnesisForm form={savedData} readOnly />
        </>
      ) : (
        <>
          {templateQ.data?.createdAt && (
            <p className="text-sm text-blue-600 bg-blue-50 rounded-xl px-3 py-2">
              Pré-preenchido com a sua última anamnese. Reveja e confirme os dados.
            </p>
          )}
          {createMut.isError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
              Erro ao guardar. Tente novamente.
            </p>
          )}
          <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }}>
            <AnamnesisForm form={form} onChange={setForm} />
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={createMut.isPending}
                className="rounded-xl bg-gray-900 text-white px-5 py-2 text-sm hover:bg-gray-700 disabled:opacity-50"
              >
                {createMut.isPending ? "A guardar…" : "Guardar Anamnese"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
