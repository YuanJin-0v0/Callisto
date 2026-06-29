use rusqlite::params;
use std::fs;
use std::path::Path;
use tauri::{Manager, State};

use crate::db::models::*;
use crate::db::Database;

#[tauri::command]
pub fn get_reading_books(db: State<Database>) -> Result<Vec<ReadingBook>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, title, author, file_path, file_type, cover_path, progress, current_pos, last_read, created_at FROM reading_books ORDER BY last_read DESC")
        .map_err(|e| e.to_string())?;
    let items = stmt
        .query_map([], |row| {
            Ok(ReadingBook {
                id: Some(row.get(0)?),
                title: row.get(1)?,
                author: row.get(2)?,
                file_path: row.get(3)?,
                file_type: row.get(4)?,
                cover_path: row.get(5)?,
                progress: row.get(6)?,
                current_pos: row.get(7)?,
                last_read: row.get(8)?,
                created_at: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(items)
}

#[tauri::command]
pub fn import_book(db: State<Database>, file_path: String) -> Result<ReadingBook, String> {
    let path = Path::new(&file_path);
    let file_name = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Unknown")
        .to_string();
    let ext = path
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or("txt")
        .to_lowercase();

    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO reading_books (title, file_path, file_type) VALUES (?1, ?2, ?3)",
        params![file_name, file_path, ext],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    Ok(ReadingBook {
        id: Some(id),
        title: file_name,
        author: None,
        file_path,
        file_type: Some(ext),
        cover_path: None,
        progress: Some(0.0),
        current_pos: None,
        last_read: None,
        created_at: None,
    })
}

#[tauri::command]
pub fn delete_reading_book(db: State<Database>, id: i64) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM reading_books WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn read_book_content(file_path: String) -> Result<String, String> {
    let content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
    Ok(content)
}

#[tauri::command]
pub fn update_reading_progress(
    db: State<Database>,
    id: i64,
    progress: f64,
    current_pos: Option<String>,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE reading_books SET progress=?1, current_pos=?2, last_read=datetime('now') WHERE id=?3",
        params![progress, current_pos, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_bookmarks(db: State<Database>, book_id: i64) -> Result<Vec<ReadingBookmark>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, book_id, title, position, note, created_at FROM reading_bookmarks WHERE book_id = ?1 ORDER BY created_at")
        .map_err(|e| e.to_string())?;
    let items = stmt
        .query_map(params![book_id], |row| {
            Ok(ReadingBookmark {
                id: Some(row.get(0)?),
                book_id: row.get(1)?,
                title: row.get(2)?,
                position: row.get(3)?,
                note: row.get(4)?,
                created_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(items)
}

#[tauri::command]
pub fn create_bookmark(db: State<Database>, book_id: i64, title: String, position: String) -> Result<ReadingBookmark, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO reading_bookmarks (book_id, title, position) VALUES (?1, ?2, ?3)",
        params![book_id, title, position],
    )
    .map_err(|e| e.to_string())?;
    let id = conn.last_insert_rowid();
    Ok(ReadingBookmark {
        id: Some(id),
        book_id,
        title: Some(title),
        position,
        note: None,
        created_at: None,
    })
}

#[tauri::command]
pub fn boss_key_hide(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("main") {
        win.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn boss_key_show(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("main") {
        win.show().map_err(|e| e.to_string())?;
    }
    Ok(())
}
