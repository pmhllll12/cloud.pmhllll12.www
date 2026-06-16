import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, loadEnv, type ProxyOptions } from "vite";
import react from "@vitejs/plugin-react";

/** `vite.config.ts` 가 있는 폴더 = 프론트 루트 (실행 cwd 와 무관하게 index.html 위치 고정) */
const FRONTEND_ROOT = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, FRONTEND_ROOT, "");

  /** 개발·프리뷰 UI 포트 — 항상 3000 (5173 미사용). `PORT` / `VITE_DEV_PORT` 는 무시 */
  const DEV_PORT = 3000;

  /** 백엔드 API 포트 — backend/apps 의 API_PORT 와 동일하게 */
  const API_PORT = Number(env.VITE_API_PORT || 8000);

  /** 루프백만 쓰려면 `VITE_DEV_LOCALHOST=1` (기본은 모든 인터페이스 — 폰 LAN 접속용) */
  const LOCALHOST_ONLY =
    env.VITE_DEV_LOCALHOST === "1" || env.VITE_DEV_LOCALHOST === "true";
  const serverHost = LOCALHOST_ONLY ? "localhost" : true;

  const API_ORIGIN = `http://127.0.0.1:${API_PORT}`;

  /** 백엔드가 DB 초기화 등으로 느릴 때 프록시가 너무 빨리 끊기지 않도록 */
  const apiDevProxy = {
    target: API_ORIGIN,
    changeOrigin: true,
    proxyTimeout: 120_000,
  } satisfies ProxyOptions;

  const proxy: Record<string, string | ProxyOptions> = {
    "/chat": { ...apiDevProxy },
    "/weather": { ...apiDevProxy },
    "/signup": { ...apiDevProxy },
    "/ping": { ...apiDevProxy },
    "/api": { ...apiDevProxy },
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
      /** 포트 충돌 시 즉시 실패해 원인 파악이 쉬움 */
      strictPort: true,
      host: serverHost,
      proxy,
    },
    preview: {
      port: DEV_PORT,
      strictPort: true,
      host: serverHost,
      proxy,
    },
  };
});
