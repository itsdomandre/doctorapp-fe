// src/app/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/routes/ProtectedRoute";
import RoleRoute from "@/routes/RoleRoute";
import HomeRedirect from "@/routes/HomeRedirect";
import AppShell from "@/components/AppShell";

import RegisterSuccess from "@/pages/RegisterSuccess";
import ForgotPassword from "@/pages/ForgotPassword";
import ForgotPasswordSent from "@/pages/ForgotPasswordSent";
import ResetPassword from "@/pages/ResetPassword";
import ActivateAccount from "@/pages/ActivateAccount";
import MyAppointments from "@/pages/user/MyAppointments";
import Patients from "@/pages/admin/Patients";
import Appointments from "@/pages/admin/Appointments";


const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Forbidden = lazy(() => import("@/pages/Forbidden"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const UserDashboard = lazy(() => import("@/pages/user/UserDashboard"));
const NewAppointment = lazy(() => import("@/pages/user/NewAppointment"));

const withSuspense = (el: React.ReactElement) => (
  <Suspense fallback={<div className="p-6">Carregando…</div>}>{el}</Suspense>
);

// helper para envolver páginas protegidas no shell responsivo
const wrapShell = (el: React.ReactElement) => withSuspense(<AppShell>{el}</AppShell>);

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
  { path: "/activate", element: <ActivateAccount /> },

  // Protegidas
  {
    element: <ProtectedRoute />,
    children: [
      // ADMIN
      {
        element: <RoleRoute allowed={["ADMIN"]} />,
        children: [
          { path: "/admin", element: wrapShell(<AdminDashboard />) },
          { path: "/admin/patients", element: wrapShell(<Patients />) },
          { path: "/admin/appointments", element: wrapShell(<Appointments />) },
        ],
      },

      // USER (USER e ADMIN)
      {
        element: <RoleRoute allowed={["USER", "ADMIN"]} />,
        children: [
          { path: "/app", element: wrapShell(<UserDashboard />) },
          { path: "/app/appointments", element: wrapShell(<MyAppointments />) },
          { path: "/app/appointments/new", element: wrapShell(<NewAppointment />) },
        ],
      },
    ],
  },

  // Catch-all
  { path: "*", element: withSuspense(<NotFound />) },
]);
