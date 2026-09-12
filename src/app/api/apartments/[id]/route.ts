import { NextResponse } from "next/server";
import {
  deleteApartment,
  getApartmentWithExtras,
  updateApartment,
} from "@/lib/repo";
import type { ApartmentPatch } from "@/lib/repo";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const apartment = getApartmentWithExtras(id);
  if (!apartment) {
    return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  }
  return NextResponse.json(apartment);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: ApartmentPatch;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const updated = updateApartment(id, body);
  if (!updated) {
    return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  }
  return NextResponse.json(getApartmentWithExtras(id));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  deleteApartment(id);
  return NextResponse.json({ ok: true });
}
