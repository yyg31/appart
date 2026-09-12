"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ApartmentWithExtras, Person } from "@/lib/types";
import { STATUS_ORDER } from "@/lib/types";
import { ApartmentCard } from "./ApartmentCard";

type PriceRange = "all" | "under_800" | "800_900" | "over_900";

const PRICE_RANGE_LABELS: Record<PriceRange, string> = {
  all: "Tous les prix",
  under_800: "Moins de 800 000 €",
  "800_900": "800 000 à 900 000 €",
  over_900: "900 000 € ou plus",
};

function matchesPriceRange(price: number | null, range: PriceRange): boolean {
  if (range === "all") return true;
  if (price === null) return false;
  if (range === "under_800") return price < 800_000;
  if (range === "800_900") return price >= 800_000 && price <= 900_000;
  return price > 900_000;
}

const BASE_SORTS = {
  recent: "Plus récent",
  status: "Statut (Vu, Planifié, RDV, Peut-être)",
  price_asc: "Prix croissant",
  price_desc: "Prix décroissant",
  price_per_sqm_asc: "Prix/m² croissant",
  price_per_sqm_desc: "Prix/m² décroissant",
  rating_desc: "Meilleure note (moyenne)",
  surface_desc: "Plus grande surface",
} as const;

type BaseSortKey = keyof typeof BASE_SORTS;

function personSortKey(personId: number) {
  return `person:${personId}`;
}

function pricePerSqm(a: ApartmentWithExtras): number | null {
  if (!a.price || !a.surface) return null;
  return a.price / a.surface;
}

export function Dashboard({
  apartments,
  persons,
}: {
  apartments: ApartmentWithExtras[];
  persons: Person[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [arrondissementFilter, setArrondissementFilter] = useState(
    () => searchParams.get("arr") ?? "all"
  );
  const [priceRange, setPriceRange] = useState<PriceRange>(
    () => (searchParams.get("prix") as PriceRange | null) ?? "all"
  );
  const [sort, setSort] = useState<string>(() => searchParams.get("tri") ?? "recent");

  useEffect(() => {
    const params = new URLSearchParams();
    if (arrondissementFilter !== "all") params.set("arr", arrondissementFilter);
    if (priceRange !== "all") params.set("prix", priceRange);
    if (sort !== "recent") params.set("tri", sort);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrondissementFilter, priceRange, sort]);

  const arrondissements = useMemo(() => {
    const values = new Set<string>();
    for (const a of apartments) {
      if (a.arrondissement) values.add(a.arrondissement);
    }
    return Array.from(values).sort();
  }, [apartments]);

  const filtered = useMemo(() => {
    let result = apartments;
    if (arrondissementFilter !== "all") {
      result = result.filter((a) => a.arrondissement === arrondissementFilter);
    }
    if (priceRange !== "all") {
      result = result.filter((a) => matchesPriceRange(a.price, priceRange));
    }

    const sorted = [...result];
    const personMatch = sort.match(/^person:(\d+)$/);
    if (personMatch) {
      const personId = Number(personMatch[1]);
      const scoreFor = (a: ApartmentWithExtras) =>
        a.ratings.find((r) => r.personId === personId)?.score ?? -Infinity;
      sorted.sort((a, b) => scoreFor(b) - scoreFor(a));
    } else {
      switch (sort as BaseSortKey) {
        case "price_asc":
          sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
          break;
        case "price_desc":
          sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
          break;
        case "price_per_sqm_asc":
          sorted.sort((a, b) => (pricePerSqm(a) ?? Infinity) - (pricePerSqm(b) ?? Infinity));
          break;
        case "price_per_sqm_desc":
          sorted.sort((a, b) => (pricePerSqm(b) ?? -Infinity) - (pricePerSqm(a) ?? -Infinity));
          break;
        case "rating_desc":
          sorted.sort(
            (a, b) => (b.averageScore ?? -Infinity) - (a.averageScore ?? -Infinity)
          );
          break;
        case "surface_desc":
          sorted.sort((a, b) => (b.surface ?? -Infinity) - (a.surface ?? -Infinity));
          break;
        case "status":
          sorted.sort(
            (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
          );
          break;
        default:
          sorted.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    }
    return sorted;
  }, [apartments, arrondissementFilter, priceRange, sort]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
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
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value as PriceRange)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
        >
          {Object.entries(PRICE_RANGE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
        >
          {Object.entries(BASE_SORTS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
          {persons.map((person) => (
            <option key={person.id} value={personSortKey(person.id)}>
              Meilleure note {person.name}
            </option>
          ))}
        </select>

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
            <ApartmentCard key={apartment.id} apartment={apartment} persons={persons} />
          ))}
        </div>
      )}
    </div>
  );
}
