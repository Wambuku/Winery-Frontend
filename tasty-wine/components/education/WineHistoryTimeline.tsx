'use client';

import Image from 'next/image';
import React from 'react';
import { getWineHistory } from '../../lib/education';
import type { WineHistoryEntry } from '../../lib/types/education';

interface WineHistoryTimelineProps {
  entries?: WineHistoryEntry[];
  showImages?: boolean;
}

export default function WineHistoryTimeline({ entries, showImages = true }: WineHistoryTimelineProps) {
  const timeline = entries ?? getWineHistory();

  return (
    <section aria-labelledby="wine-history-heading" className="space-y-8 rounded-3xl border border-white/10 bg-black/60 p-6 backdrop-blur">
      <header className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.4rem] text-yellow-300">Heritage</p>
        <h2 id="wine-history-heading" className="text-2xl font-semibold text-white sm:text-3xl">
          Moments that shaped the cellar
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-white/70 sm:text-base">
          Trace the lineage of modern winemaking—from clay qvevri buried in Georgian hillsides to monastic terroir mapping.
        </p>
      </header>

      <ol className="space-y-6" role="list">
        {timeline.map((entry) => (
          <li
            key={entry.id}
            className="relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 md:flex-row md:items-stretch md:gap-8 md:p-6"
          >
            <div className="flex items-center gap-3 md:w-48 md:flex-col md:items-start md:gap-4">
              <span aria-hidden className="h-2 w-2 rounded-full border border-yellow-300 bg-black md:hidden" />
              <div className="hidden w-full items-center md:flex">
                <div className="flex flex-col items-center">
                  <span aria-hidden className="mb-2 block h-4 w-4 rounded-full border border-yellow-300 bg-black" />
                  <span
                    aria-hidden
                    className="block h-24 w-px bg-gradient-to-b from-yellow-500/40 via-white/10 to-transparent"
                  />
                </div>
              </div>
              <div className="space-y-1 text-xs uppercase tracking-wide text-white/60">
                <span className="block text-yellow-300">{entry.period}</span>
                <span className="block text-white/60">{entry.region}</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <header className="space-y-2">
                <h3 className="text-xl font-semibold text-white">{entry.title}</h3>
                <p className="text-sm leading-relaxed text-white/75">{entry.summary}</p>
              </header>

              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1 rounded-xl border border-white/10 bg-black/40 p-3">
                  <dt className="text-xs uppercase tracking-wide text-yellow-300">Highlights</dt>
                  <dd>
                    <ul className="space-y-1 text-sm text-white/75">
                      {entry.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2">
                          <span aria-hidden className="mt-1 block h-1.5 w-1.5 rounded-full bg-yellow-300" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div className="space-y-1 rounded-xl border border-white/10 bg-black/40 p-3">
                  <dt className="text-xs uppercase tracking-wide text-yellow-300">Notable figures</dt>
                  <dd className="text-sm text-white/75">{entry.notableFigures.join(', ')}</dd>
                </div>
              </dl>

              {entry.relatedArticles && entry.relatedArticles.length > 0 && (
                <footer className="flex flex-wrap gap-2" aria-label="Related articles">
                  {entry.relatedArticles.map((articleId) => (
                    <span
                      key={articleId}
                      className="rounded-full border border-yellow-300/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-300"
                    >
                      #{articleId.replace(/-/g, ' ')}
                    </span>
                  ))}
                </footer>
              )}
            </div>

            {showImages && entry.imageUrl && (
              <figure className="relative h-40 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/50 md:h-auto md:w-64 lg:w-72">
                <Image
                  src={entry.imageUrl}
                  alt={`Historic scene: ${entry.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover"
                />
              </figure>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
