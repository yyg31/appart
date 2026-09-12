// Kept only for the underlying DB column (unused by the UI); the app no
// longer surfaces a "status" concept anywhere.
export type ApartmentStatus =
  | "nouveau"
  | "a_contacter"
  | "contacte"
  | "visite_prevue"
  | "visite"
  | "coup_de_coeur"
  | "rejete"
  | "plus_disponible";

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
