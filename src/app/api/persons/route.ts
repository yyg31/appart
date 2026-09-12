import { NextResponse } from "next/server";
import { listPersons } from "@/lib/repo";

export async function GET() {
  return NextResponse.json(listPersons());
}
