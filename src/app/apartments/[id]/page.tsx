import { notFound } from "next/navigation";
import { getApartmentWithExtras, listPersons } from "@/lib/repo";
import { ApartmentDetail } from "@/components/ApartmentDetail";

export default async function ApartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apartment = getApartmentWithExtras(id);
  if (!apartment) notFound();
  const persons = listPersons();

  return <ApartmentDetail apartment={apartment} persons={persons} />;
}
