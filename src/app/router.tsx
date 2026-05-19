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
const AdminAppointments = lazy(() => import("@/pages/admin/AdminAppointments"));
const AdminPatients = lazy(() => import("@/pages/admin/AdminPatients"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminCreateUser = lazy(() => import("@/pages/admin/AdminCreateUser"));
const UserDashboard = lazy(() => import("@/pages/user/UserDashboard"));
const MyAppointments = lazy(() => import("@/pages/user/MyAppointments"));
const NewAppointment = lazy(() => import("@/pages/user/NewAppointment"));

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
          {
            path: "/admin/appointments",
            element: withSuspense(
              <AppLayout>
                <AdminAppointments />
              </AppLayout>
            ),
          },
          {
            path: "/admin/patients",
            element: withSuspense(
              <AppLayout>
                <AdminPatients />
              </AppLayout>
            ),
          },
          {
            path: "/admin/users",
            element: withSuspense(
              <AppLayout>
                <AdminUsers />
              </AppLayout>
            ),
          },
          {
            path: "/admin/users/new",
            element: withSuspense(
              <AppLayout>
                <AdminCreateUser />
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
