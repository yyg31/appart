#!/usr/bin/env node
// Enrichment pass: re-scrapes each listing page via the app's own
// /api/scrape endpoint and fills in every image found (og:image /
// twitter:image / JSON-LD). By default only touches apartments with no
// photo yet; pass --all to re-scrape every apartment with a URL and
// replace its photos with whatever is found now (useful after a scraper
// improvement, to pick up galleries that a first pass only got one image
// from).
// Usage: node enrich-images.mjs <app_url> <user> <password> [--all]

const args = process.argv.slice(2).filter((a) => a !== "--all");
const all = process.argv.includes("--all");
const [appUrl, user, password] = args;

if (!appUrl || !user || !password) {
  console.error("Usage: node enrich-images.mjs <app_url> <user> <password> [--all]");
  process.exit(1);
}

const base = appUrl.replace(/\/$/, "");
const auth = "Basic " + Buffer.from(`${user}:${password}`).toString("base64");
const headers = { "Content-Type": "application/json", Authorization: auth };

const apartments = await (await fetch(`${base}/api/apartments`, { headers })).json();
const targets = apartments.filter(
  (a) => a.url && (all || !a.images || a.images.length === 0)
);

console.log(
  `${apartments.length} annonce(s) au total, ${targets.length} à traiter` +
    (all ? " (mode --all : toutes les annonces avec une URL)." : " (sans photo).")
);

let updated = 0;
let skipped = 0;

for (const [index, apartment] of targets.entries()) {
  const label = apartment.title || apartment.id;
  try {
    const scraped = await (
      await fetch(`${base}/api/scrape`, {
        method: "POST",
        headers,
        body: JSON.stringify({ url: apartment.url }),
      })
    ).json();

    const currentCount = apartment.images?.length ?? 0;
    if (scraped.images && scraped.images.length > currentCount) {
      await fetch(`${base}/api/apartments/${apartment.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ images: scraped.images }),
      });
      updated++;
      console.log(
        `PHOTO(S) [${index + 1}/${targets.length}] ${label} (${currentCount} -> ${scraped.images.length})`
      );
    } else {
      skipped++;
      console.log(
        `INCHANGÉ [${index + 1}/${targets.length}] ${label} (${currentCount} photo(s), rien de mieux trouvé)`
      );
    }
  } catch (err) {
    skipped++;
    console.error(`ECHEC [${index + 1}/${targets.length}] ${label} -> ${err.message}`);
  }
  await new Promise((r) => setTimeout(r, 300));
}

console.log(`\nTerminé : ${updated} annonce(s) enrichie(s), ${skipped} sans résultat.`);
