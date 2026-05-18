import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/auth";

export default function RoleRoute({ allowed }: { allowed: Array<"ADMIN" | "USER"> }) {
  const { user } = useAuth();
  if (!user?.role || !allowed.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
}
