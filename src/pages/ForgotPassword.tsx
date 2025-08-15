// src/pages/ForgotPassword.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();

    if (!email) {
      setError("Informe o email.");
      return;
    }

    setSubmitting(true);
    try {
      // Backend espera @RequestParam String email
      await api.post("/api/auth/forgot-password", null, { params: { email } });
      navigate("/forgot-password/sent", { replace: true });
    } catch (err: any) {
      // Mantemos mensagem genérica por segurança
      navigate("/forgot-password/sent", { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-16 p-6 border rounded bg-white shadow space-y-4"
    >
      <h1 className="text-2xl font-semibold">Recuperar senha</h1>
      <p className="text-sm text-gray-600">
        Informe o seu email para receber um link de redefinição de senha.
      </p>

      <div>
        <label className="block text-sm">Email</label>
        <input
          type="email"
          name="email"
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? "A enviar..." : "Enviar link"}
      </button>

      <p className="text-sm text-center">
        <Link to="/login" className="text-blue-600 hover:underline">
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}
