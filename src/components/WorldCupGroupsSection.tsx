import { useMemo } from "react";
import { koGroupLabel, koTeam } from "../data/worldCup2026Ko";
import { getWc2026GroupDraw } from "../data/worldCup2026Schedule";
import "./WorldCupGroupsSection.css";

export default function WorldCupGroupsSection() {
  const groups = useMemo(() => getWc2026GroupDraw(), []);

  return (
    <section
      id="groups"
      className="wc-groups"
      aria-labelledby="wc-groups-heading"
    >
      <div className="wc-groups__inner">
        <h2 id="wc-groups-heading" className="wc-groups__title">
          조 편성
        </h2>
        <p className="wc-groups__sub">
          FIFA 월드컵 2026 본선 12개 조 · 조별 리그 일정 데이터와 동일한 팀 구성입니다.
        </p>
        <div className="wc-groups__grid">
          {groups.map(({ groupId, teams }) => (
            <article key={groupId} className="wc-groups__card">
              <h3 className="wc-groups__card-title">{koGroupLabel(groupId)}</h3>
              <ol className="wc-groups__list">
                {teams.map((t) => (
                  <li key={t} className="wc-groups__team">
                    {koTeam(t)}
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
