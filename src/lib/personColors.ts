export const PERSON_BADGE_STYLES = [
  "bg-blue-100 text-blue-700",
  "bg-pink-100 text-pink-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
];

export function personBadgeStyle(index: number): string {
  return PERSON_BADGE_STYLES[index % PERSON_BADGE_STYLES.length];
}
