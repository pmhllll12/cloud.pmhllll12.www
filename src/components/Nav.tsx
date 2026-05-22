import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { koTeam } from "../data/worldCup2026Ko";
import {
  getMatchesOnKstDay,
  formatMatchTimeKstOnly,
} from "../data/worldCup2026Schedule";
import LoginModal from "./LoginModal";
import NavWeather from "./NavWeather";
import WorldCupScheduleModal from "./WorldCupScheduleModal";
import { WC_OPEN_FULL_SCHEDULE } from "../wcScheduleOpen";
import "./Nav.css";

const MENU_OTHER = [
  { label: "조 편성", href: "#groups" },
  { label: "팀", href: "#teams" },
  { label: "통계", href: "#stats" },
];

const SESSION_EMAIL_KEY = "worldcup_session_email";

type NavUiState = {
  authModal: null | "login" | "signup";
  sessionEmail: string | null;
  scheduleOpen: boolean;
};

function createInitialNavUi(sessionEmail: string | null = null): NavUiState {
  return {
    authModal: null,
    sessionEmail,
    scheduleOpen: false,
  };
}

export default function Nav() {
  const [ui, setUi] = useState<NavUiState>(() => createInitialNavUi());

  const patch = useCallback((p: Partial<NavUiState>) => {
    setUi((prev) => ({ ...prev, ...p }));
  }, []);

  useEffect(() => {
    try {
      const v = sessionStorage.getItem(SESSION_EMAIL_KEY);
      setUi((prev) => ({ ...prev, sessionEmail: v }));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const open = () => patch({ scheduleOpen: true });
    window.addEventListener(WC_OPEN_FULL_SCHEDULE, open);
    return () => window.removeEventListener(WC_OPEN_FULL_SCHEDULE, open);
  }, [patch]);

  const todayMatches = useMemo(() => getMatchesOnKstDay(), []);

  const scheduleHint = useMemo(() => {
    if (todayMatches.length === 0) {
      return "오늘(KST) 예정 경기 없음";
    }
    if (todayMatches.length === 1) {
      const m = todayMatches[0]!;
      return `${formatMatchTimeKstOnly(m.kickoffIso)} · ${koTeam(m.home)} 대 ${koTeam(m.away)}`;
    }
    const m0 = todayMatches[0]!;
    const more = todayMatches.length - 1;
    return `${formatMatchTimeKstOnly(m0.kickoffIso)} · ${koTeam(m0.home)} 대 ${koTeam(m0.away)} 외 ${more}경기`;
  }, [todayMatches]);

  const scheduleTitle = useMemo(() => {
    if (todayMatches.length === 0) {
      return "한국시각 기준 오늘 날짜에 예정된 월드컵 경기가 없습니다. 클릭하면 전체 일정을 볼 수 있습니다.";
    }
    return [
      `한국시각(KST) 오늘 ${todayMatches.length}경기`,
      ...todayMatches.map(
        (m) =>
          `${formatMatchTimeKstOnly(m.kickoffIso)} ${koTeam(m.home)} vs ${koTeam(m.away)}`,
      ),
      "",
      "클릭 시 전체 대회 일정",
    ].join("\n");
  }, [todayMatches]);

  const handleLogout = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_EMAIL_KEY);
    } catch {
      /* ignore */
    }
    patch({ sessionEmail: null });
  }, [patch]);

  const handleLoginSuccess = useCallback(
    (email: string) => {
      try {
        sessionStorage.setItem(SESSION_EMAIL_KEY, email);
      } catch {
        /* ignore */
      }
      patch({ sessionEmail: email });
    },
    [patch],
  );

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/" className="nav__brand" aria-label="WORLDCUP 홈">
          <span className="nav__logo">WORLDCUP</span>
        </Link>

        <nav className="nav__menu" aria-label="주요 메뉴">
          <div className="nav__menu-links">
            <button
              type="button"
              className="nav__schedule-btn"
              onClick={() => patch({ scheduleOpen: true })}
              aria-haspopup="dialog"
              aria-expanded={ui.scheduleOpen}
            >
              <span className="nav__schedule-btn__label">{"Today's 경기"}</span>
              <span className="nav__schedule-btn__hint" title={scheduleTitle}>
                {scheduleHint}
              </span>
            </button>
            {MENU_OTHER.map((item) => (
              <a key={item.href} href={item.href} className="nav__link">
                {item.label}
              </a>
            ))}
          </div>
          <NavWeather />
        </nav>

        <div className="nav__actions">
          <button
            type="button"
            className="nav__schedule-btn--mobile"
            onClick={() => patch({ scheduleOpen: true })}
            aria-label="전체 경기일정 열기 (오늘 KST 경기 요약)"
          >
            {"Today's 경기"}
          </button>
          {ui.sessionEmail ? (
            <>
              <span className="nav__session" title={ui.sessionEmail}>
                {ui.sessionEmail.split("@")[0]}
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
                onClick={() => patch({ authModal: "login" })}
              >
                로그인
              </button>
              <button
                type="button"
                className="nav__btn nav__btn--ghost"
                onClick={() => patch({ authModal: "signup" })}
              >
                회원가입
              </button>
            </div>
          )}
        </div>
      </div>
      <LoginModal
        open={ui.authModal !== null}
        variant={ui.authModal ?? "login"}
        onClose={() => patch({ authModal: null })}
        onSuccess={handleLoginSuccess}
      />
      <WorldCupScheduleModal
        open={ui.scheduleOpen}
        onClose={() => patch({ scheduleOpen: false })}
      />
    </header>
  );
}
