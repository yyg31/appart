import { listPersons } from "@/lib/repo";
import { PersonSettings } from "@/components/PersonSettings";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const persons = listPersons();
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Réglages</h1>
        <p className="text-slate-500">Personnalisez les noms utilisés pour les notes.</p>
      </div>
      <PersonSettings persons={persons} />
    </div>
  );
}
