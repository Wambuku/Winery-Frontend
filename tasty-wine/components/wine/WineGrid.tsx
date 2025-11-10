"use client";

import React from "react";
import WineCard from "./WineCard";
import type { WineSummary } from "./types";

interface WineGridProps {
  wines: WineSummary[];
  title?: string;
  subtitle?: string;
  layout?: "auto" | "compact";
  onSelectWine?: (wine: WineSummary) => void;
  onAddToCart?: (wine: WineSummary) => void;
  emptyState?: React.ReactNode;
}

export default function WineGrid({
  wines,
  title,
  subtitle,
  layout = "auto",
  onSelectWine,
  onAddToCart,
  emptyState,
}: WineGridProps) {
  const columnClass =
    layout === "compact"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="space-y-8">
      {(title || subtitle) && (
        <header className="space-y-2 text-center sm:text-left">
          {title && (
            <h2 className="text-3xl font-black uppercase tracking-[0.6rem] text-yellow-400 sm:text-left">
              {title}
            </h2>
          )}
          {subtitle && <p className="max-w-2xl text-sm text-white/70 sm:text-base">{subtitle}</p>}
        </header>
      )}

      {wines.length === 0 ? (
        emptyState ?? (
          <div className="rounded-3xl border border-red-500/40 bg-black/60 p-12 text-center text-white/80 shadow-lg shadow-red-900/20">
            <p className="text-lg font-semibold">No wines found</p>
            <p className="mt-2 text-sm text-white/60">
              Adjust your filters or check back soon as we restock the cellar.
            </p>
          </div>
        )
      ) : (
        <div className={`grid gap-6 ${columnClass}`}>
          {wines.map((wine) => (
            <WineCard key={wine.id} wine={wine} onSelect={onSelectWine} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </section>
  );
}
