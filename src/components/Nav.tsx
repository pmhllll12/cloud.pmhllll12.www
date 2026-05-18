import { useCallback, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import LoginModal from "./LoginModal";
import NavWeather from "./NavWeather";
import "./Nav.css";

const MENU = [
  { label: "일정", href: "#schedule" },
  { label: "조 편성", href: "#groups" },
  { label: "팀", href: "#teams" },
  { label: "통계", href: "#stats" },
];

const SESSION_EMAIL_KEY = "worldcup_session_email";

export default function Nav() {
  const [authModal, setAuthModal] = useState<null | "login" | "signup">(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    try {
      const v = sessionStorage.getItem(SESSION_EMAIL_KEY);
      if (v) setSessionEmail(v);
    } catch {
      /* ignore */
    }
  }, []);

  const handleLogout = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_EMAIL_KEY);
    } catch {
      /* ignore */
    }
    setSessionEmail(null);
  }, []);

  const handleLoginSuccess = useCallback((email: string) => {
    try {
      sessionStorage.setItem(SESSION_EMAIL_KEY, email);
    } catch {
      /* ignore */
    }
    setSessionEmail(email);
  }, []);

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/" className="nav__brand" aria-label="WORLDCUP 홈">
          <span className="nav__logo">WORLDCUP</span>
        </Link>

        <nav className="nav__menu" aria-label="주요 메뉴">
          <div className="nav__menu-links">
            {MENU.map((item) => (
              <a key={item.href} href={item.href} className="nav__link">
                {item.label}
              </a>
            ))}
          </div>
          <NavWeather />
        </nav>

        <div className="nav__actions">
          <NavLink
            to="/titanic"
            className={({ isActive }) =>
              isActive
                ? "nav__btn nav__btn--ghost nav__btn--active"
                : "nav__btn nav__btn--ghost"
            }
          >
            타이타닉
          </NavLink>
          {sessionEmail ? (
            <>
              <span className="nav__session" title={sessionEmail}>
                {sessionEmail.split("@")[0]}
              </span>
              <button
                type="button"
                className="nav__btn nav__btn--ghost"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </>
          ) : (
            <div className="nav__auth-btns">
              <button
                type="button"
                className="nav__btn nav__btn--primary"
                onClick={() => setAuthModal("login")}
              >
                로그인
              </button>
              <button
                type="button"
                className="nav__btn nav__btn--ghost"
                onClick={() => setAuthModal("signup")}
              >
                회원가입
              </button>
            </div>
          )}
        </div>
      </div>
      <LoginModal
        open={authModal !== null}
        variant={authModal ?? "login"}
        onClose={() => setAuthModal(null)}
        onSuccess={handleLoginSuccess}
      />
    </header>
  );
}
