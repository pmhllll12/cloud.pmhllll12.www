import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import "./LoginModal.css";

export type AuthModalVariant = "login" | "signup";

type LoginModalProps = {
  open: boolean;
  variant: AuthModalVariant;
  onClose: () => void;
  onSuccess: (email: string) => void;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_ID_RE = /^[a-zA-Z0-9_]{2,64}$/;
const PHONE_RE = /^01[0-9][0-9]{7,8}$/;
const MIN_PASSWORD = 6;

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** 회원가입 API — dev 는 Vite 프록시 /signup → backend (기본 포트 8000). */
function getApiBase(): string {
  const base = import.meta.env.VITE_API_BASE?.trim();
  if (base) return base.replace(/\/$/, "");
  return "";
}

function getSignupUrl(): string {
  const base = getApiBase();
  if (base) {
    if (base.endsWith("/signup")) return base;
    return `${base}/signup`;
  }
  return "/signup";
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => window.setTimeout(r, ms));
}

async function ensureApiReachable(): Promise<string | null> {
  const pingUrl = getApiBase() ? `${getApiBase()}/ping` : "/ping";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(pingUrl, { method: "GET" });
      if (res.ok) return null;
      if (res.status >= 500 && attempt === 0) {
        await sleep(400);
        continue;
      }
      return `API 응답 오류 (${res.status}). backend\\apps 에서 python main.py 상태를 확인하세요.`;
    } catch {
      if (attempt === 0) {
        await sleep(400);
        continue;
      }
      return (
        "백엔드 API(8000)에 연결할 수 없습니다.\n" +
        "1) backend\\apps 에서 python main.py 실행\n" +
        "2) 터미널에 'Application startup complete' 확인\n" +
        "3) frontend 에서 npm run dev 실행 후 다시 시도\n" +
        "4) Windows 에서 UVICORN_RELOAD=1 이면 저장할 때마다 API 가 잠깐 끊길 수 있음"
      );
    }
  }
  return null;
}

function logSignupPayload(phase: string, values: Record<string, unknown>): void {
  console.log(`[회원가입] ${phase}`, values);
}

/** 콘솔 로그용 — 비밀번호 필드 마스킹 */
function redactSignupForLog(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...body };
  if ("password" in out) out.password = "[redacted]";
  if ("password_confirm" in out) out.password_confirm = "[redacted]";
  return out;
}

function parseHttpError(status: number, raw: string): string {
  if (!raw.trim()) {
    if (status === 409) return "이미 사용 중인 아이디 또는 이메일입니다.";
    if (status === 400) return "입력값이 올바르지 않거나 중복된 정보입니다.";
    if (status === 422) return "입력 형식이 올바르지 않습니다.";
    if (status === 503) return "데이터베이스에 연결할 수 없습니다. API 서버를 확인하세요.";
    if (status === 404) {
      return "회원가입 API를 찾을 수 없습니다. backend/apps 에서 python main.py 를 실행하세요.";
    }
    if (status === 502 || status === 503) {
      return (
        "백엔드 API가 꺼져 있거나 재시작 중입니다 (502).\n" +
        "backend\\apps 에서 python main.py 를 다시 실행하고 " +
        "'Application startup complete' 가 보인 뒤 회원가입하세요."
      );
    }
    return `서버 오류 (${status}). API(8000)가 실행 중인지 확인하세요.`;
  }
  try {
    const j = JSON.parse(raw) as { detail?: unknown; message?: string };
    const d = j.detail ?? j.message;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) {
      const parts = d
        .map((x) => {
          if (typeof x === "object" && x !== null && "msg" in x) {
            return String((x as { msg?: string }).msg ?? "");
          }
          return typeof x === "string" ? x : "";
        })
        .filter(Boolean);
      if (parts.length) return parts.join(", ");
    }
  } catch {
    /* ignore */
  }
  return raw.trim().slice(0, 300);
}

type LoginModalFormState = {
  userId: string;
  email: string;
  nickname: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  error: string | null;
  submitting: boolean;
};

