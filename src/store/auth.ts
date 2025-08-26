// src/store/auth.ts
import { create } from "zustand";
import api from "@/lib/api";

type Role = "ADMIN" | "USER" | string;
export type User = { id: string; firstName?: string; lastName?: string; email: string; role?: Role; };

type AuthState = {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  setLoading: (v: boolean) => void;
  initSession: () => Promise<void>;
  fetchMe: () => Promise<void>;
  login: (cred: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const TOKEN_KEY = "token";
const isProtectedPath = (p: string) => p.startsWith("/app") || p.startsWith("/admin");

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  setUser: (u) => set({ user: u }),
  setLoading: (v) => set({ loading: v }),

  /** Inicializa sessão: 
   * - Se houver token: chama /me
   * - Se NÃO houver token mas está em rota protegida: tenta /me (cookie HttpOnly)
   * - Caso contrário: só marca loading=false
   */
 initSession: async () => {
  set({ loading: true });
  try {
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    const path = window.location.pathname;

    if (hasToken || isProtectedPath(path)) {
      const { data } = await api.get("/api/auth/me");
      set({ user: data, loading: false });
    } else {
      set({ user: null, loading: false });
    }
  } catch (e: any) {
    const status = e?.response?.status;
    // Só zera token se for rejeição explícita do backend
    if (status === 401 || status === 403) {
      localStorage.removeItem(TOKEN_KEY);
    }
    set({ user: null, loading: false });
  }
},
  fetchMe: async () => {
  try {
    const { data } = await api.get("/api/auth/me");
    set({ user: data });
  } catch (e: any) {
    const status = e?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem(TOKEN_KEY);
    }
    set({ user: null });
  }
},

  /** Login: guarda token se existir e SEMPRE tenta sincronizar o usuário */
  login: async ({ email, password }) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    const token = data?.token ?? data?.accessToken ?? data?.jwt;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    // independente de token, tenta buscar o usuário (suporta cookie HttpOnly)
    await get().fetchMe();
    set({ loading: false });
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {}
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null });
  },
}));
