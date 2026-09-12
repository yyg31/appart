export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatSurface(surface: number | null | undefined): string {
  if (surface === null || surface === undefined) return "—";
  return `${surface} m²`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function pricePerSquareMeter(
  price: number | null | undefined,
  surface: number | null | undefined
): string {
  if (!price || !surface) return "—";
  return `${Math.round(price / surface).toLocaleString("fr-FR")} €/m²`;
}
