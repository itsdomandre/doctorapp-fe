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

  // 1) string direta (enum serializado como texto)
  if (typeof p === "string" && p.trim()) return p;

  // 2) número (ordinal do enum) -> tenta resolver pela posição das chaves
  if (typeof p === "number" && Number.isInteger(p)) {
    const keys = Object.keys(PROCEDURE_LABEL); // ["AVALIACAO_CLINICA", ...]
    return keys[p] ?? String(p);
  }

  // 3) objeto (Jackson com enum em OBJETO)
  if (p && typeof p === "object") {
    // cobre formatos comuns: { label, name, value, key, code, id, type }
    // prioriza 'label' se existir
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

  // 4) nomes alternativos usados por alguns DTOs
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

// resolve o label final (usa mapa oficial; senão humaniza)
function resolveProcedureLabel(raw: unknown): string {
  const s = String(raw ?? "").trim();
  if (!s) return "Procedimento";

  // já é um label oficial?
  const officialLabels = Object.values(PROCEDURE_LABEL) as string[];
  if (officialLabels.includes(s)) return s;

  // é a CHAVE do enum? (ex.: "AVALIACAO_CLINICA")
  // @ts-ignore
  if (PROCEDURE_LABEL[s]) {
    // @ts-ignore
    return PROCEDURE_LABEL[s];
  }

  // fallback: humaniza "AVALIACAO_CLINICA" -> "Avaliacao clinica"
  return s
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ⚠️ teu DTO envia 'dateTime'
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

        // ordena por data; sem data vai ao fim
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
      <div className="p-6 max-w-4xl space-y-3">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
          <div className="h-8 w-28 rounded bg-gray-200 animate-pulse" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Meus agendamentos</h1>
        <Link
          to="/app/appointments/new"
          className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-4 py-2 text-sm hover:opacity-90"
        >
          <span className="text-base">＋</span>
          Novo
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border p-6 text-center">
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
              <li key={a.id} className="border rounded-2xl p-4">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : (a.id as any))}
                  className="w-full text-left flex items-center justify-between gap-3"
                >
                  <span className="font-medium">{procLabel}</span>
                  <span className="text-xs text-gray-500">{isOpen ? "Fechar" : "Ver detalhes"}</span>
                </button>

                {isOpen && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        <div>
                          <span className="font-medium">Quando:</span> {day} às {time}
                        </div>
                        {a.notes && (
                          <div className="mt-1">
                            <span className="font-medium">Observações:</span> {a.notes}
                          </div>
                        )}
                      </div>
                      <StatusBadge status={(a as any).status} />
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
