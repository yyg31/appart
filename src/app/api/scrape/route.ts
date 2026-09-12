import { NextResponse } from "next/server";
import { scrapeListing } from "@/lib/scrape";

export async function POST(request: Request) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const url = body.url?.trim();
  if (!url) {
    return NextResponse.json({ error: "URL manquante" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  const result = await scrapeListing(url);
  return NextResponse.json(result);
}
