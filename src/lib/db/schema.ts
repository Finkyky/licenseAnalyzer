import Database from 'better-sqlite3';

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS licenses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  spdx_id TEXT UNIQUE,
  text TEXT,
  summary TEXT,
  summary_zh TEXT,
  cached_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS analysis_results (
  id TEXT PRIMARY KEY,
  input_hash TEXT,
  analysis_type TEXT,
  result_json TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_analysis_input_hash ON analysis_results(input_hash);
CREATE INDEX IF NOT EXISTS idx_licenses_spdx ON licenses(spdx_id);
`;

export function initSchema(db: Database.Database) {
  db.exec(SCHEMA_SQL);
}
