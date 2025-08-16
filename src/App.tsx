// src/App.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router"; // <- usa o router certo

export default function App() {
  return <RouterProvider router={router} />;
}
