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
const ActivateAccount = lazy(() => import("@/pages/ActivateAccount"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const ResendActivation = lazy(() => import("@/pages/ResendActivation"));
const Register = lazy(() => import("@/pages/Register"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminAppointments = lazy(() => import("@/pages/admin/AdminAppointments"));
const AdminPatients = lazy(() => import("@/pages/admin/AdminPatients"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminCreateUser = lazy(() => import("@/pages/admin/AdminCreateUser"));
const AdminAnamnesis = lazy(() => import("@/pages/admin/AdminAnamnesis"));
const AdminPatientHistory = lazy(() => import("@/pages/admin/AdminPatientHistory"));
const AdminFinancialDashboard = lazy(() => import("@/pages/admin/AdminFinancialDashboard"));
const AdminReceivables = lazy(() => import("@/pages/admin/AdminReceivables"));
const AdminPayables = lazy(() => import("@/pages/admin/AdminPayables"));
const AdminProcedurePrices = lazy(() => import("@/pages/admin/AdminProcedurePrices"));
const DoctorAppointments = lazy(() => import("@/pages/doctor/DoctorAppointments"));
const DoctorAppointmentDetail = lazy(() => import("@/pages/doctor/DoctorAppointmentDetail"));
const UserDashboard = lazy(() => import("@/pages/user/UserDashboard"));
const MyAppointments = lazy(() => import("@/pages/user/MyAppointments"));
const NewAppointment = lazy(() => import("@/pages/user/NewAppointment"));
const MyAnamnesis = lazy(() => import("@/pages/user/MyAnamnesis"));

const withSuspense = (el: JSX.Element) => (
  <Suspense fallback={<div className="p-6">Carregando…</div>}>{el}</Suspense>
);

export const router = createBrowserRouter([
  // Rota raiz decide para onde levar
  { path: "/", element: withSuspense(<HomeRedirect />) },

  // Públicas
  { path: "/login", element: withSuspense(<Login />) },
  { path: "/register", element: withSuspense(<Register />) },
  { path: "/activate", element: withSuspense(<ActivateAccount />) },
  { path: "/forgot-password", element: withSuspense(<ForgotPassword />) },
  { path: "/reset-password", element: withSuspense(<ResetPassword />) },
  { path: "/resend-activation", element: withSuspense(<ResendActivation />) },
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
          {
            path: "/admin/anamnesis",
            element: withSuspense(
              <AppLayout>
                <AdminAnamnesis />
              </AppLayout>
            ),
          },
          {
            path: "/admin/patient-history",
            element: withSuspense(
              <AppLayout>
                <AdminPatientHistory />
              </AppLayout>
            ),
          },
          {
            path: "/admin/financial",
            element: withSuspense(
              <AppLayout>
                <AdminFinancialDashboard />
              </AppLayout>
            ),
          },
          {
            path: "/admin/financial/receivables",
            element: withSuspense(
              <AppLayout>
                <AdminReceivables />
              </AppLayout>
            ),
          },
          {
            path: "/admin/financial/payables",
            element: withSuspense(
              <AppLayout>
                <AdminPayables />
              </AppLayout>
            ),
          },
          {
            path: "/admin/financial/procedure-prices",
            element: withSuspense(
              <AppLayout>
                <AdminProcedurePrices />
              </AppLayout>
            ),
          },
        ],
      },
      // Área DOCTOR
      {
        element: <RoleRoute allowed={["DOCTOR"]} />,
        children: [
          {
            path: "/doctor/appointments",
            element: withSuspense(
              <AppLayout>
                <DoctorAppointments />
              </AppLayout>
            ),
          },
          {
            path: "/doctor/appointments/:id",
            element: withSuspense(
              <AppLayout>
                <DoctorAppointmentDetail />
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
          {
            path: "/app/appointments/:id/anamnesis",
            element: withSuspense(
              <AppLayout>
                <MyAnamnesis />
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
