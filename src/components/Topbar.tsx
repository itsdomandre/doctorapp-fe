import { useAuth } from "@/store/auth";
import { useState } from "react";

type Props = { onToggleSidebar: () => void };

export default function Topbar({ onToggleSidebar }: Props) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="container-app h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle menu"
            className="inline-flex items-center justify-center rounded-xl border px-3 py-2 md:hidden"
          >
            ☰
          </button>
          <span className="font-semibold">DoctorApp</span>
        </div>
        <div className="relative">
          {user ? (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-xl border px-3 py-2"
            >
              {user.firstName ?? "User"}
            </button>
          ) : (
            <a href="/login" className="rounded-xl border px-3 py-2">
              Entrar
            </a>
          )}
          {menuOpen && user && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow p-2">
              <a href="/" className="block px-3 py-2 rounded hover:bg-gray-50">
                Dashboard
              </a>
              <button
                onClick={() => logout()}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-50"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
