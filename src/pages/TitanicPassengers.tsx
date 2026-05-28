import { useCallback, useEffect, useState } from "react";
import "./TitanicPassengers.css";

const PAGE_SIZE = 50;

type PassengersPageResponse = {
  ok: boolean;
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  columns: string[];
  items: Record<string, unknown>[];
};

function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE?.trim();
  if (base) {
    return `${base.replace(/\/$/, "")}${path}`;
  }
  return path;
}

function buildPageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | "ellipsis")[] = [];
  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(total - 1, current + 1);

  items.push(1);
  if (windowStart > 2) items.push("ellipsis");
  for (let p = windowStart; p <= windowEnd; p += 1) {
    items.push(p);
  }
  if (windowEnd < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

export default function TitanicPassengers() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PassengersPageResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (targetPage: number) => {
    setBusy(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        page_size: String(PAGE_SIZE),
      });
      const res = await fetch(apiUrl(`/titanic/james/passengers?${params}`));
      const body = (await res.json().catch(() => null)) as
        | { detail?: string }
        | PassengersPageResponse
        | null;
      if (!res.ok) {
        let detail =
          body && typeof body === "object" && "detail" in body && typeof body.detail === "string"
            ? body.detail
            : `조회에 실패했습니다. (${res.status})`;
        if (res.status === 404) {
          detail =
            "승객 목록 API를 찾을 수 없습니다. backend 폴더에서 python main.py 로 서버를 재시작한 뒤 다시 시도하세요.";
        }
        throw new Error(detail);
      }
      const parsed = body as PassengersPageResponse;
      setData(parsed);
      if (parsed.total_pages > 0 && targetPage > parsed.total_pages) {
        setPage(parsed.total_pages);
      } else {
        setPage(targetPage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "승객 목록을 불러오지 못했습니다.");
      setData(null);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(page);
  }, [page, loadPage]);

  const totalPages = data?.total_pages ?? 0;
  const pageItems = totalPages > 0 ? buildPageItems(page, totalPages) : [];

  return (
    <section className="titanic-passengers" aria-labelledby="passengers-heading">
      <h2 id="passengers-heading" className="titanic-passengers__heading">
        승객 목록
      </h2>
      <p className="titanic-passengers__meta">
        {data
          ? `전체 ${data.total_count.toLocaleString()}명 · 페이지당 ${PAGE_SIZE}명`
          : "데이터베이스에서 승객 정보를 불러옵니다."}
      </p>

      {error ? (
        <p className="titanic-passengers__error" role="alert">
          {error}
        </p>
      ) : null}

      {busy && !data ? (
        <p className="titanic-passengers__loading">목록을 불러오는 중…</p>
      ) : null}

      {data && data.items.length > 0 ? (
        <div className={`titanic-passengers__table-wrap${busy ? " titanic-passengers__table-wrap--dim" : ""}`}>
          <table className="titanic-passengers__table">
            <thead>
              <tr>
                {data.columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((row, i) => (
                <tr key={`${page}-${i}-${String(row.PassengerId ?? i)}`}>
                  {data.columns.map((col) => (
                    <td key={col}>{String(row[col] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {data && data.total_count === 0 && !busy ? (
        <p className="titanic-passengers__empty">
          저장된 승객이 없습니다. 「1. 데이터 수집 및 실습」에서 CSV를 먼저 업로드하세요.
        </p>
      ) : null}

      {totalPages > 0 ? (
        <nav className="titanic-pagination" aria-label="승객 목록 페이지">
          <button
            type="button"
            className="titanic-pagination__btn"
            disabled={page <= 1 || busy}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="이전 페이지"
          >
            ‹
          </button>
          {pageItems.map((item, idx) =>
            item === "ellipsis" ? (
              <span key={`e-${idx}`} className="titanic-pagination__ellipsis">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={
                  item === page
                    ? "titanic-pagination__btn titanic-pagination__btn--active"
                    : "titanic-pagination__btn"
                }
                disabled={busy}
                onClick={() => setPage(item)}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            className="titanic-pagination__btn"
            disabled={page >= totalPages || busy}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="다음 페이지"
          >
            ›
          </button>
        </nav>
      ) : null}
    </section>
  );
}
