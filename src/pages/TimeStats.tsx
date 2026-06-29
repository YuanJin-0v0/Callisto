import { useEffect, useState, useCallback } from "react";

interface TimeStatsData {
  music_seconds: number;
  reading_seconds: number;
  gaming_seconds: number;
  pomodoro_count: number;
  pomodoro_seconds: number;
}

function fmt(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function TimeStats() {
  const [stats, setStats] = useState<TimeStatsData | null>(null);

  const load = useCallback(async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const data: TimeStatsData = await invoke("get_time_stats");
      setStats(data);
    } catch {
      /* not in Tauri */
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "var(--gold)", fontSize: 16 }}>时长统计</h2>
        <button className="pixel-btn" onClick={load}>刷新</button>
      </div>

      {stats ? (
        <>
          <div className="grid-2" style={{ marginBottom: 16 }}>
            {[
              { label: "🎵 听歌", value: fmt(stats.music_seconds) },
              { label: "📖 阅读", value: fmt(stats.reading_seconds) },
              { label: "🎮 游戏", value: fmt(stats.gaming_seconds) },
              { label: "⏱ 专注", value: fmt(stats.pomodoro_seconds) },
            ].map((s) => (
              <div key={s.label} className="pixel-card">
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.label}</div>
                <div style={{ fontSize: 18, color: "var(--gold)", marginTop: 4 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="pixel-card">
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>番茄钟完成</div>
            <div style={{ fontSize: 24, color: "var(--success)", marginTop: 4 }}>
              {stats.pomodoro_count} 个
            </div>
          </div>
        </>
      ) : (
        <p style={{ color: "var(--text-muted)" }}>暂无数据</p>
      )}
    </div>
  );
}
