"use client";

import Image from "next/image";
import React from "react";
import type { WineSummary } from "./types";

interface WineCardProps {
  wine: WineSummary;
  onSelect?: (wine: WineSummary) => void;
  onAddToCart?: (wine: WineSummary) => void;
}

export default function WineCard({ wine, onSelect, onAddToCart }: WineCardProps) {
  const handleCardClick = () => {
    onSelect?.(wine);
  };

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onAddToCart?.(wine);
  };

  return (
    <article
      onClick={handleCardClick}
      role={onSelect ? "button" : "group"}
      tabIndex={onSelect ? 0 : -1}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-red-500/40 bg-black/70 text-white shadow-xl shadow-red-900/20 transition duration-300 hover:-translate-y-2 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500"
    >
      <div className="relative h-56 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-black/20 to-black/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {wine.imageUrl ? (
          <Image
            src={wine.imageUrl}
            alt={wine.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-950 via-red-900 to-black">
            <span className="text-4xl font-black uppercase tracking-[0.6rem] text-red-300/60">
              {wine.name.slice(0, 2)}
            </span>
          </div>
        )}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {wine.badges?.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-yellow-400/70 bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-300 shadow shadow-black/40"
            >
              {badge}
            </span>
          ))}
          {wine.inStock === false && (
            <span className="rounded-full border border-red-400/70 bg-red-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-100 shadow shadow-black/40">
              Sold out
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <header className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-white">{wine.name}</h3>
            <span className="rounded-full border border-red-500/60 bg-red-900/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-200">
              {wine.type}
            </span>
          </div>
          <p className="text-sm uppercase tracking-wide text-yellow-300">
            {wine.region}
            {wine.country ? ` • ${wine.country}` : ""}
            {wine.vintage ? ` • ${wine.vintage}` : ""}
          </p>
        </header>

        <p className="flex-1 text-sm text-white/80">
          {wine.shortDescription ??
            "Silky texture with layered notes that bloom across the palate, crafted for unforgettable evenings."}
        </p>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/60">Bottle</p>
            <p className="text-lg font-semibold text-yellow-300">${wine.price.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-3">
            {typeof wine.rating === "number" && (
              <span className="flex items-center gap-1 text-sm text-yellow-300">
                <svg
                  aria-hidden
                  className="h-4 w-4 fill-yellow-400"
                  viewBox="0 0 24 24"
                  role="img"
                  focusable="false"
                >
                  <path d="M12 2.25 14.917 8.2l6.433.537-4.831 4.198 1.424 6.365L12 16.9l-5.943 2.4 1.423-6.365-4.83-4.198 6.433-.537L12 2.25Z" />
                </svg>
                {wine.rating.toFixed(1)}
              </span>
            )}
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-full border border-yellow-300/60 bg-black/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-yellow-300 transition hover:bg-yellow-300 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
