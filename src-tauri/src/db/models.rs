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
pub struct MediaStats {
    pub watching: i64,
    pub completed: i64,
    pub plan: i64,
    pub paused: i64,
    pub dropped: i64,
    pub total: i64,
}
