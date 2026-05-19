import api from "@/lib/api";

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  birthdate: string;
};

export async function register(input: RegisterInput): Promise<void> {
  await api.post("/api/auth/register", input);
}

export async function activateAccount(token: string): Promise<void> {
  await api.get("/api/auth/activate", { params: { token } });
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/api/auth/forgot-password", null, { params: { email } });
}

export async function resetPassword(token: string, newPassword: string, confirmNewPassword: string): Promise<void> {
  await api.post(
    "/api/auth/reset-password",
    { newPassword, confirmNewPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function resendActivation(email: string): Promise<void> {
  await api.post("/api/auth/resend-activation", null, { params: { email } });
}
