export type ApartmentStatus = "peut_etre" | "planifie" | "rdv" | "vu";

export const STATUS_LABELS: Record<ApartmentStatus, string> = {
  vu: "Vu",
  planifie: "Planifié",
  rdv: "RDV",
  peut_etre: "Peut-être",
};

export const STATUS_ORDER: ApartmentStatus[] = ["vu", "planifie", "rdv", "peut_etre"];

export interface Person {
  id: number;
  name: string;
}

export interface Rating {
  apartmentId: string;
  personId: number;
  score: number;
  comment: string | null;
  updatedAt: string;
}

export interface PriceHistoryEntry {
  id: number;
  apartmentId: string;
  price: number;
  recordedAt: string;
}

export interface Apartment {
  id: string;
  url: string | null;
  sourceSite: string | null;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  surface: number | null;
  rooms: number | null;
  floor: string | null;
  hasElevator: boolean | null;
  hasCellar: boolean | null;
  arrondissement: string | null;
  neighborhood: string | null;
  contactPhone: string | null;
  visitDate: string | null;
  notes: string;
  status: ApartmentStatus;
  listingUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApartmentWithExtras extends Apartment {
  ratings: Rating[];
  priceHistory: PriceHistoryEntry[];
  averageScore: number | null;
  images: string[];
}

export interface ScrapedListing {
  url: string;
  sourceSite: string | null;
  title: string | null;
  description: string | null;
  images: string[];
  price: number | null;
  surface: number | null;
  rooms: number | null;
  warning: string | null;
}
