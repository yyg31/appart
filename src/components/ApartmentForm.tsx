"use client";

import { useRef, useState } from "react";

export interface ApartmentFormValues {
  title: string;
  url: string;
  sourceSite: string;
  description: string;
  images: string[];
  price: string;
  surface: string;
  rooms: string;
  floor: string;
  hasElevator: "unknown" | "yes" | "no";
  hasCellar: "unknown" | "yes" | "no";
  hasParking: "unknown" | "yes" | "no";
  arrondissement: string;
  neighborhood: string;
  contactPhone: string;
  visitDate: string;
  listingUpdatedAt: string;
  notes: string;
}

export const EMPTY_FORM_VALUES: ApartmentFormValues = {
  title: "",
  url: "",
  sourceSite: "",
  description: "",
  images: [],
  price: "",
  surface: "",
  rooms: "",
  floor: "",
  hasElevator: "unknown",
  hasCellar: "unknown",
  hasParking: "unknown",
  arrondissement: "",
  neighborhood: "",
  contactPhone: "",
  visitDate: "",
  listingUpdatedAt: "",
  notes: "",
};

function triState(value: boolean | null | undefined): "unknown" | "yes" | "no" {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "unknown";
}

export function apartmentToFormValues(apartment: {
  title: string;
  url: string | null;
  sourceSite: string | null;
  description: string | null;
  images: string[];
  price: number | null;
  surface: number | null;
  rooms: number | null;
  floor: string | null;
  hasElevator: boolean | null;
  hasCellar: boolean | null;
  hasParking: boolean | null;
  arrondissement: string | null;
  neighborhood: string | null;
  contactPhone: string | null;
  visitDate: string | null;
  listingUpdatedAt: string | null;
  notes: string;
}): ApartmentFormValues {
  return {
    title: apartment.title,
    url: apartment.url ?? "",
    sourceSite: apartment.sourceSite ?? "",
    description: apartment.description ?? "",
    images: apartment.images,
    price: apartment.price?.toString() ?? "",
    surface: apartment.surface?.toString() ?? "",
    rooms: apartment.rooms?.toString() ?? "",
    floor: apartment.floor ?? "",
    hasElevator: triState(apartment.hasElevator),
    hasCellar: triState(apartment.hasCellar),
    hasParking: triState(apartment.hasParking),
    arrondissement: apartment.arrondissement ?? "",
    neighborhood: apartment.neighborhood ?? "",
    contactPhone: apartment.contactPhone ?? "",
    visitDate: apartment.visitDate?.slice(0, 10) ?? "",
    listingUpdatedAt: apartment.listingUpdatedAt?.slice(0, 10) ?? "",
    notes: apartment.notes,
  };
}

export function formValuesToPayload(values: ApartmentFormValues) {
  return {
    title: values.title.trim(),
    url: values.url.trim() || null,
    sourceSite: values.sourceSite.trim() || null,
    description: values.description.trim() || null,
    images: values.images.map((u) => u.trim()).filter(Boolean),
    price: values.price.trim() ? Number(values.price) : null,
    surface: values.surface.trim() ? Number(values.surface) : null,
    rooms: values.rooms.trim() ? Number(values.rooms) : null,
    floor: values.floor.trim() || null,
    hasElevator: values.hasElevator === "unknown" ? null : values.hasElevator === "yes",
    hasCellar: values.hasCellar === "unknown" ? null : values.hasCellar === "yes",
    hasParking: values.hasParking === "unknown" ? null : values.hasParking === "yes",
    arrondissement: values.arrondissement.trim() || null,
    neighborhood: values.neighborhood.trim() || null,
    contactPhone: values.contactPhone.trim() || null,
    visitDate: values.visitDate || null,
    listingUpdatedAt: values.listingUpdatedAt || null,
    notes: values.notes,
  };
}

