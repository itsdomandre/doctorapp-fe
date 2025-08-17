import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/store/auth";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function Login() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError("");
    const errs: typeof fieldErrors = {};

    if (!email.trim()) errs.email = "Informe seu e-mail.";
    else if (!isValidEmail(email)) errs.email = "E-mail inválido.";

    if (!password) errs.password = "Informe sua senha.";

    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setLoading(true);
      await login({ email, password }); // mantém seu fluxo atual
      navigate("/app", { replace: true });
    } catch (err: any) {
      const status = err?.response?.status;
      const backendMsg = err?.response?.data?.message;

      if (status === 400 || status === 401) {
        // Mensagem estável para testes quando as credenciais são inválidas
        setGeneralError(
          typeof backendMsg === "string" && backendMsg.trim()
            ? backendMsg // use a mensagem do backend se já for a desejada
            : "E-mail ou senha inválidos."
        );
      } else {
        setGeneralError("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }

  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-10">
        {/* Marca / logo (opcional) */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white font-bold">
            DA
          </div>
          <h1 className="mt-3 text-2xl font-semibold">Welcome to DoctorApp</h1>
          <p className="text-sm text-gray-600 mt-1">Entre para continuar</p>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm p-5 sm:p-6">
          {generalError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate aria-busy={loading}>
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoComplete="email"
                className={[
                  "mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none",
                  fieldErrors.email ? "border-red-400 focus:ring-2 focus:ring-red-200" : "border-gray-300 focus:ring-2 focus:ring-gray-200",
                ].join(" ")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
              {fieldErrors.email && (
                <p id="email-error" className="mt-1 text-xs text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Senha */}
            <div className="mb-5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-700 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  className={[
                    "w-full rounded-xl border px-3 py-2 pr-10 text-sm outline-none",
                    fieldErrors.password ? "border-red-400 focus:ring-2 focus:ring-red-200" : "border-gray-300 focus:ring-2 focus:ring-gray-200",
                  ].join(" ")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute inset-y-0 right-0 mr-2 my-auto h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100"
                  aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                  tabIndex={0}
                >
                  {/* Ícone olho/olho-riscado sem libs */}
                  {showPwd ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l18 18M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.42M9.88 5.09A9.77 9.77 0 0 1 12 5c5.5 0 9.5 4.5 10 7- .17 .76 - .6 1.62 -1.3 2.48M6.7 6.7C4.39 8.17 3 10.13 3 12c.5 2.5 4.5 7 9 7 1.16 0 2.25-.2 3.25-.58" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="mt-1 text-xs text-red-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Ações */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>

            {/* Links inferiores */}
            <div className="mt-4 flex flex-col items-center gap-2 text-sm">
              <div className="text-gray-600">
                Não tem conta?{" "}
                <Link to="/register" className="text-blue-700 hover:underline">
                  Criar conta
                </Link>
              </div>
              <Link
                to="/forgot-password"
                className="text-blue-700 hover:underline"
              >
                Recuperar acesso
              </Link>
            </div>
          </form>
        </div>

        {/* Rodapé simples */}
        <p className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} DoctorApp
        </p>
      </div>
    </div>
  );
}
