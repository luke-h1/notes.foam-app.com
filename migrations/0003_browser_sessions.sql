CREATE TABLE IF NOT EXISTS browser_sessions (
	id TEXT PRIMARY KEY NOT NULL,
	expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_browser_sessions_expires_at ON browser_sessions (expires_at);
