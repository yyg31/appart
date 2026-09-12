import type { PriceHistoryEntry } from "@/lib/types";
import { formatDateTime, formatPrice } from "@/lib/format";

export function PriceHistoryList({ entries }: { entries: PriceHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">Aucun historique de prix.</p>;
  }

  const chronological = [...entries].reverse();

  return (
    <ul className="flex flex-col gap-1.5 text-sm">
      {chronological.map((entry, index) => {
        const previous = chronological[index + 1];
        const delta = previous ? entry.price - previous.price : null;
        return (
          <li
            key={entry.id}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5"
          >
            <span className="text-slate-500">{formatDateTime(entry.recordedAt)}</span>
            <span className="flex items-center gap-2">
              <span className="font-medium">{formatPrice(entry.price)}</span>
              {delta !== null && delta !== 0 && (
                <span
                  className={delta < 0 ? "text-green-600" : "text-red-600"}
                >
                  {delta > 0 ? "+" : ""}
                  {formatPrice(delta)}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
