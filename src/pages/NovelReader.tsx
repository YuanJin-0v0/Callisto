import { useEffect, useState, useCallback, useRef } from "react";

interface ReadingBook {
  id?: number;
  title: string;
  author?: string;
  file_path: string;
  file_type?: string;
  cover_path?: string;
  progress?: number;
  current_pos?: string;
  last_read?: string;
  created_at?: string;
}

export default function NovelReader() {
  const [books, setBooks] = useState<ReadingBook[]>([]);
  const [activeBook, setActiveBook] = useState<ReadingBook | null>(null);
  const [content, setContent] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [hidden, setHidden] = useState(false);
  const pageSize = 200;
  const contentRef = useRef<HTMLDivElement>(null);

  const loadBooks = useCallback(async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const list: ReadingBook[] = await invoke("get_reading_books");
      setBooks(list);
    } catch {
      /* not in Tauri */
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleImport = useCallback(async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const file = await open({
        multiple: false,
        filters: [{ name: "Text", extensions: ["txt", "md", "epub"] }],
      });
      if (!file) return;
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("import_book", { filePath: file });
      loadBooks();
    } catch {
      /* fallback: prompt path */
      const path = prompt("输入文件路径：");
      if (!path) return;
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("import_book", { filePath: path });
        loadBooks();
      } catch {
        /* not in Tauri */
      }
    }
  }, [loadBooks]);

  const openBook = useCallback(async (book: ReadingBook) => {
    setActiveBook(book);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const text: string = await invoke("read_book_content", { filePath: book.file_path });
      const lines = text.split("\n");
      setContent(lines);
      const startOffset = book.current_pos ? parseInt(book.current_pos) || 0 : 0;
      setOffset(startOffset);
    } catch {
      setContent(["无法读取文件"]);
    }
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("确定删除？")) return;
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("delete_reading_book", { id });
        loadBooks();
      } catch {
        /* not in Tauri */
      }
    },
    [loadBooks]
  );

  const saveProgress = useCallback(async () => {
    if (!activeBook?.id) return;
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const progress = content.length > 0 ? offset / content.length : 0;
      await invoke("update_reading_progress", {
        id: activeBook.id,
        progress,
        currentPos: String(offset),
      });
    } catch {
      /* not in Tauri */
    }
  }, [activeBook, offset, content]);

  const scrollUp = useCallback(() => {
    setOffset((o) => Math.max(0, o - pageSize));
  }, []);

  const scrollDown = useCallback(() => {
    setOffset((o) => Math.min(content.length - 1, o + pageSize));
    saveProgress();
  }, [content, saveProgress]);

  const toggleBossKey = useCallback(async () => {
    setHidden((h) => !h);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      if (hidden) {
        await invoke("boss_key_show");
      } else {
        await invoke("boss_key_hide");
      }
    } catch {
      /* not in Tauri */
    }
  }, [hidden]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "H") {
        e.preventDefault();
        toggleBossKey();
      }
      if (activeBook) {
        if (e.key === "ArrowUp" || e.key === "PageUp") scrollUp();
        if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") scrollDown();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeBook, scrollUp, scrollDown, toggleBossKey]);

  if (activeBook) {
    const visibleText = content.slice(offset, offset + pageSize);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: hidden ? "var(--bg-primary)" : undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div>
            <button className="pixel-btn" onClick={() => { saveProgress(); setActiveBook(null); }} style={{ marginRight: 8 }}>
              ← 返回
            </button>
            <span style={{ color: "var(--gold)", fontSize: 14 }}>{activeBook.title}</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              className="pixel-btn"
              onClick={toggleBossKey}
              style={{ borderColor: "var(--danger)" }}
            >
              {hidden ? "显示" : "Boss Key"} (Ctrl+Shift+H)
            </button>
          </div>
        </div>

        {hidden ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              fontSize: 24,
            }}
          >
            看起来你正在努力工作
          </div>
        ) : (
          <>
            <div
              ref={contentRef}
              className="pixel-card"
              style={{
                flex: 1,
                overflow: "auto",
                fontSize: 15,
                lineHeight: 1.9,
                whiteSpace: "pre-wrap",
                padding: "16px 24px",
              }}
            >
              {visibleText.map((line, i) => (
                <div key={i}>{line || "\u00A0"}</div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                {Math.round((offset / content.length) * 100)}% · 行 {offset + 1}-
                {Math.min(offset + pageSize, content.length)}/{content.length}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="pixel-btn" onClick={scrollUp}>
                  ↑ 上一页
                </button>
                <button className="pixel-btn" onClick={saveProgress}>
                  保存进度
                </button>
                <button className="pixel-btn primary" onClick={scrollDown}>
                  ↓ 下一页
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "var(--gold)", fontSize: 16 }}>小说阅读</h2>
        <button className="pixel-btn primary" onClick={handleImport}>
          + 导入书籍
        </button>
      </div>

      {books.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>暂无书籍，点击「导入书籍」添加 txt 文件</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {books.map((book) => (
            <div
              key={book.id}
              className="pixel-card"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div style={{ cursor: "pointer", flex: 1 }} onClick={() => openBook(book)}>
                <div style={{ fontWeight: "bold" }}>{book.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {book.file_type?.toUpperCase()} ·{" "}
                  {book.progress != null ? `${Math.round(book.progress * 100)}%` : "未读"}
                  {book.last_read ? ` · ${book.last_read}` : ""}
                </div>
              </div>
              <button
                className="pixel-btn"
                style={{ fontSize: 11 }}
                onClick={() => book.id && handleDelete(book.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
