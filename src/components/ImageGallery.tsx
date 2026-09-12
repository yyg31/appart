"use client";

import { useState } from "react";

export function ImageGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) return null;

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
