#!/usr/bin/env node
// One-time enrichment pass: for apartments that already have a `url` but no
// photos, re-scrapes the listing page via the app's own /api/scrape
// endpoint and fills in every image found (og:image / twitter:image / JSON-LD).
// Usage: node enrich-images.mjs <app_url> <user> <password>

const [appUrl, user, password] = process.argv.slice(2);

if (!appUrl || !user || !password) {
  console.error("Usage: node enrich-images.mjs <app_url> <user> <password>");
  process.exit(1);
}

const base = appUrl.replace(/\/$/, "");
const auth = "Basic " + Buffer.from(`${user}:${password}`).toString("base64");
const headers = { "Content-Type": "application/json", Authorization: auth };

const apartments = await (await fetch(`${base}/api/apartments`, { headers })).json();
const targets = apartments.filter((a) => a.url && (!a.images || a.images.length === 0));

console.log(`${apartments.length} annonce(s) au total, ${targets.length} sans photo à traiter.`);

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

    if (scraped.images && scraped.images.length > 0) {
      await fetch(`${base}/api/apartments/${apartment.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ images: scraped.images }),
      });
      updated++;
      console.log(`PHOTO(S) [${index + 1}/${targets.length}] ${label} (${scraped.images.length})`);
    } else {
      skipped++;
      console.log(`AUCUNE [${index + 1}/${targets.length}] ${label} (site non accessible ou sans image)`);
    }
  } catch (err) {
    skipped++;
    console.error(`ECHEC [${index + 1}/${targets.length}] ${label} -> ${err.message}`);
  }
  await new Promise((r) => setTimeout(r, 300));
}

console.log(`\nTerminé : ${updated} annonce(s) enrichie(s), ${skipped} sans résultat.`);
