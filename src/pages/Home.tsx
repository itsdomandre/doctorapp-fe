export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Bem-vindo ao DoctorApp</h1>
      <p className="text-gray-600">Este é o teu painel. Vamos construir as seções passo a passo.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Consultas hoje</div>
          <div className="text-3xl font-bold mt-2">0</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Pacientes ativos</div>
          <div className="text-3xl font-bold mt-2">0</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Pendências</div>
          <div className="text-3xl font-bold mt-2">0</div>
        </div>
      </div>
    </div>
  );
}
