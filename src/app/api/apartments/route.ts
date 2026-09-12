import { NextResponse } from "next/server";
import { createApartment, listApartmentsWithExtras } from "@/lib/repo";
import type { ApartmentInput } from "@/lib/repo";

export async function GET() {
  const apartments = listApartmentsWithExtras();
  return NextResponse.json(apartments);
}

export async function POST(request: Request) {
  let body: Partial<ApartmentInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "Le titre est obligatoire" }, { status: 400 });
  }

  const apartment = createApartment({ ...body, title });
  return NextResponse.json(apartment, { status: 201 });
}
