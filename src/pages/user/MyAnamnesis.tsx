import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getMyAnamnesis, getMyTemplate, createMyAnamnesis } from "@/lib/api/anamnesis";
import type { AnamnesisData } from "@/types/anamnesis";

export default function MyAnamnesis() {
  const { id } = useParams<{ id: string }>();
  const appointmentId = Number(id);

  // Try to load existing anamnesis; if 404, fall through to the form
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
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = templateQ.data;
      setForm(rest);
    }
  }, [existingQ.isError, templateQ.data]);

  const createMut = useMutation({
    mutationFn: (data: AnamnesisData) => createMyAnamnesis(appointmentId, data),
    onSuccess: () => setSubmitted(true),
  });

  const isLoading = existingQ.isLoading || (existingQ.isError && templateQ.isLoading);

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-gray-500">A carregar…</div>
    );
  }

  // Anamnesis already filled — show read-only view
  if (existingQ.data || submitted) {
    const data = existingQ.data ?? createMut.data;
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Link to="/app/appointments" className="text-sm text-gray-500 hover:underline">
            ← Agendamentos
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-semibold">Anamnese</h1>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm p-5 space-y-1">
          <p className="text-sm font-medium text-green-700 bg-green-50 rounded-xl px-3 py-2">
            A sua anamnese está registada. Apenas o médico pode efectuar alterações futuras.
          </p>
          {data?.createdAt && (
            <p className="text-xs text-gray-400 pt-1">
              Preenchida em {data.createdAt.slice(0, 10)}
            </p>
          )}
        </div>

        <ReadOnlyAnamnesis data={data ?? form} />
      </div>
    );
  }

  // Form to fill
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link to="/app/appointments" className="text-sm text-gray-500 hover:underline">
          ← Agendamentos
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-semibold">Preencher Anamnese</h1>
      </div>

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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createMut.mutate(form);
        }}
        className="space-y-6"
      >
        <Section title="Condições Médicas">
          <BoolField
            label="Doença crónica"
            value={form.hasChronicDisease ?? null}
            onChange={(v) => setForm((f) => ({ ...f, hasChronicDisease: v }))}
          />
          {form.hasChronicDisease && (
            <TextField
              label="Qual doença?"
              value={form.chronicDiseaseDescription ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, chronicDiseaseDescription: v }))}
            />
          )}

          <BoolField
            label="Medicação contínua"
            value={form.usesContinuousMedication ?? null}
            onChange={(v) => setForm((f) => ({ ...f, usesContinuousMedication: v }))}
          />
          {form.usesContinuousMedication && (
            <TextField
              label="Qual medicação?"
              value={form.medicationDescription ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, medicationDescription: v }))}
            />
          )}

          <BoolField
            label="Alergias a medicamentos"
            value={form.hasAllergies ?? null}
            onChange={(v) => setForm((f) => ({ ...f, hasAllergies: v }))}
          />
          {form.hasAllergies && (
            <TextField
              label="Quais alergias?"
              value={form.allergyDescription ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, allergyDescription: v }))}
            />
          )}

          <BoolField label="Anemia" value={form.hasAnemia ?? null} onChange={(v) => setForm((f) => ({ ...f, hasAnemia: v }))} />
          <BoolField label="Diabetes" value={form.hasDiabetes ?? null} onChange={(v) => setForm((f) => ({ ...f, hasDiabetes: v }))} />
          <BoolField label="Hipertensão" value={form.hasHypertension ?? null} onChange={(v) => setForm((f) => ({ ...f, hasHypertension: v }))} />

          <BoolField
            label="Depressão"
            value={form.hasDepression ?? null}
            onChange={(v) => setForm((f) => ({ ...f, hasDepression: v }))}
          />
          {form.hasDepression && (
            <BoolField
              label="Depressão controlada?"
              value={form.depressionControlled ?? null}
              onChange={(v) => setForm((f) => ({ ...f, depressionControlled: v }))}
            />
          )}

          <BoolField label="Cancro (histórico)" value={form.hadCancer ?? null} onChange={(v) => setForm((f) => ({ ...f, hadCancer: v }))} />
        </Section>

        <Section title="Condições de Pele">
          <BoolField label="Queloides" value={form.hasKeloids ?? null} onChange={(v) => setForm((f) => ({ ...f, hasKeloids: v }))} />
          <BoolField label="Vitiligo" value={form.hasVitiligo ?? null} onChange={(v) => setForm((f) => ({ ...f, hasVitiligo: v }))} />
          <BoolField label="Psoríase" value={form.hasPsoriasis ?? null} onChange={(v) => setForm((f) => ({ ...f, hasPsoriasis: v }))} />
          <BoolField label="Tatuagens" value={form.hasTattoos ?? null} onChange={(v) => setForm((f) => ({ ...f, hasTattoos: v }))} />
        </Section>

        <Section title="Histórico Estético">
          <BoolField
            label="Tratamento estético anterior"
            value={form.hadAestheticTreatment ?? null}
            onChange={(v) => setForm((f) => ({ ...f, hadAestheticTreatment: v }))}
          />
          {form.hadAestheticTreatment && (
            <TextField
              label="Qual tratamento?"
              value={form.treatmentDescription ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, treatmentDescription: v }))}
            />
          )}
          <BoolField label="Usa aspirina" value={form.usesAspirin ?? null} onChange={(v) => setForm((f) => ({ ...f, usesAspirin: v }))} />
          <BoolField label="Usa corticosteroides" value={form.usesCorticosteroids ?? null} onChange={(v) => setForm((f) => ({ ...f, usesCorticosteroids: v }))} />
          <BoolField label="Usou Roacutan" value={form.usedRoacutan ?? null} onChange={(v) => setForm((f) => ({ ...f, usedRoacutan: v }))} />
        </Section>

        <Section title="Estilo de Vida">
          <BoolField
            label="Actividade física"
            value={form.practicesPhysicalActivity ?? null}
            onChange={(v) => setForm((f) => ({ ...f, practicesPhysicalActivity: v }))}
          />
          {form.practicesPhysicalActivity && (
            <TextField
              label="Qual actividade?"
              value={form.activityDescription ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, activityDescription: v }))}
            />
          )}
          <BoolField label="Consome álcool" value={form.consumesAlcohol ?? null} onChange={(v) => setForm((f) => ({ ...f, consumesAlcohol: v }))} />
          <BoolField label="Fuma" value={form.smokes ?? null} onChange={(v) => setForm((f) => ({ ...f, smokes: v }))} />
        </Section>

        <Section title="Saúde Reprodutiva">
          <BoolField label="Grávida" value={form.isPregnant ?? null} onChange={(v) => setForm((f) => ({ ...f, isPregnant: v }))} />
          <BoolField label="A amamentar" value={form.isBreastfeeding ?? null} onChange={(v) => setForm((f) => ({ ...f, isBreastfeeding: v }))} />
          <BoolField
            label="Contraceptivo hormonal"
            value={form.usesHormonalContraceptive ?? null}
            onChange={(v) => setForm((f) => ({ ...f, usesHormonalContraceptive: v }))}
          />
          {form.usesHormonalContraceptive && (
            <TextField
              label="Qual contraceptivo?"
              value={form.contraceptiveDescription ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, contraceptiveDescription: v }))}
            />
          )}
        </Section>

        <Section title="Alergias Alimentares">
          <BoolField
            label="Alergia alimentar"
            value={form.hasFoodAllergy ?? null}
            onChange={(v) => setForm((f) => ({ ...f, hasFoodAllergy: v }))}
          />
          {form.hasFoodAllergy && (
            <TextField
              label="Qual alergia?"
              value={form.foodAllergyDescription ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, foodAllergyDescription: v }))}
            />
          )}
        </Section>

        <Section title="Notas Adicionais">
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Observações (opcional)</label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              maxLength={1000}
              className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Informações adicionais que considere relevantes…"
            />
            <span className="text-xs text-gray-400">{(form.notes ?? "").length}/1000</span>
          </div>
        </Section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createMut.isPending}
            className="rounded-xl bg-gray-900 text-white px-5 py-2 text-sm hover:bg-gray-700 disabled:opacity-50"
          >
            {createMut.isPending ? "A guardar…" : "Guardar Anamnese"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-5 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function BoolField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded-lg px-3 py-1 text-xs border transition ${
            value === true
              ? "bg-gray-900 text-white border-gray-900"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded-lg px-3 py-1 text-xs border transition ${
            value === false
              ? "bg-gray-900 text-white border-gray-900"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Não
        </button>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="pl-4 space-y-1">
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
      />
    </div>
  );
}

function ReadOnlyAnamnesis({ data }: { data: AnamnesisData }) {
  const fields: [string, boolean | null | undefined][] = [
    ["Doença crónica", data.hasChronicDisease],
    ["Medicação contínua", data.usesContinuousMedication],
    ["Alergias a medicamentos", data.hasAllergies],
    ["Anemia", data.hasAnemia],
    ["Diabetes", data.hasDiabetes],
    ["Hipertensão", data.hasHypertension],
    ["Depressão", data.hasDepression],
    ["Depressão controlada", data.depressionControlled],
    ["Cancro (histórico)", data.hadCancer],
    ["Queloides", data.hasKeloids],
    ["Vitiligo", data.hasVitiligo],
    ["Psoríase", data.hasPsoriasis],
    ["Tatuagens", data.hasTattoos],
    ["Tratamento estético anterior", data.hadAestheticTreatment],
    ["Usa aspirina", data.usesAspirin],
    ["Usa corticosteroides", data.usesCorticosteroids],
    ["Usou Roacutan", data.usedRoacutan],
    ["Actividade física", data.practicesPhysicalActivity],
    ["Consome álcool", data.consumesAlcohol],
    ["Fuma", data.smokes],
    ["Grávida", data.isPregnant],
    ["A amamentar", data.isBreastfeeding],
    ["Contraceptivo hormonal", data.usesHormonalContraceptive],
    ["Alergia alimentar", data.hasFoodAllergy],
  ];

  const descriptions: [string, string | null | undefined][] = [
    ["Doença crónica", data.chronicDiseaseDescription],
    ["Medicação", data.medicationDescription],
    ["Alergias", data.allergyDescription],
    ["Tratamento estético", data.treatmentDescription],
    ["Actividade física", data.activityDescription],
    ["Contraceptivo", data.contraceptiveDescription],
    ["Alergia alimentar", data.foodAllergyDescription],
  ];

  return (
    <div className="rounded-2xl border bg-white shadow-sm p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {fields.map(([label, val]) =>
          val == null ? null : (
            <div key={label} className="flex items-center justify-between text-sm border-b pb-1">
              <span className="text-gray-600">{label}</span>
              <span className={val ? "text-red-600 font-medium" : "text-green-700"}>
                {val ? "Sim" : "Não"}
              </span>
            </div>
          )
        )}
      </div>

      {descriptions.some(([, v]) => v) && (
        <div className="space-y-1 pt-2">
          {descriptions.map(([label, val]) =>
            val ? (
              <p key={label} className="text-sm text-gray-600">
                <span className="font-medium">{label}:</span> {val}
              </p>
            ) : null
          )}
        </div>
      )}

      {data.notes && (
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Notas:</span> {data.notes}
          </p>
        </div>
      )}
    </div>
  );
}
