import axios from "axios";

const api = axios.create({
  baseURL: "/",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // JWT expired or invalid — clear local state and send to login
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
