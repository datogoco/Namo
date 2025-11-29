import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendTarget =
  process.env.VITE_BACKEND_URL || "http://localhost:5000";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "127.0.0.1",
    port: 5173,

    hmr: {
      host: "127.0.0.1",
      protocol: "ws",
      port: 5173,
      clientPort: 5173, // 🔥 CRITICAL FIX
    },

    proxy: {
      "/api": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/get-csrf-token": {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
});
