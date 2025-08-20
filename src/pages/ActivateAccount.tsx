// src/pages/ActivateAccount.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "@/lib/api";

export default function ActivateAccount() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();

  const ran = useRef(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token ausente ou inválido.");
        return;
      }
      try {
        await api.post("/api/auth/activate", null, { params: { token } });
        setStatus("ok");
        setMessage("Conta ativada com sucesso! Redirecionando...");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      } catch (e: any) {
        setStatus("error");
        setMessage(
          e?.response?.data?.message ??
            "Não foi possível ativar sua conta. O token pode ter expirado."
        );
      }
    })();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm text-center">
        <h1 className="text-xl font-semibold mb-2">Ativação de Conta</h1>

        {status === "idle" && <p className="text-gray-600">Validando token…</p>}

        {status === "ok" && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-green-700">
            {message}
          </div>
        )}

        {status === "error" && (
          <>
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700">
              {message}
            </div>
            <Link
              to="/login"
              className="mt-4 inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm hover:bg-gray-100"
            >
              Ir para o Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
