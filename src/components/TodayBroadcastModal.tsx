import { useCallback, useEffect, useId, useMemo } from "react";
import { createPortal } from "react-dom";
import { koMatchMetaLine, koTeam } from "../data/worldCup2026Ko";
import {
  formatMatchTimeKstOnly,
  getMatchesOnKstDay,
} from "../data/worldCup2026Schedule";
import "./WorldCupScheduleModal.css";
import "./TodayBroadcastModal.css";

type TodayBroadcastModalProps = {
  open: boolean;
  onClose: () => void;
};

const BROADCAST_LINKS: { label: string; href: string; hint: string }[] = [
  {
    label: "FIFA+ · 공식",
    href: "https://www.fifa.com/fifaplus",
    hint: "FIFA 공식 플랫폼(하이라이트·정보)",
  },
  {
    label: "대회 공식 페이지",
    href: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026",
    hint: "일정·뉴스·중계 안내",
  },
  {
    label: "FIFA 월드컵 YouTube",
    href: "https://www.youtube.com/@FIFAWorldCup",
    hint: "공식 채널 하이라이트·라이브",
  },
  {
    label: "KBS 스포츠",
    href: "https://sports.kbs.co.kr",
    hint: "국내 TV·디지털 중계 안내(방송사 페이지)",
  },
  {
    label: "JTBC",
    href: "https://www.jtbc.co.kr",
    hint: "국내 TV·디지털 중계 안내(방송사 페이지)",
  },
];

export default function TodayBroadcastModal({
  open,
  onClose,
}: TodayBroadcastModalProps) {
  const titleId = useId();

  const todayMatches = useMemo(
    () => (open ? getMatchesOnKstDay() : []),
    [open],
  );

  const handleKey = useCallback(
    (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [open, handleKey]);

  const handleBackdrop = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!open) return null;

  return createPortal(
    <div
      className="wc-schedule-backdrop"
      role="presentation"
      onMouseDown={handleBackdrop}
    >
      <div
        className="wc-schedule-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="wc-schedule-modal__head">
          <div>
            <h2 id={titleId} className="wc-schedule-modal__title">
              오늘의 경기 · 중계 안내
            </h2>
            <p className="wc-schedule-modal__sub">
              경기 시각은 <strong>한국 표준시(KST)</strong> 기준입니다. 중계는
              방송사·FIFA 정책에 따라 달라질 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            className="wc-schedule-modal__close"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        <div className="wc-schedule-modal__body">
          <h3 className="wc-broadcast-section-title">오늘 예정 경기</h3>
          {todayMatches.length === 0 ? (
            <p className="wc-broadcast-empty">
              한국시각 기준 오늘 날짜에 잡힌 월드컵 2026 경기가 없습니다. 아래
              링크에서 공식 중계·하이라이트를 확인해 보세요.
            </p>
          ) : (
            <ul className="wc-schedule-day__list">
              {todayMatches.map((m) => (
                <li key={m.id} className="wc-schedule-row">
                  <span className="wc-schedule-row__time">
                    {formatMatchTimeKstOnly(m.kickoffIso)}
                  </span>
                  <span className="wc-schedule-row__match">
                    {koTeam(m.home)} 대 {koTeam(m.away)}
                  </span>
                  <span className="wc-schedule-row__meta">
                    {koMatchMetaLine(m)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <h3 className="wc-broadcast-section-title">중계·라이브 보러가기</h3>
          <ul className="wc-broadcast-links" aria-label="중계 관련 외부 링크">
            {BROADCAST_LINKS.map((item) => (
              <li key={item.href}>
                <a
                  className="wc-broadcast-link"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.label}
                  <span className="wc-broadcast-link__sub">{item.hint}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <footer className="wc-schedule-modal__foot">
          국내 TV·온라인 중계는{" "}
          <strong>KBS·JTBC</strong> 등 방송사 공지를 확인하세요. 일정 데이터는
          openfootball 기준이며 변경될 수 있습니다.
        </footer>
      </div>
    </div>,
    document.body,
  );
}
