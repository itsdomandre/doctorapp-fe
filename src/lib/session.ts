// src/lib/session.ts
import api from "@/lib/api";
import { useAuth, User } from "@/store/auth";

const TOKEN_KEY = "token";

export async function bootstrapSession() {
  const { setUser, setLoading } = useAuth.getState();

  setLoading(true);
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      return;
    }
    const { data } = await api.get<User>("/api/auth/me");
    setUser(data);
  } catch {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  } finally {
    setLoading(false);
  }
}
