import Link from "next/link";
import { listApartmentsWithExtras, listPersons } from "@/lib/repo";
import { Dashboard } from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const apartments = listApartmentsWithExtras();
  const persons = listPersons();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nos annonces</h1>
          <p className="text-slate-500">
            Suivez, notez et comparez les appartements que vous avez repérés.
          </p>
        </div>
        <Link
          href="/apartments/new"
          className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          + Ajouter une annonce
        </Link>
      </div>

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
