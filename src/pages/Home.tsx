import Hero from "../components/Hero";
import GeminiChat from "./GeminiChat";
import "./Home.css";

export default function Home() {
  return (
    <div className="home">
      <div className="home__bg" aria-hidden />
      <main className="home__main home__grid">
        <div className="home__hero">
          <Hero />
        </div>
        <div className="home__aside">
          <GeminiChat />
        </div>
      </main>
    </div>
  );
}
