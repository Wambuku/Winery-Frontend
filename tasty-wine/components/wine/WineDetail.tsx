"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import type { WineDetailData } from "./types";

interface WineDetailProps {
  wine: WineDetailData;
  onAddToCart?: (payload: { wine: WineDetailData; size?: { label: string; price: number } }) => void;
}

export default function WineDetail({ wine, onAddToCart }: WineDetailProps) {
  const [selectedSize, setSelectedSize] = useState(wine.availableSizes?.[0]);

  const priceLabel = useMemo(() => {
    if (selectedSize) {
      return `${selectedSize.label} • $${selectedSize.price.toFixed(2)}`;
    }
    return `$${wine.price.toFixed(2)}`;
  }, [selectedSize, wine.price]);

  const handleAddToCart = () => {
    onAddToCart?.({ wine, size: selectedSize });
  };

  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="relative overflow-hidden rounded-3xl border border-red-500/40 bg-black/70 shadow-2xl shadow-red-900/30">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-transparent to-black/80" />
        {wine.imageUrl ? (
          <Image
            src={wine.imageUrl}
            alt={wine.name}
            width={960}
            height={1200}
            className="h-full w-full object-cover"
            priority
          />
        ) : (
          <div className="flex h-full min-h-[28rem] items-center justify-center bg-gradient-to-br from-black via-red-950 to-red-800">
            <span className="text-6xl font-black uppercase tracking-[0.8rem] text-red-300/60">
              {wine.name.slice(0, 2)}
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
          <p className="text-sm uppercase tracking-wide text-yellow-300">
            {wine.region} • {wine.category}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">{wine.name}</h1>
        </div>
      </div>

      <div className="space-y-10 rounded-3xl border border-red-500/30 bg-black/80 p-8 text-white shadow-xl shadow-red-900/20">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-wide text-white/60">
            {wine.type && <span>{wine.type}</span>}
            {wine.vintage && <span>• {wine.vintage}</span>}
            {wine.country && <span>• {wine.country}</span>}
            {wine.rating && (
              <span className="flex items-center gap-1 text-yellow-300">
                <svg aria-hidden className="h-4 w-4 fill-yellow-400" viewBox="0 0 24 24">
                  <path d="M12 2.25 14.917 8.2l6.433.537-4.831 4.198 1.424 6.365L12 16.9l-5.943 2.4 1.423-6.365-4.83-4.198 6.433-.537L12 2.25Z" />
                </svg>
                {wine.rating.toFixed(1)}
              </span>
            )}
          </div>
          <p className="text-lg text-white/80">{wine.longDescription ?? wine.shortDescription}</p>
        </header>

        {wine.tastingNotes && wine.tastingNotes.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold uppercase tracking-wide text-yellow-300">Tasting notes</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {wine.tastingNotes.map((note) => (
                <li
                  key={note}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80"
                >
                  <span className="h-2 w-2 rounded-full bg-yellow-300" aria-hidden />
                  {note}
                </li>
              ))}
            </ul>
          </section>
        )}

        {wine.ingredients && wine.ingredients.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold uppercase tracking-wide text-yellow-300">Ingredients</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {wine.ingredients.map((item) => (
                <li key={item} className="rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white/80">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {wine.pairingSuggestions && wine.pairingSuggestions.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold uppercase tracking-wide text-yellow-300">Pairing suggestions</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {wine.pairingSuggestions.map((pairing) => (
                <li key={pairing} className="rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white/80">
                  {pairing}
                </li>
              ))}
            </ul>
          </section>
        )}

        {wine.history && (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold uppercase tracking-wide text-yellow-300">Estate history</h2>
            <p className="text-sm leading-relaxed text-white/75">{wine.history}</p>
          </section>
        )}

        <footer className="space-y-4 rounded-2xl border border-yellow-400/30 bg-black/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/60">Select bottle</p>
              <p className="text-xl font-semibold text-yellow-300">{priceLabel}</p>
            </div>

            {wine.availableSizes && wine.availableSizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {wine.availableSizes.map((size) => {
                  const isActive = selectedSize?.label === size.label;
                  return (
                    <button
                      key={size.label}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 ${
                        isActive
                          ? "border border-yellow-300 bg-yellow-300 text-black"
                          : "border border-yellow-300/40 bg-black/50 text-yellow-300 hover:border-yellow-300"
                      }`}
                    >
                      {size.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 rounded-full bg-red-700 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_18px_32px_-16px_rgba(185,28,28,0.9)] transition hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 sm:flex-none"
            >
              Add to cart
            </button>
            {wine.purchaseLink && (
              <a
                href={wine.purchaseLink}
                className="rounded-full border border-yellow-300/60 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-yellow-300 transition hover:border-yellow-300 hover:text-black hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
              >
                Purchase wholesale
              </a>
            )}
          </div>
        </footer>
      </div>
    </section>
  );
}
