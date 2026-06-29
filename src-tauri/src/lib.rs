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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
