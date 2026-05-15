import { defineConfig, type ProxyOptions } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const proxy: Record<string, string | ProxyOptions> = {
    "/chat": {
      target: "http://127.0.0.1:8000",
      changeOrigin: true,
    },
    "/weather": {
      target: "http://127.0.0.1:8000",
      changeOrigin: true,
    },
    "/google-gemini": {
      target: "https://generativelanguage.googleapis.com",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/google-gemini/, ""),
    },
  };

  return {
    plugins: [react()],
    server: {
      port: 3000,
      strictPort: false,
      proxy,
    },
    preview: {
      port: 3000,
      strictPort: false,
      proxy,
    },
  };
});
