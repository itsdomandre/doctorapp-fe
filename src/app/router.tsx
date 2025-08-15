// src/router.tsx
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


const withSuspense = (el: React.ReactElement) => (
  <Suspense fallback={<div className="p-6">Carregando…</div>}>{el}</Suspense>
);


export const router = createBrowserRouter([
  // Rota raiz decide para onde levar
  { path: "/", element: withSuspense(<HomeRedirect />) },

  // Públicas
  { path: "/login", element: withSuspense(<Login />) },
  { path: "/register", element: withSuspense(<Register />) },
  { path: "/register-success", element: <RegisterSuccess /> },
  { path: "/403", element: withSuspense(<Forbidden />) },
  
  // Recuperação de senha
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/forgot-password/sent", element: <ForgotPasswordSent /> },

  // Aceita tanto /reset-password/:token quanto /reset-password?token=...
  { path: "/reset-password/:token", element: <ResetPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },

  { path: "/403", element: withSuspense(<Forbidden />) },

  { path: "*", element: withSuspense(<NotFound />) },

  // Protegidas
  {
    element: <ProtectedRoute />,
    children: [
      // Área ADMIN
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
      // Área USER (USER e ADMIN)
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
        ],
      },
    ],
  },

  // Catch-all
  { path: "*", element: withSuspense(<NotFound />) },
]);
