import { create } from "zustand";
import api from "@/lib/api";

type Role = "ADMIN" | "USER" | "DOCTOR";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: string;
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
    try {
      const { data: me } = await api.get<User>("/api/auth/me");
      set({ user: me, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      /* ignore */
    } finally {
      set({ user: null });
    }
  },
}));
