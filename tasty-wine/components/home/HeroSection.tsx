'use client';

import React from 'react';
import { FaWineBottle } from 'react-icons/fa6';

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-black" />

      <div className="relative mx-auto max-w-12xl">
        <div className="relative min-h-[70vh] overflow-hidden rounded-[28px] border border-red-900/30 bg-gradient-to-b from-[#0e0d0e] via-[#121016] to-[#0c0b0c] shadow-2xl shadow-red-900/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(248,113,113,0.14),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(127,29,29,0.18),transparent_36%)] opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.12)_0,rgba(255,255,255,0.06)_22%,transparent_22%),linear-gradient(300deg,rgba(248,113,113,0.14)_10%,transparent_30%,rgba(127,29,29,0.12)_38%)] mix-blend-overlay opacity-30" />

          <div className="relative flex h-full flex-col px-6 pb-12 pt-8 sm:px-12 sm:pb-16 sm:pt-12">
            <div className="flex items-start justify-between text-red-100">
              <p className="max-w-xl text-sm font-serif text-red-100/90 sm:text-base">
                History and future from the heart of the Teramo hills
              </p>
              <div className="mt-1 hidden flex-col gap-1 sm:flex">
                <span className="text-xl font-semibold text-red-200">
                  <FaWineBottle />
                </span>
              </div>
            </div>

            <div className="relative flex flex-1 flex-col items-center justify-center gap-6">
              <div className="pointer-events-none absolute -left-10 top-1/3 hidden h-40 w-40 -rotate-6 rounded-full border-2 border-red-900/60 bg-[radial-gradient(circle_at_40%_40%,rgba(255,255,255,0.08),transparent_55%)] shadow-[10px_14px_0_rgba(127,29,29,0.25)] sm:block" />
              <div className="pointer-events-none absolute -right-10 top-1/3 hidden h-40 w-40 rotate-9 rounded-full border-2 border-red-900/60 bg-[radial-gradient(circle_at_60%_50%,rgba(255,255,255,0.08),transparent_55%)] shadow-[-10px_14px_0_rgba(127,29,29,0.25)] sm:block" />
              <div className="pointer-events-none absolute left-10 bottom-14 hidden h-20 w-32 rotate-3 rounded-full border-2 border-red-800/70 bg-[radial-gradient(circle_at_40%_40%,rgba(248,113,113,0.2),transparent_60%)] shadow-[6px_10px_0_rgba(127,29,29,0.25)] lg:block" />
              <div className="pointer-events-none absolute right-12 bottom-12 hidden h-20 w-20 -rotate-6 rounded-full border-2 border-red-800/70 bg-[radial-gradient(circle_at_50%_50%,rgba(248,113,113,0.2),transparent_58%)] shadow-[-6px_10px_0_rgba(127,29,29,0.25)] lg:block" />

              <div className="text-center">
                <h1 className="text-4xl font-black uppercase tracking-[0.08em] text-red-100 sm:text-6xl lg:text-7xl">
                    Crafted to Perfection.                
                </h1>
                <p className="mt-1 text-lg font-serif uppercase tracking-[0.2em] text-red-200/90 sm:text-xl">
                  Collection
                </p>
              </div>

              <div className="relative flex items-center justify-center">
                <span className="absolute -left-10 top-5 hidden rotate-[-8deg] text-[11px] uppercase tracking-[0.2em] text-red-200 sm:block">
                  Heritage
                </span>
                <span className="absolute -right-10 top-5 hidden rotate-[8deg] text-[11px] uppercase tracking-[0.2em] text-red-200 sm:block">
                  Craft
                </span>
                <img
                  src="/assets/wine-1.jpg"
                  alt="Signature bottle"
                  className="w-[180px] rotate-[-12deg] drop-shadow-[0_30px_45px_rgba(0,0,0,0.35)] sm:w-[220px] lg:w-[260px]"
                />
              </div>

              <div className="flex flex-col items-center gap-2">
                <p className="text-lg font-black uppercase tracking-[0.25em] text-red-100 sm:text-2xl">
                  W I N E R Y
                </p>
                <p className="text-xs uppercase tracking-[0.28em] text-red-200/80 sm:text-sm">
                  A land, its wines
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
