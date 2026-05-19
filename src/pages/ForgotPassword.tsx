import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPassword } from "@/lib/api/auth";

const schema = z.object({
  email: z.string().email("Email inválido"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await forgotPassword(data.email).catch(() => {});
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border shadow-sm p-8 space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Recuperar senha</h1>
          <p className="text-sm text-gray-500 mt-1">
            Insira o seu email e enviaremos um link de recuperação.
          </p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              Se o email existir na nossa plataforma, receberá um link em breve.
            </p>
            <Link to="/login" className="block text-sm text-gray-500 hover:underline">
              Voltar ao login
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gray-900 text-white py-2 text-sm hover:bg-gray-700 disabled:opacity-50 transition"
            >
              {isSubmitting ? "A enviar…" : "Enviar link de recuperação"}
            </button>

            <Link to="/login" className="block text-center text-sm text-gray-500 hover:underline">
              Voltar ao login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
