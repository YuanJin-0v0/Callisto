pub mod models;

use rusqlite::{Connection, Result};
use std::sync::Mutex;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new() -> Result<Self> {
        let db_path = get_db_path();
        let conn = Connection::open(&db_path)?;
        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
        Ok(Database { conn: Mutex::new(conn) })
    }

    pub fn initialize(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(include_str!("migrations.sql"))?;
        Ok(())
    }
}

fn get_db_path() -> String {
    if let Some(data_dir) = dirs::data_dir() {
        let app_dir = data_dir.join("Callisto");
        std::fs::create_dir_all(&app_dir).ok();
        app_dir.join("callisto.db").to_string_lossy().to_string()
    } else {
        "callisto.db".to_string()
    }
}
