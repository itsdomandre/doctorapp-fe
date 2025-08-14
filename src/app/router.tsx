// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/routes/ProtectedRoute";
import RoleRoute from "@/routes/RoleRoute";
import HomeRedirect from "@/routes/HomeRedirect";
import AppLayout from "@/layouts/AppLayout";

const Login = lazy(() => import("@/pages/Login"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Forbidden = lazy(() => import("@/pages/Forbidden"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const UserDashboard = lazy(() => import("@/pages/user/UserDashboard"));

const withSuspense = (el: JSX.Element) => (
  <Suspense fallback={<div className="p-6">Carregando…</div>}>{el}</Suspense>
);

export const router = createBrowserRouter([
  // Rota raiz decide para onde levar
  { path: "/", element: withSuspense(<HomeRedirect />) },

  // Públicas
  { path: "/login", element: withSuspense(<Login />) },
  { path: "/403", element: withSuspense(<Forbidden />) },

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
