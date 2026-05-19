import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/lib/api/auth";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Deve conter pelo menos uma maiúscula")
      .regex(/[^a-zA-Z0-9]/, "Deve conter pelo menos um carácter especial"),
    confirmNewPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "As senhas não coincidem",
    path: ["confirmNewPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border shadow-sm p-8 text-center space-y-4">
          <h1 className="text-lg font-semibold">Link inválido</h1>
          <p className="text-sm text-gray-500">Este link não é válido. Solicite um novo.</p>
          <Link
            to="/forgot-password"
            className="block w-full rounded-xl bg-gray-900 text-white py-2 text-sm hover:bg-gray-700 transition"
          >
            Recuperar senha
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      await resetPassword(token, data.newPassword, data.confirmNewPassword);
      navigate("/login?reset=success", { replace: true });
    } catch (err: any) {
      setError("root", { message: "Link inválido, expirado ou já utilizado. Solicite um novo." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border shadow-sm p-8 space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Nova senha</h1>
          <p className="text-sm text-gray-500 mt-1">Escolha uma nova senha para a sua conta.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Nova senha</label>
            <input
              type="password"
              {...register("newPassword")}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            {errors.newPassword && <p className="text-xs text-red-600">{errors.newPassword.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Confirmar nova senha</label>
            <input
              type="password"
              {...register("confirmNewPassword")}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            {errors.confirmNewPassword && (
              <p className="text-xs text-red-600">{errors.confirmNewPassword.message}</p>
            )}
          </div>

          {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gray-900 text-white py-2 text-sm hover:bg-gray-700 disabled:opacity-50 transition"
          >
            {isSubmitting ? "A guardar…" : "Definir nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
