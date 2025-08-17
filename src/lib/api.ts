// src/lib/api.ts
import axios, { AxiosHeaders } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  withCredentials: true, // permite cookie HttpOnly
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // garante AxiosHeaders
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  config.headers = headers;

  // (opcional) log
  const full = `${config.baseURL ?? ""}${config.url ?? ""}`;
  console.debug("[API] ->", config.method?.toUpperCase(), full, { params: config.params });

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const { config, response } = err || {};
    const isMe = config?.url?.includes("/api/auth/me");
    const hasToken = !!localStorage.getItem("token");

    // não poluir console com 401 esperado do /me sem token
    if (!(isMe && !hasToken && response?.status === 401)) {
      const full = `${config?.baseURL ?? ""}${config?.url ?? ""}`;
      console.error(
        "[API] x",
        config?.method?.toUpperCase(),
        full,
        "=>",
        response?.status,
        response?.data
      );
    }
    return Promise.reject(err);
  }
);

export default api;
