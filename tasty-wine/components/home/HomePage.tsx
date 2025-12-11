'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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



      {/* Footer CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-red-500/30 bg-slate-900/80 shadow-2xl shadow-red-900/20">
          <div className="absolute inset-0">
            <Image
              src="/assets/wine-5.jpg"
              alt="Fine wine bottles on display"
              fill
              sizes="(min-width: 1024px) 1200px, 100vw"
              className="h-full w-full object-cover opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-slate-900/70 to-red-900/50" />
            <div className="absolute -left-24 top-0 h-full w-64 bg-red-500/30 blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
          </div>

        <div className="relative grid items-center gap-10 px-6 py-14 sm:px-12 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full border border-red-500/40 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-red-200">
                Cellar Picks • New Arrivals
              </span>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Discover Your Perfect Wine
              </h2>
              <p className="max-w-2xl text-base text-slate-200 sm:text-lg">
                Explore curated bottles from boutique vineyards to legendary estates. Every label is hand-selected for balance, character, and a story worth sharing.
              </p>
              <div className="grid gap-3 text-sm text-slate-100 sm:grid-cols-2">
                {[
                  'Sommelier-picked highlights updated weekly',
                  'Cold-chain shipping to preserve every note',
                  'Pairing tips included with every bottle',
                  'Members-only drops before they sell out',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl bg-white/5 px-3 py-2 backdrop-blur">
                    <svg
                      className="mt-1 h-4 w-4 text-red-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-lg hover:shadow-red-900/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400">
                  Shop Now
                </button>
                <button className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40">
                  View Cellar List
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-red-500/30 blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur">
                <Image
                  src="/assets/wine-6.jpg"
                  alt="Sommelier pouring red wine"
                  width={600}
                  height={400}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-red-200">Tonight&apos;s Pick</p>
                  <h3 className="mt-2 text-xl font-bold text-white">2018 Bordeaux Blend</h3>
                  <p className="mt-1 text-sm text-slate-200">Plush dark berries, cedar, and a silky finish — perfect with slow-braised short rib.</p>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-100">
                    <span className="rounded-full bg-white/10 px-3 py-1">Limited 48 bottles</span>
                    <span className="font-semibold text-red-200">$78</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
