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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-900 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight text-gray-900">DoctorApp</span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-5">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-gray-900">Verifique o seu email</h1>
              <p className="text-sm text-gray-500 mt-2">
                Enviámos um link de activação. Clique no link para activar a sua conta e começar a usar o DoctorApp.
              </p>
            </div>
            <Link
              to="/login"
              className="block w-full rounded-xl bg-gray-900 text-white py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Ir para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">

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
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Criar conta</h1>
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
              <input type="email" {...reg("email")} placeholder="email@exemplo.com" className={inputCls} />
            </Field>

            <Field label="Telefone" error={errors.phoneNumber?.message}>
              <input {...reg("phoneNumber")} placeholder="+55 11 91234-5678" className={inputCls} />
            </Field>

            <Field label="Data de nascimento" error={errors.birthdate?.message}>
              <input type="date" {...reg("birthdate")} className={inputCls} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Senha" error={errors.password?.message}>
                <input type="password" {...reg("password")} className={inputCls} />
              </Field>
              <Field label="Confirmar senha" error={errors.confirmPassword?.message}>
                <input type="password" {...reg("confirmPassword")} className={inputCls} />
              </Field>
            </div>

            <p className="text-xs text-gray-400">
              A senha deve ter no mínimo 8 caracteres, uma maiúscula e um carácter especial.
            </p>

            {errors.root && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.root.message}
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
                  Criando conta…
                </>
              ) : "Criar conta"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Já tem conta?{" "}
            <Link to="/login" className="font-medium text-gray-900 hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white";

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
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
