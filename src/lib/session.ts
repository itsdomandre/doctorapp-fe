import { useAuth } from "@/store/auth";
import api from "@/lib/api";

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuth.getState().setUser(null);
    }
    return Promise.reject(err);
  }
);
