import { NextResponse } from "next/server";
import { deleteRating, getApartmentWithExtras, upsertRating } from "@/lib/repo";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: { personId?: number; score?: number; comment?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { personId, score } = body;
  if (typeof personId !== "number" || typeof score !== "number") {
    return NextResponse.json(
      { error: "personId et score sont obligatoires" },
      { status: 400 }
    );
  }
  if (score < 1 || score > 10) {
    return NextResponse.json(
      { error: "La note doit être comprise entre 1 et 10" },
      { status: 400 }
    );
  }

  const apartment = getApartmentWithExtras(id);
  if (!apartment) {
    return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  }

  upsertRating(id, personId, score, body.comment ?? null);
  return NextResponse.json(getApartmentWithExtras(id));
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: { personId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  if (typeof body.personId !== "number") {
    return NextResponse.json({ error: "personId est obligatoire" }, { status: 400 });
  }

  const apartment = getApartmentWithExtras(id);
  if (!apartment) {
    return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  }

  deleteRating(id, body.personId);
  return NextResponse.json(getApartmentWithExtras(id));
}
