import { useMemo } from "react";
import { koTeam } from "../data/worldCup2026Ko";
import {
  getSouthKoreaWinPct,
  getWinProbabilities,
} from "../data/wc2026WinModel";
import "./WorldCupStatsSection.css";

export default function WorldCupStatsSection() {
  const rows = useMemo(() => getWinProbabilities(), []);
  const krPct = useMemo(() => getSouthKoreaWinPct(), []);

  return (
    <section
      id="stats"
      className="wc-stats"
      aria-labelledby="wc-stats-heading"
    >
      <div className="wc-stats__inner">
        <h2 id="wc-stats-heading" className="wc-stats__title">
          통계
        </h2>

        <div className="wc-stats__history" role="region" aria-label="역대 월드컵 요약">
          <h3 className="wc-stats__history-title">역대 본선 기준 요약</h3>
          <ul className="wc-stats__history-list">
            <li>
              <strong>우승 횟수</strong>: 브라질 5회, 독일·이탈리아 각 4회, 아르헨티나 3회,
              프랑스·우루과이 각 2회, 잉글랜드·스페인 각 1회(2026 시점 역대 통계).
            </li>
            <li>
              <strong>대한민국</strong>: 1954년 첫 본선 이후 다수 회 출전, 2002년 한·일
              월드컵 4강, 그 외 주로 16강·조별 리그 단계.
            </li>
            <li>
              아래 비율은 위와 같은 <strong>누적 성적·본선 경험</strong>을 가중한 단순
              모델의 <strong>참고용 추정치</strong>이며, 실제 우승 확률·배당·FIFA
              랭킹과 다릅니다.
            </li>
          </ul>
        </div>

        <div className="wc-stats__kr" role="status">
          <p className="wc-stats__kr-label">모델 기준 대한민국 우승 확률</p>
          <p className="wc-stats__kr-value">
            <span className="wc-stats__kr-num">{krPct.toFixed(1)}</span>
            <span className="wc-stats__kr-unit">%</span>
          </p>
        </div>

        <h3 className="wc-stats__table-title">참가국별 우승 확률 추정 (%)</h3>
        <p className="wc-stats__table-sub">
          2026 본선 48개 대표팀 · 합계 100.0% · 소수 첫째 자리
        </p>

        <div className="wc-stats__table-wrap">
          <table className="wc-stats__table">
            <thead>
              <tr>
                <th scope="col">순위</th>
                <th scope="col">국가</th>
                <th scope="col">확률</th>
                <th scope="col" className="wc-stats__th-bar">
                  비교
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const max = rows[0]?.pct ?? 1;
                const w = max > 0 ? Math.min(100, (r.pct / max) * 100) : 0;
                const isKr = r.code === "South Korea";
                return (
                  <tr
                    key={r.code}
                    className={isKr ? "wc-stats__row wc-stats__row--kr" : "wc-stats__row"}
                  >
                    <td>{i + 1}</td>
                    <td>{koTeam(r.code)}</td>
                    <td className="wc-stats__pct">{r.pct.toFixed(1)}%</td>
                    <td className="wc-stats__bar-cell">
                      <span
                        className="wc-stats__bar"
                        style={{ width: `${w}%` }}
                        aria-hidden
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
