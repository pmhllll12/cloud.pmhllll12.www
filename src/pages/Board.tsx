import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import "./Board.css";

const LS_KEY = "wc_community_posts_v1";

type BoardPost = {
  id: string;
  body: string;
  createdAt: number;
};

function readPosts(): BoardPost[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as BoardPost[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writePosts(rows: BoardPost[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(rows.slice(-80)));
  } catch {
    /* ignore */
  }
}

export default function Board() {
  const formId = useId();
  const [posts, setPosts] = useState<BoardPost[]>(readPosts);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setPosts(readPosts());
  }, []);

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const body = draft.trim();
      if (body.length < 2) {
        setNotice("두 글자 이상 입력해 주세요.");
        return;
      }
      if (body.length > 2000) {
        setNotice("2000자 이내로 작성해 주세요.");
        return;
      }
      const row: BoardPost = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        body,
        createdAt: Date.now(),
      };
      const next = [...readPosts(), row];
      writePosts(next);
      setPosts(next);
      setDraft("");
      setNotice("등록되었습니다. (이 브라우저에만 저장됩니다)");
      window.setTimeout(() => setNotice(null), 2800);
    },
    [draft],
  );

  return (
    <main className="board">
      <div className="board__inner">
        <nav className="board__nav">
          <Link to="/" className="board__back">
            ← 홈으로
          </Link>
        </nav>

        <h1 className="board__title">자유게시판 · 건의사항</h1>
        <p className="board__lead">
          월드컵 이야기·응원·잡담은 물론, 사이트 개선 건의나 문의도 남겨 주세요.
          <strong> 비로그인·가벼운 마음으로</strong> 쓰시면 됩니다. (현재는 이
          기기 브라우저에만 저장되는 데모입니다. 서버 게시판 연동 시 공개·관리
          정책이 적용됩니다.)
        </p>

        <form className="board__form" onSubmit={onSubmit} aria-labelledby={formId}>
          <label id={formId} className="board__label" htmlFor="board-body">
            글 작성
          </label>
          <textarea
            id="board-body"
            className="board__textarea"
            rows={5}
            maxLength={2000}
            placeholder="예: ○○ 경기 중계 화면이 있었으면 좋겠어요 / 오타 제보 / 응원글 자유"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="board__form-foot">
            <span className="board__count">{draft.length} / 2000</span>
            <button type="submit" className="board__submit">
              등록하기
            </button>
          </div>
        </form>

        {notice ? (
          <p className="board__notice" role="status">
            {notice}
          </p>
        ) : null}

        <section className="board__list-wrap" aria-labelledby="board-list-title">
          <h2 id="board-list-title" className="board__list-title">
            최근 글
          </h2>
          {posts.length === 0 ? (
            <p className="board__empty">아직 등록된 글이 없습니다. 첫 글을 남겨 보세요.</p>
          ) : (
            <ul className="board__list">
              {[...posts]
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((p) => (
                  <li key={p.id} className="board__item">
                    <time
                      className="board__time"
                      dateTime={new Date(p.createdAt).toISOString()}
                    >
                      {new Intl.DateTimeFormat("ko-KR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(p.createdAt))}
                    </time>
                    <p className="board__body">{p.body}</p>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
