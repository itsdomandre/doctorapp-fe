import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-dvh grid place-items-center">
      <div className="text-center space-y-2">
        <div className="text-3xl font-bold">404</div>
        <div>Página não encontrada.</div>
        <Link to="/" className="underline">Voltar ao início</Link>
      </div>
    </div>
  );
}
