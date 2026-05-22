import { useState } from "react";
import { Link } from "react-router-dom";
import { openFullWorldCupSchedule } from "../wcScheduleOpen";
import HeroPredictionPanel from "./HeroPredictionPanel";
import TodayBroadcastModal from "./TodayBroadcastModal";
import "./Hero.css";

const CHIPS = [
  "예측·P",
  "AI 분석",
  "본선",
  "조 편성",
  "16강",
  "8강",
  "라이브 스코어",
  "골 순위",
  "하이라이트",
  "응원단",
  "통계",
];

type HeroProps = {
  onGeminiPreset?: (text: string) => void;
  /** false면 예측 패널 미포함 — Home에서 제미나이 아래로 배치 */
  showPrediction?: boolean;
};

export default function Hero({
  onGeminiPreset,
  showPrediction = true,
}: HeroProps) {
  const [todayBroadcastOpen, setTodayBroadcastOpen] = useState(false);

  return (
    <section className="hero">
      <div className="hero__inner">
        <div id="schedule" className="hero__sr-anchor" aria-hidden />
        <span className="hero__pill">FIFA WORLD CUP 2026</span>

        <h1 className="hero__title">
          <span className="hero__line">32개국 64경기를 한 화면에</span>
          <span className="hero__line hero__line--accent">
            축구 월드컵 일정·결과
          </span>
          <span className="hero__line">&nbsp;&amp; 라이브 매치 안내</span>
        </h1>

        <p className="hero__sub">
          조별 리그부터 결승까지 — 일정·대진·골 순위·하이라이트를 한 곳에 모아
          <br />
          월드컵의 모든 순간을 함께 안내하는 시스템입니다.
        </p>

        {showPrediction ? (
          <HeroPredictionPanel onAiPreset={onGeminiPreset} />
        ) : null}

        <div className="hero__actions">
          <button
            type="button"
            className="hero__btn hero__btn--primary"
            onClick={() => setTodayBroadcastOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={todayBroadcastOpen}
          >
            오늘의 경기
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M5 12h14M13 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="hero__btn hero__btn--ghost"
            onClick={openFullWorldCupSchedule}
          >
            전체 일정 보기
          </button>
          <Link
            to="/board"
            className="hero__btn hero__btn--ghost"
            title="자유 수다·건의·문의"
          >
            자유게시판·건의
          </Link>
        </div>

        <ul className="hero__chips" aria-label="주요 안내 카테고리">
          {CHIPS.map((c) => (
            <li key={c} className="hero__chip">
              {c}
            </li>
          ))}
        </ul>
      </div>

      <TodayBroadcastModal
        open={todayBroadcastOpen}
        onClose={() => setTodayBroadcastOpen(false)}
      />
    </section>
  );
}
