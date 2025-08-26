import { useAuth } from "@/store/auth";
export async function bootstrapSession() {
  await useAuth.getState().initSession();
}
