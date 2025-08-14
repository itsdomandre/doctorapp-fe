import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/auth";

export default function ProtectedRoute() {
  const loading = useAuth((s) => s.loading);
  const user = useAuth((s) => s.user);

  if (loading) return <div className="p-6">Carregando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
