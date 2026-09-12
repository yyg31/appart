import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!/^[a-f0-9-]+\.(jpg|png|webp|gif)$/i.test(filename)) {
    return NextResponse.json({ error: "Fichier invalide" }, { status: 400 });
  }

  const extension = filename.split(".").pop()!.toLowerCase();

  try {
    const buffer = await readFile(path.join(UPLOAD_DIR, filename));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": CONTENT_TYPE_BY_EXTENSION[extension] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });
  }
}
