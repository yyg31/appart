import Link from "next/link";
import { listApartmentsWithExtras, listPersons } from "@/lib/repo";
import { Dashboard } from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const apartments = listApartmentsWithExtras();
  const persons = listPersons();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Nos annonces</h1>

      {apartments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Aucune annonce pour l&apos;instant.{" "}
          <Link href="/apartments/new" className="font-medium text-slate-900 underline">
            Ajoutez la première
          </Link>
          .
        </div>
      ) : (
        <Dashboard apartments={apartments} persons={persons} />
      )}
    </div>
  );
}
