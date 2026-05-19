import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/store/auth";

const qc = new QueryClient();

function AppInitializer() {
  const initialize = useAuth((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AppInitializer />
    </QueryClientProvider>
  );
}
