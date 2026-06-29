import { useEffect, useState, useCallback } from "react";
import type { MediaItem, MediaStats } from "../types/media";

const STATUS_MAP: Record<string, string> = {
  doing: "在看",
  done: "看完",
  plan: "想看",
  pause: "暂停",
  drop: "弃番",
};

export default function AnimeList() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [filter, setFilter] = useState("all");

  const loadData = useCallback(async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const list: MediaItem[] = await invoke("get_media_list", {
        mediaType: "anime",
        status: filter === "all" ? null : filter,
      });
      setItems(list);
      const s: MediaStats = await invoke("get_media_stats");
      setStats(s);
    } catch {
      /* not in Tauri */
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = useCallback(async () => {
    const title = prompt("输入番剧名称：");
    if (!title) return;
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("create_media_item", {
        item: {
          title,
          type: "anime",
          status: "plan",
        },
      });
      loadData();
    } catch {
      /* not in Tauri */
    }
  }, [loadData]);

  const handleStatusChange = useCallback(
    async (id: number, status: string) => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const item = items.find((i) => i.id === id);
        if (item) {
          await invoke("update_media_item", { item: { ...item, status } });
          loadData();
        }
      } catch {
        /* not in Tauri */
      }
    },
    [items, loadData]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("确定删除？")) return;
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("delete_media_item", { id });
        loadData();
      } catch {
        /* not in Tauri */
      }
    },
    [loadData]
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0, color: "var(--gold)", fontSize: 16 }}>番剧库</h2>
        <button className="pixel-btn primary" onClick={handleAdd}>
          + 添加
        </button>
      </div>

      {stats && (
        <div className="grid-4" style={{ marginBottom: 16 }}>
          {[
            { label: "在看", value: stats.watching, color: "var(--accent)" },
            { label: "看完", value: stats.completed, color: "var(--success)" },
            { label: "想看", value: stats.plan, color: "var(--gold)" },
            { label: "总计", value: stats.total, color: "var(--text-primary)" },
          ].map((s) => (
            <div key={s.label} className="pixel-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.label}</div>
              <div style={{ fontSize: 20, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {["all", "doing", "done", "plan", "pause", "drop"].map((s) => (
          <button
            key={s}
            className={`pixel-btn${filter === s ? " primary" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s === "all" ? "全部" : STATUS_MAP[s]}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>
          {filter === "all" ? "暂无条目，点击「+ 添加」开始追番" : "没有匹配的条目"}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item) => (
            <div key={item.id} className="pixel-card" style={{ display: "flex", gap: 12 }}>
              <div
                style={{
                  width: 64,
                  height: 88,
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                {item.cover_url ? (
                  <img
                    src={item.cover_url}
                    alt=""
                    style={{ width: 64, height: 88, objectFit: "cover" }}
                  />
                ) : (
                  "🎬"
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", color: "var(--text-primary)" }}>
                  {item.title_cn || item.title}
                </div>
                {item.title_cn && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.title}</div>
                )}
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                  {item.progress != null && item.episodes
                    ? `进度 ${item.progress}/${item.episodes}`
                    : STATUS_MAP[item.status] || item.status}
                  {item.score ? ` | ⭐${item.score}` : ""}
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                  <select
                    className="pixel-input"
                    value={item.status}
                    onChange={(e) => item.id && handleStatusChange(item.id, e.target.value)}
                    style={{ fontSize: 11, padding: "2px 4px" }}
                  >
                    {Object.entries(STATUS_MAP).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <button
                    className="pixel-btn"
                    style={{ fontSize: 11, padding: "2px 6px" }}
                    onClick={() => item.id && handleDelete(item.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
