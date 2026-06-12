# 프론트엔드 (`www`) — LLM 코딩 지침

Vite + React UI. 개발·프리뷰 포트는 **3000 고정** ([`vite.config.ts`](vite.config.ts)).

공통 4원칙 전문 ---> [`../vault/CLAUDE.md`](../vault/CLAUDE.md)  
모노레포 지도 ---> [`../CLAUDE.md`](../CLAUDE.md)

---

## 실행

```powershell
cd www
npm install   # 최초 1회
npm run dev
```

- 브라우저: `http://localhost:3000` (또는 터미널에 표시된 Network URL)
- `ERR_CONNECTION_REFUSED`: dev 서버가 꺼진 상태 — 터미널을 켠 채 유지한다.

상세 ---> [`../DEV_SERVER.md`](../DEV_SERVER.md)

---

## API 프록시

[`vite.config.ts`](vite.config.ts) 가 아래를 백엔드(`VITE_API_PORT`, 기본 8000)로 프록시한다.

| 경로 | 용도 |
|------|------|
| `/titanic` | 타이타닉 API |
| `/chat`, `/signup`, `/ping`, `/weather` | 공통 API |

- 프론트 `fetch`는 **상대 경로** 우선: `fetch("/titanic/smith/chat", …)`.
- `VITE_API_BASE`는 LAN·정적 빌드에서만 필요 ([`.env.example`](.env.example)).

Docker: 브라우저는 **`localhost:3000`만** 호출하고, gateway가 백엔드로 넘긴다.

---

## 주요 페이지

| 경로 | 파일 |
|------|------|
| 레슨 셸 | [`src/pages/LessonLayout.tsx`](src/pages/LessonLayout.tsx) |
| 타이타닉 업로드 | [`src/pages/Titanic.tsx`](src/pages/Titanic.tsx) |
| 스미스 채팅 | [`src/pages/TitanicSmith.tsx`](src/pages/TitanicSmith.tsx) |
| 라우트 | [`src/App.tsx`](src/App.tsx) |

---

## React 규칙 (정본)

폼·상태·보안 UX ---> [`../vault/DevOps/Frontend/REACT_RULES.md`](../vault/DevOps/Frontend/REACT_RULES.md)

요약:

- 관련 필드는 **단일 객체 state** 또는 제출 시 **`FormData`**.
- 비밀번호·PII를 `alert` / `console.log`에 넣지 않는다.
- 요청 범위 밖 UI 리팩터·포맷 정리 금지.

---

## Docker

```powershell
cd ..
docker compose up --build -d
```

프론트 이미지는 `npm run build` 후 `vite preview` (포트 3000, 컨테이너 내부).
