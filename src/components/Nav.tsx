import { Link, NavLink } from "react-router-dom";
import NavWeather from "./NavWeather";
import "./Nav.css";

const MENU = [
  { label: "일정", href: "#schedule" },
  { label: "조 편성", href: "#groups" },
  { label: "팀", href: "#teams" },
  { label: "통계", href: "#stats" },
];

export default function Nav() {
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
          <button type="button" className="nav__btn nav__btn--primary">
            로그인
          </button>
        </div>
      </div>
    </header>
  );
}
