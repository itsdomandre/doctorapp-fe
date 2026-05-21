import { useAuth } from "@/store/auth";
import api from "@/lib/api";

// Shared promise so multiple simultaneous 401s only trigger one session check
let sessionCheckInFlight: Promise<void> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status !== 401) return Promise.reject(err);

    const url: string = err.config?.url ?? "";

    // A 401 from the session check itself is definitive — log out immediately
    if (url.includes("/api/auth/me")) {
      useAuth.getState().setUser(null);
      return Promise.reject(err);
    }

    // For data endpoints, verify the session before logging out.
    // This prevents false logouts when the backend returns 401 for a missing
    // or misconfigured endpoint while the user's session is still valid.
    if (!sessionCheckInFlight) {
      sessionCheckInFlight = api
        .get("/api/auth/me")
        .then(() => {
          // Session still valid — the 401 came from a data endpoint, not expiry
        })
        .catch(() => {
          useAuth.getState().setUser(null);
        })
        .finally(() => {
          sessionCheckInFlight = null;
        });
    }

    return Promise.reject(err);
  }
);
