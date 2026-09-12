import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "appart.db");

declare global {
  var __appartDb: Database.Database | undefined;
}

function createConnection() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS apartments (
      id TEXT PRIMARY KEY,
      url TEXT,
      source_site TEXT,
      title TEXT NOT NULL DEFAULT '',
      description TEXT,
      image_url TEXT,
      price INTEGER,
      surface REAL,
      rooms INTEGER,
      floor TEXT,
      has_elevator INTEGER,
      has_cellar INTEGER,
      arrondissement TEXT,
      neighborhood TEXT,
      contact_phone TEXT,
      visit_date TEXT,
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'nouveau',
      listing_updated_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      apartment_id TEXT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
      price INTEGER NOT NULL,
      recorded_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ratings (
      apartment_id TEXT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
      person_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
      score INTEGER NOT NULL,
      comment TEXT,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (apartment_id, person_id)
    );
  `);

  const personCount = db
    .prepare("SELECT COUNT(*) AS count FROM persons")
    .get() as { count: number };

  if (personCount.count === 0) {
    const insert = db.prepare("INSERT INTO persons (name) VALUES (?)");
    insert.run("Personne 1");
    insert.run("Personne 2");
  }

  return db;
}

export function getDb(): Database.Database {
  if (!global.__appartDb) {
    global.__appartDb = createConnection();
  }
  return global.__appartDb;
}
