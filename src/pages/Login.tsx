import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth, User } from "@/store/auth";
import api from "@/lib/api";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe a senha"),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/api/auth/login", data);
      const { data: me } = await api.get<User>("/api/auth/me");
      setUser(me);
      navigate(me.role === "ADMIN" ? "/admin" : "/app", { replace: true });
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      const message = status === 401 ? "Credenciais inválidas" : "Erro ao fazer login";
      setError("root", { message });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-sm mx-auto mt-20 p-6 border rounded space-y-4 bg-white shadow"
    >
      <h1 className="text-xl font-semibold">Entrar</h1>

      <div>
        <label htmlFor="email" className="block text-sm">Email</label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="w-full border rounded px-3 py-2"
        />
        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm">Senha</label>
        <input
          id="password"
          type="password"
          {...register("password")}
          className="w-full border rounded px-3 py-2"
        />
        {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
      </div>

      {errors.root && <p className="text-red-600 text-sm">{errors.root.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Entrar
      </button>
    </form>
  );
}
