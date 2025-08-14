import api from "@/lib/api";
import { useAuth, User } from "@/store/auth";

export async function bootstrapSession() {
  const { setUser, setLoading } = useAuth.getState();

  setLoading(true);
  try {
    const { data } = await api.get<User>("/api/auth/me");
    setUser(data);
  } catch {
    setUser(null);
  } finally {
    setLoading(false);
  }
}
