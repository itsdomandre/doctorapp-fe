import { useAuth } from "@/store/auth";
import api from "@/lib/api";

// Intercept 401 responses globally — clear session and token
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
