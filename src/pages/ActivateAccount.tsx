import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";

export default function ActivateAccount() {
  const [search] = useSearchParams();
  const token = search.get("token");
  const [status, setStatus] = useState<"idle"|"ok"|"error">("idle");
  const [message, setMessage] = useState<string>("Ativando sua conta...");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!token) {
        setStatus("error");
        setMessage("Token ausente ou inválido.");
        return;
      }
      try {
        await api.post(`/api/auth/activate?token=${encodeURIComponent(token)}`);
        if (!cancelled) {
          setStatus("ok");
          setMessage("Conta ativada com sucesso!");
          setTimeout(() => navigate("/login", { replace: true }), 2500);
        }
      } catch (e: any) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            e?.response?.data?.message ??
            "Não foi possível ativar sua conta. O token pode ter expirado."
          );
        }
      }
    }

    run();
    return () => { cancelled = true; };
  }, [token, navigate]);

  return (
    <div className="max-w-md mx-auto mt-24 bg-white rounded-2xl border shadow p-6 text-center space-y-4">
      <h1 className="text-xl font-semibold">Ativação de Conta</h1>
      <p className={status === "error" ? "text-red-600" : "text-gray-700"}>
        {message}
      </p>

      {status === "ok" && (
        <Link
          to="/login"
          className="inline-block rounded-xl border px-4 py-2 hover:bg-gray-100"
        >
          Ir para o Login
        </Link>
      )}

      {status === "error" && (
        <div className="space-x-2">
          <Link
            to="/login"
            className="inline-block rounded-xl border px-4 py-2 hover:bg-gray-100"
          >
            Ir para o Login
          </Link>
        </div>
      )}
    </div>
  );
}
