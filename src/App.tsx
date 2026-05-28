import { Routes, Route, Navigate } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import Board from "./pages/Board";
import LessonLayout from "./pages/LessonLayout";
import LessonOverview from "./pages/LessonOverview";
import LessonTitanic from "./pages/LessonTitanic";
import LessonTitanicPassengers from "./pages/LessonTitanicPassengers";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board" element={<Board />} />
        <Route path="/lesson" element={<LessonLayout />}>
          <Route index element={<LessonOverview />} />
          <Route path="titanic" element={<LessonTitanic />} />
          <Route path="titanic/passengers" element={<LessonTitanicPassengers />} />
        </Route>
        <Route path="/titanic" element={<Navigate to="/lesson/titanic" replace />} />
      </Routes>
    </div>
  );
}
