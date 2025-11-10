'use client';

import React, { useEffect, useState } from 'react';
import type { SystemHealthMetric } from '../../lib/types/admin';

interface SystemHealthPanelProps {
  metrics: SystemHealthMetric[];
}

export default function SystemHealthPanel({ metrics }: SystemHealthPanelProps) {
  const [eventLog, setEventLog] = useState<
    Array<{ id: string; label: string; level: 'info' | 'warning' | 'error'; timestamp: number }>
  >([]);

  useEffect(() => {
    const handleVital = (event: Event) => {
      const detail = (event as CustomEvent).detail as { name: string; value: number; rating?: string };
      setEventLog((log) => [
        {
          id: `vital-${detail.name}-${detail.value}-${Date.now()}`,
          label: `${detail.name} ${detail.value.toFixed(2)} (${detail.rating ?? 'n/a'})`,
          level: detail.rating === 'poor' || detail.rating === 'needs-improvement' ? 'warning' : 'info',
          timestamp: Date.now(),
        },
        ...log,
      ].slice(0, 6));
    };

    const handleError = (event: Event) => {
      const detail = (event as CustomEvent).detail as { message: string };
      setEventLog((log) => [
        {
          id: `error-${detail.message}-${Date.now()}`,
          label: `JS error: ${detail.message}`,
          level: 'error',
          timestamp: Date.now(),
        },
        ...log,
      ].slice(0, 6));
    };

    window.addEventListener('tasty-wine:web-vital', handleVital as EventListener);
    window.addEventListener('tasty-wine:error', handleError as EventListener);

    return () => {
      window.removeEventListener('tasty-wine:web-vital', handleVital as EventListener);
      window.removeEventListener('tasty-wine:error', handleError as EventListener);
    };
  }, []);

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow shadow-black/30">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-white/60">System health</p>
        <h2 className="text-lg font-semibold text-white">Platform monitoring</h2>
        <p className="text-xs text-white/60">
          Stay ahead of incidents with live operational checks across the commerce stack.
        </p>
      </header>

      <ul className="space-y-3 text-sm text-white/75" role="list">
        {metrics.map((metric) => (
          <li
            key={metric.id}
            className="rounded-2xl border border-white/10 bg-black/50 p-4"
            aria-label={`${metric.label} status`}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-white">{metric.label}</p>
                <p className="text-xs text-white/50">
                  Checked {new Date(metric.lastChecked).toLocaleTimeString()}
                </p>
              </div>
              <StatusPill status={metric.status} />
            </div>
            <p className="mt-3 text-sm text-white/70">{metric.description}</p>
          </li>
        ))}
      </ul>

      {eventLog.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white/70">
          <p className="font-semibold uppercase tracking-wide text-white/60">Recent telemetry</p>
          <ul className="space-y-1">
            {eventLog.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs uppercase tracking-wide ${
                    entry.level === 'error'
                      ? 'bg-red-500/20 text-red-200'
                      : entry.level === 'warning'
                      ? 'bg-yellow-500/20 text-yellow-200'
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  {entry.level}
                </span>
                <span className="flex-1 px-2 text-left">{entry.label}</span>
                <time className="text-white/50">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </time>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        className="w-full rounded-full border border-red-400/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-red-200 transition hover:border-red-300 hover:text-black hover:bg-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
      >
        Open incident response playbook
      </button>
    </section>
  );
}

interface StatusPillProps {
  status: SystemHealthMetric['status'];
}

function StatusPill({ status }: StatusPillProps) {
  switch (status) {
    case 'operational':
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-green-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-200">
          <span aria-hidden className="h-2 w-2 rounded-full bg-green-300" />
          Operational
        </span>
      );
    case 'degraded':
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-200">
          <span aria-hidden className="h-2 w-2 rounded-full bg-yellow-300" />
          Degraded
        </span>
      );
    case 'issue':
    default:
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-red-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-200">
          <span aria-hidden className="h-2 w-2 rounded-full bg-red-300" />
          Investigate
        </span>
      );
  }
}
