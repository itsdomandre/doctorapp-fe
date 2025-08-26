import { useEffect } from "react";
import { useAuth } from "@/store/auth";

export default function Boot() {
  const initSession = useAuth((s) => s.initSession);
  useEffect(() => { void initSession(); }, [initSession]);
  return null;
}
