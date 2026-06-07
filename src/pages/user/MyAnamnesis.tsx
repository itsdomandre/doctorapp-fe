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
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Carregando anamnese…
      </div>
    );
  }

  const savedData = existingQ.data ?? (submitted ? createMut.data : undefined);

  return (
    <div className="space-y-6 max-w-2xl">

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
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          {savedData ? "Anamnese" : "Preencher Anamnese"}
        </h1>
      </div>

      {savedData ? (
        <>
          {/* Success banner */}
          <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">Anamnese registada</p>
              <p className="text-sm text-green-700 mt-0.5">
                Apenas o médico pode efectuar alterações futuras.
              </p>
              {savedData.createdAt && (
                <p className="text-xs text-green-600 mt-1">
                  Preenchida em {savedData.createdAt.slice(0, 10).split("-").reverse().join("/")}
                </p>
              )}
            </div>
          </div>

          <AnamnesisForm form={savedData} readOnly />
        </>
      ) : (
        <>
          {/* Pre-fill info banner */}
          {templateQ.data?.createdAt && (
            <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800">Pré-preenchido</p>
                <p className="text-sm text-blue-700 mt-0.5">
                  Os dados foram preenchidos com a sua última anamnese. Reveja e confirme antes de guardar.
                </p>
              </div>
            </div>
          )}

          {/* Error banner */}
          {createMut.isError && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Erro ao guardar. Tente novamente.
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }}>
            <AnamnesisForm form={form} onChange={setForm} />
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={createMut.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {createMut.isPending ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Salvando…
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar Anamnese
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
