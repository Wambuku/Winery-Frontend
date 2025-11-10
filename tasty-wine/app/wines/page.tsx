'use client';

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { fetchWines } from "../../lib/api/wines";
import { useCart } from "../../context/CartContext";
import type { Wine } from "../../lib/api/wines";
import { WineCarousel, WineDetail, WineGrid, WineSummary, WineDetailData } from "../../components/wine";

const TastingReviews = dynamic(() => import("../../components/education/TastingReviews"), {
  ssr: false,
});

function mapWineToDetail(wine: Wine): WineDetailData {
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
    region: wine.region ?? "Unknown region",
    country: wine.country,
    vintage: wine.vintage,
    price: wine.price,
    imageUrl: wine.imageUrl,
    shortDescription: wine.description,
    tastingNotes,
    pairingSuggestions,
    history: wine.location,
  };
}

export default function WinesShowcasePage() {
  const [wines, setWines] = useState<WineDetailData[]>([]);
  const [selectedWine, setSelectedWine] = useState<WineDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    loadWines();
  }, []);

  const loadWines = async () => {
    try {
      const response = await fetchWines({ limit: 20 });
      const mapped = response.data.map(mapWineToDetail);
      setWines(mapped);
      if (mapped.length > 0) {
        setSelectedWine(mapped[0]);
      }
    } catch (error) {
      console.error('Failed to load wines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWine = (wine: WineSummary) => {
    const detail = wines.find((item) => item.id === wine.id);
    if (detail) {
      setSelectedWine(detail);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-xl text-white">Loading wines...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#120303] to-red-950 px-4 py-16 text-white sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.4rem] text-yellow-400">Featured cellar</p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">Discover the winery portfolio</h1>
          <p className="max-w-3xl text-base text-white/75">
            Explore limited releases, signature whites, and cellar collector favourites from our curated collection.
          </p>
        </header>

        {wines.length > 0 && (
          <>
            <WineCarousel wines={wines.slice(0, 6)} onSelectWine={handleSelectWine} />

            <WineGrid
              wines={wines}
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
                  variant: wine.category || 'Standard',
                })
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
                    variant: size?.label ?? wine.category ?? 'Standard',
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
