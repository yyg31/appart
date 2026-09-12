import { NextResponse } from "next/server";
import { renamePerson } from "@/lib/repo";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Le nom est obligatoire" }, { status: 400 });
  }

  const person = renamePerson(Number(id), name);
  if (!person) {
    return NextResponse.json({ error: "Personne introuvable" }, { status: 404 });
  }
  return NextResponse.json(person);
}
