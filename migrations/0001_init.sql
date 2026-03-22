-- Notes: short public id + secret delete token
CREATE TABLE notes (
  id TEXT PRIMARY KEY NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  delete_token TEXT NOT NULL UNIQUE
);

CREATE INDEX idx_notes_created_at ON notes (created_at);
