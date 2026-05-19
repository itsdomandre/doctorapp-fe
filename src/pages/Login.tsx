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
      navigate(me.role === "ADMIN" ? "/admin" : "/app", { replace: true });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        setError("root", {
          message: "Conta não activada. Verifique o seu email.",
        });
      } else {
        setError("root", { message: "Credenciais inválidas" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border shadow-sm p-8 space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Entrar</h1>
          <p className="text-sm text-gray-500 mt-1">Bem-vindo de volta.</p>
        </div>

        {resetSuccess && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Senha redefinida com sucesso. Pode fazer login agora.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register("email")}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="email@exemplo.com"
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Senha</label>
              <Link to="/forgot-password" className="text-xs text-gray-500 hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              type="password"
              {...register("password")}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
          </div>

          {errors.root && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {errors.root.message}
              {errors.root.message?.includes("activada") && (
                <Link to="/resend-activation" className="block mt-1 underline text-xs">
                  Reenviar email de activação
                </Link>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gray-900 text-white py-2 text-sm hover:bg-gray-700 disabled:opacity-50 transition"
          >
            {isSubmitting ? "A entrar…" : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Não tem conta?{" "}
          <Link to="/register" className="underline hover:text-gray-800">
            Registar
          </Link>
        </p>
      </div>
    </div>
  );
}
