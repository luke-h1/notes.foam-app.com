CREATE TABLE IF NOT EXISTS rate_limit_buckets (
	bucket_key TEXT PRIMARY KEY NOT NULL,
	count INTEGER NOT NULL,
	expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_expires_at ON rate_limit_buckets (expires_at);
