import Image from 'next/image';
import React from 'react';
import { useRouter } from 'next/navigation';
import type { WineRecommendation } from '../../lib/types/recommendation';

interface FeaturedSectionProps {
  title: string;
  wines: WineRecommendation[];
}

export default function FeaturedSection({ title, wines }: FeaturedSectionProps) {
  const router = useRouter();

  if (wines.length === 0) return null;

  const handleWineClick = (wineId: string) => {
    router.push(`/wines/${wineId}`);
  };

  const getBadgeLabel = (reason: WineRecommendation['reason']) => {
    switch (reason) {
      case 'trending':
        return '🔥 Trending';
      case 'new_arrival':
        return '✨ New';
      case 'popular':
        return '⭐ Popular';
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {wines.map((wine) => {
          const badgeLabel = getBadgeLabel(wine.reason);
          return (
            <button
              type="button"
              key={wine.wineId}
              onClick={() => handleWineClick(wine.wineId)}
              className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 p-5 text-left transition-all hover:border-red-500 hover:shadow-xl hover:shadow-red-500/20 sm:p-6"
            >
              {wine.imageUrl ? (
                <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
                  <Image
                    src={wine.imageUrl}
                    alt={wine.wineName}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  />
                </div>
              ) : (
                <div className="mb-4 flex h-48 w-full items-center justify-center rounded-lg bg-slate-900/70 text-2xl font-semibold text-slate-300">
                  {wine.wineName.slice(0, 2)}
                </div>
              )}

              {badgeLabel && (
                <div className="absolute right-4 top-4 rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {badgeLabel}
                </div>
              )}

              <h3 className="text-lg font-semibold text-white sm:text-xl">{wine.wineName}</h3>
              <p className="mt-2 text-sm text-slate-400">
                {wine.type}
                {wine.region ? ` • ${wine.region}` : ''}
              </p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xl font-bold text-red-400 sm:text-2xl">
                  KES {wine.price.toLocaleString()}
                </span>
                <div className="flex items-center gap-1 text-yellow-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold">{wine.score.toFixed(1)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
