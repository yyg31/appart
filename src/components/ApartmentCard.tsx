import Link from "next/link";
import type { ApartmentWithExtras } from "@/lib/types";
import { formatDate, formatPrice, formatSurface, pricePerSquareMeter } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

export function ApartmentCard({ apartment }: { apartment: ApartmentWithExtras }) {
  const priceHasChanged =
    apartment.priceHistory.length > 1 &&
    apartment.priceHistory[0].price !==
      apartment.priceHistory[apartment.priceHistory.length - 1].price;

  return (
    <Link
      href={`/apartments/${apartment.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md hover:border-slate-300"
    >
      <div className="relative h-40 w-full bg-slate-100">
        {apartment.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={apartment.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            🏢
          </div>
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge status={apartment.status} />
        </div>
        {apartment.averageScore !== null && (
          <div className="absolute top-2 right-2 rounded-full bg-white/95 px-2 py-0.5 text-xs font-semibold shadow">
            ⭐ {apartment.averageScore.toFixed(1)}/10
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold leading-snug line-clamp-2 group-hover:underline">
          {apartment.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">{formatPrice(apartment.price)}</span>
          {priceHasChanged && (
            <span className="text-xs text-orange-600 font-medium">prix modifié</span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600">
          <span>{formatSurface(apartment.surface)}</span>
          {apartment.rooms !== null && <span>{apartment.rooms} pièces</span>}
          {apartment.floor && <span>étage {apartment.floor}</span>}
          <span>{pricePerSquareMeter(apartment.price, apartment.surface)}</span>
        </div>
        {(apartment.arrondissement || apartment.neighborhood) && (
          <div className="text-sm text-slate-500">
            {[apartment.arrondissement, apartment.neighborhood]
              .filter(Boolean)
              .join(" · ")}
          </div>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-slate-400">
          {apartment.listingUpdatedAt && (
            <span>Annonce màj {formatDate(apartment.listingUpdatedAt)}</span>
          )}
          {apartment.visitDate && (
            <span className="text-indigo-500 font-medium">
              Visite le {formatDate(apartment.visitDate)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
