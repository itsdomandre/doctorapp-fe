import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { activateAccount } from "@/lib/api/auth";

type State = "loading" | "success" | "error";

function Brand() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-900 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      <span className="text-base font-semibold tracking-tight text-gray-900">DoctorApp</span>
    </div>
  );
}

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<State>("loading");
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">

        <Brand />

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-5">

          {state === "loading" && (
            <>
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-gray-900">A activar conta…</h1>
                <p className="text-sm text-gray-500 mt-2">Aguarde um momento.</p>
              </div>
            </>
          )}

          {state === "success" && (
            <>
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-gray-900">Conta activada!</h1>
                <p className="text-sm text-gray-500 mt-2">
                  A sua conta está pronta. Pode fazer login agora.
                </p>
              </div>
              <Link
                to="/login"
                className="block w-full rounded-xl bg-gray-900 text-white py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Ir para o login
              </Link>
            </>
          )}

          {state === "error" && (
            <>
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-gray-900">Link inválido ou expirado</h1>
                <p className="text-sm text-gray-500 mt-2">
                  O link de activação é inválido ou já foi utilizado.
                </p>
              </div>
              <div className="space-y-2">
                <Link
                  to="/resend-activation"
                  className="block w-full rounded-xl bg-gray-900 text-white py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Reenviar email de activação
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar ao login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
