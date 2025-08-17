// src/components/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";

type Props = { open?: boolean; onNavigate?: () => void };
const linkBase = "block rounded-xl px-3 py-2 text-sm hover:bg-gray-100 transition";
const linkActive = "bg-gray-100 font-medium";

export default function Sidebar({ open = true, onNavigate }: Props) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const role = (user?.role || "USER") as "ADMIN" | "USER";

  const initials = (email?: string) =>
    (email ? email.split("@")[0].slice(0, 2).toUpperCase() : "U");

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
    onNavigate?.();
  }

  return (
    <aside className={`p-2 sm:p-4 ${open ? "block" : "hidden"}`}>
      <div className="rounded-2xl border bg-white shadow-sm p-4 flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
          {initials(user?.email)}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium break-words">{user?.email ?? "Usuário"}</div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-700 mt-1">
            {role}
          </span>
        </div>
      </div>

      <nav className="space-y-1">
        {role === "ADMIN" ? (
          <>
            <NavLink
              to="/admin"
              end
              onClick={onNavigate}
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/appointments"
              onClick={onNavigate}
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}
            >
              Appointments
            </NavLink>
            <NavLink
              to="/admin/patients"
              onClick={onNavigate}
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}
            >
              Pacientes
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/app"
              end
              onClick={onNavigate}
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/app/appointments"
              onClick={onNavigate}
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}
            >
              Meus Appointments
            </NavLink>
          </>
        )}
      </nav>

      <hr className="my-4 border-gray-200" />
      <button
        onClick={handleLogout}
        className="w-full rounded-xl border px-3 py-2 text-sm hover:bg-gray-100"
      >
        Sair
      </button>
    </aside>
  );
}
