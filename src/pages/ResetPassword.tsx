// src/pages/ResetPassword.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "@/lib/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token: tokenFromPath } = useParams();
  const [search] = useSearchParams();
  const token = useMemo(
    () => tokenFromPath || search.get("token") || "",
    [tokenFromPath, search]
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const newPassword = String(fd.get("newPassword") || "");
    const confirmNewPassword = String(fd.get("confirmNewPassword") || "");

    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("A confirmação de senha não confere.");
      return;
    }
    if (!token) {
      setError("Token inválido ou ausente.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(
        "/api/auth/reset-password",
        { newPassword, confirmNewPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOk(true);
      // opcional: navegar direto para login
      // navigate("/login", { replace: true });
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data ||
        "Não foi possível redefinir a senha. O link pode ter expirado.";
      setError(String(backendMsg));
    } finally {
      setSubmitting(false);
    }
  }

  if (ok) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 border rounded bg-white shadow text-center space-y-4">
        <h1 className="text-2xl font-semibold text-green-600">Senha alterada!</h1>
        <p>Pode iniciar sessão com a sua nova senha.</p>
        <Link
          to="/login"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Ir para Login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-16 p-6 border rounded bg-white shadow space-y-4"
    >
      <h1 className="text-2xl font-semibold">Redefinir senha</h1>

      <div>
        <label className="block text-sm">Nova senha</label>
        <input type="password" name="newPassword" className="w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <label className="block text-sm">Confirmar nova senha</label>
        <input type="password" name="confirmNewPassword" className="w-full border rounded px-3 py-2" required />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? "A alterar..." : "Alterar senha"}
      </button>

      <p className="text-sm text-center">
        <Link to="/login" className="text-blue-600 hover:underline">
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}
