import type { AnamnesisData } from "@/types/anamnesis";

type Props = {
  form: AnamnesisData;
  onChange?: (f: AnamnesisData) => void;
  readOnly?: boolean;
};

export default function AnamnesisForm({ form, onChange, readOnly = false }: Props) {
  if (readOnly) return <AnamnesisReadOnly form={form} />;

  const set = (patch: Partial<AnamnesisData>) => onChange?.({ ...form, ...patch });

  return (
    <div className="space-y-6">
      <Section title="Condições Médicas">
        <BoolField label="Doença crónica" value={form.hasChronicDisease ?? null} onChange={(v) => set({ hasChronicDisease: v })} />
        {form.hasChronicDisease && (
          <TextField label="Qual doença?" value={form.chronicDiseaseDescription ?? ""} onChange={(v) => set({ chronicDiseaseDescription: v })} />
        )}
        <BoolField label="Medicação contínua" value={form.usesContinuousMedication ?? null} onChange={(v) => set({ usesContinuousMedication: v })} />
        {form.usesContinuousMedication && (
          <TextField label="Qual medicação?" value={form.medicationDescription ?? ""} onChange={(v) => set({ medicationDescription: v })} />
        )}
        <BoolField label="Alergias a medicamentos" value={form.hasAllergies ?? null} onChange={(v) => set({ hasAllergies: v })} />
        {form.hasAllergies && (
          <TextField label="Quais alergias?" value={form.allergyDescription ?? ""} onChange={(v) => set({ allergyDescription: v })} />
        )}
        <BoolField label="Anemia" value={form.hasAnemia ?? null} onChange={(v) => set({ hasAnemia: v })} />
        <BoolField label="Diabetes" value={form.hasDiabetes ?? null} onChange={(v) => set({ hasDiabetes: v })} />
        <BoolField label="Hipertensão" value={form.hasHypertension ?? null} onChange={(v) => set({ hasHypertension: v })} />
        <BoolField label="Depressão" value={form.hasDepression ?? null} onChange={(v) => set({ hasDepression: v })} />
        {form.hasDepression && (
          <BoolField label="Depressão controlada?" value={form.depressionControlled ?? null} onChange={(v) => set({ depressionControlled: v })} />
        )}
        <BoolField label="Cancro (histórico)" value={form.hadCancer ?? null} onChange={(v) => set({ hadCancer: v })} />
      </Section>

      <Section title="Condições de Pele">
        <BoolField label="Queloides" value={form.hasKeloids ?? null} onChange={(v) => set({ hasKeloids: v })} />
        <BoolField label="Vitiligo" value={form.hasVitiligo ?? null} onChange={(v) => set({ hasVitiligo: v })} />
        <BoolField label="Psoríase" value={form.hasPsoriasis ?? null} onChange={(v) => set({ hasPsoriasis: v })} />
        <BoolField label="Tatuagens" value={form.hasTattoos ?? null} onChange={(v) => set({ hasTattoos: v })} />
      </Section>

      <Section title="Histórico Estético">
        <BoolField label="Tratamento estético anterior" value={form.hadAestheticTreatment ?? null} onChange={(v) => set({ hadAestheticTreatment: v })} />
        {form.hadAestheticTreatment && (
          <TextField label="Qual tratamento?" value={form.treatmentDescription ?? ""} onChange={(v) => set({ treatmentDescription: v })} />
        )}
        <BoolField label="Usa aspirina" value={form.usesAspirin ?? null} onChange={(v) => set({ usesAspirin: v })} />
        <BoolField label="Usa corticosteroides" value={form.usesCorticosteroids ?? null} onChange={(v) => set({ usesCorticosteroids: v })} />
        <BoolField label="Usou Roacutan" value={form.usedRoacutan ?? null} onChange={(v) => set({ usedRoacutan: v })} />
      </Section>

      <Section title="Estilo de Vida">
        <BoolField label="Actividade física" value={form.practicesPhysicalActivity ?? null} onChange={(v) => set({ practicesPhysicalActivity: v })} />
        {form.practicesPhysicalActivity && (
          <TextField label="Qual actividade?" value={form.activityDescription ?? ""} onChange={(v) => set({ activityDescription: v })} />
        )}
        <BoolField label="Consome álcool" value={form.consumesAlcohol ?? null} onChange={(v) => set({ consumesAlcohol: v })} />
        <BoolField label="Fuma" value={form.smokes ?? null} onChange={(v) => set({ smokes: v })} />
      </Section>

      <Section title="Saúde Reprodutiva">
        <BoolField label="Grávida" value={form.isPregnant ?? null} onChange={(v) => set({ isPregnant: v })} />
        <BoolField label="A amamentar" value={form.isBreastfeeding ?? null} onChange={(v) => set({ isBreastfeeding: v })} />
        <BoolField label="Contraceptivo hormonal" value={form.usesHormonalContraceptive ?? null} onChange={(v) => set({ usesHormonalContraceptive: v })} />
        {form.usesHormonalContraceptive && (
          <TextField label="Qual contraceptivo?" value={form.contraceptiveDescription ?? ""} onChange={(v) => set({ contraceptiveDescription: v })} />
        )}
      </Section>

      <Section title="Alergias Alimentares">
        <BoolField label="Alergia alimentar" value={form.hasFoodAllergy ?? null} onChange={(v) => set({ hasFoodAllergy: v })} />
        {form.hasFoodAllergy && (
          <TextField label="Qual alergia?" value={form.foodAllergyDescription ?? ""} onChange={(v) => set({ foodAllergyDescription: v })} />
        )}
      </Section>

      <Section title="Notas Adicionais">
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
      </Section>
    </div>
  );
}

