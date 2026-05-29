import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/auth";

export default function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Carregando…</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "DOCTOR") return <Navigate to="/doctor/appointments" replace />;
  return <Navigate to="/app" replace />;
}
