import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";

type NavItem = { to: string; label: string; end?: boolean; icon: React.ReactNode };

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  DOCTOR: "Médico",
  USER: "Paciente",
};

function initials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Icons ──────────────────────────────────────────────────────────────────

const IconGrid = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);
const IconCalendar = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconUsers = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconDocument = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const IconHistory = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconUser = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconHome = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const NAV_LINKS: Record<string, NavItem[]> = {
  ADMIN: [
    { to: "/admin",                end: true, label: "Dashboard",           icon: IconGrid },
    { to: "/admin/appointments",              label: "Agendamentos",         icon: IconCalendar },
    { to: "/admin/patients",                  label: "Pacientes",            icon: IconUsers },
    { to: "/admin/anamnesis",                 label: "Anamneses",            icon: IconDocument },
    { to: "/admin/patient-history",           label: "Histórico",            icon: IconHistory },
    { to: "/admin/users",                     label: "Utilizadores",         icon: IconUser },
  ],
  DOCTOR: [
    { to: "/doctor/appointments",             label: "Meus Agendamentos",    icon: IconCalendar },
  ],
  USER: [
    { to: "/app",                  end: true, label: "Dashboard",            icon: IconHome },
    { to: "/app/appointments",                label: "Meus Agendamentos",    icon: IconCalendar },
  ],
};

type Props = { open?: boolean };

export default function Sidebar({ open = true }: Props) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const role = user?.role ?? "USER";
  const links = NAV_LINKS[role] ?? NAV_LINKS.USER;

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside
      className={`
        w-56 shrink-0 flex flex-col gap-0
        ${open ? "flex" : "hidden"} md:flex
      `}
    >
      {/* User card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-3.5 flex items-center gap-3 mb-2">
        <div className="h-9 w-9 shrink-0 rounded-full bg-gray-900 flex items-center justify-center text-xs font-semibold text-white select-none">
          {initials(user?.fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate leading-tight">
            {user?.fullName ?? "Utilizador"}
          </p>
          <span className="inline-flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-[11px] text-gray-400">{ROLE_LABELS[role] ?? role}</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="rounded-2xl border border-gray-200 bg-white shadow-sm p-2 flex-1">
        <div className="space-y-0.5">
          {links.map(({ to, label, end, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white font-medium"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? "text-white" : "text-gray-400"}>{icon}</span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="mt-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </button>
      </div>
    </aside>
  );
}
