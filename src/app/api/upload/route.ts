import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  const extension = EXTENSION_BY_TYPE[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Format non supporté (JPEG, PNG, WEBP ou GIF uniquement)" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Fichier trop volumineux (8 Mo max)" }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return NextResponse.json({ url: `/api/uploads/${filename}` });
}
