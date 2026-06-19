import { useState } from "react";
import "./Admin.css";

type NavItem = { key: string; label: string; icon: string };

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "DASHBOARD", icon: "🏠" },
  { key: "chart", label: "CHART", icon: "📊" },
  { key: "apps", label: "APPS", icon: "⭐" },
  { key: "form", label: "FORM", icon: "📝" },
  { key: "email", label: "EMAIL", icon: "✉️" },
  { key: "setting", label: "SETTING", icon: "⚙️" },
  { key: "lorem", label: "LOREM", icon: "📷" },
  { key: "contrary", label: "CONTRARY", icon: "📁" },
  { key: "belief", label: "BELIEF", icon: "📦" },
];

const TABS = ["LOREM IPSUM", "CONTRARY", "POPULAR", "BELIEF", "AENEAN"];

const ROW_ITEMS = [
  { percent: 20, label: "LOREM IPSUM" },
  { percent: 60, label: "LOREM IPSUM" },
  { percent: 80, label: "LOREM IPSUM" },
  { percent: 20, label: "LOREM IPSUM" },
];

const BAR_DATA = [
  { year: "2013", value: 35 },
  { year: "2014", value: 55 },
  { year: "2015", value: 40 },
  { year: "2016", value: 70 },
  { year: "2017", value: 50 },
  { year: "2018", value: 85 },
];

const MINI_RINGS = [60, 70, 60];

const THIN_BARS = [
  { label: "LOREM IPSUM", percent: 80 },
  { label: "LOREM IPSUM", percent: 55 },
  { label: "LOREM IPSUM", percent: 40 },
];

function ProgressRing({
  percent,
  size = 64,
  stroke = 7,
  gradientId,
  fontSize,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  gradientId: string;
  fontSize?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  return (
    <svg
      className="admin-ring"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${percent}%`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="55%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e8ef"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="53%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="admin-ring__label"
        fontSize={fontSize ?? Math.round(size / 4.5)}
      >
        {percent}%
      </text>
    </svg>
  );
}

export default function Admin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div className="admin">
      {sidebarOpen ? (
        <button
          type="button"
          className="admin__overlay"
          aria-label="메뉴 닫기"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`admin__sidebar ${sidebarOpen ? "admin__sidebar--open" : ""}`}
      >
        <div className="admin__brand">
          <span className="admin__brand-mark" aria-hidden>
            🛡️
          </span>
          <span className="admin__brand-text">
            <strong>LOREM IPSUM</strong>
            <small>LOREM IPSUM</small>
          </span>
        </div>
        <nav className="admin__nav" aria-label="관리자 메뉴">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`admin__nav-item ${
                activeNav === item.key ? "admin__nav-item--active" : ""
              }`}
              onClick={() => {
                setActiveNav(item.key);
                setSidebarOpen(false);
              }}
            >
              <span className="admin__nav-icon" aria-hidden>
                {item.icon}
              </span>
              <span className="admin__nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="admin__main">
        <header className="admin__topbar">
          <button
            type="button"
            className="admin__menu-btn"
            aria-label="메뉴 열기"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="admin__topbar-text">
            <p className="admin__eyebrow">DASHBOARD USER ADMIN PANEL</p>
            <p className="admin__subtitle">
              Contrary to popular belief, Lorem Ipsum is not.
            </p>
          </div>
          <div className="admin__profile">
            <span className="admin__profile-name">LOREM IPSUM</span>
            <span className="admin__profile-avatar" aria-hidden>
              🙂
            </span>
          </div>
        </header>

        <nav className="admin__tabs" aria-label="대시보드 탭">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`admin__tab ${
                activeTab === tab ? "admin__tab--active" : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <main className="admin__grid">
          <section className="admin-card admin-card--chart">
            <header className="admin-card__head">
              <div>
                <p className="admin-card__title">LOREM IPSUM</p>
                <p className="admin-card__hint">
                  Currency to popular belief, Lorem Ipsum is not.
                </p>
              </div>
              <button type="button" className="admin-card__more" aria-label="더 보기">
                +
              </button>
            </header>
            <p className="admin-card__big-number">$ 4,837.26</p>
            <svg
              className="admin-area-chart"
              viewBox="0 0 300 110"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="admin-area-line" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="admin-area-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 95 L300 95 L300 25 L275 10 L250 35 L225 20 L200 45 L175 30 L150 50 L125 40 L100 65 L75 55 L50 75 L25 60 L0 70 Z"
                fill="url(#admin-area-fill)"
              />
              <path
                d="M0 70 L25 60 L50 75 L75 55 L100 65 L125 40 L150 50 L175 30 L200 45 L225 20 L250 35 L275 10 L300 25"
                fill="none"
                stroke="url(#admin-area-line)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </section>

          <section className="admin-card admin-card--donut">
            <header className="admin-card__head">
              <p className="admin-card__title">LOREM IPSUM</p>
              <button type="button" className="admin-card__more" aria-label="더 보기">
                +
              </button>
            </header>
            <div className="admin-card__donut-wrap">
              <ProgressRing percent={75} size={120} stroke={10} gradientId="ring-main" />
            </div>
          </section>

          <section className="admin-card admin-card--rows">
            <header className="admin-card__head">
              <div>
                <p className="admin-card__title">LOREM IPSUM</p>
                <p className="admin-card__hint">
                  Contrary to popular belief, Lorem Ipsum is not simply random text.
                </p>
              </div>
            </header>
            <ul className="admin-rows">
              {ROW_ITEMS.map((row, i) => (
                <li className="admin-row" key={i}>
                  <ProgressRing
                    percent={row.percent}
                    size={56}
                    stroke={6}
                    gradientId={`ring-row-${i}`}
                  />
                  <span className="admin-row__box">{row.label}</span>
                  <span className="admin-row__dot" aria-hidden />
                  <span className="admin-row__label">{row.label}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="admin-card admin-card--bars">
            <header className="admin-card__head">
              <p className="admin-card__title">LOREM IPSUM</p>
              <button type="button" className="admin-card__more" aria-label="더 보기">
                +
              </button>
            </header>
            <div className="admin-bar-chart">
              {BAR_DATA.map((bar) => (
                <div className="admin-bar-chart__col" key={bar.year}>
                  <div
                    className="admin-bar-chart__bar"
                    style={{ height: `${bar.value}%` }}
                  />
                  <span className="admin-bar-chart__year">{bar.year}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-card admin-card--text">
            <header className="admin-card__head">
              <p className="admin-card__title">LOREM IPSUM</p>
            </header>
            <p className="admin-card__paragraph">
              Contrary to popular belief, Lorem Ipsum is not simply random text. It
              has roots in a piece of classical Latin literature.
            </p>
            <ul className="admin-thin-bars">
              {THIN_BARS.map((bar, i) => (
                <li key={i} className="admin-thin-bars__row">
                  <span className="admin-thin-bars__label">{bar.label}</span>
                  <span className="admin-thin-bars__track">
                    <span
                      className="admin-thin-bars__fill"
                      style={{ width: `${bar.percent}%` }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="admin-card admin-card--mini-rings">
            {MINI_RINGS.map((percent, i) => (
              <ProgressRing
                key={i}
                percent={percent}
                size={64}
                stroke={7}
                gradientId={`ring-mini-${i}`}
              />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
