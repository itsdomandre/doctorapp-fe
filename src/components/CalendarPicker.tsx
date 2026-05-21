import { useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  getDay,
  getDaysInMonth,
  isBefore,
  startOfToday,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";

type Props = {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  month: Date;
  onMonthChange: (month: Date) => void;
  availability: Record<string, number>;
  loading?: boolean;
};

const DOW_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function CalendarPicker({
  selectedDate,
  onDateSelect,
  month,
  onMonthChange,
  availability,
  loading,
}: Props) {
  const today = startOfToday();

  const cells = useMemo(() => {
    const first = startOfMonth(month);
    const startDow = getDay(first); // 0 = Sunday
    const totalDays = getDaysInMonth(month);
    const result: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) result.push(null);
    for (let d = 1; d <= totalDays; d++) result.push(d);
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [month]);

  function toDateStr(day: number): string {
    const y = month.getFullYear();
    const m = String(month.getMonth() + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const availabilityKnown = Object.keys(availability).length > 0;

  function isDisabled(day: number): boolean {
    const dateStr = toDateStr(day);
    const date = parseISO(dateStr);
    if (isBefore(date, today)) return true;
    if (getDay(date) === 6) return true;
    // Only filter by slot count when the backend returned availability data
    if (availabilityKnown && !availability[dateStr]) return true;
    return false;
  }

  return (
    <div className="select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => onMonthChange(subMonths(month, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 text-lg"
        >
          ‹
        </button>
        <h2 className="text-sm font-semibold text-gray-800 capitalize">
          {format(month, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 text-lg"
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DOW_LABELS.map((label) => (
          <div key={label} className="text-center text-xs text-gray-400 font-medium py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-11 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;

            const dateStr = toDateStr(day);
            const disabled = isDisabled(day);
            const selected = selectedDate === dateStr;
            const slots = availability[dateStr] ?? 0;

            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => onDateSelect(dateStr)}
                className={[
                  "flex flex-col items-center justify-center h-11 rounded-xl text-sm transition-all",
                  selected
                    ? "bg-gray-900 text-white font-semibold shadow"
                    : !disabled
                    ? "bg-teal-50 text-teal-800 font-medium hover:bg-teal-100 ring-1 ring-teal-200 cursor-pointer"
                    : "text-gray-300 cursor-not-allowed",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span>{day}</span>
                {!disabled && !selected && (
                  <span className="text-[9px] leading-none text-teal-500 mt-0.5">{slots}v</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
