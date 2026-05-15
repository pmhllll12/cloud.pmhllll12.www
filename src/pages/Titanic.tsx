import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import "./Titanic.css";

function isTitanicCsv(name: string): boolean {
  return name.trim().toLowerCase() === "titanic.csv";
}

async function readCsvPreview(file: File): Promise<{ rows: number; bytes: number }> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const rows = Math.max(0, lines.length - 1);
  return { rows, bytes: file.size };
}

const INPUT_ID = "titanic-csv-input";

export default function Titanic() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pickedName, setPickedName] = useState<string | null>(null);

  const resetMessages = () => {
    setError(null);
    setOk(null);
  };

  const ingest = useCallback(async (file: File) => {
    resetMessages();
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("CSV 파일만 업로드할 수 있습니다.");
      return;
    }
    if (!isTitanicCsv(file.name)) {
      setError('파일 이름은 반드시 "titanic.csv" 여야 합니다.');
      return;
    }
    setBusy(true);
    setPickedName(file.name);
    try {
      const { rows, bytes } = await readCsvPreview(file);
      setOk(
        `업로드 완료 · ${rows.toLocaleString()}행 (헤더 제외), ${(bytes / 1024).toFixed(1)} KB`,
      );
    } catch {
      setError("파일을 읽는 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }, []);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) void ingest(f);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void ingest(f);
  };

  const onDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const openPicker = () => {
    inputRef.current?.click();
  };

  return (
    <main className="titanic">
      <div className="titanic__inner">
        <h1 className="titanic__title">타이타닉 홈</h1>

        <section className="titanic-upload" aria-labelledby="titanic-upload-heading">
          <h2 id="titanic-upload-heading" className="titanic-upload__heading">
            Titanic 데이터
          </h2>
          <p className="titanic-upload__lead">
            <strong>업로드 창</strong>에 <code>titanic.csv</code> 를 끌어 놓거나 창을
            클릭하거나, 아래 <strong>업로드 버튼</strong>으로 동일 파일을 선택할 수
            있습니다.
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
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            <span className="titanic-upload__zone-icon" aria-hidden>
              ↑
            </span>
            <span className="titanic-upload__zone-title">업로드 창</span>
            <span className="titanic-upload__zone-text">
              {pickedName
                ? `선택된 파일: ${pickedName}`
                : "titanic.csv 를 여기로 드래그하거나, 이 영역을 클릭하세요."}
            </span>
          </label>

          <div className="titanic-upload__actions">
            <button
              type="button"
              className="titanic-upload__btn"
              disabled={busy}
              onClick={() => openPicker()}
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
