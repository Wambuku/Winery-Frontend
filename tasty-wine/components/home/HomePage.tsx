'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { fetchWines } from '../../lib/api/wines';
import { getTrendingWines, getNewArrivals } from '../../lib/api/recommendations';
import type { Wine } from '../../lib/api/wines';
import type { WineRecommendation } from '../../lib/types/recommendation';
import HeroSection from './HeroSection';
import WineCarousel from './WineCarousel';
import FeaturedSection from './FeaturedSection';
import CategoryGrid from './CategoryGrid';
import SearchBar from './SearchBar';
import HighlightsStrip from './HighlightsStrip';
import EditorialSpotlight from './EditorialSpotlight';

const PairingShowcase = dynamic(() => import('../education/PairingShowcase'), {
  ssr: false,
});

const TastingReviews = dynamic(() => import('../education/TastingReviews'), {
  ssr: false,
  loading: () => (
    <section className="rounded-3xl border border-white/10 bg-black/60 p-6 text-white/60">
      Loading tasting notes…
    </section>
  ),
});

export default function HomePage() {
  const [featuredWines, setFeaturedWines] = useState<Wine[]>([]);
  const [trendingWines, setTrendingWines] = useState<WineRecommendation[]>([]);
  const [newArrivals, setNewArrivals] = useState<WineRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [wines, trending, arrivals] = await Promise.all([
        fetchWines({ limit: 10 }),
        getTrendingWines(6),
        getNewArrivals(6),
      ]);

      setFeaturedWines(wines.data);
      setTrendingWines(trending);
      setNewArrivals(arrivals);
    } catch (error) {
      console.error('Failed to load homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

 
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-black">
     
      {/* Classic Hero + Search */}
      <HeroSection />
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <SearchBar />
      </div>

      {/* Highlights */}
      <div className="py-4">
        <HighlightsStrip />
      </div>

      {/* Featured Wine Carousel */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">Featured Collection</h2>
        
        <WineCarousel wines={featuredWines} />
      </section>

      {/* Category Grid */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">Browse by Category</h2>
        <CategoryGrid />
      </section>

      {/* Trending Wines */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <FeaturedSection title="Trending Now" wines={trendingWines} />
      </section>

      

      {/* Pairings */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <PairingShowcase />
      </section>

      {/* Tasting Reviews */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <TastingReviews />
      </section>

      {/* Editorial Spotlight */}
      <EditorialSpotlight />

      {/* Footer CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-900/20 to-purple-900/20 px-6 py-12 text-center backdrop-blur sm:px-12">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Discover Your Perfect Wine</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
            Explore our curated collection of premium wines from around the world. Each bottle tells
            a story of craftsmanship and tradition.
          </p>
          <button className="mt-8 rounded-full bg-red-600 px-8 py-4 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 sm:text-base">
            Shop Now
          </button>
        </div>
      </section>
    </div>
  );
}
