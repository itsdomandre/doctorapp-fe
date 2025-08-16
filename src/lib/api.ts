import axios, { AxiosHeaders } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  withCredentials: true,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Garante uma instância 'AxiosHeaders' mesmo que viesse um objeto plain
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  config.headers = headers;

  // (opcional) log de debug
  const full = `${config.baseURL ?? ""}${config.url ?? ""}`;
  console.debug("[API] ->", config.method?.toUpperCase(), full, { params: config.params });

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const { config, response } = err || {};
    const full = `${config?.baseURL ?? ""}${config?.url ?? ""}`;
    console.error("[API] x", config?.method?.toUpperCase(), full, "=>", response?.status, response?.data);
    return Promise.reject(err);
  }
);

export default api;
