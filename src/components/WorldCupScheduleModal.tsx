import { useCallback, useEffect, useId, useMemo } from "react";
import { createPortal } from "react-dom";
import { koMatchMetaLine, koTeam } from "../data/worldCup2026Ko";
import {
  WC2026_MATCHES,
  type WcMatch,
} from "../data/worldCup2026Schedule";
import "./WorldCupScheduleModal.css";

type WorldCupScheduleModalProps = {
  open: boolean;
  onClose: () => void;
};

function groupByKstDate(matches: WcMatch[]): Map<string, WcMatch[]> {
  const ymdFmt = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const wdFmt = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    weekday: "short",
  });
  const map = new Map<string, WcMatch[]>();
  for (const m of matches) {
    const d = new Date(m.kickoffIso);
    const key = `${ymdFmt.format(d)}|${wdFmt.format(d)}`;
    const list = map.get(key);
    if (list) list.push(m);
    else map.set(key, [m]);
  }
  return map;
}

export default function WorldCupScheduleModal({
  open,
  onClose,
}: WorldCupScheduleModalProps) {
  const titleId = useId();

  const grouped = useMemo(() => groupByKstDate(WC2026_MATCHES), []);

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
              FIFA 월드컵 2026 경기일정
            </h2>
            <p className="wc-schedule-modal__sub">
              표시 시각은 <strong>한국 표준시(한국 시각)</strong> 기준입니다.
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
          {Array.from(grouped.entries()).map(([dateKey, rows]) => {
            const [ymd, weekday] = dateKey.split("|");
            return (
            <section key={dateKey} className="wc-schedule-day">
              <h3 className="wc-schedule-day__title">
                {ymd} ({weekday}) (한국 시각)
              </h3>
              <ul className="wc-schedule-day__list">
                {rows.map((m) => (
                  <li key={m.id} className="wc-schedule-row">
                    <span className="wc-schedule-row__time">
                      {new Intl.DateTimeFormat("ko-KR", {
                        timeZone: "Asia/Seoul",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }).format(new Date(m.kickoffIso))}
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
            </section>
            );
          })}
        </div>

        <footer className="wc-schedule-modal__foot">
          데이터 출처: openfootball/world-cup.json (2026). 변경 시 최종 일정은{" "}
          <a
            href="https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026"
            target="_blank"
            rel="noreferrer"
          >
            FIFA 공식
          </a>
          을 확인하세요.
        </footer>
      </div>
    </div>,
    document.body,
  );
}
