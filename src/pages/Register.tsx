import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";

type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  birthdate: string; // yyyy-MM-dd
};

export default function Register() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload: RegisterPayload = {
      firstName: String(fd.get("firstName") || "").trim(),
      lastName: String(fd.get("lastName") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      password: String(fd.get("password") || ""),
      phoneNumber: String(fd.get("phoneNumber") || "").trim(),
      birthdate: String(fd.get("birthdate") || ""),
    };
    const confirmPassword = String(fd.get("confirmPassword") || "");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(payload.email)) {
      setError("Endereço de e-mail inválido.");
      return;
    }

    if (payload.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (payload.password !== confirmPassword) {
      setError("A confirmação de senha não confere.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/auth/register", payload);
      navigate("/register-success", { replace: true });
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data ||
        null;
      if (backendMsg) setError(String(backendMsg));
      else if (err?.response?.status === 409) setError("Email já cadastrado.");
      else setError("Erro ao registrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-16 p-6 border rounded bg-white shadow space-y-4"
    >
      <h1 className="text-2xl font-semibold">Criar conta</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">Nome</label>
          <input name="firstName" className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm">Sobrenome</label>
          <input name="lastName" className="w-full border rounded px-3 py-2" required />
        </div>
      </div>

      <div>
        <label className="block text-sm">Email</label>
        <input type="email" name="email" className="w-full border rounded px-3 py-2" required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">Senha</label>
          <input type="password" name="password" className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm">Confirmar senha</label>
          <input type="password" name="confirmPassword" className="w-full border rounded px-3 py-2" required />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">Telefone</label>
          <input name="phoneNumber" className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm">Data de nascimento</label>
          <input type="date" name="birthdate" className="w-full border rounded px-3 py-2" required />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? "Enviando..." : "Criar conta"}
      </button>

      <p className="text-sm text-center">
        Já tem conta?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
