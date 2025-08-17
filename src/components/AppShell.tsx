// src/components/AppShell.tsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // trava o scroll do body quando o drawer está aberto
  useEffect(() => {
    const original = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [open]);

  // fecha ao mudar de rota (clicou em um link do menu)
  useEffect(() => {
    if (open) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // fecha com ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden rounded-xl p-2 border"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
            >
              ☰
            </button>
            <span className="font-semibold">DoctorApp</span>
          </div>
        </div>
      </header>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-3 border-b flex items-center justify-between">
              <span className="font-medium">Menu</span>
              <button
                className="rounded-xl p-2 border hover:bg-gray-50 active:scale-[0.98] transition"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
              >
                {/* X icon (SVG) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6l12 12M6 18L18 6"/>
                </svg>
              </button>
            </div>
            <div className="h-[calc(100%-56px)] overflow-y-auto p-4">
              {/* onNavigate fecha o drawer ao clicar num link */}
              <Sidebar open onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Corpo */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          <aside className="hidden md:block w-64 shrink-0">
            <Sidebar open />
          </aside>
          <main className="flex-1 w-full overflow-hidden">{children}</main>
        </div>
      </div>
    </div>
  );
}
