import { create } from "zustand";
import api from "@/lib/api";

type Role = "ADMIN" | "USER";

export type User = {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: Role;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (u) => set({ user: u }),

  initialize: async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const { data: me } = await api.get<User>("/api/auth/me");
      set({ user: me, loading: false });
    } catch {
      localStorage.removeItem("auth_token");
      set({ user: null, loading: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      /* ignore */
    } finally {
      localStorage.removeItem("auth_token");
      set({ user: null });
    }
  },
}));
