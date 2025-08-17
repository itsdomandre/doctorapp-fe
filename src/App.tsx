// src/App.tsx
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { useAuth } from "@/store/auth";

export default function App() {
  const initSession = useAuth((s) => s.initSession);
  useEffect(() => { initSession(); }, [initSession]);
  return <RouterProvider router={router} />;
}
