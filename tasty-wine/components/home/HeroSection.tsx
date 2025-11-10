'use client';

import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-900/50 to-purple-900/50" />
      
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-20 pt-24 text-center sm:px-6 sm:pb-28 sm:pt-28 lg:flex-row lg:items-end lg:justify-between lg:gap-20 lg:text-left">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
            <span className="block">Premium Wine</span>
            <span className="bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
              Collection
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-200 sm:text-lg lg:mx-0">
            Discover exceptional wines from renowned vineyards worldwide. Each bottle is carefully
            selected to bring you the finest flavors and experiences.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:justify-start">
            <button className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-all hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 sm:px-8 sm:py-4 sm:text-base">
              Explore Collection
            </button>
            <button className="rounded-full border-2 border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white backdrop-blur transition-all hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 sm:px-8 sm:py-4 sm:text-base">
              Learn More
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 grid w-full gap-6 text-left sm:max-w-md sm:text-center lg:mt-0 lg:text-left">
          <div className="rounded-3xl border border-white/10 bg-black/40 px-6 py-6 text-white backdrop-blur md:px-8 md:py-8">
            <p className="text-xs uppercase tracking-[0.4rem] text-yellow-300">Sommelier tips</p>
            <p className="mt-3 text-sm text-white/70 sm:text-base">
              Sip the season&apos;s best pairings curated for sunset dinners, rooftop celebrations, and fireside nights.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/40 px-6 py-6 text-white backdrop-blur md:px-8 md:py-8">
            <p className="text-xs uppercase tracking-[0.4rem] text-yellow-300">Express delivery</p>
            <p className="mt-3 text-sm text-white/70 sm:text-base">
              Same-day delivery across Nairobi and next-day shipping nationwide for members of the Cellar Club.
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-red-500/20 blur-3xl sm:-left-40 sm:h-80 sm:w-80 lg:-left-56 lg:h-96 lg:w-96" />
        <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl sm:-right-40 sm:h-80 sm:w-80 lg:-right-56 lg:h-96 lg:w-96" />
      </div>
    </section>
  );
}