interface ApartmentFormProps {
  initialValues: ApartmentFormValues;
  submitLabel: string;
  onSubmit: (values: ApartmentFormValues) => Promise<void>;
  extraActions?: React.ReactNode;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none";

export function ApartmentForm({
  initialValues,
  submitLabel,
  onSubmit,
  extraActions,
}: ApartmentFormProps) {
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [brokenPhotos, setBrokenPhotos] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof ApartmentFormValues>(
    key: K,
    value: ApartmentFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec de l'envoi de la photo");
      update("images", [...values.images, data.url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi de la photo");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim()) {
      setError("Le titre est obligatoire");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="Titre *">
        <input
          className={inputClass}
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Lien de l'annonce">
          <input
            className={inputClass}
            value={values.url}
            onChange={(e) => update("url", e.target.value)}
            placeholder="https://..."
          />
        </Field>
        <Field label="Site source">
          <input
            className={inputClass}
            value={values.sourceSite}
            onChange={(e) => update("sourceSite", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          className={inputClass}
          rows={3}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>

      <Field label="Photos">
        <div className="flex flex-col gap-3">
          {values.images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {values.images.map((url, index) => (
                <div key={index} className="group relative h-20 w-20 shrink-0">
                  {brokenPhotos.has(index) ? (
                    <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-lg text-slate-300">
                      🚫
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt=""
                      onError={() => setBrokenPhotos((prev) => new Set(prev).add(index))}
                      className="h-full w-full rounded-lg border border-slate-200 object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        "images",
                        values.images.filter((_, i) => i !== index)
                      )
                    }
                    aria-label="Retirer cette photo"
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs text-white shadow"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="self-start rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            {uploading ? "Envoi..." : "📷 Choisir une photo"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelected}
            className="hidden"
          />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Prix (€)">
          <input
            type="number"
            className={inputClass}
            value={values.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </Field>
        <Field label="Surface (m²)">
          <input
            type="number"
            className={inputClass}
            value={values.surface}
            onChange={(e) => update("surface", e.target.value)}
          />
        </Field>
        <Field label="Nb pièces">
          <input
            type="number"
            className={inputClass}
            value={values.rooms}
            onChange={(e) => update("rooms", e.target.value)}
          />
        </Field>
        <Field label="Étage">
          <input
            className={inputClass}
            value={values.floor}
            onChange={(e) => update("floor", e.target.value)}
            placeholder="RDC, 3e..."
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Ascenseur">
          <select
            className={inputClass}
            value={values.hasElevator}
            onChange={(e) =>
              update("hasElevator", e.target.value as ApartmentFormValues["hasElevator"])
            }
          >
            <option value="yes">Oui</option>
            <option value="no">Non</option>
            <option value="unknown">NC</option>
          </select>
        </Field>
        <Field label="Cave">
          <select
            className={inputClass}
            value={values.hasCellar}
            onChange={(e) =>
              update("hasCellar", e.target.value as ApartmentFormValues["hasCellar"])
            }
          >
            <option value="yes">Cave</option>
            <option value="unknown">NC</option>
            <option value="no">Non</option>
          </select>
        </Field>
        <Field label="Parking">
          <select
            className={inputClass}
            value={values.hasParking}
            onChange={(e) =>
              update("hasParking", e.target.value as ApartmentFormValues["hasParking"])
            }
          >
            <option value="yes">Oui</option>
            <option value="no">Non</option>
            <option value="unknown">NC</option>
          </select>
        </Field>
        <Field label="Arrondissement">
          <input
            className={inputClass}
            value={values.arrondissement}
            onChange={(e) => update("arrondissement", e.target.value)}
            placeholder="75011..."
          />
        </Field>
        <Field label="Quartier">
          <input
            className={inputClass}
            value={values.neighborhood}
            onChange={(e) => update("neighborhood", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Date de mise à jour de l'annonce">
          <input
            type="date"
            className={inputClass}
            value={values.listingUpdatedAt}
            onChange={(e) => update("listingUpdatedAt", e.target.value)}
          />
        </Field>
        <Field label="Date de visite">
          <input
            type="date"
            className={inputClass}
            value={values.visitDate}
            onChange={(e) => update("visitDate", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Contact téléphonique">
        <input
          className={inputClass}
          value={values.contactPhone}
          onChange={(e) => update("contactPhone", e.target.value)}
          placeholder="06 12 34 56 78"
        />
      </Field>

      <Field label="Bloc-notes">
        <textarea
          className={inputClass}
          rows={5}
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Vos impressions, questions à poser, points de vigilance..."
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : submitLabel}
        </button>
        {extraActions}
      </div>
    </form>
  );
}
