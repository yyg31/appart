"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApartmentForm,
  EMPTY_FORM_VALUES,
  formValuesToPayload,
  type ApartmentFormValues,
} from "@/components/ApartmentForm";
import type { ScrapedListing } from "@/lib/types";

export default function NewApartmentPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapeWarning, setScrapeWarning] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ApartmentFormValues | null>(null);

  async function handleAnalyze() {
    if (!url.trim()) return;
    setAnalyzing(true);
    setScrapeError(null);
    setScrapeWarning(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = (await res.json()) as ScrapedListing & { error?: string };
      if (!res.ok) {
        setScrapeError(data.error ?? "Impossible d'analyser cette URL");
        setFormValues({ ...EMPTY_FORM_VALUES, url: url.trim() });
        return;
      }
      if (data.warning) setScrapeWarning(data.warning);
      setFormValues({
        ...EMPTY_FORM_VALUES,
        url: data.url,
        sourceSite: data.sourceSite ?? "",
        title: data.title ?? "",
        description: data.description ?? "",
        images: data.images ?? [],
        price: data.price?.toString() ?? "",
        surface: data.surface?.toString() ?? "",
        rooms: data.rooms?.toString() ?? "",
        floor: data.floor ?? "",
        hasElevator: data.hasElevator === true ? "yes" : data.hasElevator === false ? "no" : "unknown",
        hasCellar: data.hasCellar === true ? "yes" : data.hasCellar === false ? "no" : "unknown",
      });
    } catch {
      setScrapeError("Impossible d'analyser cette URL. Remplissez les champs manuellement.");
      setFormValues({ ...EMPTY_FORM_VALUES, url: url.trim() });
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleCreate(values: ApartmentFormValues) {
    const res = await fetch("/api/apartments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValuesToPayload(values)),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Erreur lors de la création");
    }
    router.push(`/apartments/${data.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ajouter une annonce</h1>
        <p className="text-slate-500">
          Collez le lien de l&apos;annonce pour pré-remplir les informations, puis
          complétez ce qui manque.
        </p>
      </div>

      {!formValues && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">URL de l&apos;annonce</span>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                placeholder="https://www.seloger.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAnalyze();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing || !url.trim()}
                className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {analyzing ? "Analyse..." : "Analyser"}
              </button>
            </div>
          </label>
          {scrapeError && <p className="mt-2 text-sm text-red-600">{scrapeError}</p>}
          <button
            type="button"
            onClick={() => setFormValues({ ...EMPTY_FORM_VALUES, url: url.trim() })}
            className="mt-3 text-sm font-medium text-slate-600 underline"
          >
            Ou remplir le formulaire manuellement
          </button>
        </div>
      )}

      {formValues && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          {scrapeWarning && (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {scrapeWarning}
            </p>
          )}
          <ApartmentForm
            initialValues={formValues}
            submitLabel="Créer l'annonce"
            onSubmit={handleCreate}
            extraActions={
              <button
                type="button"
                onClick={() => setFormValues(null)}
                className="text-sm font-medium text-slate-500 underline"
              >
                Recommencer
              </button>
            }
          />
        </div>
      )}
    </div>
  );
}
