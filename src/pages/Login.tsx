import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    try {
      // 1. Login (salva cookie)
      await api.post("/api/auth/login", { email, password });

      // 2. Buscar dados do usuário
      const { data: me } = await api.get("/api/auth/me");

      // 3. Guardar no contexto global
      setUser(me);

      // 4. Redirecionar pelo papel
      if (me.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Credenciais inválidas");
      } else {
        setError("Erro ao fazer login");
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-20 p-6 border rounded space-y-4 bg-white shadow"
    >
      <h1 className="text-xl font-semibold">Welcome to DoctorApp</h1>

      <div>
        <label className="block text-sm">Email</label>
        <input
          type="email"
          name="email"
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm">Senha</label>
        <input
          type="password"
          name="password"
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Entrar
      </button>

      <p className="text-sm text-center">
        Não tem conta?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          Criar conta
        </Link>
      </p>
      <p className="text-sm text-center">
        Esqueceu a sua senha?{" "}
        <Link to="/forgot-password" className="text-blue-600 hover:underline">
          Recuperar acesso
        </Link>
      </p>
    </form>
  );
}
