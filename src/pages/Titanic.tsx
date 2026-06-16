import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import "./Titanic.css";

type TitanicProps = {
  hideOuterTitle?: boolean;
};

function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE?.trim();
  if (base) {
    return `${base.replace(/\/$/, "")}${path}`;
  }
  return path;
}

/** `POST /api/titanic/james/upload` — 백엔드 `JamesDirectorUploadResponse` 와 동일 */
type UploadResponse = {
  ok?: boolean;
  message: string;
  filename: string;
  row_count: number;
  note?: string;
  /** 있으면 CSV 헤더 목록 (없을 수 있음 — `columns` 없이 응답하는 경우 대비) */
  columns?: string[];
  preview?: Record<string, unknown>[];
};

function parseApiError(
  body: { detail?: string | { msg?: string }[] } | null,
  status: number,
): string {
  if (body && typeof body === "object" && "detail" in body) {
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail
        .map((d) => (typeof d === "object" && d?.msg ? d.msg : String(d)))
        .join(", ");
    }
  }
  return `요청에 실패했습니다. (${status})`;
}

async function uploadJamesCsv(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file, file.name);
  const res = await fetch(apiUrl("/api/titanic/james/upload"), {
    method: "POST",
    body: form,
  });
  const body = (await res.json().catch(() => null)) as
    | { detail?: string | { msg?: string }[] }
    | UploadResponse
    | null;
  if (!res.ok) {
    throw new Error(
      parseApiError(body as { detail?: string | { msg?: string }[] } | null, res.status),
    );
  }
  return body as UploadResponse;
}

const INPUT_ID = "titanic-james-csv-input";

export default function Titanic({ hideOuterTitle = false }: TitanicProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pickedName, setPickedName] = useState<string | null>(null);

  const ingest = useCallback(async (file: File) => {
    setError(null);
    setOk(null);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("CSV 파일만 업로드할 수 있습니다.");
      return;
    }
    setBusy(true);
    setPickedName(file.name);
    try {
      const data = await uploadJamesCsv(file);
      const cols = Array.isArray(data.columns) ? data.columns : [];
      const hasGender = cols.includes("gender");
      setOk(
        `${data.message} · ${data.row_count.toLocaleString()}행, ${(file.size / 1024).toFixed(1)} KB` +
          (hasGender ? " · Sex → gender 변환됨" : ""),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "파일을 업로드하는 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }, []);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) void ingest(f);
  };

  return (
    <main className="titanic">
      <div className="titanic__inner">
        {!hideOuterTitle ? (
          <h1 className="titanic__title">타이타닉 홈</h1>
        ) : null}

        <section
          className={`titanic-upload${hideOuterTitle ? " titanic-upload--tight" : ""}`}
          aria-labelledby="titanic-upload-heading"
        >
          <h2 id="titanic-upload-heading" className="titanic-upload__heading">
            James — Titanic 데이터
          </h2>
          <p className="titanic-upload__lead">
            Kaggle 형식의 Titanic CSV(예: <code>Titanic-Dataset.csv</code>)를
            업로드합니다. <code>POST /api/titanic/james/upload</code>
          </p>

          <input
            id={INPUT_ID}
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="titanic-upload__hidden"
            onChange={onInputChange}
          />

          <label
            htmlFor={INPUT_ID}
            className={`titanic-upload__zone${dragOver ? " titanic-upload__zone--active" : ""}${busy ? " titanic-upload__zone--busy" : ""}`}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) void ingest(f);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
          >
            <span className="titanic-upload__zone-icon" aria-hidden>
              ↑
            </span>
            <span className="titanic-upload__zone-title">업로드 창</span>
            <span className="titanic-upload__zone-text">
              {pickedName
                ? `선택된 파일: ${pickedName}`
                : "Titanic CSV를 여기로 드래그하거나, 이 영역을 클릭하세요."}
            </span>
          </label>

          <div className="titanic-upload__actions">
            <button
              type="button"
              className="titanic-upload__btn"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? "처리 중…" : "업로드 버튼 (파일 선택)"}
            </button>
          </div>

          {error ? (
            <p className="titanic-upload__msg titanic-upload__msg--error" role="alert">
              {error}
            </p>
          ) : null}
          {ok ? (
            <p className="titanic-upload__msg titanic-upload__msg--ok">{ok}</p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
