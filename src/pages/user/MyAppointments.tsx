// src/pages/user/MyAppointments.tsx
import { useEffect, useState } from "react";
import { fetchMyAppointments } from "@/lib/appointment";
import type { AppointmentDTO } from "@/types/appointment";
import StatusBadge from "@/components/StatusBadge";
import { Link, useNavigate } from "react-router-dom";
import { PROCEDURE_LABEL } from "@/types/appointment";

type AnyDate =
  | string
  | number[]
  | { year: number; month: number; day: number; hour?: number; minute?: number; second?: number }
  | null
  | undefined;

/* ---------------- Date helpers ---------------- */
function toDate(raw: AnyDate): Date | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    const n = raw.includes("T") ? raw : raw.replace(" ", "T");
    const d = new Date(n);
    return isNaN(d.getTime()) ? null : d;
  }
  if (Array.isArray(raw)) {
    const [y, m, d, hh = 0, mm = 0, ss = 0] = raw;
    if (typeof y === "number" && typeof m === "number" && typeof d === "number") {
      return new Date(y, m - 1, d, hh, mm, ss);
    }
    return null;
  }
  if (typeof raw === "object" && "year" in raw && "month" in raw && "day" in raw) {
    const { year, month, day, hour = 0, minute = 0, second = 0 } = raw as any;
    return new Date(year, month - 1, day, hour, minute, second);
  }
  return null;
}

function formatDayTime(raw: AnyDate) {
  const d = toDate(raw);
  if (!d) return { day: "—", time: "—" };
  return {
    day: d.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" }),
    time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false }),
  };
}

/* ---------------- Procedure helpers ---------------- */
function pickProcedureRaw(a: any) {
  const p = a?.procedure;
  if (typeof p === "string" && p.trim()) return p;
  if (typeof p === "number" && Number.isInteger(p)) {
    const keys = Object.keys(PROCEDURE_LABEL);
    return keys[p] ?? String(p);
  }
  if (p && typeof p === "object") {
    return (
      (p as any).label ??
      (p as any).name ??
      (p as any).value ??
      (p as any).key ??
      (p as any).code ??
      (p as any).id ??
      (p as any).type ??
      null
    );
  }
  return (
    a?.procedureLabel ??
    a?.procedure_label ??
    a?.procedureName ??
    a?.procedure_name ??
    a?.type ??
    a?.procedureType ??
    null
  );
}

function resolveProcedureLabel(raw: unknown): string {
  const s = String(raw ?? "").trim();
  if (!s) return "Procedimento";
  const officialLabels = Object.values(PROCEDURE_LABEL) as string[];
  if (officialLabels.includes(s)) return s;
  // @ts-ignore
  if (PROCEDURE_LABEL[s]) {
    // @ts-ignore
    return PROCEDURE_LABEL[s];
  }
  return s.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function pickDateRaw(a: any): AnyDate {
  return a?.dateTime ?? a?.appointmentDate ?? a?.appointment_date ?? a?.datetime ?? a?.date_time ?? null;
}

/* ---------------- Component ---------------- */
export default function MyAppointments() {
  const [items, setItems] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMyAppointments();
        (data as any[]).sort((a, b) => {
          const da = toDate(pickDateRaw(a))?.getTime() ?? Number.POSITIVE_INFINITY;
          const db = toDate(pickDateRaw(b))?.getTime() ?? Number.POSITIVE_INFINITY;
          return da - db;
        });
        setItems(data as any);
      } catch (e: any) {
        if (e?.response?.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        setError(e?.response?.data?.message ?? "Não foi possível carregar seus agendamentos.");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) {
    return (
      <div className="px-2 sm:px-0 py-6 mx-auto w-full max-w-3xl space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-1">
          <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
          <div className="h-8 w-28 rounded bg-gray-200 animate-pulse" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) return <div className="px-2 sm:px-0 py-6 mx-auto w-full max-w-3xl text-red-600">{error}</div>;

  return (
    <div className="px-2 sm:px-0 py-6 mx-auto w-full max-w-3xl">
      {/* Header da página responsivo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold">Meus agendamentos</h1>
        <Link
          to="/app/appointments/new"
          className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-4 py-2 text-sm hover:opacity-90 self-start sm:self-auto"
        >
          <span className="text-base">＋</span>
          <span className="sm:whitespace-nowrap">Novo</span>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border bg-white p-4 sm:p-6 text-center">
          <p className="text-gray-600 mb-4">Você ainda não possui agendamentos.</p>
          <button
            onClick={() => navigate("/app/appointments/new")}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-100"
          >
            Agendar agora
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {(items as any[]).map((a) => {
            const procLabel = resolveProcedureLabel(pickProcedureRaw(a));
            const { day, time } = formatDayTime(pickDateRaw(a));
            const isOpen = openId === a.id;

            return (
              <li key={a.id} className="border rounded-2xl bg-white p-4 sm:p-5">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : (a.id as any))}
                  className="w-full text-left flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium">{procLabel}</span>
                  <span className="text-xs text-gray-500 self-start sm:self-auto">
                    {isOpen ? "Fechar" : "Ver detalhes"}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="text-sm text-gray-700">
                        <div>
                          <span className="font-medium">Quando:</span> {day} às {time}
                        </div>
                        {a.notes && (
                          <div className="mt-1 break-words">
                            <span className="font-medium">Observações:</span> {a.notes}
                          </div>
                        )}
                      </div>
                      <div className="self-start sm:self-auto">
                        <StatusBadge status={(a as any).status} />
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
