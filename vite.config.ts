import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: { "@": resolve(__dirname, "src") },
    },
    server: {
      port: 5173,
      strictPort: false,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: env.VITE_API_TARGET ?? "http://192.9.200.99:8080",
          changeOrigin: true,
        },
      },
    },
  };
});
