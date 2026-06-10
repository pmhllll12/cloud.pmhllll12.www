import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import "./TitanicSmith.css";

type ChatMessage = {
  id: string;
  role: "user" | "model";
  text: string;
  pending?: boolean;
};

type SmithChatResponse = {
  reply: string;
  model: string;
};

function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE?.trim();
  if (base) {
    return `${base.replace(/\/$/, "")}${path}`;
  }
  return path;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseApiError(raw: string, status: number): string {
  try {
    const j = JSON.parse(raw) as {
      detail?: string | Array<{ msg?: string }>;
    };
    if (typeof j.detail === "string") return j.detail;
    if (Array.isArray(j.detail)) {
      const parts = j.detail
        .map((d) => (typeof d === "object" && d?.msg ? d.msg : String(d)))
        .filter(Boolean);
      if (parts.length) return parts.join(", ");
    }
  } catch {
    /* ignore */
  }
  return raw.trim() || `HTTP ${status}`;
}

async function postSmithChat(message: string): Promise<SmithChatResponse> {
  const res = await fetch(apiUrl("/titanic/smith/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(parseApiError(raw, res.status));
  }
  const data = JSON.parse(raw) as SmithChatResponse;
  if (!data.reply?.trim()) {
    throw new Error("선장이 비어 있는 응답을 반환했습니다.");
  }
  return { reply: data.reply.trim(), model: data.model ?? "" };
}

const WELCOME =
  "안녕하시오. 나는 RMS 타이타닉의 선장 에드워드 스미스라오. 배와 바다, 그날의 일—무엇이든 물어보시오.";

export default function TitanicSmith() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "model", text: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    requestAnimationFrame(scrollToBottom);
  }, [messages, scrollToBottom]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    setInput("");

    const userMsg: ChatMessage = { id: uid(), role: "user", text };
    const pendingId = uid();
    const pending: ChatMessage = {
      id: pendingId,
      role: "model",
      text: "…잠시만 기다려 주시오.",
      pending: true,
    };

    setMessages((prev) => [...prev, userMsg, pending]);
    setLoading(true);
    try {
      const { reply, model } = await postSmithChat(text);
      if (model) setModelName(model);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId ? { ...m, text: reply, pending: false } : m,
        ),
      );
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
      setMessages((prev) => prev.filter((m) => m.id !== pendingId));
      setError(msg);
    } finally {
      setLoading(false);
      requestAnimationFrame(scrollToBottom);
    }
  }, [input, loading, scrollToBottom]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send();
  };

  return (
    <section className="smith-chat" aria-labelledby="smith-chat-heading">
      <div className="smith-chat__head">
        <span className="smith-chat__badge">LESSON</span>
        <h2 id="smith-chat-heading" className="smith-chat__title">
          스미스 선장과의 대화
        </h2>
        <p className="smith-chat__meta">
          API: <code>POST /titanic/smith/chat</code>
          {modelName ? (
            <>
              {" "}
              · 모델: <code>{modelName}</code>
            </>
          ) : null}
        </p>
        <p className="smith-chat__hint">
          타이타닉·항해·1912년에 대해 물어보세요. 백엔드 <code>apps/.env</code> 에{" "}
          <code>GEMINI_API_KEY</code> 가 있어야 답변이 생성됩니다.
        </p>
      </div>

      {error ? (
        <div className="smith-chat__error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="smith-chat__stream" ref={listRef}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`smith-chat__bubble smith-chat__bubble--${m.role}${m.pending ? " smith-chat__bubble--pending" : ""}`}
          >
            <span className="smith-chat__who">
              {m.role === "user" ? "나" : "스미스 선장"}
            </span>
            <p className="smith-chat__text">{m.text}</p>
          </div>
        ))}
      </div>

      <form className="smith-chat__form" onSubmit={onSubmit}>
        <textarea
          className="smith-chat__input"
          rows={2}
          placeholder="타이타닉에 대해 물어보세요…"
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <button
          type="submit"
          className="smith-chat__send"
          disabled={loading || !input.trim()}
        >
          {loading ? "전송 중…" : "보내기"}
        </button>
      </form>
    </section>
  );
}
