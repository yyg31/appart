"use client";

import { useState } from "react";

export function ImageGallery({
  images,
  onAdd,
}: {
  images: string[];
  onAdd?: (url: string) => Promise<void>;
}) {
  const [active, setActive] = useState(0);
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  if (images.length === 0) {
    if (!onAdd) return null;

    if (adding) {
      return (
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
          <span className="text-sm font-medium text-slate-700">
            URL de la photo
          </span>
          <div className="flex gap-2">
            <input
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
            />
            <button
              type="button"
              disabled={saving || !url.trim()}
              onClick={async () => {
                setSaving(true);
                try {
                  await onAdd(url.trim());
                  setUrl("");
                  setAdding(false);
                } finally {
                  setSaving(false);
                }
              }}
              className="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {saving ? "..." : "Ajouter"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setUrl("");
              }}
              className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-500 hover:bg-white"
            >
              Annuler
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="flex h-40 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-slate-400 hover:text-slate-600"
      >
        <span className="text-3xl">📷</span>
        <span className="text-sm font-medium">Ajouter une photo</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[active]}
        alt=""
        className="max-h-80 w-full rounded-lg object-cover"
      />
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((src, index) => (
            <button
              key={src + index}
              type="button"
              onClick={() => setActive(index)}
              className={`shrink-0 overflow-hidden rounded-md border-2 ${
                index === active ? "border-slate-900" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-16 w-20 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
