type Props = {
  slots: string[];
  selectedSlot: string | null;
  onSlotSelect: (slot: string) => void;
  loading?: boolean;
};

export default function TimeSlotGrid({ slots, selectedSlot, onSlotSelect, loading }: Props) {
  if (loading) {
    return (
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-20 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-2">Sem horários disponíveis para esta data.</p>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => onSlotSelect(slot)}
          className={[
            "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
            selectedSlot === slot
              ? "bg-gray-900 text-white border-gray-900 shadow"
              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50",
          ].join(" ")}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}
