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

CREATE TABLE IF NOT EXISTS novels (
    id          INTEGER PRIMARY KEY,
    title       TEXT NOT NULL,
    author      TEXT DEFAULT 'Me',
    synopsis    TEXT,
    cover_path  TEXT,
    status      TEXT NOT NULL DEFAULT 'draft',
    word_count  INTEGER DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS novel_chapters (
    id          INTEGER PRIMARY KEY,
    novel_id    INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL DEFAULT '',
    word_count  INTEGER DEFAULT 0,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    status      TEXT NOT NULL DEFAULT 'draft',
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS novel_inspirations (
    id          INTEGER PRIMARY KEY,
    novel_id    INTEGER REFERENCES novels(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    source      TEXT,
    tags        TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS novel_characters (
    id          INTEGER PRIMARY KEY,
    novel_id    INTEGER REFERENCES novels(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    role        TEXT,
    description TEXT,
    traits      TEXT,
    relationships TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS novel_worlds (
    id          INTEGER PRIMARY KEY,
    novel_id    INTEGER REFERENCES novels(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    category    TEXT,
    description TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reading_books (
    id          INTEGER PRIMARY KEY,
    title       TEXT NOT NULL,
    author      TEXT,
    file_path   TEXT NOT NULL,
    file_type   TEXT,
    cover_path  TEXT,
    progress    REAL DEFAULT 0.0,
    current_pos TEXT,
    last_read   TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reading_bookmarks (
    id          INTEGER PRIMARY KEY,
    book_id     INTEGER NOT NULL REFERENCES reading_books(id) ON DELETE CASCADE,
    title       TEXT,
    position    TEXT NOT NULL,
    note        TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('db_version', '2');
