import { Link } from "react-router-dom";

export default function RegisterSuccess() {
  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded bg-white shadow text-center space-y-4">
      <h1 className="text-2xl font-semibold text-green-600">Conta criada com sucesso!</h1>
      <p>
        Enviamos um email com um link de ativação para o endereço cadastrado.  
        Clique no link para ativar sua conta antes de fazer login.
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
