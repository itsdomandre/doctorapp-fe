import { AppointmentStatus } from "@/types/appointment";

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, string> = {
    SOLICITADO: "bg-yellow-100 text-yellow-800",
    APROVADO: "bg-green-100 text-green-800",
    REJEITADO: "bg-red-100 text-red-800",
    CANCELADO: "bg-gray-200 text-gray-700",
    COMPLETO: "bg-green-100 text-green-600",
  };
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${map[status]}`}>
      {status}
    </span>
  );
}