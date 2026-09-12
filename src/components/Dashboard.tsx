"use client";

import { useMemo, useState } from "react";
import type { ApartmentStatus, ApartmentWithExtras } from "@/lib/types";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/types";
import { ApartmentCard } from "./ApartmentCard";

type SortKey =
  | "recent"
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "surface_desc";

const SORT_LABELS: Record<SortKey, string> = {
  recent: "Plus récent",
  price_asc: "Prix croissant",
  price_desc: "Prix décroissant",
  rating_desc: "Meilleure note",
  surface_desc: "Plus grande surface",
};

export function Dashboard({ apartments }: { apartments: ApartmentWithExtras[] }) {
  const [statusFilter, setStatusFilter] = useState<ApartmentStatus | "all">("all");
  const [arrondissementFilter, setArrondissementFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [hideRejected, setHideRejected] = useState(true);

  const arrondissements = useMemo(() => {
    const values = new Set<string>();
    for (const a of apartments) {
      if (a.arrondissement) values.add(a.arrondissement);
    }
    return Array.from(values).sort();
  }, [apartments]);

  const filtered = useMemo(() => {
    let result = apartments;
    if (hideRejected) {
      result = result.filter(
        (a) => a.status !== "rejete" && a.status !== "plus_disponible"
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }
    if (arrondissementFilter !== "all") {
      result = result.filter((a) => a.arrondissement === arrondissementFilter);
    }

    const sorted = [...result];
    switch (sort) {
      case "price_asc":
        sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case "price_desc":
        sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
        break;
      case "rating_desc":
        sorted.sort(
          (a, b) => (b.averageScore ?? -Infinity) - (a.averageScore ?? -Infinity)
        );
        break;
      case "surface_desc":
        sorted.sort((a, b) => (b.surface ?? -Infinity) - (a.surface ?? -Infinity));
        break;
      default:
        sorted.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
    return sorted;
  }, [apartments, statusFilter, arrondissementFilter, sort, hideRejected]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApartmentStatus | "all")}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="all">Tous les statuts</option>
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        {arrondissements.length > 0 && (
          <select
            value={arrondissementFilter}
            onChange={(e) => setArrondissementFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="all">Tous les arrondissements</option>
            {arrondissements.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        )}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
        >
          {Object.entries(SORT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={hideRejected}
            onChange={(e) => setHideRejected(e.target.checked)}
          />
          Masquer rejetés / plus disponibles
        </label>

        <span className="ml-auto text-sm text-slate-500">
          {filtered.length} annonce{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Aucune annonce ne correspond aux filtres.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((apartment) => (
            <ApartmentCard key={apartment.id} apartment={apartment} />
          ))}
        </div>
      )}
    </div>
  );
}
