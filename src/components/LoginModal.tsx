import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
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
const MIN_PASSWORD = 6;

export default function LoginModal({
  open,
  variant,
  onClose,
  onSuccess,
}: LoginModalProps) {
  const titleId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setError(null);
    const t = window.setTimeout(() => emailRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open, variant]);

  const handleBackdropMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();

    if (!trimmed) {
      setError("이메일 주소를 입력해 주세요.");
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }

    if (variant === "signup") {
      if (password.length < MIN_PASSWORD) {
        setError(`비밀번호는 ${MIN_PASSWORD}자 이상 입력해 주세요.`);
        return;
      }
      if (password !== passwordConfirm) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      onSuccess(trimmed);
      setEmail("");
      setPassword("");
      setPasswordConfirm("");
      onClose();
    }, 400);
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
    ? "이메일과 비밀번호로 새 계정을 만드세요."
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
          <div className="login-modal__field">
            <label htmlFor="auth-email" className="login-modal__label">
              이메일 (아이디)
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
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
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
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
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
                value={passwordConfirm}
                onChange={(ev) => setPasswordConfirm(ev.target.value)}
              />
            </div>
          ) : null}
          {error ? (
            <p className="login-modal__error" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="login-modal__submit"
            disabled={submitting}
          >
            {submitting ? "처리 중…" : isSignup ? "회원가입" : "로그인"}
          </button>
          <p className="login-modal__hint">
            데모 화면입니다. 서버 인증은 연결되어 있지 않습니다.
          </p>
        </form>
      </div>
    </div>,
    document.body,
  );
}
