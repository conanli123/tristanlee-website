CREATE TABLE IF NOT EXISTS work_likes (
  work_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (work_id, visitor_id)
);

CREATE INDEX IF NOT EXISTS idx_work_likes_visitor ON work_likes (visitor_id);
