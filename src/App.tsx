import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import Board from "./pages/Board";
import Admin from "./pages/Admin";
import LessonLayout from "./pages/LessonLayout";
import LessonOverview from "./pages/LessonOverview";
import LessonTitanic from "./pages/LessonTitanic";
import LessonTitanicPassengers from "./pages/LessonTitanicPassengers";
import LessonTitanicSmith from "./pages/LessonTitanicSmith";
import "./App.css";

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="app">
      {isAdminRoute ? null : <Nav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board" element={<Board />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/lesson" element={<LessonLayout />}>
          <Route index element={<LessonOverview />} />
          <Route path="titanic" element={<LessonTitanic />} />
          <Route path="titanic/passengers" element={<LessonTitanicPassengers />} />
          <Route path="titanic/smith" element={<LessonTitanicSmith />} />
        </Route>
        <Route path="/titanic" element={<Navigate to="/lesson/titanic" replace />} />
      </Routes>
    </div>
  );
}
