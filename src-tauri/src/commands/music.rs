use std::fs;
use std::path::Path;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct SongInfo {
    pub path: String,
    pub title: String,
    pub artist: String,
    pub duration: f64,
}

#[tauri::command]
pub fn scan_music_directory(dir: String) -> Result<Vec<SongInfo>, String> {
    let path = Path::new(&dir);
    if !path.is_dir() {
        return Err("Invalid directory".into());
    }

    let extensions = ["mp3", "flac", "wav", "ogg", "m4a", "aac", "wma"];
    let mut songs = Vec::new();

    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            let entry_path = entry.path();
            if let Some(ext) = entry_path.extension().and_then(|e| e.to_str()) {
                if extensions.contains(&ext.to_lowercase().as_str()) {
                    let file_name = entry_path
                        .file_stem()
                        .and_then(|s| s.to_str())
                        .unwrap_or("Unknown")
                        .to_string();
                    songs.push(SongInfo {
                        path: entry_path.to_string_lossy().to_string(),
                        title: file_name,
                        artist: "Unknown".into(),
                        duration: 0.0,
                    });
                }
            }
        }
    }

    songs.sort_by(|a, b| a.title.to_lowercase().cmp(&b.title.to_lowercase()));
    Ok(songs)
}

#[tauri::command]
pub fn read_audio_file(path: String) -> Result<Vec<u8>, String> {
    fs::read(&path).map_err(|e| e.to_string())
}
