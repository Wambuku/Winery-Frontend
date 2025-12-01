'use client';

import React from 'react';

const accent = {
  deepRed: '#9b111e',
  dark: '#0b0a0d',
  text: '#f3f0ed',
};

export default function HighlightsStrip() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[28px] border border-red-900/30 bg-gradient-to-b from-[#0e0c11] via-[#0b0a0d] to-[#0e0c11] px-6 py-10 shadow-2xl shadow-red-900/30 sm:px-10">
        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_12%_20%,rgba(155,17,30,0.14),transparent_35%),radial-gradient(circle_at_82%_10%,rgba(255,255,255,0.06),transparent_32%)]" />
        <div className="relative grid gap-10 lg:grid-cols-2">
          <div className="space-y-5 text-[#e8e4de]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-200">New Wines</p>
            <div className="space-y-2">
              <p className="text-4xl font-serif font-semibold text-[color:#c7182d] sm:text-5xl">Merlot</p>
              <p className="text-2xl font-semibold text-[color:#f3f0ed] sm:text-3xl">Winehouse Vineyard</p>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-slate-200">
              Merlot is loved for its boisterous black cherry flavors, supple tannins, and chocolatey
              finish. On the high end, it&apos;s often mistaken for a Cabernet Sauvignon.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                className="rounded-md bg-[color:#c7182d] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/40 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:#c7182d]"
                style={{ backgroundColor: accent.deepRed }}
              >
                Learn more
              </button>
              <button className="rounded-md border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[color:#c7182d] hover:text-[color:#c7182d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:#c7182d]">
                View more
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-200/70 sm:px-4">
              <span>Prev</span>
              <span>Next</span>
            </div>
            <div className="relative h-full max-h-[360px] w-full max-w-[360px] sm:max-h-[420px] sm:max-w-[420px]">
              <div
                className="absolute inset-6 rounded-[26px] border-2 border-[color:#c7182d] sm:inset-4"
                style={{ borderColor: accent.deepRed }}
              />
              <div
                className="absolute inset-12 rounded-full bg-[color:#c7182d]/80 shadow-[0_20px_40px_rgba(155,17,30,0.35)] sm:inset-12"
                style={{ backgroundColor: accent.deepRed }}
              />
              <img
                src="/assets/wine-3.jpg"
                alt="Featured Merlot bottle"
                className="relative mx-auto h-full w-auto max-h-[360px] drop-shadow-[0_30px_45px_rgba(0,0,0,0.65)] sm:max-h-[420px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
