import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import "./GeminiChat.css";

type ChatMessage = {
  id: string;
  role: "user" | "model";
  text: string;
  pending?: boolean;
};

type ChatResponse = {
  reply: string;
  model: string;
};

function getChatUrl(): string {
  const base = import.meta.env.VITE_API_BASE;
  if (typeof base === "string" && base.trim()) {
    return `${base.replace(/\/$/, "")}/chat`;
  }
  return "/chat";
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

async function postChat(message: string): Promise<ChatResponse> {
  const res = await fetch(getChatUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(parseApiError(raw, res.status));
  }

  const data = JSON.parse(raw) as ChatResponse;
  if (!data.reply?.trim()) {
    throw new Error("모델이 비어 있는 응답을 반환했습니다.");
  }
  return { reply: data.reply.trim(), model: data.model ?? "" };
}

type GeminiChatProps = {
  preset?: { key: number; text: string } | null;
  onPresetConsumed?: () => void;
};

export default function GeminiChat({
  preset,
  onPresetConsumed,
}: GeminiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!preset?.text) return;
    setInput(preset.text);
    onPresetConsumed?.();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [preset?.key, preset?.text, onPresetConsumed]);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

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
      text: "답변을 생성하는 중…",
      pending: true,
    };

    setMessages((prev) => [...prev, userMsg, pending]);
    requestAnimationFrame(scrollToBottom);

    setLoading(true);
    try {
      const { reply, model } = await postChat(text);
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
    <aside className="gemini-chat" aria-label="Gemini 채팅" id="gemini-chat">
      <div className="gemini-chat__head">
        <span className="gemini-chat__badge">Gemini</span>
        <h2 className="gemini-chat__title">제미나이와 대화</h2>
        <p className="gemini-chat__meta">
          API: <code>POST /chat</code>
          {modelName ? (
            <>
              {" "}
              · 모델: <code>{modelName}</code>
            </>
          ) : null}
        </p>
      </div>

      <p className="gemini-chat__hint">
        백엔드 <code>POST /chat</code> 로 연결됩니다. PC 브라우저에서는 Vite가{" "}
        <code>/chat</code> 을 같은 PC의 API(기본 <code>127.0.0.1:8000</code>)로 프록시합니다.
        <br />
        <strong>폰·다른 기기·웹뷰 앱</strong>에서는 <code>localhost</code> 가 그 기기를 가리키므로,
        PC와 같은 Wi‑Fi일 때 터미널에 나온 <code>Network</code> 주소(예:{" "}
        <code>http://192.168.x.x:3000</code>)로 접속하세요. 빌드된 앱이 API를 직접 부를 때는{" "}
        <code>.env</code> 의 <code>VITE_API_BASE=http://&lt;PC_LAN_IP&gt;:8000</code> 로 빌드하고,
        API는 <code>API_HOST=0.0.0.0</code> 로 실행합니다. 자세히는{" "}
        <code>frontend/DEV_SERVER.md</code> 를 보세요.
        <br />
        <code>backend/apps/.env</code> 에 <code>GEMINI_API_KEY</code> 를 넣고 API 서버(
        <code>python main.py</code>)를 켜 두세요.
      </p>

      <p className="gemini-chat__ai-hint">
        <strong>AI 승부 예측</strong> — 예측 패널의「AI에게 이 경기 물어보기」를 누르면
        여기에 질문이 채워집니다. 승률·예상 스코어를 물어보세요.
      </p>

      {error ? (
        <div className="gemini-chat__error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="gemini-chat__stream">
        <div className="gemini-chat__messages" ref={listRef}>
          {messages.length === 0 ? (
            <p className="gemini-chat__empty">
              월드컵 일정, 규칙, 팀 정보 등 무엇이든 물어보세요.
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`gemini-chat__bubble gemini-chat__bubble--${m.role}${m.pending ? " gemini-chat__bubble--pending" : ""}`}
              >
                <span className="gemini-chat__who">
                  {m.role === "user" ? "나" : "Gemini"}
                </span>
                <p className="gemini-chat__text">{m.text}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <form className="gemini-chat__form" onSubmit={onSubmit}>
        <textarea
          ref={inputRef}
          className="gemini-chat__input"
          rows={2}
          placeholder="메시지를 입력하세요…"
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
          className="gemini-chat__send"
          disabled={loading || !input.trim()}
        >
          {loading ? "전송 중…" : "보내기"}
        </button>
      </form>
    </aside>
  );
}
