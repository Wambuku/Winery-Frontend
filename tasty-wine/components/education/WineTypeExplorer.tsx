'use client';

import React from 'react';
import { getWineTypes } from '../../lib/education';
import type { WineTypeProfile } from '../../lib/types/education';

interface WineTypeExplorerProps {
  profiles?: WineTypeProfile[];
  onSelectType?: (type: WineTypeProfile) => void;
}

export default function WineTypeExplorer({ profiles, onSelectType }: WineTypeExplorerProps) {
  const wineTypes = profiles ?? getWineTypes();

  return (
    <section aria-labelledby="wine-type-explorer" className="space-y-6 rounded-3xl border border-white/10 bg-black/65 p-6">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.4rem] text-yellow-300">Styles</p>
        <h2 id="wine-type-explorer" className="text-2xl font-semibold text-white sm:text-3xl">
          Decode wine styles at a glance
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-white/70 sm:text-base">
          Compare structure, tasting profile, and serving rituals to select the ideal bottle for your guests.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3" role="list">
        {wineTypes.map((profile) => {
          const handleClick = () => {
            onSelectType?.(profile);
          };
          return (
            <article
              key={profile.id}
              role="listitem"
              className="group flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow shadow-black/40 transition hover:border-yellow-300/50 focus-within:border-yellow-300/50"
            >
              <header className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={handleClick}
                  className="flex items-center justify-between rounded-xl border border-transparent bg-transparent px-3 py-2 text-left transition hover:border-yellow-300/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
                  aria-label={`Select ${profile.name}`}
                >
                  <span>
                    <span className="text-xs uppercase tracking-wide text-white/60">{profile.body} body</span>
                    <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
                  </span>
                  <span aria-hidden className="text-xl text-yellow-300">
                    →
                  </span>
                </button>
                <p className="text-sm text-white/70">{profile.description}</p>
              </header>

              <dl className="grid gap-2 text-xs uppercase tracking-wide text-white/60 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-white/70">
                  <dt>Acidity</dt>
                  <dd className="text-sm font-semibold text-white">{profile.acidity}</dd>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-white/70">
                  <dt>Tannins</dt>
                  <dd className="text-sm font-semibold text-white">{profile.tannins}</dd>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-white/70">
                  <dt>Sweetness</dt>
                  <dd className="text-sm font-semibold text-white">{profile.sweetness}</dd>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-white/70">
                  <dt>Serve</dt>
                  <dd className="text-sm font-semibold text-white">{profile.servingTemp}</dd>
                </div>
              </dl>

              <div className="space-y-3 text-sm text-white/75">
                <div>
                  <p className="text-xs uppercase tracking-wide text-yellow-300">Aroma</p>
                  <ul className="mt-1 flex flex-wrap gap-2">
                    {profile.aromaNotes.map((note) => (
                      <li key={note} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-yellow-300">Palate</p>
                  <ul className="mt-1 flex flex-wrap gap-2">
                    {profile.palateNotes.map((note) => (
                      <li key={note} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
                {profile.finishNotes && profile.finishNotes.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-yellow-300">Finish</p>
                    <p className="mt-1 text-white/70">{profile.finishNotes.join(', ')}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-wide text-yellow-300">Regions to explore</p>
                  <p className="mt-1 text-white/70">{profile.recommendedRegions.join(' • ')}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
