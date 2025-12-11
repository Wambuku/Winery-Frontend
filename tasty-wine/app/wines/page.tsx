'use client';

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchWines } from "../../lib/api/wines";
import { useCart } from "../../context/CartContext";
import type { Wine } from "../../lib/api/wines";
import { WineCarousel, WineDetail, WineGrid, WineSummary, WineDetailData } from "../../components/wine";

const TastingReviews = dynamic(() => import("../../components/education/TastingReviews"), {
  ssr: false,
});

const fallbackImages: Record<string, string> = {
  red: "/assets/wine-6.jpg",
  white: "/assets/glass-pour.jpg",
  rosé: "/assets/wine-3.jpg",
  rose: "/assets/wine-3.jpg",
  sparkling: "/assets/sparkling-wine.jpg",
  default: "/assets/wine-5.jpg",
};

const typeLabels = ["All", "Red", "White", "Rosé", "Sparkling"];

function mapWineToDetail(wine: Wine): WineDetailData {
  const categoryKey = (wine.category ?? wine.type ?? "").toLowerCase();
  const resolvedImage = wine.imageUrl || fallbackImages[categoryKey] || fallbackImages.default;
  const region = wine.region ?? "Estate Reserve";

  const tastingNotes =
    typeof wine.tastingNotes === "string"
      ? wine.tastingNotes.split(",").map((note) => note.trim())
      : Array.isArray(wine.tastingNotes)
      ? (wine.tastingNotes as string[])
      : undefined;

  const pairingSuggestions =
    typeof wine.pairingNotes === "string"
      ? wine.pairingNotes.split(",").map((pairing) => pairing.trim())
      : Array.isArray(wine.pairingNotes)
      ? (wine.pairingNotes as string[])
      : undefined;

  return {
    id: wine.id,
    name: wine.name,
    category: wine.category ?? wine.type ?? "Cellar selection",
    type: wine.type ?? wine.category ?? "Blend",
    region,
    country: wine.country,
    vintage: wine.vintage,
    price: wine.price,
    imageUrl: resolvedImage,
    shortDescription: wine.description,
    tastingNotes,
    pairingSuggestions,
    history: wine.location,
    badges: [
      wine.stock !== undefined && wine.stock <= 6 ? "Low stock" : undefined,
      wine.country ? wine.country : undefined,
    ].filter(Boolean) as string[],
    inStock: wine.stock === undefined ? undefined : wine.stock > 0,
  };
}

export default function WinesShowcasePage() {
  const [wines, setWines] = useState<WineDetailData[]>([]);
  const [selectedWine, setSelectedWine] = useState<WineDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>("All");
  const { addItem } = useCart();
  const abortRef = useRef<AbortController | null>(null);

  const loadWines = useCallback(async () => {
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setLoading(true);
      const response = await fetchWines({ limit: 24, signal: abortRef.current.signal });
      const mapped = response.data.map(mapWineToDetail);
      setWines(mapped);
      if (mapped.length > 0) {
        setSelectedWine(mapped[0]);
      }
    } catch (error) {
      if ((error as { name?: string }).name !== "AbortError") {
        console.error("Failed to load wines:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWines();
    return () => abortRef.current?.abort();
  }, [loadWines]);

  const handleSelectWine = (wine: WineSummary) => {
    const detail = wines.find((item) => item.id === wine.id);
    if (detail) {
      setSelectedWine(detail);
    }
  };

  const filteredWines = useMemo(() => {
    if (activeType === "All") return wines;
    const key = activeType.toLowerCase();
    return wines.filter(
      (wine) => (wine.category ?? wine.type ?? "").toLowerCase() === key || wine.type.toLowerCase() === key
    );
  }, [activeType, wines]);

  const featuredWines = filteredWines.slice(0, 6);

  const skeletonCards = Array.from({ length: 6 });

  useEffect(() => {
    if (filteredWines.length === 0) {
      setSelectedWine(null);
      return;
    }
    if (!selectedWine || !filteredWines.find((wine) => wine.id === selectedWine.id)) {
      setSelectedWine(filteredWines[0]);
    }
  }, [filteredWines, selectedWine]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#0c0a0f] to-red-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/wine-7.jpg"
            alt="Cellar backdrop"
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-red-950/60" />
          <div className="absolute -left-10 top-10 h-56 w-56 rounded-full bg-red-500/25 blur-3xl" />
          <div className="absolute right-10 bottom-10 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-200 backdrop-blur">
                Curated Cellar
                <span className="rounded-full bg-yellow-400/20 px-2 py-1 text-[10px] text-yellow-100">
                  {wines.length || "—"} bottles
                </span>
              </p>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl">
                Discover the winery portfolio
              </h1>
              <p className="max-w-3xl text-base text-white/75">
                Explore limited releases, signature whites, and cellar collector favourites with tasting notes,
                pairing tips, and real availability.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 backdrop-blur sm:px-5">
              <p className="font-semibold text-white">Shipping freshness</p>
              <p className="text-white/70">Cold-chain delivery on every order to preserve aroma and texture.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {typeLabels.map((label) => {
              const isActive = activeType === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveType(label)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 ${
                    isActive
                      ? "border border-yellow-300 bg-yellow-300 text-black shadow-[0_12px_28px_-16px_rgba(234,179,8,0.8)]"
                      : "border border-white/20 bg-white/5 text-white hover:border-yellow-300/60 hover:text-yellow-100"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-16 sm:px-8">
        {loading ? (
          <div className="space-y-8">
            <div className="h-72 w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <div className="h-full w-full animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {skeletonCards.map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-3xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="h-44 rounded-2xl bg-white/10" />
                  <div className="mt-4 h-4 w-3/4 rounded bg-white/15" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-white/10" />
                  <div className="mt-4 h-10 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {featuredWines.length > 0 && (
              <WineCarousel wines={featuredWines} onSelectWine={handleSelectWine} />
            )}

            <WineGrid
              wines={filteredWines}
              title="Cellar Collection"
              subtitle="Tap a bottle to reveal detailed tasting profiles and serving recommendations."
              onSelectWine={handleSelectWine}
              onAddToCart={(wine) =>
                addItem({
                  id: wine.id,
                  name: wine.name,
                  price: wine.price,
                  quantity: 1,
                  imageUrl: wine.imageUrl,
                  variant: wine.category || "Standard",
                })
              }
              emptyState={
                <div className="rounded-3xl border border-red-500/40 bg-black/60 p-12 text-center text-white/80 shadow-lg shadow-red-900/20">
                  <p className="text-lg font-semibold">No wines in this style yet</p>
                  <p className="mt-2 text-sm text-white/60">
                    Try another category or check back soon as we restock the cellar.
                  </p>
                </div>
              }
            />

            {selectedWine && (
              <WineDetail
                wine={selectedWine}
                onAddToCart={({ wine, size }) =>
                  addItem({
                    id: wine.id,
                    name: wine.name,
                    price: size?.price ?? wine.price,
                    quantity: 1,
                    imageUrl: wine.imageUrl,
                    variant: size?.label ?? wine.category ?? "Standard",
                  })
                }
              />
            )}

            <TastingReviews />
          </>
        )}
      </div>
    </main>
  );
}
