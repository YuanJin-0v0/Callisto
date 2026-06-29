import { useState, useCallback, useEffect, useRef } from "react";

export default function Pomodoro() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [active, setActive] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const intervalRef = useRef<number>(0);

  const start = useCallback(async () => {
    setActive(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const id: number = await invoke("start_pomodoro", { durationMinutes: minutes });
      setSessionId(id);
    } catch {
      /* not in Tauri */
    }
  }, [minutes]);

  const complete = useCallback(async () => {
    setActive(false);
    setMinutes(25);
    setSeconds(0);
    if (sessionId) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("complete_pomodoro", { sessionId });
      } catch {
        /* not in Tauri */
      }
    }
    setSessionId(null);
  }, [sessionId]);

  useEffect(() => {
    if (!active) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s > 0) return s - 1;
        setMinutes((m) => {
          if (m > 0) return m - 1;
          complete();
          return 0;
        });
        return 59;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [active, complete]);

  const display = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 40 }}>
      <h2 style={{ margin: "0 0 24px", color: "var(--gold)", fontSize: 16 }}>番茄钟</h2>

      <div
        className="pixel-card"
        style={{
          fontSize: 48,
          padding: "32px 48px",
          textAlign: "center",
          color: "var(--accent)",
          fontVariantNumeric: "tabular-nums",
          marginBottom: 24,
        }}
      >
        {display}
      </div>

      {!active ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="pixel-btn"
            onClick={() => setMinutes((m) => Math.max(1, m - 5))}
          >
            -5
          </button>
          <input
            className="pixel-input"
            type="number"
            value={minutes}
            min={1}
            max={120}
            onChange={(e) => setMinutes(parseInt(e.target.value) || 25)}
            style={{ width: 60, textAlign: "center", fontSize: 16 }}
          />
          <button
            className="pixel-btn"
            onClick={() => setMinutes((m) => Math.min(120, m + 5))}
          >
            +5
          </button>
          <button className="pixel-btn primary" onClick={start} style={{ marginLeft: 8 }}>
            开始专注
          </button>
        </div>
      ) : (
        <button className="pixel-btn" onClick={complete} style={{ borderColor: "var(--danger)" }}>
          结束
        </button>
      )}
    </div>
  );
}
