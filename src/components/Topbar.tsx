import { useAuth } from "@/store/auth";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function initials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  DOCTOR: "Médico",
  USER: "Paciente",
};

type Props = { onToggleSidebar: () => void };

export default function Topbar({ onToggleSidebar }: Props) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="container-app h-14 flex items-center justify-between gap-4">

        {/* Left: hamburger (mobile) + brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            aria-label="Abrir menu"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-900 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-gray-900">DoctorApp</span>
          </div>
        </div>

        {/* Right: user avatar dropdown */}
        <div className="relative" ref={menuRef}>
          {user ? (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 rounded-xl pl-1 pr-3 py-1 hover:bg-gray-100 transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-gray-900 flex items-center justify-center text-[11px] font-semibold text-white select-none shrink-0">
                {initials(user.fullName)}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[140px] truncate">
                {user.fullName}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : null}

          {menuOpen && user && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 bg-white shadow-lg p-1.5">
              {/* User info */}
              <div className="px-3 py-2.5 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center text-xs font-semibold text-white select-none shrink-0">
                  {initials(user.fullName)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate leading-tight">{user.fullName}</p>
                  <p className="text-[11px] text-gray-400 truncate">{ROLE_LABELS[user.role ?? ""] ?? user.role}</p>
                </div>
              </div>

              <div className="h-px bg-gray-100 my-1" />

              <button
                onClick={async () => {
                  setMenuOpen(false);
                  await logout();
                  navigate("/login", { replace: true });
                }}
                className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
