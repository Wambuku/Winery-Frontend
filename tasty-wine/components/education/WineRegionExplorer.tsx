'use client';

import Image from 'next/image';
import React from 'react';
import { getWineRegions } from '../../lib/education';
import type { WineRegionGuide } from '../../lib/types/education';

interface WineRegionExplorerProps {
  regions?: WineRegionGuide[];
}

export default function WineRegionExplorer({ regions }: WineRegionExplorerProps) {
  const guides = regions ?? getWineRegions();

  return (
    <section aria-labelledby="wine-region-heading" className="space-y-8">
      <header className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.4rem] text-yellow-300">Terroir</p>
        <h2 id="wine-region-heading" className="text-2xl font-semibold text-white sm:text-3xl">
          Travel through iconic wine regions
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-white/70 sm:text-base">
          Discover the climates, grapes, and cellar-worthy experiences that define the world&apos;s celebrated appellations.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {guides.map((guide) => (
          <article
            key={guide.id}
            className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-lg shadow-black/30 transition hover:border-yellow-300/60 focus-within:border-yellow-300/60"
          >
            <div className="relative h-48 w-full overflow-hidden">
              {guide.heroImage ? (
                <Image
                  src={guide.heroImage}
                  alt={`Landscape of ${guide.name}`}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-black via-red-950 to-red-800 text-3xl">
                  <span aria-hidden>🌍</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                <p className="text-xs uppercase tracking-wide text-white/60">{guide.country}</p>
                <h3 className="text-lg font-semibold text-white">{guide.name}</h3>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-5">
              <p className="text-sm leading-relaxed text-white/75">{guide.description}</p>
              <dl className="space-y-3 text-sm text-white/80">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-yellow-300">Climate</dt>
                  <dd>{guide.climate}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-yellow-300">Signature grapes</dt>
                  <dd>
                    <span className="sr-only">Signature grapes:</span>
                    <div className="flex flex-wrap gap-2">
                      {guide.signatureGrapes.map((grape) => (
                        <span key={grape} className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
                          {grape}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-yellow-300">Key appellations</dt>
                  <dd className="text-white/70">{guide.keyAppellations.join(' • ')}</dd>
                </div>
              </dl>
              {guide.travelTips && guide.travelTips.length > 0 && (
                <div className="rounded-2xl border border-yellow-300/30 bg-yellow-300/5 p-3 text-xs text-yellow-200">
                  <p className="font-semibold uppercase tracking-wide text-yellow-300">Travel tips</p>
                  <ul className="mt-2 space-y-1">
                    {guide.travelTips.map((tip) => (
                      <li key={tip}>{tip}</li>
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
