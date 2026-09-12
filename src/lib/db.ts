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

    CREATE TABLE IF NOT EXISTS apartment_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      apartment_id TEXT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      position INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_apartment_images_apartment
      ON apartment_images(apartment_id, position);
  `);

  const personCount = db
    .prepare("SELECT COUNT(*) AS count FROM persons")
    .get() as { count: number };

  if (personCount.count === 0) {
    const insert = db.prepare("INSERT INTO persons (name) VALUES (?)");
    insert.run("Personne 1");
    insert.run("Personne 2");
  }

  // One-time backfill: apartments that predate the gallery table had a
  // single `image_url` column. Copy it in as the cover photo so existing
  // data still shows an image, then apartment_images becomes the only
  // source of truth going forward.
  db.exec(`
    INSERT INTO apartment_images (apartment_id, url, position)
    SELECT id, image_url, 0 FROM apartments
    WHERE image_url IS NOT NULL
    AND id NOT IN (SELECT apartment_id FROM apartment_images)
  `);

  return db;
}

export function getDb(): Database.Database {
  if (!global.__appartDb) {
    global.__appartDb = createConnection();
  }
  return global.__appartDb;
}
