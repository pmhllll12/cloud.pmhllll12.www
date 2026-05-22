import { useMemo, useState } from "react";
import { koGroupLabel, koTeam } from "../data/worldCup2026Ko";
import { getWc2026NationsFlat } from "../data/worldCup2026Schedule";
import notablePlayers from "../data/wc2026NotablePlayers.json";
import "./WorldCupTeamsSection.css";

type NotablePlayerRow = { name: string; club?: string };

const NOTABLE = notablePlayers as Record<string, NotablePlayerRow[]>;

export default function WorldCupTeamsSection() {
  const nations = useMemo(() => getWc2026NationsFlat(), []);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return nations;
    return nations.filter(({ code }) => {
      const ko = koTeam(code).toLowerCase();
      const en = code.toLowerCase();
      return ko.includes(s) || en.includes(s);
    });
  }, [nations, q]);

  return (
    <section
      id="teams"
      className="wc-teams"
      aria-labelledby="wc-teams-heading"
    >
      <div className="wc-teams__inner">
        <h2 id="wc-teams-heading" className="wc-teams__title">
          팀
        </h2>
        <p className="wc-teams__sub">
          본선에 나오는 선수는 모두 아래 <strong>국가 대표팀</strong> 이름으로 출전합니다.
          표의 선수·클럽은 <strong>참고용 예시</strong>이며, 2026년 최종 엔트리는 FIFA 및
          각 축구협회 발표를 따릅니다.
        </p>

        <label className="wc-teams__search">
          <span className="wc-teams__search-label">대표팀 검색</span>
          <input
            type="search"
            className="wc-teams__search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="예: 대한민국, Brazil…"
            autoComplete="off"
          />
        </label>

        <ul className="wc-teams__list">
          {filtered.map(({ code, groupId }) => {
            const examples = NOTABLE[code] ?? [];
            return (
              <li key={code} className="wc-teams__card">
                <div className="wc-teams__card-head">
                  <span className="wc-teams__nation">{koTeam(code)}</span>
                  <span className="wc-teams__group">{koGroupLabel(groupId)}</span>
                </div>
                <p className="wc-teams__affil">
                  소속: <strong>{koTeam(code)} 대표팀</strong>
                </p>
                {examples.length > 0 ? (
                  <>
                    <p className="wc-teams__examples-label">참고용 주요 선수 예시</p>
                    <ul className="wc-teams__players">
                      {examples.map((p) => (
                        <li key={`${code}-${p.name}`} className="wc-teams__player">
                          <span className="wc-teams__player-name">{p.name}</span>
                          {p.club ? (
                            <span className="wc-teams__player-club">{p.club}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="wc-teams__no-examples">
                    예시 명단은 준비 중입니다. 선수는 모두 위 대표팀 소속으로 출전합니다.
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        {filtered.length === 0 ? (
          <p className="wc-teams__empty">검색 결과가 없습니다.</p>
        ) : null}
      </div>
    </section>
  );
}
