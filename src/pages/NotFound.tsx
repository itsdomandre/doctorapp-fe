export default function NotFound() {
  return (
    <div className="min-h-dvh grid place-items-center">
      <div className="text-center space-y-2">
        <div className="text-3xl font-bold">404</div>
        <div>Página não encontrada.</div>
        <a href="/" className="underline">Voltar ao início</a>
      </div>
    </div>
  );
}
