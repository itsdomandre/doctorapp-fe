import { AppointmentStatus } from "@/types/appointment";

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, string> = {
    REQUESTED: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-200 text-gray-700",
    COMPLETED: "bg-blue-100 text-blue-800",
  };
  const label: Record<AppointmentStatus, string> = {
    REQUESTED: "Pendente",
    APPROVED: "Aprovado",
    REJECTED: "Rejeitado",
    CANCELLED: "Cancelado",
    COMPLETED: "Concluído",
  };
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${map[status]}`}>
      {label[status]}
    </span>
  );
}
