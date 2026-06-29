import { useEffect, useState, useCallback } from "react";
import type { Novel, NovelChapter, NovelInspiration } from "../types/novel";

const STATUS_NAMES: Record<string, string> = {
  draft: "草稿",
  writing: "撰写中",
  finished: "完本",
};

export default function NovelWriter() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [activeNovel, setActiveNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<NovelChapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<NovelChapter | null>(null);
  const [inspirations, setInspirations] = useState<NovelInspiration[]>([]);
  const [tab, setTab] = useState<"novels" | "inspirations">("novels");

  const loadNovels = useCallback(async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const list: Novel[] = await invoke("get_novels");
      setNovels(list);
    } catch {
      /* not in Tauri */
    }
  }, []);

  const loadChapters = useCallback(async (novelId: number) => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const list: NovelChapter[] = await invoke("get_chapters", { novelId });
      setChapters(list);
    } catch {
      /* not in Tauri */
    }
  }, []);

  const loadInspirations = useCallback(async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const list: NovelInspiration[] = await invoke("get_inspirations");
      setInspirations(list);
    } catch {
      /* not in Tauri */
    }
  }, []);

  useEffect(() => {
    loadNovels();
    loadInspirations();
  }, [loadNovels, loadInspirations]);

  const handleCreateNovel = useCallback(async () => {
    const title = prompt("输入作品名称：");
    if (!title) return;
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("create_novel", { title });
      loadNovels();
    } catch {
      /* not in Tauri */
    }
  }, [loadNovels]);

  const handleSelectNovel = useCallback(
    (novel: Novel) => {
      setActiveNovel(novel);
      setActiveChapter(null);
      if (novel.id) loadChapters(novel.id);
    },
    [loadChapters]
  );

  const handleCreateChapter = useCallback(async () => {
    if (!activeNovel?.id) return;
    const title = prompt("输入章节名称：");
    if (!title) return;
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("create_chapter", { novelId: activeNovel.id, title });
      loadChapters(activeNovel.id);
    } catch {
      /* not in Tauri */
    }
  }, [activeNovel, loadChapters]);

  const handleSaveChapter = useCallback(async () => {
    if (!activeChapter?.id) return;
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("update_chapter", { chapter: activeChapter });
      if (activeNovel?.id) loadChapters(activeNovel.id);
    } catch {
      /* not in Tauri */
    }
  }, [activeChapter, activeNovel, loadChapters]);

  const handleAddInspiration = useCallback(async () => {
    const content = prompt("记录灵感：");
    if (!content) return;
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("create_inspiration", { content, source: null });
      loadInspirations();
    } catch {
      /* not in Tauri */
    }
  }, [loadInspirations]);

  if (activeNovel) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <button className="pixel-btn" onClick={() => { setActiveNovel(null); setActiveChapter(null); }} style={{ marginRight: 8 }}>
              ← 返回
            </button>
            <span style={{ color: "var(--gold)", fontSize: 14, fontWeight: "bold" }}>
              {activeNovel.title}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: 12, marginLeft: 8 }}>
              ({activeNovel.word_count || 0} 字)
            </span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button className="pixel-btn" onClick={handleCreateChapter}>+ 章节</button>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, gap: 12, overflow: "hidden" }}>
          <div style={{ width: 180, flexShrink: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
            {chapters.map((ch) => (
              <button
                key={ch.id}
                className={`pixel-btn${activeChapter?.id === ch.id ? " primary" : ""}`}
                onClick={() => setActiveChapter(ch)}
                style={{ textAlign: "left", fontSize: 11, padding: "4px 8px", width: "100%" }}
              >
                {ch.title}
                <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>
                  ({ch.word_count || 0})
                </span>
              </button>
            ))}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {activeChapter ? (
              <>
                <input
                  className="pixel-input"
                  value={activeChapter.title}
                  onChange={(e) => setActiveChapter({ ...activeChapter, title: e.target.value })}
                  style={{ marginBottom: 8, fontSize: 14, fontWeight: "bold", width: "100%" }}
                />
                <textarea
                  className="pixel-input"
                  value={activeChapter.content}
                  onChange={(e) => setActiveChapter({ ...activeChapter, content: e.target.value })}
                  style={{
                    flex: 1,
                    width: "100%",
                    resize: "none",
                    fontSize: 14,
                    lineHeight: 1.8,
                    fontFamily: "inherit",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {activeChapter.content.length} 字
                  </span>
                  <button className="pixel-btn primary" onClick={handleSaveChapter}>
                    保存
                  </button>
                </div>
              </>
            ) : (
              <div style={{ color: "var(--text-muted)", textAlign: "center", paddingTop: 60 }}>
                选择或创建章节开始写作
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "var(--gold)", fontSize: 16 }}>小说写作</h2>
        <div style={{ display: "flex", gap: 4 }}>
          <button className={`pixel-btn${tab === "novels" ? " primary" : ""}`} onClick={() => setTab("novels")}>
            作品
          </button>
          <button className={`pixel-btn${tab === "inspirations" ? " primary" : ""}`} onClick={() => setTab("inspirations")}>
            灵感
          </button>
        </div>
      </div>

      {tab === "novels" ? (
        <>
          <button className="pixel-btn primary" onClick={handleCreateNovel} style={{ marginBottom: 12 }}>
            + 新建作品
          </button>
          {novels.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>暂无作品</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {novels.map((novel) => (
                <div
                  key={novel.id}
                  className="pixel-card"
                  onClick={() => handleSelectNovel(novel)}
                  style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <div style={{ fontWeight: "bold" }}>{novel.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {novel.word_count || 0} 字 · {STATUS_NAMES[novel.status] || novel.status}
                    </div>
                  </div>
                  <div style={{ color: "var(--text-muted)" }}>→</div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <button className="pixel-btn primary" onClick={handleAddInspiration} style={{ marginBottom: 12 }}>
            + 记录灵感
          </button>
          {inspirations.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>暂无灵感记录</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {inspirations.map((insp) => (
                <div key={insp.id} className="pixel-card">
                  <div>{insp.content}</div>
                  {insp.source && (
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                      来源: {insp.source}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    {insp.created_at}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
