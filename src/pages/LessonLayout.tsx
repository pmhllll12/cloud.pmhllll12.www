import { NavLink, Outlet } from "react-router-dom";
import "./LessonLayout.css";

export default function LessonLayout() {
  return (
    <div className="lesson-layout">
      <aside className="lesson-sidebar" aria-label="수업용 메뉴">
        <p className="lesson-sidebar__kicker">수업용</p>
        <nav className="lesson-sidebar__nav">
          <NavLink
            to="/lesson/titanic"
            end
            className={({ isActive }) =>
              isActive
                ? "lesson-sidebar__link lesson-sidebar__link--active"
                : "lesson-sidebar__link"
            }
          >
            타이타닉
          </NavLink>
        </nav>
      </aside>
      <div className="lesson-body">
        <Outlet />
      </div>
    </div>
  );
}
