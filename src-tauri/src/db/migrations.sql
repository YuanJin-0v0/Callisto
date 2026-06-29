CREATE TABLE IF NOT EXISTS media_items (
    id          INTEGER PRIMARY KEY,
    title       TEXT NOT NULL,
    title_cn    TEXT,
    type        TEXT NOT NULL DEFAULT 'anime',
    status      TEXT NOT NULL DEFAULT 'plan',
    score       INTEGER,
    episodes    INTEGER,
    progress    INTEGER DEFAULT 0,
    cover_url   TEXT,
    summary     TEXT,
    tags        TEXT,
    comment     TEXT,
    start_date  TEXT,
    finish_date TEXT,
    platform    TEXT DEFAULT 'manual',
    platform_id TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS media_episodes (
    id          INTEGER PRIMARY KEY,
    media_id    INTEGER NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    ep_number   INTEGER NOT NULL,
    title       TEXT,
    watched     BOOLEAN NOT NULL DEFAULT 0,
    watched_at  TEXT,
    rating      INTEGER
);

CREATE TABLE IF NOT EXISTS media_favorites (
    id          INTEGER PRIMARY KEY,
    media_id    INTEGER NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    category    TEXT,
    content     TEXT NOT NULL,
    note        TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('db_version', '1');
