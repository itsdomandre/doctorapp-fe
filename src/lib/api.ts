import axios from "axios";
import { useAuth } from "@/store/auth";

const api = axios.create({
  baseURL: "/",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      useAuth.getState().setUser(null);
    }
    return Promise.reject(err);
  }
);

export default api;
