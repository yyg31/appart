import * as cheerio from "cheerio";
import type { ScrapedListing } from "./types";

const FETCH_TIMEOUT_MS = 12_000;

function parsePriceFromText(text: string): number | null {
  // Matches "350 000 €", "350000€", "€350,000", "350.000 €", etc.
  const match = text.match(
    /(\d{1,3}(?:[ .,]\d{3})+|\d{4,7})\s?(?:€|EUR)/i
  );
  if (!match) return null;
  const digits = match[1].replace(/[ .,]/g, "");
  const value = parseInt(digits, 10);
  return Number.isFinite(value) ? value : null;
}

function parseSurfaceFromText(text: string): number | null {
  const match = text.match(/(\d{1,4}(?:[.,]\d{1,2})?)\s?m(?:2|²)/i);
  if (!match) return null;
  const value = parseFloat(match[1].replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

function parseRoomsFromText(text: string): number | null {
  const piecesMatch = text.match(/(\d{1,2})\s?pi[eè]ces?/i);
  if (piecesMatch) return parseInt(piecesMatch[1], 10);
  const tMatch = text.match(/\bT(\d)\b/);
  if (tMatch) return parseInt(tMatch[1], 10);
  const roomsMatch = text.match(/(\d{1,2})\s?rooms?/i);
  if (roomsMatch) return parseInt(roomsMatch[1], 10);
  return null;
}

function findInJsonLd(json: unknown, keys: string[]): unknown {
  if (json === null || typeof json !== "object") return undefined;
  if (Array.isArray(json)) {
    for (const item of json) {
      const found = findInJsonLd(item, keys);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  const obj = json as Record<string, unknown>;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") {
      const found = findInJsonLd(value, keys);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

export async function scrapeListing(url: string): Promise<ScrapedListing> {
  let hostname: string | null = null;
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    throw new Error("URL invalide");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html: string;
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
    });
    if (!response.ok) {
      return {
        url,
        sourceSite: hostname,
        title: null,
        description: null,
        imageUrl: null,
        price: null,
        surface: null,
        rooms: null,
        warning: `Le site a répondu avec le code ${response.status}. Remplissez les champs manuellement.`,
      };
    }
    html = await response.text();
  } catch (error) {
    return {
      url,
      sourceSite: hostname,
      title: null,
      description: null,
      imageUrl: null,
      price: null,
      surface: null,
      rooms: null,
      warning:
        error instanceof Error && error.name === "AbortError"
          ? "Le site a mis trop de temps à répondre. Remplissez les champs manuellement."
          : "Impossible d'analyser automatiquement cette page. Remplissez les champs manuellement.",
    };
  } finally {
    clearTimeout(timeout);
  }

  const $ = cheerio.load(html);

  const metaContent = (selector: string) =>
    $(selector).attr("content")?.trim() || null;

  const title =
    metaContent('meta[property="og:title"]') ||
    metaContent('meta[name="twitter:title"]') ||
    $("title").first().text().trim() ||
    null;

  const description =
    metaContent('meta[property="og:description"]') ||
    metaContent('meta[name="description"]') ||
    null;

  const imageUrl =
    metaContent('meta[property="og:image"]') ||
    metaContent('meta[name="twitter:image"]') ||
    null;

  const siteName = metaContent('meta[property="og:site_name"]') || hostname;

  let price: number | null = null;
  let surface: number | null = null;
  let rooms: number | null = null;

  $('script[type="application/ld+json"]').each((_, el) => {
    if (price !== null && surface !== null && rooms !== null) return;
    try {
      const json = JSON.parse($(el).contents().text());
      if (price === null) {
        const rawPrice = findInJsonLd(json, ["price", "lowPrice"]);
        if (rawPrice !== undefined) {
          const parsed =
            typeof rawPrice === "number"
              ? rawPrice
              : parseInt(String(rawPrice).replace(/[^\d]/g, ""), 10);
          if (Number.isFinite(parsed) && parsed > 0) price = parsed;
        }
      }
      if (surface === null) {
        const rawSurface = findInJsonLd(json, ["floorSize", "surface"]);
        if (rawSurface !== undefined) {
          const value =
            typeof rawSurface === "object" && rawSurface !== null
              ? (rawSurface as Record<string, unknown>).value
              : rawSurface;
          const parsed = parseFloat(String(value));
          if (Number.isFinite(parsed)) surface = parsed;
        }
      }
      if (rooms === null) {
        const rawRooms = findInJsonLd(json, [
          "numberOfRooms",
          "numberOfBedrooms",
        ]);
        if (rawRooms !== undefined) {
          const parsed = parseInt(String(rawRooms), 10);
          if (Number.isFinite(parsed)) rooms = parsed;
        }
      }
    } catch {
      // ignore malformed JSON-LD blocks
    }
  });

  const fallbackText = `${title ?? ""} ${description ?? ""}`;
  if (price === null) price = parsePriceFromText(fallbackText);
  if (surface === null) surface = parseSurfaceFromText(fallbackText);
  if (rooms === null) rooms = parseRoomsFromText(fallbackText);

  const foundSomething = title || description || price || surface || rooms;

  return {
    url,
    sourceSite: siteName,
    title,
    description,
    imageUrl,
    price,
    surface,
    rooms,
    warning: foundSomething
      ? null
      : "Peu d'informations ont pu être extraites automatiquement. Vérifiez et complétez les champs.",
  };
}
