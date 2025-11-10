'use client';

import React from 'react';
import type { InventoryAlert } from '../../lib/types/admin';

interface InventoryAlertsPanelProps {
  alerts: InventoryAlert[];
}

export default function InventoryAlertsPanel({ alerts }: InventoryAlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow shadow-black/30">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-white/60">Inventory health</p>
          <h2 className="text-lg font-semibold text-white">No alerts</h2>
        </header>
        <p className="mt-3 text-sm text-white/70">Stock levels look healthy across all tracked wines.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow shadow-black/30">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-white/60">Inventory health</p>
        <h2 className="text-lg font-semibold text-white">Alerts requiring attention</h2>
        <p className="text-xs text-white/60">
          Prioritize critical alerts to avoid stockouts of high-performing wines.
        </p>
      </header>

      <ul className="space-y-3 text-sm text-white/75" role="list">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className="rounded-2xl border border-white/10 bg-black/50 p-4"
            aria-label={`${alert.wineName} stock alert`}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-white">{alert.wineName}</p>
                <p className="text-xs text-white/50">SKU {alert.sku}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  alert.severity === 'critical'
                    ? 'bg-red-600/30 text-red-200'
                    : 'bg-yellow-500/20 text-yellow-200'
                }`}
              >
                {alert.severity}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
              <span>Current stock: <strong className="text-white">{alert.currentStock}</strong></span>
              <span>Reorder at {alert.reorderLevel} bottles</span>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="w-full rounded-full border border-yellow-300/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-yellow-300 transition hover:border-yellow-300 hover:text-black hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
      >
        Open inventory dashboard
      </button>
    </section>
  );
}
