"use client";

import { useState } from "react";
import type { Person, Rating } from "@/lib/types";

export function RatingEditor({
  apartmentId,
  person,
  rating,
  onSaved,
}: {
  apartmentId: string;
  person: Person;
  rating: Rating | undefined;
  onSaved: () => void;
}) {
  const [score, setScore] = useState(rating?.score ?? 5);
  const [comment, setComment] = useState(rating?.comment ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/apartments/${apartmentId}/ratings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId: person.id, score, comment: comment || null }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between">
        <span className="font-medium">{person.name}</span>
        <span className="text-lg font-bold">{score}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
      />
      <textarea
        className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
        placeholder="Commentaire (optionnel)"
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="self-start rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {saving ? "..." : rating ? "Mettre à jour la note" : "Enregistrer la note"}
      </button>
    </div>
  );
}