function createInitialFormState(): LoginModalFormState {
  return {
    userId: "",
    email: "",
    nickname: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    error: null,
    submitting: false,
  };
}

/** FormData → 문자열 맵 (체크박스 등 File 제외 시) */
function formDataToStringRecord(fd: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

export default function LoginModal({
  open,
  variant,
  onClose,
  onSuccess,
}: LoginModalProps) {
  const titleId = useId();
  const userIdRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<LoginModalFormState>(createInitialFormState);

  const patch = useCallback((p: Partial<LoginModalFormState>) => {
    setState((prev) => ({ ...prev, ...p }));
  }, []);

  useEffect(() => {
    if (!open) return;
    setState(createInitialFormState());
    const t = window.setTimeout(() => {
      if (variant === "signup") userIdRef.current?.focus();
      else emailRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(t);
  }, [open, variant]);

  const handleBackdropMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formProps = formDataToStringRecord(formData);

    void (async () => {
      const notify = (msg: string) => {
        patch({ error: msg });
      };

      patch({ error: null });

      const emailRaw = formProps.email ?? "";
      const password = formProps.password ?? "";
      const passwordConfirm = formProps.passwordConfirm ?? "";
      const userIdRaw = formProps.userId ?? "";
      const nicknameRaw = formProps.nickname ?? "";
      const phoneRaw = formProps.phone ?? "";

      const trimmed = emailRaw.trim();

      if (!trimmed) {
        notify("이메일 주소를 입력해 주세요.");
        return;
      }
      if (!EMAIL_RE.test(trimmed)) {
        notify("올바른 이메일 형식이 아닙니다.");
        return;
      }
      if (!password) {
        notify("비밀번호를 입력해 주세요.");
        return;
      }

      if (variant === "signup") {
        const trimmedUserId = userIdRaw.trim();
        const trimmedNickname = nicknameRaw.trim();
        const phoneDigits = normalizePhone(phoneRaw);

        if (!trimmedUserId) {
          notify("아이디를 입력해 주세요.");
          return;
        }
        if (!USER_ID_RE.test(trimmedUserId)) {
          notify("아이디는 영문·숫자·밑줄(_) 2자 이상으로 입력해 주세요.");
          return;
        }
        if (!trimmedNickname) {
          notify("닉네임을 입력해 주세요.");
          return;
        }
        if (!phoneDigits) {
          notify("휴대전화 번호를 입력해 주세요.");
          return;
        }
        if (!PHONE_RE.test(phoneDigits)) {
          notify("휴대전화 번호 형식이 올바르지 않습니다. (예: 01012345678)");
          return;
        }
        if (password.length < MIN_PASSWORD) {
          notify(`비밀번호는 ${MIN_PASSWORD}자 이상 입력해 주세요.`);
          return;
        }
        if (password !== passwordConfirm) {
          notify("비밀번호가 일치하지 않습니다.");
          return;
        }

        const signupBody = {
          user_id: trimmedUserId,
          email: trimmed,
          nickname: trimmedNickname,
          phone: phoneDigits,
          password,
          password_confirm: passwordConfirm,
        };
        const signupUrl = getSignupUrl();

        patch({ submitting: true });
        try {
          const apiErr = await ensureApiReachable();
          if (apiErr) {
            notify(apiErr);
            return;
          }

          logSignupPayload("API 전송", {
            url: signupUrl,
            body: redactSignupForLog(signupBody),
          });
          const res = await fetch(signupUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(signupBody),
          });
          const raw = await res.text();
          logSignupPayload("API 응답", { status: res.status, body: raw });
          if (!res.ok) {
            notify(parseHttpError(res.status, raw));
            return;
          }
          try {
            JSON.parse(raw);
          } catch {
            notify("회원가입은 성공했으나 서버 응답을 읽지 못했습니다.");
            return;
          }
          onSuccess(trimmed);
          setState(createInitialFormState());
          onClose();
        } catch (err) {
          console.error("[회원가입] API 실패", err);
          const unreachable = await ensureApiReachable();
          notify(
            unreachable ??
              "서버에 연결할 수 없습니다. backend/apps 에서 python main.py 와 frontend 에서 npm run dev 가 모두 실행 중인지 확인하세요.",
          );
        } finally {
          patch({ submitting: false });
        }
        return;
      }

      patch({ submitting: true });
      window.setTimeout(() => {
        patch({ submitting: false });
        onSuccess(trimmed);
        setState(createInitialFormState());
        onClose();
      }, 400);
    })();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const isSignup = variant === "signup";
  const title = isSignup ? "회원가입" : "로그인";
  const subtitle = isSignup
    ? "아이디, 이메일, 닉네임, 휴대전화와 비밀번호로 가입합니다."
    : "이메일 주소와 비밀번호로 로그인하세요.";

  return createPortal(
    <div
      className="login-modal-backdrop"
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="login-modal__head">
          <div>
            <h2 id={titleId} className="login-modal__title">
              {title}
            </h2>
            <p className="login-modal__subtitle">{subtitle}</p>
          </div>
          <button
            type="button"
            className="login-modal__close"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {isSignup ? (
            <>
              <div className="login-modal__field">
                <label htmlFor="auth-user-id" className="login-modal__label">
                  아이디 (userId)
                </label>
                <input
                  ref={userIdRef}
                  id="auth-user-id"
                  className="login-modal__input"
                  type="text"
                  name="userId"
                  autoComplete="username"
                  placeholder="영문·숫자·_ 2자 이상"
                  value={state.userId}
                  onChange={(ev) => patch({ userId: ev.target.value })}
                />
              </div>
              <div className="login-modal__field">
                <label htmlFor="auth-nickname" className="login-modal__label">
                  닉네임
                </label>
                <input
                  id="auth-nickname"
                  className="login-modal__input"
                  type="text"
                  name="nickname"
                  autoComplete="nickname"
                  placeholder="표시 이름"
                  value={state.nickname}
                  onChange={(ev) => patch({ nickname: ev.target.value })}
                />
              </div>
              <div className="login-modal__field">
                <label htmlFor="auth-phone" className="login-modal__label">
                  휴대전화
                </label>
                <input
                  id="auth-phone"
                  className="login-modal__input"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="01012345678"
                  value={state.phone}
                  onChange={(ev) => patch({ phone: ev.target.value })}
                />
              </div>
            </>
          ) : null}
          <div className="login-modal__field">
            <label htmlFor="auth-email" className="login-modal__label">
              {isSignup ? "이메일" : "이메일 (아이디)"}
            </label>
            <input
              ref={emailRef}
              id="auth-email"
              className="login-modal__input"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={state.email}
              onChange={(ev) => patch({ email: ev.target.value })}
            />
          </div>
          <div className="login-modal__field">
            <label htmlFor="auth-password" className="login-modal__label">
              비밀번호
            </label>
            <input
              id="auth-password"
              className="login-modal__input"
              type="password"
              name="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="비밀번호"
              value={state.password}
              onChange={(ev) => patch({ password: ev.target.value })}
            />
          </div>
          {isSignup ? (
            <div className="login-modal__field">
              <label htmlFor="auth-password2" className="login-modal__label">
                비밀번호 확인
              </label>
              <input
                id="auth-password2"
                className="login-modal__input"
                type="password"
                name="passwordConfirm"
                autoComplete="new-password"
                placeholder="비밀번호 다시 입력"
                value={state.passwordConfirm}
                onChange={(ev) => patch({ passwordConfirm: ev.target.value })}
              />
            </div>
          ) : null}
          {state.error ? (
            <p className="login-modal__error" role="alert">
              {state.error}
            </p>
          ) : null}
          <button
            type="submit"
            className="login-modal__submit"
            disabled={state.submitting}
          >
            {state.submitting ? "처리 중…" : isSignup ? "회원가입" : "로그인"}
          </button>
          <p className="login-modal__hint">
            {isSignup
              ? "회원가입 시 POST /signup 으로 전송됩니다. 터미널에서 수신 로그를 확인하세요."
              : "데모 로그인입니다."}
          </p>
        </form>
      </div>
    </div>,
    document.body,
  );
}
