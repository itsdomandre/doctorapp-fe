import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminCreateUser, type AdminCreateUserInput, type Role } from "@/lib/api/users";

const initialForm: AdminCreateUserInput = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phoneNumber: "",
  birthdate: "",
  role: "USER",
};

export default function AdminCreateUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState<AdminCreateUserInput>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminCreateUser(form);
      navigate("/admin/users");
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors?.[0] ??
        err?.response?.data ??
        "Erro ao criar utilizador.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-semibold mb-1">Criar Utilizador</h1>
      <p className="text-gray-500 text-sm mb-6">A conta é criada como activa — sem verificação de email.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primeiro nome" name="firstName" value={form.firstName} onChange={handleChange} />
          <Field label="Último nome" name="lastName" value={form.lastName} onChange={handleChange} />
        </div>
        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} />
        <Field label="Telefone" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
        <Field label="Data de nascimento" name="birthdate" type="date" value={form.birthdate} onChange={handleChange} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="USER">USER — Paciente</option>
            <option value="ADMIN">ADMIN — Administrador</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gray-900 text-white px-5 py-2 text-sm hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "A criar…" : "Criar utilizador"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border px-5 py-2 text-sm hover:bg-gray-100"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
};

function Field({ label, name, value, onChange, type = "text" }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
      />
    </div>
  );
}
