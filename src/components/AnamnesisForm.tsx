import type { AnamnesisData } from "@/types/anamnesis";

type Props = {
  form: AnamnesisData;
  onChange?: (f: AnamnesisData) => void;
  readOnly?: boolean;
};

export default function AnamnesisForm({ form, onChange, readOnly = false }: Props) {
  const set = (patch: Partial<AnamnesisData>) => onChange?.({ ...form, ...patch });

  return (
    <div className="space-y-6">
      <Section title="Condições Médicas">
        <BoolField label="Doença crónica" value={form.hasChronicDisease ?? null} onChange={(v) => set({ hasChronicDisease: v })} readOnly={readOnly} />
        {form.hasChronicDisease && (
          <TextField label="Qual doença?" value={form.chronicDiseaseDescription ?? ""} onChange={(v) => set({ chronicDiseaseDescription: v })} readOnly={readOnly} />
        )}

        <BoolField label="Medicação contínua" value={form.usesContinuousMedication ?? null} onChange={(v) => set({ usesContinuousMedication: v })} readOnly={readOnly} />
        {form.usesContinuousMedication && (
          <TextField label="Qual medicação?" value={form.medicationDescription ?? ""} onChange={(v) => set({ medicationDescription: v })} readOnly={readOnly} />
        )}

        <BoolField label="Alergias a medicamentos" value={form.hasAllergies ?? null} onChange={(v) => set({ hasAllergies: v })} readOnly={readOnly} />
        {form.hasAllergies && (
          <TextField label="Quais alergias?" value={form.allergyDescription ?? ""} onChange={(v) => set({ allergyDescription: v })} readOnly={readOnly} />
        )}

        <BoolField label="Anemia" value={form.hasAnemia ?? null} onChange={(v) => set({ hasAnemia: v })} readOnly={readOnly} />
        <BoolField label="Diabetes" value={form.hasDiabetes ?? null} onChange={(v) => set({ hasDiabetes: v })} readOnly={readOnly} />
        <BoolField label="Hipertensão" value={form.hasHypertension ?? null} onChange={(v) => set({ hasHypertension: v })} readOnly={readOnly} />

        <BoolField label="Depressão" value={form.hasDepression ?? null} onChange={(v) => set({ hasDepression: v })} readOnly={readOnly} />
        {form.hasDepression && (
          <BoolField label="Depressão controlada?" value={form.depressionControlled ?? null} onChange={(v) => set({ depressionControlled: v })} readOnly={readOnly} />
        )}

        <BoolField label="Cancro (histórico)" value={form.hadCancer ?? null} onChange={(v) => set({ hadCancer: v })} readOnly={readOnly} />
      </Section>

      <Section title="Condições de Pele">
        <BoolField label="Queloides" value={form.hasKeloids ?? null} onChange={(v) => set({ hasKeloids: v })} readOnly={readOnly} />
        <BoolField label="Vitiligo" value={form.hasVitiligo ?? null} onChange={(v) => set({ hasVitiligo: v })} readOnly={readOnly} />
        <BoolField label="Psoríase" value={form.hasPsoriasis ?? null} onChange={(v) => set({ hasPsoriasis: v })} readOnly={readOnly} />
        <BoolField label="Tatuagens" value={form.hasTattoos ?? null} onChange={(v) => set({ hasTattoos: v })} readOnly={readOnly} />
      </Section>

      <Section title="Histórico Estético">
        <BoolField label="Tratamento estético anterior" value={form.hadAestheticTreatment ?? null} onChange={(v) => set({ hadAestheticTreatment: v })} readOnly={readOnly} />
        {form.hadAestheticTreatment && (
          <TextField label="Qual tratamento?" value={form.treatmentDescription ?? ""} onChange={(v) => set({ treatmentDescription: v })} readOnly={readOnly} />
        )}
        <BoolField label="Usa aspirina" value={form.usesAspirin ?? null} onChange={(v) => set({ usesAspirin: v })} readOnly={readOnly} />
        <BoolField label="Usa corticosteroides" value={form.usesCorticosteroids ?? null} onChange={(v) => set({ usesCorticosteroids: v })} readOnly={readOnly} />
        <BoolField label="Usou Roacutan" value={form.usedRoacutan ?? null} onChange={(v) => set({ usedRoacutan: v })} readOnly={readOnly} />
      </Section>

      <Section title="Estilo de Vida">
        <BoolField label="Actividade física" value={form.practicesPhysicalActivity ?? null} onChange={(v) => set({ practicesPhysicalActivity: v })} readOnly={readOnly} />
        {form.practicesPhysicalActivity && (
          <TextField label="Qual actividade?" value={form.activityDescription ?? ""} onChange={(v) => set({ activityDescription: v })} readOnly={readOnly} />
        )}
        <BoolField label="Consome álcool" value={form.consumesAlcohol ?? null} onChange={(v) => set({ consumesAlcohol: v })} readOnly={readOnly} />
        <BoolField label="Fuma" value={form.smokes ?? null} onChange={(v) => set({ smokes: v })} readOnly={readOnly} />
      </Section>

      <Section title="Saúde Reprodutiva">
        <BoolField label="Grávida" value={form.isPregnant ?? null} onChange={(v) => set({ isPregnant: v })} readOnly={readOnly} />
        <BoolField label="A amamentar" value={form.isBreastfeeding ?? null} onChange={(v) => set({ isBreastfeeding: v })} readOnly={readOnly} />
        <BoolField label="Contraceptivo hormonal" value={form.usesHormonalContraceptive ?? null} onChange={(v) => set({ usesHormonalContraceptive: v })} readOnly={readOnly} />
        {form.usesHormonalContraceptive && (
          <TextField label="Qual contraceptivo?" value={form.contraceptiveDescription ?? ""} onChange={(v) => set({ contraceptiveDescription: v })} readOnly={readOnly} />
        )}
      </Section>

      <Section title="Alergias Alimentares">
        <BoolField label="Alergia alimentar" value={form.hasFoodAllergy ?? null} onChange={(v) => set({ hasFoodAllergy: v })} readOnly={readOnly} />
        {form.hasFoodAllergy && (
          <TextField label="Qual alergia?" value={form.foodAllergyDescription ?? ""} onChange={(v) => set({ foodAllergyDescription: v })} readOnly={readOnly} />
        )}
      </Section>

      <Section title="Notas Adicionais">
        {readOnly ? (
          form.notes ? <p className="text-sm text-gray-700">{form.notes}</p> : <p className="text-sm text-gray-400">Sem notas.</p>
        ) : (
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Observações (opcional)</label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => set({ notes: e.target.value })}
              rows={3}
              maxLength={1000}
              className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Informações adicionais que considere relevantes…"
            />
            <span className="text-xs text-gray-400">{(form.notes ?? "").length}/1000</span>
          </div>
        )}
      </Section>
    </div>
  );
}

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
  readOnly,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  readOnly: boolean;
}) {
  if (readOnly) {
    return (
      <div className="flex items-center justify-between text-sm border-b pb-1">
        <span className="text-gray-600">{label}</span>
        {value == null ? (
          <span className="text-gray-400">—</span>
        ) : (
          <span className={value ? "text-red-600 font-medium" : "text-green-700"}>{value ? "Sim" : "Não"}</span>
        )}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded-lg px-3 py-1 text-xs border transition ${value === true ? "bg-gray-900 text-white border-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded-lg px-3 py-1 text-xs border transition ${value === false ? "bg-gray-900 text-white border-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
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
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly: boolean;
}) {
  if (readOnly) {
    return value ? (
      <p className="pl-4 text-sm text-gray-600">
        <span className="font-medium">{label}:</span> {value}
      </p>
    ) : null;
  }
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
