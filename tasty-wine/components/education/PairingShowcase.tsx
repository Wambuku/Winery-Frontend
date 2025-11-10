'use client';

import React from 'react';
import { getPairingSuggestions, getWineTypes } from '../../lib/education';
import type { WinePairingSuggestion, WineTypeProfile } from '../../lib/types/education';

interface PairingShowcaseProps {
  pairings?: WinePairingSuggestion[];
  wineTypes?: WineTypeProfile[];
}

export default function PairingShowcase({ pairings, wineTypes }: PairingShowcaseProps) {
  const suggestions = pairings ?? getPairingSuggestions();
  const types = wineTypes ?? getWineTypes();
  const typeMap = new Map(types.map((type) => [type.id, type]));

  return (
    <section aria-labelledby="pairing-showcase" className="space-y-6 rounded-3xl border border-white/10 bg-black/70 p-6">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.4rem] text-yellow-300">Pairings</p>
        <h2 id="pairing-showcase" className="text-2xl font-semibold text-white sm:text-3xl">
          Pair like a sommelier
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-white/70 sm:text-base">
          Build menus around complementary textures, acidity, and aromatic echoes for unforgettable dining moments.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {suggestions.map((suggestion) => (
          <article
            key={suggestion.id}
            className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30"
          >
            <header className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-white/60">{suggestion.occasion ?? 'Any occasion'}</p>
              <h3 className="text-lg font-semibold text-white">{suggestion.title}</h3>
            </header>

            <div className="space-y-3 text-sm text-white/75">
              <div>
                <p className="text-xs uppercase tracking-wide text-yellow-300">Wine styles</p>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {suggestion.wineTypes.map((typeId) => {
                    const type = typeMap.get(typeId);
                    return (
                      <li
                        key={typeId}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/70"
                      >
                        {type?.name ?? typeId}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-yellow-300">Plates</p>
                <ul className="mt-1 space-y-1">
                  {suggestion.foods.map((food) => (
                    <li key={food} className="flex items-start gap-2">
                      <span aria-hidden className="mt-1 block h-1.5 w-1.5 rounded-full bg-yellow-300" />
                      <span>{food}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {suggestion.chefTips && suggestion.chefTips.length > 0 && (
                <div className="rounded-2xl border border-yellow-300/30 bg-yellow-300/5 p-3 text-xs text-yellow-200">
                  <p className="font-semibold uppercase tracking-wide text-yellow-300">Service notes</p>
                  <ul className="mt-2 space-y-1">
                    {suggestion.chefTips.map((tip) => (
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
