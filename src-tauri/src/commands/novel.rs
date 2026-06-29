use rusqlite::params;
use tauri::State;

use crate::db::models::*;
use crate::db::Database;

#[tauri::command]
pub fn get_novels(db: State<Database>) -> Result<Vec<Novel>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, title, author, synopsis, cover_path, status, word_count, created_at, updated_at FROM novels ORDER BY updated_at DESC")
        .map_err(|e| e.to_string())?;
    let items = stmt
        .query_map([], |row| {
            Ok(Novel {
                id: Some(row.get(0)?),
                title: row.get(1)?,
                author: row.get(2)?,
                synopsis: row.get(3)?,
                cover_path: row.get(4)?,
                status: row.get(5)?,
                word_count: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(items)
}

#[tauri::command]
pub fn create_novel(db: State<Database>, title: String) -> Result<Novel, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO novels (title) VALUES (?1)",
        params![title],
    )
    .map_err(|e| e.to_string())?;
    let id = conn.last_insert_rowid();
    Ok(Novel {
        id: Some(id),
        title,
        author: Some("Me".into()),
        synopsis: None,
        cover_path: None,
        status: "draft".into(),
        word_count: Some(0),
        created_at: None,
        updated_at: None,
    })
}

#[tauri::command]
pub fn update_novel(db: State<Database>, novel: Novel) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE novels SET title=?1, author=?2, synopsis=?3, cover_path=?4, status=?5, updated_at=datetime('now') WHERE id=?6",
        params![novel.title, novel.author, novel.synopsis, novel.cover_path, novel.status, novel.id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_novel(db: State<Database>, id: i64) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM novels WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_chapters(db: State<Database>, novel_id: i64) -> Result<Vec<NovelChapter>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, novel_id, title, content, word_count, sort_order, status, created_at, updated_at FROM novel_chapters WHERE novel_id = ?1 ORDER BY sort_order")
        .map_err(|e| e.to_string())?;
    let items = stmt
        .query_map(params![novel_id], |row| {
            Ok(NovelChapter {
                id: Some(row.get(0)?),
                novel_id: row.get(1)?,
                title: row.get(2)?,
                content: row.get(3)?,
                word_count: row.get(4)?,
                sort_order: row.get(5)?,
                status: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(items)
}

#[tauri::command]
pub fn create_chapter(db: State<Database>, novel_id: i64, title: String) -> Result<NovelChapter, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let max_order: i32 = conn
        .query_row("SELECT COALESCE(MAX(sort_order), -1) FROM novel_chapters WHERE novel_id = ?1", params![novel_id], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO novel_chapters (novel_id, title, sort_order) VALUES (?1, ?2, ?3)",
        params![novel_id, title, max_order + 1],
    )
    .map_err(|e| e.to_string())?;
    let id = conn.last_insert_rowid();
    Ok(NovelChapter {
        id: Some(id),
        novel_id,
        title,
        content: String::new(),
        word_count: Some(0),
        sort_order: max_order + 1,
        status: "draft".into(),
        created_at: None,
        updated_at: None,
    })
}

#[tauri::command]
pub fn update_chapter(db: State<Database>, chapter: NovelChapter) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let wc = chapter.content.chars().count() as i64;
    conn.execute(
        "UPDATE novel_chapters SET title=?1, content=?2, word_count=?3, status=?4, updated_at=datetime('now') WHERE id=?5",
        params![chapter.title, chapter.content, wc, chapter.status, chapter.id],
    )
    .map_err(|e| e.to_string())?;
    let total: i64 = conn
        .query_row("SELECT COALESCE(SUM(word_count), 0) FROM novel_chapters WHERE novel_id = ?1", params![chapter.novel_id], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE novels SET word_count=?1, updated_at=datetime('now') WHERE id=?2",
        params![total, chapter.novel_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_chapter(db: State<Database>, id: i64) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM novel_chapters WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_inspirations(db: State<Database>) -> Result<Vec<NovelInspiration>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, novel_id, content, source, tags, created_at FROM novel_inspirations ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;
    let items = stmt
        .query_map([], |row| {
            Ok(NovelInspiration {
                id: Some(row.get(0)?),
                novel_id: row.get(1)?,
                content: row.get(2)?,
                source: row.get(3)?,
                tags: row.get(4)?,
                created_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(items)
}

#[tauri::command]
pub fn create_inspiration(db: State<Database>, content: String, source: Option<String>) -> Result<NovelInspiration, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO novel_inspirations (content, source) VALUES (?1, ?2)",
        params![content, source],
    )
    .map_err(|e| e.to_string())?;
    let id = conn.last_insert_rowid();
    Ok(NovelInspiration {
        id: Some(id),
        novel_id: None,
        content,
        source,
        tags: None,
        created_at: None,
    })
}
