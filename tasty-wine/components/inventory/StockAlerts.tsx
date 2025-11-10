'use client';

import React from 'react';
import type { StockAlert } from '../../lib/types/inventory';

interface StockAlertsProps {
  alerts: StockAlert[];
  onRefresh: () => void;
}

export default function StockAlerts({ alerts }: StockAlertsProps) {
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {criticalAlerts.length > 0 && (
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">🚨</span>
            <h3 className="font-semibold text-red-400">Critical Stock Alerts</h3>
          </div>
          <div className="space-y-2">
            {criticalAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between rounded-lg bg-red-500/10 p-3"
              >
                <div>
                  <div className="font-medium text-white">{alert.wineName}</div>
                  <div className="text-sm text-red-300">{alert.message}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-red-400">Current: {alert.currentStock}</div>
                  <div className="text-xs text-red-300">Reorder: {alert.reorderLevel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {warningAlerts.length > 0 && (
        <div className="rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <h3 className="font-semibold text-yellow-400">Low Stock Warnings</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {warningAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between rounded-lg bg-yellow-500/10 p-3"
              >
                <div>
                  <div className="font-medium text-white">{alert.wineName}</div>
                  <div className="text-sm text-yellow-300">{alert.message}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-yellow-400">{alert.currentStock}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
