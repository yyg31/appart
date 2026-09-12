"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApartmentWithExtras, Person } from "@/lib/types";
import {
  ApartmentForm,
  apartmentToFormValues,
  formValuesToPayload,
  type ApartmentFormValues,
} from "@/components/ApartmentForm";
import { ImageGallery } from "@/components/ImageGallery";
import { InlineSelect, InlineText } from "@/components/InlineField";
import { PriceHistoryList } from "@/components/PriceHistoryList";
import { RatingEditor } from "@/components/RatingEditor";
import { formatDate, formatPrice, formatSurface } from "@/lib/format";

export function ApartmentDetail({
  apartment,
  persons,
}: {
  apartment: ApartmentWithExtras;
  persons: Person[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleUpdate(values: ApartmentFormValues) {
    const res = await fetch(`/api/apartments/${apartment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValuesToPayload(values)),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Erreur lors de la mise à jour");
    }
    setEditing(false);
    router.refresh();
  }

  async function patchField(field: string, value: unknown) {
    const res = await fetch(`/api/apartments/${apartment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Erreur lors de la mise à jour");
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Supprimer définitivement cette annonce ?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/apartments/${apartment.id}`, { method: "DELETE" });
      router.push("/");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <h1 className="text-xl font-bold">Modifier l&apos;annonce</h1>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <ApartmentForm
            initialValues={apartmentToFormValues(apartment)}
            submitLabel="Enregistrer"
            onSubmit={handleUpdate}
            extraActions={
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-sm font-medium text-slate-500 underline"
              >
                Annuler
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          {apartment.sourceSite && (
            <div className="mb-1 text-xs text-slate-400">{apartment.sourceSite}</div>
          )}
          <h1 className="text-2xl font-bold leading-tight">{apartment.title}</h1>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
          >
            Modifier
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Supprimer
          </button>
        </div>

        <ImageGallery
          images={apartment.images}
          onAdd={(url) => patchField("images", [url])}
        />

        {apartment.url && (
          <a
            href={apartment.url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm font-medium text-blue-600 underline"
          >
            Voir l&apos;annonce originale ↗
          </a>
        )}

        {apartment.description && (
          <p className="whitespace-pre-line text-sm text-slate-600">
            {apartment.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-4">
          <Info label="Prix" value={formatPrice(apartment.price)} />
          <Info label="Surface" value={formatSurface(apartment.surface)} />
          <Info
            label="Pièces"
            value={apartment.rooms !== null ? String(apartment.rooms) : "—"}
          />
          <Info label="Étage" value={apartment.floor ?? "—"} />
          <InlineSelect
            label="Ascenseur"
            value={apartment.hasElevator === null ? "nc" : apartment.hasElevator ? "yes" : "no"}
            options={[
              { value: "yes", label: "Oui" },
              { value: "no", label: "Non" },
              { value: "nc", label: "NC" },
            ]}
            onSave={(v) => patchField("hasElevator", v === "nc" ? null : v === "yes")}
          />
          <InlineSelect
            label="Cave"
            value={apartment.hasCellar === null ? "nc" : apartment.hasCellar ? "yes" : "no"}
            options={[
              { value: "yes", label: "Cave" },
              { value: "nc", label: "NC" },
              { value: "no", label: "Non" },
            ]}
            onSave={(v) => patchField("hasCellar", v === "nc" ? null : v === "yes")}
          />
          <Info label="Arrondissement" value={apartment.arrondissement ?? "—"} />
          <Info label="Quartier" value={apartment.neighborhood ?? "—"} />
          <Info
            label="Annonce mise à jour"
            value={formatDate(apartment.listingUpdatedAt)}
          />
          <Info label="Date de visite" value={formatDate(apartment.visitDate)} />
          <InlineText
            label="Contact"
            value={apartment.contactPhone ?? ""}
            placeholder="Téléphone, email..."
            onSave={(v) => patchField("contactPhone", v.trim() || null)}
          />
          <Info label="Ajouté le" value={formatDate(apartment.createdAt)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Historique des prix</h2>
          <PriceHistoryList entries={apartment.priceHistory} />
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Notes (sur 10)</h2>
          <div className="flex flex-col gap-3">
            {persons.map((person) => (
              <RatingEditor
                key={person.id}
                apartmentId={apartment.id}
                person={person}
                rating={apartment.ratings.find((r) => r.personId === person.id)}
                onSaved={() => router.refresh()}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">Bloc-notes</h2>
        <p className="whitespace-pre-line text-sm text-slate-600">
          {apartment.notes || "Aucune note pour l'instant."}
        </p>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
