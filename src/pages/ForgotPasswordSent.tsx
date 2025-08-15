import { Link } from "react-router-dom";

export default function ForgotPasswordSent() {
  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded bg-white shadow text-center space-y-4">
      <h1 className="text-2xl font-semibold text-green-600">Verifique o seu email</h1>
      <p>
        Se o email existir, enviamos um link para redefinir a sua senha.
        Siga as instruções no email para continuar.
      </p>
      <Link
        to="/login"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Ir para Login
      </Link>
    </div>
  );
}
