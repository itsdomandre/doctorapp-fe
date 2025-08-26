import { useEffect, useState } from "react";
import api from "@/lib/api";

type UserDTO = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
};

type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // índice da página (0-based)
};

export default function Patients() {
  const [data, setData] = useState<Page<UserDTO> | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await api.get<Page<UserDTO>>("/api/users/all-patients", {
          params: { page, size },
          signal: ctrl.signal,
        });
        setData(res.data);
      } catch (e: any) {
        if (e.name !== "CanceledError") {
          setErr(e?.response?.data?.message || "Erro ao carregar pacientes");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => ctrl.abort();
  }, [page, size]);

  const rows = data?.content ?? [];
  const canPrev = page > 0;
  const canNext = data ? page + 1 < data.totalPages : false;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Pacientes</h1>
        <select
          className="border rounded px-2 py-2"
          value={size}
          onChange={(e) => { setPage(0); setSize(Number(e.target.value)); }}
        >
          {[10, 20, 50].map(n => <option key={n} value={n}>{n}/página</option>)}
        </select>
      </div>

      {loading && <p>Carregando...</p>}
      {err && <p className="text-red-600">{err}</p>}
      {!loading && rows.length === 0 && <p>Nenhum paciente encontrado.</p>}

      {rows.length > 0 && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">E-mail</th>
                <th className="text-left p-3">Telefone</th>

              </tr>
            </thead>
            <tbody>
              {rows.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.fullName}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.phoneNumber ?? "-"}</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Página {(data?.number ?? 0) + 1} de {data?.totalPages ?? 1} — {data?.totalElements ?? 0} registos
        </p>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 border rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={!canPrev}
          >
            Anterior
          </button>
          <button
            className="px-3 py-2 border rounded disabled:opacity-50"
            onClick={() => setPage(p => p + 1)}
            disabled={!canNext}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
