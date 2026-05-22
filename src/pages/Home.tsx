import { useState } from "react";
import Hero from "../components/Hero";
import HeroPredictionPanel from "../components/HeroPredictionPanel";
import WorldCupGroupsSection from "../components/WorldCupGroupsSection";
import WorldCupTeamsSection from "../components/WorldCupTeamsSection";
import WorldCupStatsSection from "../components/WorldCupStatsSection";
import GeminiChat from "./GeminiChat";
import "./Home.css";

export default function Home() {
  const [geminiPreset, setGeminiPreset] = useState<{
    key: number;
    text: string;
  } | null>(null);

  return (
    <div className="home">
      <div className="home__bg" aria-hidden />
      <main className="home__main home__grid">
        <div className="home__hero">
          <Hero
            showPrediction={false}
            onGeminiPreset={(text) => setGeminiPreset({ key: Date.now(), text })}
          />
        </div>
        <div className="home__chat-slot">
          <GeminiChat
            preset={geminiPreset}
            onPresetConsumed={() => setGeminiPreset(null)}
          />
        </div>
        <div className="home__prediction">
          <HeroPredictionPanel
            onAiPreset={(text) => setGeminiPreset({ key: Date.now(), text })}
          />
        </div>
        <div className="home__sections">
          <WorldCupGroupsSection />
          <WorldCupTeamsSection />
          <WorldCupStatsSection />
        </div>
      </main>
    </div>
  );
}
