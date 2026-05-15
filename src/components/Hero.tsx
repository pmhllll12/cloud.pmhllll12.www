import "./Hero.css";

const CHIPS = [
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

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__inner">
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

        <div className="hero__actions">
          <a href="#today" className="hero__btn hero__btn--primary">
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
          </a>
          <a href="#schedule" className="hero__btn hero__btn--ghost">
            전체 일정 보기
          </a>
        </div>

        <ul className="hero__chips" aria-label="주요 안내 카테고리">
          {CHIPS.map((c) => (
            <li key={c} className="hero__chip">
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
