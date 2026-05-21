import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
  addDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, PROCEDURE_LABELS } from "@/types/appointment";

// Hours shown in the grid (08:00 – 19:00)
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: "bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100",
  APPROVED: "bg-green-50 border-green-300 text-green-800 hover:bg-green-100",
  REJECTED: "bg-red-50 border-red-300 text-red-500 hover:bg-red-100",
  CANCELLED: "bg-gray-100 border-gray-300 text-gray-400 hover:bg-gray-200",
  COMPLETED: "bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100",
};

type Props = {
  appointments: Appointment[];
  weekStart: Date;
  onWeekChange: (date: Date) => void;
  onAppointmentClick: (a: Appointment) => void;
  pendingCount?: number;
  isLoading?: boolean;
};

export default function WeeklyCalendar({
  appointments,
  weekStart,
  onWeekChange,
  onAppointmentClick,
  pendingCount,
  isLoading,
}: Props) {
  // Mon–Sun, skip Saturday (getDay() === 6)
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  }).filter((d) => d.getDay() !== 6);

  const weekEnd = addDays(weekStart, 6);

  function slotAppts(day: Date, hour: number): Appointment[] {
    return appointments.filter((a) => {
      const dt = parseISO(a.dateTime);
      return isSameDay(dt, day) && dt.getHours() === hour;
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Agendamentos</h1>
          {!!pendingCount && pendingCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onWeekChange(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Hoje
          </button>
          <button
            onClick={() => onWeekChange(subWeeks(weekStart, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 text-lg"
          >
            ‹
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[160px] text-center">
            {format(weekStart, "d MMM", { locale: ptBR })} –{" "}
            {format(weekEnd, "d MMM yyyy", { locale: ptBR })}
          </span>
          <button
            onClick={() => onWeekChange(addWeeks(weekStart, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 text-lg"
          >
            ›
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto">
        <div className="min-w-[680px]">
          {/* Day headers */}
          <div
            className="grid border-b"
            style={{ gridTemplateColumns: "56px repeat(6, 1fr)" }}
          >
            <div className="p-2 border-r" />
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={[
                  "p-2 text-center border-l",
                  isToday(day) ? "bg-teal-50" : "",
                ].join(" ")}
              >
                <div className="text-xs text-gray-400 uppercase">
                  {format(day, "EEE", { locale: ptBR })}
                </div>
                <div
                  className={[
                    "text-sm font-semibold mt-0.5",
                    isToday(day) ? "text-teal-700" : "text-gray-800",
                  ].join(" ")}
                >
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* Time rows */}
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-400">A carregar…</div>
          ) : (
            HOURS.map((hour) => (
              <div
                key={hour}
                className="grid border-b last:border-b-0"
                style={{ gridTemplateColumns: "56px repeat(6, 1fr)", minHeight: "52px" }}
              >
                {/* Hour label */}
                <div className="text-xs text-gray-400 text-right pr-3 pt-2 border-r">
                  {String(hour).padStart(2, "0")}:00
                </div>

                {/* Day cells */}
                {weekDays.map((day) => {
                  const appts = slotAppts(day, hour);
                  return (
                    <div
                      key={day.toISOString()}
                      className={[
                        "p-1 border-l min-h-[52px]",
                        isToday(day) ? "bg-teal-50/40" : "",
                      ].join(" ")}
                    >
                      {appts.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => onAppointmentClick(a)}
                          title={`${a.patientName} — ${PROCEDURE_LABELS[a.procedure] ?? a.procedure}`}
                          className={[
                            "w-full text-left rounded-lg border px-2 py-1 text-xs mb-0.5",
                            "transition-all hover:shadow-sm active:scale-95",
                            STATUS_COLORS[a.status] ?? "bg-gray-100 border-gray-200",
                          ].join(" ")}
                        >
                          <div className="font-semibold truncate">{a.patientName ?? "—"}</div>
                          <div className="truncate opacity-75 text-[10px]">
                            {PROCEDURE_LABELS[a.procedure] ?? a.procedure}
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