// ── Compact read-only view ────────────────────────────────────────────────────

type ReadOnlyItem = {
  label: string;
  value: boolean | null | undefined;
  detail?: string | null;
};

type ReadOnlySection = {
  title: string;
  items: ReadOnlyItem[];
};

function AnamnesisReadOnly({ form }: { form: AnamnesisData }) {
  const sections: ReadOnlySection[] = [
    {
      title: "Condições Médicas",
      items: [
        { label: "Doença crónica", value: form.hasChronicDisease, detail: form.hasChronicDisease ? form.chronicDiseaseDescription : null },
        { label: "Medicação contínua", value: form.usesContinuousMedication, detail: form.usesContinuousMedication ? form.medicationDescription : null },
        { label: "Alergias a medicamentos", value: form.hasAllergies, detail: form.hasAllergies ? form.allergyDescription : null },
        { label: "Anemia", value: form.hasAnemia },
        { label: "Diabetes", value: form.hasDiabetes },
        { label: "Hipertensão", value: form.hasHypertension },
        { label: "Depressão", value: form.hasDepression, detail: form.hasDepression && form.depressionControlled != null ? (form.depressionControlled ? "Controlada" : "Não controlada") : null },
        { label: "Cancro (histórico)", value: form.hadCancer },
      ],
    },
    {
      title: "Condições de Pele",
      items: [
        { label: "Queloides", value: form.hasKeloids },
        { label: "Vitiligo", value: form.hasVitiligo },
        { label: "Psoríase", value: form.hasPsoriasis },
        { label: "Tatuagens", value: form.hasTattoos },
      ],
    },
    {
      title: "Histórico Estético",
      items: [
        { label: "Tratamento estético anterior", value: form.hadAestheticTreatment, detail: form.hadAestheticTreatment ? form.treatmentDescription : null },
        { label: "Usa aspirina", value: form.usesAspirin },
        { label: "Usa corticosteroides", value: form.usesCorticosteroids },
        { label: "Usou Roacutan", value: form.usedRoacutan },
      ],
    },
    {
      title: "Estilo de Vida",
      items: [
        { label: "Actividade física", value: form.practicesPhysicalActivity, detail: form.practicesPhysicalActivity ? form.activityDescription : null },
        { label: "Consome álcool", value: form.consumesAlcohol },
        { label: "Fuma", value: form.smokes },
      ],
    },
    {
      title: "Saúde Reprodutiva",
      items: [
        { label: "Grávida", value: form.isPregnant },
        { label: "A amamentar", value: form.isBreastfeeding },
        { label: "Contraceptivo hormonal", value: form.usesHormonalContraceptive, detail: form.usesHormonalContraceptive ? form.contraceptiveDescription : null },
      ],
    },
    {
      title: "Alergias Alimentares",
      items: [
        { label: "Alergia alimentar", value: form.hasFoodAllergy, detail: form.hasFoodAllergy ? form.foodAllergyDescription : null },
      ],
    },
  ];

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.title} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{section.title}</h3>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
            {section.items.map((item) => (
              <div key={item.label} className="px-4 py-2.5 flex items-start justify-between gap-2 min-w-0">
                <span className="text-xs text-gray-600 leading-tight min-w-0">
                  {item.label}
                  {item.detail && (
                    <span className="block text-gray-400 italic truncate" title={item.detail}>
                      {item.detail}
                    </span>
                  )}
                </span>
                <ValueBadge value={item.value ?? null} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {form.notes && (
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notas Adicionais</h3>
          </div>
          <p className="px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap">{form.notes}</p>
        </div>
      )}
    </div>
  );
}

function ValueBadge({ value }: { value: boolean | null }) {
  if (value == null) return <span className="text-xs text-gray-300 shrink-0">—</span>;
  return (
    <span
      className={`shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
        value
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-600"
      }`}
    >
      {value ? "Sim" : "Não"}
    </span>
  );
}

// ── Edit-mode sub-components ──────────────────────────────────────────────────

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
