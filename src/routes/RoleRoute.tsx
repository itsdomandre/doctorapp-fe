import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/auth";

export default function RoleRoute({ allowed }: { allowed: ("USER" | "ADMIN")[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.role as "USER" | "ADMIN")) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
}
