import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, type ProxyOptions } from "vite";
import react from "@vitejs/plugin-react";

/** `vite.config.ts` 가 있는 폴더 = 프론트 루트 (실행 cwd 와 무관하게 index.html 위치 고정) */
const FRONTEND_ROOT = path.dirname(fileURLToPath(import.meta.url));

/** 개발 UI 포트 — v0 환경에서는 5173 사용 */
const DEV_PORT = Number(process.env.VITE_DEV_PORT || 5173);

/** 백엔드 API 포트 — backend/apps 의 API_PORT 와 동일하게 */
const API_PORT = Number(process.env.VITE_API_PORT || 8000);

const API_ORIGIN = `http://127.0.0.1:${API_PORT}`;

/** 백엔드가 DB 초기화 등으로 느릴 때 프록시가 너무 빨리 끊기지 않도록 */
const apiDevProxy = {
  target: API_ORIGIN,
  changeOrigin: true,
  proxyTimeout: 120_000,
} satisfies ProxyOptions;

export default defineConfig(() => {
  const proxy: Record<string, string | ProxyOptions> = {
    "/chat": { ...apiDevProxy },
    "/weather": { ...apiDevProxy },
    "/signup": { ...apiDevProxy },
    "/ping": { ...apiDevProxy },
    "/titanic": { ...apiDevProxy },
    "/db-check": { ...apiDevProxy },
    "/google-gemini": {
      target: "https://generativelanguage.googleapis.com",
      changeOrigin: true,
      rewrite: (pathname) => pathname.replace(/^\/google-gemini/, ""),
    },
  };

  return {
    root: FRONTEND_ROOT,
    plugins: [react()],
    server: {
      port: DEV_PORT,
      /** 3000 사용 중이면 두 번째 dev 서버가 3001 로 떠서 프록시·탭이 엇갈리는 일을 막음 */
      strictPort: true,
      /** 폰·태블릿에서 `http://<PC_LAN_IP>:3000` 으로 접속해 테스트할 때 필요 (localhost 는 기기 자신) */
      host: true,
      proxy,
    },
    preview: {
      port: DEV_PORT,
      strictPort: true,
      host: true,
      proxy,
    },
  };
});
