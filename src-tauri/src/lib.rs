mod commands;
mod db;

use db::Database;
use tauri::{Manager, PhysicalPosition};

fn position_pet_window(app: &tauri::App) {
    if let Some(monitor) = app.primary_monitor().ok().flatten() {
        let size = monitor.size();
        let pet_size = 200;
        let x = (size.width as i32).saturating_sub(pet_size + 20);
        let y = (size.height as i32).saturating_sub(pet_size + 60);
        if let Some(pet_win) = app.get_webview_window("pet") {
            let _ = pet_win.set_position(PhysicalPosition::new(x, y));
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let database = Database::new().expect("Failed to initialize database");
    database.initialize().expect("Failed to run migrations");

    tauri::Builder::default()
        .manage(database)
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            position_pet_window(app);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::anime::get_media_list,
            commands::anime::create_media_item,
            commands::anime::update_media_item,
            commands::anime::delete_media_item,
            commands::anime::get_media_stats,
            commands::anime::import_from_bangumi,
            commands::novel::get_novels,
            commands::novel::create_novel,
            commands::novel::update_novel,
            commands::novel::delete_novel,
            commands::novel::get_chapters,
            commands::novel::create_chapter,
            commands::novel::update_chapter,
            commands::novel::delete_chapter,
            commands::novel::get_inspirations,
            commands::novel::create_inspiration,
            commands::reader::get_reading_books,
            commands::reader::import_book,
            commands::reader::delete_reading_book,
            commands::reader::read_book_content,
            commands::reader::update_reading_progress,
            commands::reader::get_bookmarks,
            commands::reader::create_bookmark,
            commands::reader::boss_key_hide,
            commands::reader::boss_key_show,
            commands::music::scan_music_directory,
            commands::music::read_audio_file,
            commands::tracker::start_session,
            commands::tracker::stop_session,
            commands::tracker::get_time_stats,
            commands::tracker::start_pomodoro,
            commands::tracker::complete_pomodoro,
            commands::tracker::get_foreground_process,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
