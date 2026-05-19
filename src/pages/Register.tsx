import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { register } from "@/lib/api/auth";

const schema = z
  .object({
    firstName: z.string().min(1, "Obrigatório"),
    lastName: z.string().min(1, "Obrigatório"),
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Deve conter pelo menos uma maiúscula")
      .regex(/[^a-zA-Z0-9]/, "Deve conter pelo menos um carácter especial"),
    confirmPassword: z.string().min(1, "Confirme a senha"),
    phoneNumber: z.string().min(1, "Obrigatório"),
    birthdate: z.string().min(1, "Obrigatório"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function Register() {
  const [done, setDone] = useState(false);

  const {
    register: reg,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        birthdate: data.birthdate,
      });
      setDone(true);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setError("email", { message: "Este email já está registado." });
      } else {
        setError("root", { message: "Erro ao criar conta. Tente novamente." });
      }
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border shadow-sm p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold">Verifique o seu email</h1>
          <p className="text-sm text-gray-500">
            Enviámos um link de activação para o seu email. Clique no link para activar a sua conta.
          </p>
          <Link
            to="/login"
            className="block w-full rounded-xl bg-gray-900 text-white py-2 text-sm hover:bg-gray-700 transition"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border shadow-sm p-8 space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Criar conta</h1>
          <p className="text-sm text-gray-500 mt-1">Preencha os dados para se registar.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Primeiro nome" error={errors.firstName?.message}>
              <input {...reg("firstName")} className={inputCls} />
            </Field>
            <Field label="Último nome" error={errors.lastName?.message}>
              <input {...reg("lastName")} className={inputCls} />
            </Field>
          </div>

          <Field label="Email" error={errors.email?.message}>
            <input type="email" {...reg("email")} className={inputCls} placeholder="email@exemplo.com" />
          </Field>

          <Field label="Telefone" error={errors.phoneNumber?.message}>
            <input {...reg("phoneNumber")} className={inputCls} placeholder="+351 912 345 678" />
          </Field>

          <Field label="Data de nascimento" error={errors.birthdate?.message}>
            <input type="date" {...reg("birthdate")} className={inputCls} />
          </Field>

          <Field label="Senha" error={errors.password?.message}>
            <input type="password" {...reg("password")} className={inputCls} />
          </Field>

          <Field label="Confirmar senha" error={errors.confirmPassword?.message}>
            <input type="password" {...reg("confirmPassword")} className={inputCls} />
          </Field>

          {errors.root && (
            <p className="text-sm text-red-600">{errors.root.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gray-900 text-white py-2 text-sm hover:bg-gray-700 disabled:opacity-50 transition"
          >
            {isSubmitting ? "A registar…" : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Já tem conta?{" "}
          <Link to="/login" className="underline hover:text-gray-800">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
