import { randomUUID } from "node:crypto";
import { getDb } from "./db";
import type {
  Apartment,
  ApartmentStatus,
  ApartmentWithExtras,
  Person,
  PriceHistoryEntry,
  Rating,
} from "./types";

// --- row <-> model mapping -------------------------------------------------

interface ApartmentRow {
  id: string;
  url: string | null;
  source_site: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  surface: number | null;
  rooms: number | null;
  floor: string | null;
  has_elevator: number | null;
  has_cellar: number | null;
  arrondissement: string | null;
  neighborhood: string | null;
  contact_phone: string | null;
  visit_date: string | null;
  notes: string;
  status: string;
  listing_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

function toApartment(row: ApartmentRow): Apartment {
  return {
    id: row.id,
    url: row.url,
    sourceSite: row.source_site,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    price: row.price,
    surface: row.surface,
    rooms: row.rooms,
    floor: row.floor,
    hasElevator: row.has_elevator === null ? null : Boolean(row.has_elevator),
    hasCellar: row.has_cellar === null ? null : Boolean(row.has_cellar),
    arrondissement: row.arrondissement,
    neighborhood: row.neighborhood,
    contactPhone: row.contact_phone,
    visitDate: row.visit_date,
    notes: row.notes,
    status: row.status as ApartmentStatus,
    listingUpdatedAt: row.listing_updated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface PriceHistoryRow {
  id: number;
  apartment_id: string;
  price: number;
  recorded_at: string;
}

function toPriceHistory(row: PriceHistoryRow): PriceHistoryEntry {
  return {
    id: row.id,
    apartmentId: row.apartment_id,
    price: row.price,
    recordedAt: row.recorded_at,
  };
}

interface RatingRow {
  apartment_id: string;
  person_id: number;
  score: number;
  comment: string | null;
  updated_at: string;
}

function toRating(row: RatingRow): Rating {
  return {
    apartmentId: row.apartment_id,
    personId: row.person_id,
    score: row.score,
    comment: row.comment,
    updatedAt: row.updated_at,
  };
}

// --- persons ----------------------------------------------------------------

export function listPersons(): Person[] {
  const db = getDb();
  return db.prepare("SELECT id, name FROM persons ORDER BY id ASC").all() as Person[];
}

export function renamePerson(id: number, name: string): Person | null {
  const db = getDb();
  db.prepare("UPDATE persons SET name = ? WHERE id = ?").run(name, id);
  return (
    (db.prepare("SELECT id, name FROM persons WHERE id = ?").get(id) as
      | Person
      | undefined) ?? null
  );
}

// --- apartments ---------------------------------------------------------------

export interface ApartmentInput {
  url?: string | null;
  sourceSite?: string | null;
  title: string;
  description?: string | null;
  images?: string[];
  price?: number | null;
  surface?: number | null;
  rooms?: number | null;
  floor?: string | null;
  hasElevator?: boolean | null;
  hasCellar?: boolean | null;
  arrondissement?: string | null;
  neighborhood?: string | null;
  contactPhone?: string | null;
  visitDate?: string | null;
  notes?: string;
  status?: ApartmentStatus;
  listingUpdatedAt?: string | null;
}

function boolToInt(value: boolean | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return value ? 1 : 0;
}

export function createApartment(input: ApartmentInput): Apartment {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO apartments (
      id, url, source_site, title, description, image_url, price, surface, rooms,
      floor, has_elevator, has_cellar, arrondissement, neighborhood, contact_phone,
      visit_date, notes, status, listing_updated_at, created_at, updated_at
    ) VALUES (@id, @url, @sourceSite, @title, @description, @imageUrl, @price, @surface, @rooms,
      @floor, @hasElevator, @hasCellar, @arrondissement, @neighborhood, @contactPhone,
      @visitDate, @notes, @status, @listingUpdatedAt, @createdAt, @updatedAt)`
  ).run({
    id,
    url: input.url ?? null,
    sourceSite: input.sourceSite ?? null,
    title: input.title,
    description: input.description ?? null,
    imageUrl: null,
    price: input.price ?? null,
    surface: input.surface ?? null,
    rooms: input.rooms ?? null,
    floor: input.floor ?? null,
    hasElevator: boolToInt(input.hasElevator),
    hasCellar: boolToInt(input.hasCellar),
    arrondissement: input.arrondissement ?? null,
    neighborhood: input.neighborhood ?? null,
    contactPhone: input.contactPhone ?? null,
    visitDate: input.visitDate ?? null,
    notes: input.notes ?? "",
    status: input.status ?? "nouveau",
    listingUpdatedAt: input.listingUpdatedAt ?? null,
    createdAt: now,
    updatedAt: now,
  });

  if (typeof input.price === "number") {
    db.prepare(
      "INSERT INTO price_history (apartment_id, price, recorded_at) VALUES (?, ?, ?)"
    ).run(id, input.price, now);
  }

  if (input.images) {
    setImages(id, input.images);
  }

  return getApartment(id)!;
}

export function listApartments(): Apartment[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM apartments ORDER BY updated_at DESC")
    .all() as ApartmentRow[];
  return rows.map(toApartment);
}

export function getApartment(id: string): Apartment | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM apartments WHERE id = ?").get(id) as
    | ApartmentRow
    | undefined;
  return row ? toApartment(row) : null;
}

export function getPriceHistory(apartmentId: string): PriceHistoryEntry[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM price_history WHERE apartment_id = ? ORDER BY recorded_at ASC"
    )
    .all(apartmentId) as PriceHistoryRow[];
  return rows.map(toPriceHistory);
}

export function getRatings(apartmentId: string): Rating[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM ratings WHERE apartment_id = ?")
    .all(apartmentId) as RatingRow[];
  return rows.map(toRating);
}

export function getImages(apartmentId: string): string[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT url FROM apartment_images WHERE apartment_id = ? ORDER BY position ASC"
    )
    .all(apartmentId) as { url: string }[];
  return rows.map((r) => r.url).filter((url) => url.trim() !== "");
}

export function setImages(apartmentId: string, urls: string[]): void {
  const db = getDb();
  const clean = urls.map((u) => u.trim()).filter(Boolean);
  const replace = db.transaction(() => {
    db.prepare("DELETE FROM apartment_images WHERE apartment_id = ?").run(
      apartmentId
    );
    const insert = db.prepare(
      "INSERT INTO apartment_images (apartment_id, url, position) VALUES (?, ?, ?)"
    );
    clean.forEach((url, position) => insert.run(apartmentId, url, position));
  });
  replace();
}

export function getApartmentWithExtras(id: string): ApartmentWithExtras | null {
  const apartment = getApartment(id);
  if (!apartment) return null;
  const ratings = getRatings(id);
  const priceHistory = getPriceHistory(id);
  const images = getImages(id);
  const averageScore =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : null;
  return { ...apartment, ratings, priceHistory, averageScore, images };
}

export function listApartmentsWithExtras(): ApartmentWithExtras[] {
  return listApartments().map((apartment) => {
    const ratings = getRatings(apartment.id);
    const priceHistory = getPriceHistory(apartment.id);
    const images = getImages(apartment.id);
    const averageScore =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
        : null;
    return { ...apartment, ratings, priceHistory, averageScore, images };
  });
}

export type ApartmentPatch = Partial<ApartmentInput>;

const PATCHABLE_FIELDS: Partial<Record<keyof ApartmentPatch, string>> = {
  url: "url",
  sourceSite: "source_site",
  title: "title",
  description: "description",
  price: "price",
  surface: "surface",
  rooms: "rooms",
  floor: "floor",
  hasElevator: "has_elevator",
  hasCellar: "has_cellar",
  arrondissement: "arrondissement",
  neighborhood: "neighborhood",
  contactPhone: "contact_phone",
  visitDate: "visit_date",
  notes: "notes",
  status: "status",
  listingUpdatedAt: "listing_updated_at",
};

export function updateApartment(
  id: string,
  patch: ApartmentPatch
): Apartment | null {
  const db = getDb();
  const existing = getApartment(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const columns: string[] = [];
  const values: unknown[] = [];

  for (const key of Object.keys(patch) as (keyof ApartmentPatch)[]) {
    const column = PATCHABLE_FIELDS[key];
    if (!column) continue;
    let value = patch[key];
    if (key === "hasElevator" || key === "hasCellar") {
      value = boolToInt(value as boolean | null | undefined) as never;
    }
    columns.push(`${column} = ?`);
    values.push(value ?? null);
  }

  if (patch.images !== undefined) {
    setImages(id, patch.images);
  }

  if (columns.length === 0) return existing;

  columns.push("updated_at = ?");
  values.push(now);
  values.push(id);

  db.prepare(`UPDATE apartments SET ${columns.join(", ")} WHERE id = ?`).run(
    ...values
  );

  if (
    typeof patch.price === "number" &&
    patch.price !== existing.price &&
    Number.isFinite(patch.price)
  ) {
    db.prepare(
      "INSERT INTO price_history (apartment_id, price, recorded_at) VALUES (?, ?, ?)"
    ).run(id, patch.price, now);
  }

  return getApartment(id);
}

export function deleteApartment(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM apartments WHERE id = ?").run(id);
}

export function upsertRating(
  apartmentId: string,
  personId: number,
  score: number,
  comment: string | null
): Rating {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO ratings (apartment_id, person_id, score, comment, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (apartment_id, person_id)
     DO UPDATE SET score = excluded.score, comment = excluded.comment, updated_at = excluded.updated_at`
  ).run(apartmentId, personId, score, comment, now);

  return {
    apartmentId,
    personId,
    score,
    comment,
    updatedAt: now,
  };
}
