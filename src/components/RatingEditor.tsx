"use client";

import { useState } from "react";
import type { Person, Rating } from "@/lib/types";

const SCALE = Array.from({ length: 10 }, (_, i) => i + 1);

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
  const [score, setScore] = useState(rating?.score ?? 0);
  const [comment, setComment] = useState(rating?.comment ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (score < 1) return;
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
        <span className="text-lg font-bold">{score > 0 ? `${score}/10` : "—"}</span>
      </div>
      <div className="flex flex-wrap gap-0.5">
        {SCALE.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setScore(n)}
            aria-label={`Noter ${n} sur 10`}
            className={`text-2xl leading-none ${
              n <= score ? "text-amber-400" : "text-slate-300 hover:text-amber-200"
            }`}
          >
            ★
          </button>
        ))}
      </div>
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
        disabled={saving || score < 1}
        className="self-start rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {saving ? "..." : rating ? "Mettre à jour la note" : "Enregistrer la note"}
      </button>
    </div>
  );
}
