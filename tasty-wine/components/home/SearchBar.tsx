'use client';

import Image from 'next/image';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWines } from '../../lib/api/wines';
import { trackSearch } from '../../lib/api/recommendations';
import type { Wine } from '../../lib/api/wines';

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Wine[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState('');
  const trendingSearches = ['Volcanic reds', 'Organic whites', 'Sparkling brunch', 'Cellar Club picks'];
  const searchWines = useCallback(async (term?: string) => {
    const effectiveTerm = term ?? query;
    if (!effectiveTerm) return;
    setLoading(true);
    try {
      const response = await fetchWines({ search: effectiveTerm, limit: 5 });
      setResults(response.data);
      setShowResults(true);
      setLastSearchTerm(effectiveTerm);

      if (effectiveTerm.length >= 3) {
        trackSearch(effectiveTerm).catch(() => {});
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2 && query !== lastSearchTerm) {
        searchWines();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, lastSearchTerm, searchWines]);

  const handleWineClick = (wineId: string) => {
    setShowResults(false);
    setQuery('');
    router.push(`/wines/${wineId}`);
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    searchWines(term);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search wines by name, region, or type..."
          className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-4 pl-12 text-white placeholder-slate-400 backdrop-blur focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-red-500" />
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="uppercase tracking-[0.3em] text-slate-500">Trending</span>
        {trendingSearches.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => handleQuickSearch(term)}
            className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-red-400 hover:text-red-200"
          >
            {term}
          </button>
        ))}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowResults(false)}
          />
          <div className="absolute z-20 mt-2 max-h-[70vh] w-full overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 shadow-2xl">
            {results.map((wine) => (
              <button
                key={wine.id}
                onClick={() => handleWineClick(wine.id)}
                className="flex w-full items-center gap-4 border-b border-slate-700 p-4 text-left transition-colors hover:bg-slate-700/50 last:border-0"
              >
                {wine.imageUrl && (
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                    <Image
                      src={wine.imageUrl}
                      alt={wine.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{wine.name}</h4>
                  <p className="text-sm text-slate-400">
                    {wine.type} • {wine.region}
                  </p>
                </div>
                <span className="text-lg font-bold text-red-400">
                  KES {wine.price.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
