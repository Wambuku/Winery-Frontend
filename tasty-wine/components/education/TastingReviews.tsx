'use client';

import React from 'react';
import { getTastingReviews } from '../../lib/education';
import type { TastingReview } from '../../lib/types/education';

interface TastingReviewsProps {
  reviews?: TastingReview[];
}

export default function TastingReviews({ reviews }: TastingReviewsProps) {
  const tastings = reviews ?? getTastingReviews();

  return (
    <section aria-labelledby="tasting-reviews-heading" className="space-y-6 rounded-3xl border border-white/10 bg-black/70 p-6">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.4rem] text-yellow-300">Tasting room</p>
        <h2 id="tasting-reviews-heading" className="text-2xl font-semibold text-white sm:text-3xl">
          Recent tasting impressions
        </h2>
        <p className="mx-auto max-w-xl text-sm text-white/70 sm:text-base">
          Sommeliers, critics, and passionate customers share their sensory takeaways to guide your next pour.
        </p>
      </header>

      <div className="space-y-4">
        {tastings.map((review) => (
          <article
            key={review.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow shadow-black/40 md:flex-row md:gap-6"
          >
            <header className="md:w-64">
              <p className="text-xs uppercase tracking-wide text-white/60">{review.role}</p>
              <h3 className="text-lg font-semibold text-white">{review.reviewer}</h3>
              <p className="text-sm text-white/70">
                Tasted <time dateTime={review.tastingDate}>{new Date(review.tastingDate).toLocaleDateString()}</time>
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-yellow-300" aria-label={`Rating ${review.rating} out of 5`}>
                <span aria-hidden>⭐</span>
                <span className="font-semibold">{review.rating.toFixed(1)}</span>
              </div>
            </header>

            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-yellow-300">Wine</p>
                <p className="text-sm font-semibold text-white">
                  {review.wineName} {review.vintage ? `• ${review.vintage}` : ''}
                </p>
              </div>
              <p className="text-sm text-white/75">{review.comments}</p>

              <div className="grid gap-3 sm:grid-cols-3">
                <FlavorList title="Nose" items={review.nose} />
                <FlavorList title="Palate" items={review.palate} />
                <div className="space-y-1 rounded-xl border border-white/10 bg-black/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-yellow-300">Finish</p>
                  <p className="text-sm text-white/75">{review.finish}</p>
                </div>
              </div>

              {review.recommendedPairings && review.recommendedPairings.length > 0 && (
                <div className="rounded-xl border border-yellow-300/30 bg-yellow-300/5 p-3 text-xs text-yellow-200">
                  <p className="font-semibold uppercase tracking-wide text-yellow-300">Pairing picks</p>
                  <ul className="mt-2 space-y-1">
                    {review.recommendedPairings.map((pairing) => (
                      <li key={pairing}>{pairing}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

interface FlavorListProps {
  title: string;
  items: string[];
}

function FlavorList({ title, items }: FlavorListProps) {
  return (
    <div className="space-y-1 rounded-xl border border-white/10 bg-black/40 p-3">
      <p className="text-xs uppercase tracking-wide text-yellow-300">{title}</p>
      <ul className="mt-1 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
