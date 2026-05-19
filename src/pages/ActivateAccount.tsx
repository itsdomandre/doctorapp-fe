import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { activateAccount } from "@/lib/api/auth";

type State = "loading" | "success" | "error";

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState("error");
      return;
    }
    activateAccount(token)
      .then(() => setState("success"))
      .catch(() => setState("error"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border shadow-sm p-8 text-center space-y-4">
        {state === "loading" && (
          <>
            <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin mx-auto" />
            <p className="text-sm text-gray-500">A activar a sua conta…</p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold">Conta activada!</h1>
            <p className="text-sm text-gray-500">A sua conta está pronta. Pode fazer login agora.</p>
            <Link
              to="/login"
              className="block w-full rounded-xl bg-gray-900 text-white py-2 text-sm hover:bg-gray-700 transition"
            >
              Ir para o login
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold">Link inválido ou expirado</h1>
            <p className="text-sm text-gray-500">O link de activação é inválido ou já foi utilizado.</p>
            <Link
              to="/resend-activation"
              className="block w-full rounded-xl bg-gray-900 text-white py-2 text-sm hover:bg-gray-700 transition"
            >
              Reenviar email de activação
            </Link>
            <Link to="/login" className="block text-sm text-gray-500 hover:underline">
              Voltar ao login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
