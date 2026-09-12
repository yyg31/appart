import type { ApartmentStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

const STATUS_STYLES: Record<ApartmentStatus, string> = {
  nouveau: "bg-slate-100 text-slate-700",
  a_contacter: "bg-amber-100 text-amber-800",
  contacte: "bg-blue-100 text-blue-800",
  visite_prevue: "bg-indigo-100 text-indigo-800",
  visite: "bg-teal-100 text-teal-800",
  coup_de_coeur: "bg-pink-100 text-pink-800",
  rejete: "bg-red-100 text-red-700 line-through",
  plus_disponible: "bg-neutral-200 text-neutral-500 line-through",
};

export function StatusBadge({ status }: { status: ApartmentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
