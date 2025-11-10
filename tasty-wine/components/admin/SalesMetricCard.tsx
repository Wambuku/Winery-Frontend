'use client';

import React from 'react';
import type { SalesMetric } from '../../lib/types/admin';

interface SalesMetricCardProps {
  metric: SalesMetric;
}

export default function SalesMetricCard({ metric }: SalesMetricCardProps) {
  const trendLabel = metric.trend === 'up' ? 'Increase' : metric.trend === 'down' ? 'Decrease' : 'Stable';
  const trendColor =
    metric.trend === 'up'
      ? 'text-green-300'
      : metric.trend === 'down'
      ? 'text-red-300'
      : 'text-white/70';

  const formattedValue = metric.currency
    ? `KES ${metric.value.toLocaleString()}`
    : metric.value.toLocaleString();

  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow shadow-black/30" role="listitem">
      <header className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-white/60">{metric.label}</p>
        <span aria-hidden>{metric.trend === 'up' ? '📈' : metric.trend === 'down' ? '📉' : '➖'}</span>
      </header>
      <p className="mt-4 text-2xl font-semibold text-white">{formattedValue}</p>
      <p className={`mt-2 text-xs font-semibold uppercase tracking-wide ${trendColor}`}>
        {trendLabel} {metric.change > 0 ? `• ${metric.change.toFixed(1)}%` : ''}
      </p>
    </article>
  );
}
