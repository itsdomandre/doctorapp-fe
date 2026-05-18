import api from "@/lib/api";
import { useAuth, User } from "@/store/auth";

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("auth_token");
      useAuth.getState().setUser(null);
    }
    return Promise.reject(err);
  }
);

export async function bootstrapSession() {
  const { setUser, setLoading } = useAuth.getState();

  setLoading(true);
  try {
    const { data } = await api.get<User>("/api/auth/me", { timeout: 5000 });
    setUser(data);
  } catch {
    setUser(null);
  } finally {
    setLoading(false);
  }
}
