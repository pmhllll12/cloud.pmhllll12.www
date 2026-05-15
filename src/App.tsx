import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import Titanic from "./pages/Titanic";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/titanic" element={<Titanic />} />
      </Routes>
    </div>
  );
}
