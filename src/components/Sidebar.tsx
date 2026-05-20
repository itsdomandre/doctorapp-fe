// src/components/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";

type Props = { open?: boolean };
const linkBase = "block rounded-xl px-3 py-2 text-sm hover:bg-gray-100 transition";
const linkActive = "bg-gray-100 font-medium";

export default function Sidebar({ open = true }: Props) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const role = user?.role ?? "USER";

  const initials = (name?: string) => (name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "U");

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className={`p-4 ${open ? "block" : "hidden"} md:block`}>
      {/* Card do usuário */}
      <div className="rounded-2xl border bg-white shadow-sm p-4 flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
          {initials(user?.fullName)}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{user?.fullName ?? "Utilizador"}</div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-700 mt-1">
            {role}
          </span>
        </div>
      </div>

      {/* Links */}
      <nav className="space-y-1">
        {role === "ADMIN" ? (
          <>
            <NavLink to="/admin" end className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/appointments" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}>
              Agendamentos
            </NavLink>
            <NavLink to="/admin/patients" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}>
              Pacientes
            </NavLink>
            <NavLink to="/admin/anamnesis" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}>
              Anamneses
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}>
              Utilizadores
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/app" end className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}>
              Dashboard
            </NavLink>
            <NavLink to="/app/appointments" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}>
              Meus Agendamentos
            </NavLink>
          </>
        )}
      </nav>

      <hr className="my-4 border-gray-200" />

      <button onClick={handleLogout} className="w-full rounded-xl border px-3 py-2 text-sm hover:bg-gray-100">
        Sair
      </button>
    </aside>
  );
}
