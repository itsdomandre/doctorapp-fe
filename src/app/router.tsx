import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/routes/ProtectedRoute";
import RoleRoute from "@/routes/RoleRoute";
import HomeRedirect from "@/routes/HomeRedirect";
import AppLayout from "@/layouts/AppLayout";

import RegisterSuccess from "@/pages/RegisterSuccess";
import ForgotPassword from "@/pages/ForgotPassword";
import ForgotPasswordSent from "@/pages/ForgotPasswordSent";
import ResetPassword from "@/pages/ResetPassword";

const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Forbidden = lazy(() => import("@/pages/Forbidden"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const UserDashboard = lazy(() => import("@/pages/user/UserDashboard"));
const NewAppointment = lazy(() => import("@/pages/user/NewAppointment"));
const MyAppointments = lazy(() => import("@/pages/user/MyAppointments"));

const withSuspense = (el: React.ReactElement) => (
  <Suspense fallback={<div className="p-6">Carregando…</div>}>{el}</Suspense>
);

export const router = createBrowserRouter([
  { path: "/", element: withSuspense(<HomeRedirect />) },

  // Públicas
  { path: "/login", element: withSuspense(<Login />) },
  { path: "/register", element: withSuspense(<Register />) },
  { path: "/register-success", element: <RegisterSuccess /> },
  { path: "/403", element: withSuspense(<Forbidden />) },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/forgot-password/sent", element: <ForgotPasswordSent /> },
  { path: "/reset-password/:token", element: <ResetPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },

  // Protegidas
  {
    element: <ProtectedRoute />,
    children: [
      // ADMIN
      {
        element: <RoleRoute allowed={["ADMIN"]} />,
        children: [
          {
            path: "/admin",
            element: withSuspense(
              <AppLayout>
                <AdminDashboard />
              </AppLayout>
            ),
          },
        ],
      },

      // USER (USER e ADMIN)
      {
        element: <RoleRoute allowed={["USER", "ADMIN"]} />,
        children: [
          {
            path: "/app",
            element: withSuspense(
              <AppLayout>
                <UserDashboard />
              </AppLayout>
            ),
          },
          {
            path: "/app/appointments",
            element: withSuspense(
              <AppLayout>
                <MyAppointments />
              </AppLayout>
            ),
          },
          {
            path: "/app/appointments/new",
            element: withSuspense(
              <AppLayout>
                <NewAppointment />
              </AppLayout>
            ),
          },
        ],
      },
    ],
  },

  // Catch-all
  { path: "*", element: withSuspense(<NotFound />) },
]);
