import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/auth";

export default function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Carregando…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={user.role === "ADMIN" ? "/admin" : "/app"} replace />;
}
