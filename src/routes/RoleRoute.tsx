import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/auth";

export default function RoleRoute({ allowed }) {
  const { user } = useAuth();
  if (!allowed.includes(user?.role)) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
}
