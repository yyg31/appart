import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Appart — nos annonces",
  description: "Partage et suivi d'annonces d'appartements à deux",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <Link href="/" className="font-semibold text-lg tracking-tight">
              🏠 Appart
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
              <Link href="/" className="hover:text-slate-900">
                Annonces
              </Link>
              <Link href="/apartments/new" className="hover:text-slate-900">
                Ajouter
              </Link>
              <Link href="/settings" className="hover:text-slate-900">
                Réglages
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
