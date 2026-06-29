use rusqlite::params;
use serde::Serialize;
use tauri::State;

use crate::db::Database;

#[derive(Debug, Serialize)]
pub struct TimeStats {
    pub music_seconds: i64,
    pub reading_seconds: i64,
    pub gaming_seconds: i64,
    pub pomodoro_count: i64,
    pub pomodoro_seconds: i64,
}

#[tauri::command]
pub fn start_session(
    db: State<Database>,
    session_type: String,
    label: Option<String>,
    ref_id: Option<i64>,
) -> Result<i64, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO time_sessions (type, label, ref_id, start_time) VALUES (?1, ?2, ?3, datetime('now'))",
        params![session_type, label, ref_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn stop_session(db: State<Database>, session_id: i64) -> Result<i64, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE time_sessions SET end_time=datetime('now'), duration=CAST((julianday('now') - julianday(start_time)) * 86400 AS INTEGER) WHERE id=?1",
        params![session_id],
    )
    .map_err(|e| e.to_string())?;
    let dur: i64 = conn
        .query_row(
            "SELECT COALESCE(duration, 0) FROM time_sessions WHERE id=?1",
            params![session_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;
    Ok(dur)
}

#[tauri::command]
pub fn get_time_stats(db: State<Database>) -> Result<TimeStats, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let music: i64 = conn
        .query_row(
            "SELECT COALESCE(SUM(duration), 0) FROM time_sessions WHERE type='music'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;
    let reading: i64 = conn
        .query_row(
            "SELECT COALESCE(SUM(duration), 0) FROM time_sessions WHERE type='reading'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;
    let gaming: i64 = conn
        .query_row(
            "SELECT COALESCE(SUM(duration), 0) FROM time_sessions WHERE type='game'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;
    let pomodoro_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM pomodoro_sessions WHERE completed=1",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;
    let pomodoro_seconds: i64 = conn
        .query_row(
            "SELECT COALESCE(SUM(duration * 60), 0) FROM pomodoro_sessions WHERE completed=1",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    Ok(TimeStats {
        music_seconds: music,
        reading_seconds: reading,
        gaming_seconds: gaming,
        pomodoro_count,
        pomodoro_seconds,
    })
}

#[tauri::command]
pub fn start_pomodoro(db: State<Database>, duration_minutes: i64) -> Result<i64, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO pomodoro_sessions (duration, started_at) VALUES (?1, datetime('now'))",
        params![duration_minutes],
    )
    .map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn complete_pomodoro(db: State<Database>, session_id: i64) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE pomodoro_sessions SET completed=1, ended_at=datetime('now') WHERE id=?1",
        params![session_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(target_os = "windows")]
#[tauri::command]
pub fn get_foreground_process() -> Result<String, String> {
    unsafe {
        let hwnd = windows::Win32::UI::WindowsAndMessaging::GetForegroundWindow();
        let mut buf = [0u16; 256];
        let len = windows::Win32::UI::WindowsAndMessaging::GetWindowTextW(hwnd, &mut buf);
        if len > 0 {
            let s = String::from_utf16_lossy(&buf[..len as usize]);
            return Ok(s);
        }
    }
    Ok("unknown".into())
}

#[cfg(not(target_os = "windows"))]
#[tauri::command]
pub fn get_foreground_process() -> Result<String, String> {
    Ok("unknown".into())
}
