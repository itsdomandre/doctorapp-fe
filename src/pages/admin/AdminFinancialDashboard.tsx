import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchFinancialSummary } from "@/lib/api/financial";

function fmt(value: number | undefined) {
  if (value === undefined || value === null) return "…";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function AdminFinancialDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["financial", "summary"],
    queryFn: fetchFinancialSummary,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Financeiro</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral das contas a receber e a pagar.</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="A receber (pendente)"
          value={isLoading ? undefined : data?.totalReceivablePending}
          valueClass="text-yellow-600"
          sub={`${data?.pendingReceivablesCount ?? "…"} lançamentos`}
          to="/admin/financial/receivables"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          label="Recebido (pago)"
          value={isLoading ? undefined : data?.totalReceivablePaid}
          valueClass="text-green-600"
          sub={`Mês atual: ${fmt(data?.receivablePaidThisMonth)}`}
          to="/admin/financial/receivables"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          label="A pagar (pendente)"
          value={isLoading ? undefined : data?.totalPayablePending}
          valueClass="text-red-600"
          sub={`${data?.pendingPayablesCount ?? "…"} lançamentos`}
          to="/admin/financial/payables"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          }
        />
        <KpiCard
          label="Saldo líquido"
          value={isLoading ? undefined : data?.netBalance}
          valueClass={
            data?.netBalance !== undefined
              ? data.netBalance >= 0
                ? "text-blue-600"
                : "text-red-600"
              : "text-gray-700"
          }
          sub="Recebido − Pago"
          to="/admin/financial/receivables"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickLink to="/admin/financial/receivables" label="Contas a receber" description="Ver e registar pagamentos de consultas" />
        <QuickLink to="/admin/financial/payables" label="Contas a pagar" description="Gerir despesas e pagamentos a fornecedores" />
        <QuickLink to="/admin/financial/procedure-prices" label="Preços de procedimentos" description="Definir o valor de cada tipo de procedimento" />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  valueClass,
  sub,
  to,
  icon,
}: {
  label: string;
  value: number | undefined;
  valueClass: string;
  sub: string;
  to: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 flex flex-col gap-2 hover:bg-gray-50/60 transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 border border-gray-100">{icon}</div>
      </div>
      <span className={`text-2xl font-bold tracking-tight ${valueClass}`}>
        {value === undefined ? "…" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)}
      </span>
      <span className="text-xs text-gray-400">{sub}</span>
    </Link>
  );
}

function QuickLink({ to, label, description }: { to: string; label: string; description: string }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 flex flex-col gap-1 hover:bg-gray-50/60 transition-colors"
    >
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <span className="text-xs text-gray-400">{description}</span>
    </Link>
  );
}
