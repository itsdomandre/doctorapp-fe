import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div className="min-h-dvh grid place-items-center">
      <div className="text-center space-y-2">
        <div className="text-3xl font-bold">403</div>
        <div>Sem permissão para acessar este conteúdo.</div>
        <Link to="/" className="underline">Voltar</Link>
      </div>
    </div>
  );
}
