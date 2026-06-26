CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  to_addr TEXT NOT NULL,
  from_addr TEXT NOT NULL,
  subject TEXT,
  text TEXT,
  html TEXT,
  received_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_to ON messages(to_addr);
CREATE INDEX IF NOT EXISTS idx_messages_received ON messages(received_at);
CREATE INDEX IF NOT EXISTS idx_messages_expires ON messages(expires_at);
