import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth, type User } from "@/store/auth";
import api from "@/lib/api";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe a senha"),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const resetSuccess = searchParams.get("reset") === "success";

  useEffect(() => {
    if (resetSuccess) {
      const t = setTimeout(() => {}, 0);
      return () => clearTimeout(t);
    }
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/api/auth/login", data);
      const { data: me } = await api.get<User>("/api/auth/me");
      setUser(me);
      const dest = me.role === "ADMIN" ? "/admin" : me.role === "DOCTOR" ? "/doctor/appointments" : "/app";
      navigate(dest, { replace: true });
    } catch (err: any) {
      const status = err?.response?.status;
      const body: string = err?.response?.data ?? "";
      if (status === 403 && body.toLowerCase().includes("not verified")) {
        setError("root", { message: "Conta não activada. Verifique o seu email." });
      } else if (status === 401) {
        setError("root", { message: "Credenciais inválidas." });
      } else {
        setError("root", { message: "Não foi possível entrar. Tente novamente." });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">

        {/* Brand */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-900 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight text-gray-900">DoctorApp</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Bem-vindo de volta</h1>
            <p className="text-sm text-gray-500 mt-1">Entre com as suas credenciais para continuar.</p>
          </div>

          {resetSuccess && (
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Senha redefinida com sucesso. Pode fazer login agora.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                {...register("email")}
                placeholder="email@exemplo.com"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Senha</label>
                <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
              <input
                type="password"
                {...register("password")}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              />
              {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
            </div>

            {errors.root && (
              <div className="flex flex-col gap-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errors.root.message}
                </div>
                {errors.root.message?.includes("activada") && (
                  <Link to="/resend-activation" className="ml-6 text-xs underline text-red-600 hover:text-red-800">
                    Reenviar email de activação
                  </Link>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Entrando…
                </>
              ) : "Entrar"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Não tem conta?{" "}
            <Link to="/register" className="font-medium text-gray-900 hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
