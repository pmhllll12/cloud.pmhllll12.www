import { useCallback, useEffect, useMemo, useState } from "react";
import { getHighlightMatch } from "../data/worldCup2026Schedule";
import { koTeam } from "../data/worldCup2026Ko";
import "./HeroPredictionPanel.css";

const LS_POINTS = "wc_gamify_points";
const LS_VOTES = "wc_gamify_votes";
const LS_PICKS = "wc_gamify_picks";

type Pick = "H" | "D" | "A";

type VoteBag = Record<string, { H: number; D: number; A: number }>;

type PickRow = { id: number; pick: Pick; t: number };

function readPoints(): number {
  try {
    const n = Number(localStorage.getItem(LS_POINTS));
    if (Number.isFinite(n) && n >= 0) return Math.floor(n);
  } catch {
    /* ignore */
  }
  return 1000;
}

function readVotes(): VoteBag {
  try {
    const raw = localStorage.getItem(LS_VOTES);
    if (raw) return JSON.parse(raw) as VoteBag;
  } catch {
    /* ignore */
  }
  return {};
}

function writeVotes(v: VoteBag) {
  try {
    localStorage.setItem(LS_VOTES, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

function readPicks(): PickRow[] {
  try {
    const raw = localStorage.getItem(LS_PICKS);
    if (raw) {
      const arr = JSON.parse(raw) as PickRow[];
      return Array.isArray(arr) ? arr : [];
    }
  } catch {
    /* ignore */
  }
  return [];
}

function writePicks(rows: PickRow[]) {
  try {
    localStorage.setItem(LS_PICKS, JSON.stringify(rows.slice(-200)));
  } catch {
    /* ignore */
  }
}

function seedTotals(mid: number): { H: number; D: number; A: number } {
  /* 데모용 초기 분포 — 실서비스에서는 서버 집계로 교체 */
  if (mid <= 2) return { H: 52, D: 22, A: 26 };
  return { H: 40, D: 30, A: 30 };
}

function sessionVoteKey(mid: number) {
  return `wc_gamify_vote_${mid}`;
}

function readSessionVote(mid: number): Pick | null {
  try {
    const v = sessionStorage.getItem(sessionVoteKey(mid));
    if (v === "H" || v === "D" || v === "A") return v;
  } catch {
    /* ignore */
  }
  return null;
}

function writeSessionVote(mid: number, p: Pick | null) {
  try {
    if (p === null) sessionStorage.removeItem(sessionVoteKey(mid));
    else sessionStorage.setItem(sessionVoteKey(mid), p);
  } catch {
    /* ignore */
  }
}

type HeroPredictionPanelProps = {
  onAiPreset?: (text: string) => void;
};

export default function HeroPredictionPanel({
  onAiPreset,
}: HeroPredictionPanelProps) {
  const match = useMemo(() => getHighlightMatch(), []);
  const mid = match.id;
  const homeKo = koTeam(match.home);
  const awayKo = koTeam(match.away);

  const [points, setPoints] = useState(readPoints);
  const [totals, setTotals] = useState(() => {
    const bag = readVotes();
    const key = String(mid);
    return bag[key] ?? seedTotals(mid);
  });
  const [userVote, setUserVote] = useState<Pick | null>(() =>
    readSessionVote(mid),
  );
  const [picks, setPicks] = useState(readPicks);
  const [lastPick, setLastPick] = useState<Pick | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const bag = readVotes();
    const key = String(mid);
    setTotals(bag[key] ?? seedTotals(mid));
    setUserVote(readSessionVote(mid));
    const rows = readPicks();
    setPicks(rows);
    const forMid = rows.filter((p) => p.id === mid);
    setLastPick(forMid.length ? forMid[forMid.length - 1]!.pick : null);
  }, [mid]);

  const pickCount = picks.filter((r) => r.id === mid).length;

  const pct = useMemo(() => {
    const t = totals.H + totals.D + totals.A;
    if (t <= 0) return { H: 0, D: 0, A: 0 };
    return {
      H: Math.round((100 * totals.H) / t),
      D: Math.round((100 * totals.D) / t),
      A: Math.round((100 * totals.A) / t),
    };
  }, [totals]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const applyVote = useCallback(
    (choice: Pick) => {
      const bag = readVotes();
      const key = String(mid);
      const cur = { ...(bag[key] ?? seedTotals(mid)) };
      const prev = readSessionVote(mid);
      if (prev === choice) return;
      if (prev) cur[prev] = Math.max(0, cur[prev] - 1);
      cur[choice] += 1;
      const next = { ...bag, [key]: cur };
      writeVotes(next);
      setTotals(cur);
      writeSessionVote(mid, choice);
      setUserVote(choice);
      showToast("투표가 반영되었습니다. (브라우저 누적 데모)");
    },
    [mid, showToast],
  );

  const onPredict = useCallback(
    (choice: Pick) => {
      const rows = [...readPicks(), { id: mid, pick: choice, t: Date.now() }];
      writePicks(rows);
      setPicks(rows);
      setLastPick(choice);
      showToast(
        "예측 저장 완료. 맞추면 +P · 틀리면 −P 는 결과 확정 후 정산(가상 포인트, 비현금).",
      );
    },
    [mid, showToast],
  );

  const aiPrompt = useMemo(() => {
    return `${match.home} 대 ${match.away} 경기의 승·무·패 쪽으로 승리 확률(%)과 예상 스코어를 한국어로 짧게 정리해 줘. (월드컵 2026)`;
  }, [match.home, match.away]);

  const onAiClick = useCallback(() => {
    onAiPreset?.(aiPrompt);
    showToast("오른쪽 제미나이 입력창에 프롬프트를 넣었습니다.");
  }, [aiPrompt, onAiPreset, showToast]);

  return (
    <div id="today" className="pred-panel" aria-labelledby="pred-panel-title">
      <div className="pred-panel__head">
        <h2 id="pred-panel-title" className="pred-panel__title">
          예측 · 게임화 <span className="pred-panel__tag">가상 P</span>
        </h2>
        <p className="pred-panel__points" aria-live="polite">
          <strong>{points.toLocaleString("ko-KR")} P</strong>
          <span className="pred-panel__points-hint">
            시작 1,000P · 적중 + / 미적중 − (결과 연동 시) ·{" "}
            <em>현금·배팅 아님</em>
          </span>
        </p>
      </div>

      <p className="pred-panel__law">
        규제 부담이 적은 <strong>예측 + 게임화</strong>로 오래 즐기는 구조를
        지향합니다. 경품·기프티콘은 별도 <strong>이벤트 공지·조건</strong> 하에만
        운영하세요.
      </p>

      <div className="pred-panel__grid">
        <section className="pred-card" aria-labelledby="pred-today-title">
          <h3 id="pred-today-title" className="pred-card__title">
            오늘 경기 예측하기
          </h3>
          <p className="pred-card__match">
            {homeKo} <span className="pred-card__vs">대</span> {awayKo}
          </p>
          <div className="pred-card__btns">
            {(
              [
                ["H", "홈 승"],
                ["D", "무"],
                ["A", "원정 승"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                className={`pred-pick${lastPick === k ? " pred-pick--on" : ""}`}
                onClick={() => onPredict(k)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="pred-card__fine">
            클릭 1번으로 저장 · 이 기기 기준 누적 예측{" "}
            <strong>{pickCount}회</strong> (이 경기)
          </p>
        </section>

        <section className="pred-card" aria-labelledby="pred-vote-title">
          <h3 id="pred-vote-title" className="pred-card__title">
            실시간 투표
          </h3>
          <p className="pred-card__sub">
            홈 / 무 / 원정 비율 (브라우저 간 누적 데모)
          </p>
          <div className="pred-vote__bar" role="img" aria-label="투표 비율 막대">
            <span
              className="pred-vote__seg pred-vote__seg--h"
              style={{ width: `${pct.H}%` }}
            />
            <span
              className="pred-vote__seg pred-vote__seg--d"
              style={{ width: `${pct.D}%` }}
            />
            <span
              className="pred-vote__seg pred-vote__seg--a"
              style={{ width: `${pct.A}%` }}
            />
          </div>
          <p className="pred-vote__pct">
            홈 <strong>{pct.H}%</strong> · 무 <strong>{pct.D}%</strong> · 원정{" "}
            <strong>{pct.A}%</strong>
            {userVote ? (
              <span className="pred-vote__you"> · 내 선택 반영됨</span>
            ) : null}
          </p>
          <div className="pred-card__btns pred-card__btns--sm">
            {(
              [
                ["H", "홈"],
                ["D", "무"],
                ["A", "원정"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                className={`pred-pick pred-pick--ghost${userVote === k ? " pred-pick--on" : ""}`}
                onClick={() => applyVote(k)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="pred-card pred-card--span" aria-labelledby="pred-rank-title">
          <h3 id="pred-rank-title" className="pred-card__title">
            랭킹 · 내 적중률 · 보상
          </h3>
          <ul className="pred-rank__list">
            <li>
              <strong>오늘 적중률 1위</strong> ·{" "}
              <strong>주간 TOP 10</strong> ·{" "}
              <strong>월드컵 예측왕</strong> — 리더보드 연동 시 표시
            </li>
            <li>
              <strong>내 적중률</strong> — 누적 예측{" "}
              <strong>{picks.length}건</strong> · 실제 적중률은{" "}
              <strong>경기 결과 API</strong> 연동 후 집계 (사용자 리텐션 핵심)
            </li>
            <li>
              <strong>보상</strong> — 뱃지 · 랭킹 · 커뮤니티 명예 (기프티콘·경품은
              이벤트 한정·조건 명시)
            </li>
          </ul>
        </section>

        <section className="pred-card pred-card--ai" aria-labelledby="pred-ai-title">
          <div className="pred-card--ai__copy">
            <h3 id="pred-ai-title" className="pred-card__title">
              AI 승부 예측
            </h3>
            <p className="pred-card__sub">
              오른쪽 <strong>Gemini</strong>로 승리 확률·예상 스코어 질문
            </p>
          </div>
          <button type="button" className="pred-ai__btn" onClick={onAiClick}>
            AI에게 이 경기 물어보기 →
          </button>
        </section>
      </div>

      {toast ? (
        <p className="pred-panel__toast" role="status">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
