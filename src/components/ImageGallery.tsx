"use client";

import { useRef, useState } from "react";

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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [broken, setBroken] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onAdd) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec de l'envoi de la photo");
      await onAdd(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi de la photo");
    } finally {
      setUploading(false);
    }
  }

  if (images.length === 0) {
    if (!onAdd) return null;

    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-40 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-slate-400 hover:text-slate-600 disabled:opacity-50"
        >
          <span className="text-3xl">📷</span>
          <span className="text-sm font-medium">
            {uploading ? "Envoi..." : "Ajouter une photo"}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelected}
          className="hidden"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
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
