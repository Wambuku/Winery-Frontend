'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import type { Wine } from '../../lib/api/wines';

interface WineCarouselProps {
  wines: Wine[];
}

export default function WineCarousel({ wines }: WineCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (wines.length === 0) {
    return <div className="py-12 text-center text-slate-400">No wines available</div>;
  }

  const visibleCount = Math.min(3, wines.length);
  const visibleWines = Array.from({ length: visibleCount }, (_, offset) => {
    const index = (currentIndex + offset) % wines.length;
    return wines[index];
  });

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % wines.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + wines.length) % wines.length);
  };

  const renderWineCard = (wine: Wine, index: number, variant: 'mobile' | 'desktop') => (
    <article
      key={`${wine.id}-${variant}-${index}`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-800/60 p-5 transition-all hover:border-red-500 hover:shadow-xl hover:shadow-red-500/20 sm:p-6 ${
        variant === 'mobile' ? 'min-h-[21rem] min-w-[85%] snap-center sm:min-w-[70%]' : ''
      }`}
    >
      {wine.imageUrl ? (
        <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
          <Image
            src={wine.imageUrl}
            alt={wine.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes={variant === 'mobile' ? '(max-width: 768px) 85vw, 40vw' : '(max-width: 1280px) 33vw, 20vw'}
            priority={index === 0 && variant === 'desktop'}
          />
        </div>
      ) : (
        <div className="mb-4 flex h-48 w-full items-center justify-center rounded-lg bg-slate-900/60 text-2xl font-semibold text-slate-300">
          {wine.name.slice(0, 2)}
        </div>
      )}

      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-white sm:text-xl">{wine.name}</h3>
        <p className="text-sm text-slate-400">
          {wine.type} {wine.region ? `• ${wine.region}` : ''}
        </p>
      </header>

      {wine.description && (
        <p className="mt-3 line-clamp-2 text-sm text-slate-300">{wine.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xl font-bold text-red-400 sm:text-2xl">
          KES {wine.price.toLocaleString()}
        </span>
        <button
          type="button"
          className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 sm:text-sm"
        >
          View Details
        </button>
      </div>
    </article>
  );

  return (
    <div className="space-y-8">
      {/* Mobile horizontal scroll */}
      <div className="-mx-4 md:hidden">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-1">
          {wines.map((wine, index) => renderWineCard(wine, index, 'mobile'))}
        </div>
      </div>

      {/* Desktop carousel */}
      <div className="hidden items-center gap-5 md:flex">
        <button
          type="button"
          onClick={prevSlide}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 text-white transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
          aria-label="Previous wines"
        >
          ←
        </button>

        <div className="grid flex-1 gap-6 md:grid-cols-3">
          {visibleWines.map((wine, index) => renderWineCard(wine, index, 'desktop'))}
        </div>

        <button
          type="button"
          onClick={nextSlide}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 text-white transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
          aria-label="Next wines"
        >
          →
        </button>
      </div>

      <div className="hidden justify-center gap-2 md:flex">
        {wines.map((wine, index) => (
          <button
            key={wine.id}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-8 bg-red-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
