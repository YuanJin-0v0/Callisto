use rusqlite::params;
use serde_json;
use tauri::State;

use crate::db::models::*;
use crate::db::Database;

#[tauri::command]
pub fn get_media_list(
    db: State<Database>,
    media_type: Option<String>,
    status: Option<String>,
) -> Result<Vec<MediaItem>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut sql = String::from(
        "SELECT id, title, title_cn, type, status, score, episodes, progress, cover_url, summary, tags, comment, start_date, finish_date, platform, platform_id, created_at, updated_at FROM media_items WHERE 1=1"
    );
    let mut param_values: Vec<String> = Vec::new();

    if let Some(ref t) = media_type {
        param_values.push(t.clone());
        sql.push_str(&format!(" AND type = ?{}", param_values.len()));
    }
    if let Some(ref s) = status {
        param_values.push(s.clone());
        sql.push_str(&format!(" AND status = ?{}", param_values.len()));
    }
    sql.push_str(" ORDER BY updated_at DESC");

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let params_refs: Vec<&dyn rusqlite::types::ToSql> =
        param_values.iter().map(|v| v as &dyn rusqlite::types::ToSql).collect();

    let items = stmt
        .query_map(params_refs.as_slice(), |row| {
            Ok(MediaItem {
                id: Some(row.get(0)?),
                title: row.get(1)?,
                title_cn: row.get(2)?,
                media_type: row.get(3)?,
                status: row.get(4)?,
                score: row.get(5)?,
                episodes: row.get(6)?,
                progress: row.get(7)?,
                cover_url: row.get(8)?,
                summary: row.get(9)?,
                tags: row.get(10)?,
                comment: row.get(11)?,
                start_date: row.get(12)?,
                finish_date: row.get(13)?,
                platform: row.get(14)?,
                platform_id: row.get(15)?,
                created_at: row.get(16)?,
                updated_at: row.get(17)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(items)
}

#[tauri::command]
pub fn create_media_item(db: State<Database>, item: MediaItem) -> Result<MediaItem, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO media_items (title, title_cn, type, status, score, episodes, progress, cover_url, summary, tags, comment, start_date, finish_date, platform, platform_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
        params![
            item.title, item.title_cn, item.media_type, item.status, item.score,
            item.episodes, item.progress, item.cover_url, item.summary, item.tags,
            item.comment, item.start_date, item.finish_date, item.platform, item.platform_id
        ],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    let mut result = item;
    result.id = Some(id);
    Ok(result)
}

#[tauri::command]
pub fn update_media_item(db: State<Database>, item: MediaItem) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE media_items SET title=?1, title_cn=?2, type=?3, status=?4, score=?5, episodes=?6, progress=?7, cover_url=?8, summary=?9, tags=?10, comment=?11, start_date=?12, finish_date=?13, platform=?14, platform_id=?15, updated_at=datetime('now') WHERE id=?16",
        params![
            item.title, item.title_cn, item.media_type, item.status, item.score,
            item.episodes, item.progress, item.cover_url, item.summary, item.tags,
            item.comment, item.start_date, item.finish_date, item.platform, item.platform_id,
            item.id
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_media_item(db: State<Database>, id: i64) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM media_items WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_media_stats(db: State<Database>) -> Result<MediaStats, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT
            COALESCE(SUM(CASE WHEN status='doing' THEN 1 ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN status='done' THEN 1 ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN status='plan' THEN 1 ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN status='pause' THEN 1 ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN status='drop' THEN 1 ELSE 0 END), 0),
            COUNT(*)
            FROM media_items",
        )
        .map_err(|e| e.to_string())?;

    let stats = stmt
        .query_row([], |row| {
            Ok(MediaStats {
                watching: row.get(0)?,
                completed: row.get(1)?,
                plan: row.get(2)?,
                paused: row.get(3)?,
                dropped: row.get(4)?,
                total: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(stats)
}

#[tauri::command]
pub fn import_from_bangumi(db: State<Database>, username: String) -> Result<String, String> {
    let url = format!("https://api.bgm.tv/v0/users/{}/collections", username);
    let resp = reqwest::blocking::get(&url).map_err(|e| e.to_string())?;
    let data: serde_json::Value = resp.json().map_err(|e| e.to_string())?;

    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    if let Some(entries) = data.as_array() {
        for entry in entries {
            let subject = &entry["subject"];
            let title = subject["name"].as_str().unwrap_or("Unknown");
            let title_cn = subject["name_cn"].as_str();
            let subject_id = subject["id"].as_i64().unwrap_or(0);
            let status_code = entry["type"].as_i64().unwrap_or(3);

            let status = match status_code {
                1 => "doing",
                2 => "done",
                3 => "plan",
                4 => "pause",
                _ => "plan",
            };

            let ep_count = subject["episode_count"].as_i64();
            let cover = subject["images"]["large"].as_str();
            let summary = subject["summary"].as_str();

            conn.execute(
                "INSERT OR IGNORE INTO media_items (title, title_cn, type, status, episodes, cover_url, summary, platform, platform_id) VALUES (?1, ?2, 'anime', ?3, ?4, ?5, ?6, 'bangumi', ?7)",
                params![title, title_cn, status, ep_count, cover, summary, subject_id],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    Ok(format!("Imported {} entries", data.as_array().map_or(0, |a| a.len())))
}
