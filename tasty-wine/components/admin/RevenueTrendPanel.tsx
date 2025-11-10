'use client';

import React, { useMemo } from 'react';
import type { RevenueTrendPoint } from '../../lib/types/admin';

interface RevenueTrendPanelProps {
  trend: RevenueTrendPoint[];
}

export default function RevenueTrendPanel({ trend }: RevenueTrendPanelProps) {
  const { points, maxRevenue } = useMemo(() => {
    if (trend.length === 0) {
      return { points: '', maxRevenue: 0 };
    }
    const revenues = trend.map((sample) => sample.revenue);
    const max = Math.max(...revenues);
    const min = Math.min(...revenues);
    const range = Math.max(max - min, 1);

    const coords = trend.map((sample, index) => {
      const x = (index / Math.max(trend.length - 1, 1)) * 100;
      const y = 100 - ((sample.revenue - min) / range) * 100;
      return `${x},${y}`;
    });

    return { points: coords.join(' '), maxRevenue: max };
  }, [trend]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow shadow-black/30">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/60">Revenue trend</p>
          <h2 className="text-xl font-semibold text-white">Trailing four weeks</h2>
        </div>
        <p className="text-xs text-white/60">Peak revenue KES {maxRevenue.toLocaleString()}</p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,0.35fr)] lg:items-center">
        <figure className="relative h-56 rounded-2xl border border-white/10 bg-black/50 p-4">
          <svg viewBox="0 0 100 100" aria-hidden className="h-full w-full">
            <defs>
              <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#fde68a" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <polyline
              points={points}
              fill="none"
              stroke="#facc15"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polygon points={`${points} 100,100 0,100`} fill="url(#revenueGradient)" opacity={0.35} />
          </svg>
          <figcaption className="sr-only">Revenue trend over the past four weeks</figcaption>
        </figure>

        <ul className="space-y-3 text-sm text-white/75" aria-label="Weekly revenue breakdown">
          {trend.map((sample) => (
            <li key={sample.date} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">
                  {new Date(sample.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
                <p>KES {sample.revenue.toLocaleString()}</p>
              </div>
              <div className="text-right text-xs text-white/50">
                <p>{sample.transactions} transactions</p>
                <p>Avg order KES {sample.averageOrderValue.toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
