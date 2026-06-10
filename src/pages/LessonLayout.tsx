import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./LessonLayout.css";

const TOP_CATS = [
  "ALL",
  "RAG SYSTEM",
  "ARCHITECTURE",
  "AGENT",
  "BACKEND",
  "MOBILE",
  "DEVOPS",
  "NLP",
] as const;

const MOBILE_NAV_QUERY = "(max-width: 800px)";

export default function LessonLayout() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((o) => !o), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const mq = window.matchMedia(MOBILE_NAV_QUERY);
    const sync = () => {
      if (!mq.matches) setMenuOpen(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  return (
    <div
      className={
        menuOpen ? "lesson-shell lesson-shell--nav-open" : "lesson-shell"
      }
    >
      <div className="lesson-topbar">
        <div className="lesson-topbar__inner">
          <button
            type="button"
            className="lesson-menu-btn"
            aria-label={menuOpen ? "수업 메뉴 닫기" : "수업 메뉴 열기"}
            aria-expanded={menuOpen}
            aria-controls="lesson-sidebar"
            onClick={toggleMenu}
          >
            <span className="lesson-menu-btn__bar" aria-hidden />
            <span className="lesson-menu-btn__bar" aria-hidden />
            <span className="lesson-menu-btn__bar" aria-hidden />
          </button>
          <nav className="lesson-topbar__nav" aria-label="수업·카테고리">
            {TOP_CATS.map((label) => (
              <span
                key={label}
                className="lesson-topbar__item lesson-topbar__item--muted"
                title="준비 중"
              >
                {label}
              </span>
            ))}
            <NavLink
              to="/lesson"
              className={() =>
                pathname.startsWith("/lesson")
                  ? "lesson-topbar__item lesson-topbar__item--active"
                  : "lesson-topbar__item"
              }
            >
              수업용
            </NavLink>
          </nav>
        </div>
      </div>

      <button
        type="button"
        className="lesson-drawer-backdrop"
        aria-label="메뉴 닫기"
        tabIndex={menuOpen ? 0 : -1}
        onClick={closeMenu}
      />

      <div className="lesson-layout">
        <aside
          id="lesson-sidebar"
          className="lesson-sidebar"
          aria-label="수업용 메뉴"
        >
          <div className="lesson-sidebar__head">
            <p className="lesson-sidebar__kicker">수업용</p>
            <button
              type="button"
              className="lesson-sidebar__close"
              aria-label="메뉴 닫기"
              onClick={closeMenu}
            >
              닫기
            </button>
          </div>
          <details className="lesson-sidebar__details" open>
            <summary className="lesson-sidebar__summary">타이타닉</summary>
            <div className="lesson-sidebar__subs">
              <NavLink
                to="/lesson"
                end
                className={({ isActive }) =>
                  isActive
                    ? "lesson-sidebar__sublink lesson-sidebar__sublink--active"
                    : "lesson-sidebar__sublink"
                }
                onClick={closeMenu}
              >
                과정 개요
              </NavLink>
              <NavLink
                to="/lesson/titanic"
                end
                className={({ isActive }) =>
                  isActive
                    ? "lesson-sidebar__sublink lesson-sidebar__sublink--active"
                    : "lesson-sidebar__sublink"
                }
                onClick={closeMenu}
              >
                1. 데이터 수집 및 실습
              </NavLink>
              <NavLink
                to="/lesson/titanic/passengers"
                className={({ isActive }) =>
                  isActive
                    ? "lesson-sidebar__sublink lesson-sidebar__sublink--active"
                    : "lesson-sidebar__sublink"
                }
                onClick={closeMenu}
              >
                2. 승객 목록
              </NavLink>
              <NavLink
                to="/lesson/titanic/smith"
                className={({ isActive }) =>
                  isActive
                    ? "lesson-sidebar__sublink lesson-sidebar__sublink--active"
                    : "lesson-sidebar__sublink"
                }
                onClick={closeMenu}
              >
                3. 스미스 선장과 대화하기
              </NavLink>
            </div>
          </details>
        </aside>
        <div className="lesson-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
