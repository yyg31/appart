"use client";

import { useState } from "react";

export function ImageGallery({
  images,
  onAdd,
  onRemove,
}: {
  images: string[];
  onAdd?: (url: string) => Promise<void>;
  onRemove?: (index: number) => Promise<void>;
}) {
  const [active, setActive] = useState(0);
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [broken, setBroken] = useState<Set<number>>(new Set());

  const activeIndex = Math.min(active, Math.max(images.length - 1, 0));

  async function handleRemove() {
    if (!onRemove) return;
    setRemoving(true);
    try {
      await onRemove(activeIndex);
      setActive(0);
      setBroken(new Set());
    } finally {
      setRemoving(false);
    }
  }

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

  const activeIsBroken = broken.has(activeIndex);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        {activeIsBroken ? (
          <div className="flex h-80 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400">
            <span className="text-3xl">🚫</span>
            <span className="text-sm font-medium">Photo indisponible</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[activeIndex]}
            alt=""
            onError={() => setBroken((prev) => new Set(prev).add(activeIndex))}
            className="max-h-80 w-full rounded-lg object-cover"
          />
        )}
        {onRemove && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white hover:bg-black/75 disabled:opacity-50"
          >
            {removing ? "..." : activeIsBroken ? "Retirer" : "✕ Retirer"}
          </button>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((src, index) => (
            <button
              key={src + index}
              type="button"
              onClick={() => setActive(index)}
              className={`flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 bg-slate-50 ${
                index === activeIndex ? "border-slate-900" : "border-transparent"
              }`}
            >
              {broken.has(index) ? (
                <span className="text-lg text-slate-300">🚫</span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt=""
                  onError={() => setBroken((prev) => new Set(prev).add(index))}
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
