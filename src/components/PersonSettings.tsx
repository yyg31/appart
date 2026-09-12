"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Person } from "@/lib/types";

export function PersonSettings({ persons }: { persons: Person[] }) {
  const router = useRouter();
  const [names, setNames] = useState(
    Object.fromEntries(persons.map((p) => [p.id, p.name]))
  );
  const [savingId, setSavingId] = useState<number | null>(null);

  async function handleSave(id: number) {
    setSavingId(id);
    try {
      await fetch(`/api/persons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: names[id] }),
      });
      router.refresh();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {persons.map((person) => (
        <div
          key={person.id}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
        >
          <input
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            value={names[person.id] ?? ""}
            onChange={(e) => setNames((prev) => ({ ...prev, [person.id]: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => handleSave(person.id)}
            disabled={savingId === person.id}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {savingId === person.id ? "..." : "Enregistrer"}
          </button>
        </div>
      ))}
    </div>
  );
}
