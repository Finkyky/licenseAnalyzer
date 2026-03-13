import Database from 'better-sqlite3';
import path from 'path';
import { initSchema } from './schema';
import { seedLicenses } from './seed';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dbPath = path.join(process.cwd(), 'data', 'license-analyzer.db');

  // Ensure data directory exists
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs');
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initSchema(db);
  seedLicenses(db);

  return db;
}

// License CRUD helpers
export function getLicensesBySpdx(spdxIds: string[]) {
  const db = getDb();
  const placeholders = spdxIds.map(() => '?').join(',');
  return db.prepare(`SELECT * FROM licenses WHERE spdx_id IN (${placeholders})`).all(...spdxIds);
}

export function searchLicenses(query: string) {
  const db = getDb();
  const like = `%${query}%`;
  return db.prepare(
    'SELECT id, name, spdx_id, summary, summary_zh FROM licenses WHERE name LIKE ? OR spdx_id LIKE ? LIMIT 50'
  ).all(like, like);
}

export function getAllLicenses() {
  const db = getDb();
  return db.prepare('SELECT id, name, spdx_id, summary, summary_zh FROM licenses').all();
}

export function getLicenseBySpdx(spdxId: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM licenses WHERE spdx_id = ?').get(spdxId);
}

// Analysis result helpers
export function saveAnalysisResult(id: string, inputHash: string, type: string, result: unknown) {
  const db = getDb();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(
    'INSERT OR REPLACE INTO analysis_results (id, input_hash, analysis_type, result_json, expires_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, inputHash, type, JSON.stringify(result), expiresAt);
}

export function getAnalysisResult(id: string) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM analysis_results WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    ...row,
    result: JSON.parse(row.result_json as string),
  };
}

export function getAnalysisByHash(inputHash: string) {
  const db = getDb();
  const row = db.prepare(
    'SELECT * FROM analysis_results WHERE input_hash = ? AND expires_at > datetime(\'now\') ORDER BY created_at DESC LIMIT 1'
  ).get(inputHash) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    ...row,
    result: JSON.parse(row.result_json as string),
  };
}
