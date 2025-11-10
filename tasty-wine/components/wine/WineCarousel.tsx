"use client";

import Image from "next/image";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import type { WineSummary } from "./types";

interface WineCarouselProps {
  wines: WineSummary[];
  intervalMs?: number;
  onSelectWine?: (wine: WineSummary) => void;
}

export default function WineCarousel({ wines, intervalMs = 6000, onSelectWine }: WineCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (wines.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((index) => (index + 1) % wines.length);
    }, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [wines.length, intervalMs]);

  const activeWine = wines[activeIndex];

  const handleSelect = useCallback(
    (index: number) => {
      setActiveIndex(index);
      onSelectWine?.(wines[index]);
    },
    [onSelectWine, wines]
  );

  const indicatorLabel = useMemo(() => `${activeIndex + 1} / ${wines.length}`, [activeIndex, wines.length]);

  if (wines.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-red-500/50 bg-gradient-to-br from-black via-[#2b0909] to-red-900 text-white shadow-2xl shadow-red-900/30">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="relative h-80 w-full overflow-hidden sm:h-[28rem]">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-black/60" />
          {activeWine.imageUrl ? (
            <Image
              src={activeWine.imageUrl}
              alt={activeWine.name}
              fill
              priority
              className="object-cover transition duration-700 ease-out"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-black via-red-950 to-red-800">
              <span className="text-6xl font-black uppercase tracking-[0.8rem] text-red-300/60">
                {activeWine.name.slice(0, 2)}
              </span>
            </div>
          )}
          <div className="absolute top-6 left-6 rounded-full border border-yellow-300/60 bg-black/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-yellow-300 shadow shadow-black/40">
            Featured Release
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6 p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.5rem] text-yellow-300">{indicatorLabel}</p>
            <h2 className="text-4xl font-black leading-tight">{activeWine.name}</h2>
            <p className="text-sm uppercase tracking-wide text-white/60">
              {activeWine.region}
              {activeWine.country ? ` • ${activeWine.country}` : ""}
              {activeWine.vintage ? ` • ${activeWine.vintage}` : ""}
            </p>
          </div>

          <p className="text-base text-white/75">
            {activeWine.shortDescription ??
              "A cellar-exclusive vintage with polished tannins, layered spice, and a finish that lingers well beyond the night."}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-red-500/60 bg-red-900/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-200">
              {activeWine.type}
            </span>
            {activeWine.category && (
              <span className="rounded-full border border-yellow-300/60 bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-300">
                {activeWine.category}
              </span>
            )}
            <span className="text-lg font-semibold text-yellow-300">${activeWine.price.toFixed(2)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onSelectWine?.(activeWine)}
              className="rounded-full bg-red-700 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white shadow-[0_16px_28px_-18px_rgba(185,28,28,0.9)] transition hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
            >
              View details
            </button>
            <div className="flex items-center gap-2">
              {wines.map((wine, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={wine.id}
                    type="button"
                    onClick={() => handleSelect(index)}
                    className={`h-2.5 rounded-full transition ${
                      isActive ? "w-8 bg-yellow-300" : "w-2.5 bg-white/30 hover:bg-white/60"
                    }`}
                    aria-label={`Show ${wine.name}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
