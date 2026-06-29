use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MediaItem {
    pub id: Option<i64>,
    pub title: String,
    pub title_cn: Option<String>,
    #[serde(rename = "type")]
    pub media_type: String,
    pub status: String,
    pub score: Option<i32>,
    pub episodes: Option<i32>,
    pub progress: Option<i32>,
    pub cover_url: Option<String>,
    pub summary: Option<String>,
    pub tags: Option<String>,
    pub comment: Option<String>,
    pub start_date: Option<String>,
    pub finish_date: Option<String>,
    pub platform: Option<String>,
    pub platform_id: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MediaEpisode {
    pub id: Option<i64>,
    pub media_id: i64,
    pub ep_number: i32,
    pub title: Option<String>,
    pub watched: bool,
    pub watched_at: Option<String>,
    pub rating: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MediaFavorite {
    pub id: Option<i64>,
    pub media_id: i64,
    pub category: Option<String>,
    pub content: String,
    pub note: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Novel {
    pub id: Option<i64>,
    pub title: String,
    pub author: Option<String>,
    pub synopsis: Option<String>,
    pub cover_path: Option<String>,
    pub status: String,
    pub word_count: Option<i64>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NovelChapter {
    pub id: Option<i64>,
    pub novel_id: i64,
    pub title: String,
    pub content: String,
    pub word_count: Option<i64>,
    pub sort_order: i32,
    pub status: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NovelInspiration {
    pub id: Option<i64>,
    pub novel_id: Option<i64>,
    pub content: String,
    pub source: Option<String>,
    pub tags: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NovelCharacter {
    pub id: Option<i64>,
    pub novel_id: Option<i64>,
    pub name: String,
    pub role: Option<String>,
    pub description: Option<String>,
    pub traits: Option<String>,
    pub relationships: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NovelWorld {
    pub id: Option<i64>,
    pub novel_id: Option<i64>,
    pub name: String,
    pub category: Option<String>,
    pub description: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReadingBook {
    pub id: Option<i64>,
    pub title: String,
    pub author: Option<String>,
    pub file_path: String,
    pub file_type: Option<String>,
    pub cover_path: Option<String>,
    pub progress: Option<f64>,
    pub current_pos: Option<String>,
    pub last_read: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReadingBookmark {
    pub id: Option<i64>,
    pub book_id: i64,
    pub title: Option<String>,
    pub position: String,
    pub note: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MediaStats {
    pub watching: i64,
    pub completed: i64,
    pub plan: i64,
    pub paused: i64,
    pub dropped: i64,
    pub total: i64,
}
