'use client';

import React from 'react';
import {
  getDashboardSnapshot,
  getInventoryAlerts,
  getRevenueTrend,
  getSalesMetrics,
  getStaffRoster,
  getSystemHealthMetrics,
  getTopCustomers,
} from '../../lib/admin/dashboard';
import type { SalesMetric } from '../../lib/types/admin';
import SalesMetricCard from './SalesMetricCard';
import RevenueTrendPanel from './RevenueTrendPanel';
import StaffManagementPanel from './StaffManagementPanel';
import CustomerInsightsPanel from './CustomerInsightsPanel';
import InventoryAlertsPanel from './InventoryAlertsPanel';
import SystemHealthPanel from './SystemHealthPanel';

export default function AdminDashboard() {
  const snapshot = getDashboardSnapshot();
  const metrics = getSalesMetrics();
  const trend = getRevenueTrend();
  const staff = getStaffRoster();
  const customers = getTopCustomers();
  const alerts = getInventoryAlerts();
  const systemHealth = getSystemHealthMetrics();

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-3 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4rem] text-yellow-300">Operations</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Admin dashboard</h1>
          <p className="text-sm text-white/70">
            Monitor performance, empower staff, and keep the cellar running smoothly with real-time insights.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-right text-xs text-white/60">
          <p>Snapshot generated</p>
          <p className="font-semibold text-white">
            {new Date(snapshot.generatedAt).toLocaleString()}
          </p>
        </div>
      </header>

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric: SalesMetric) => (
          <SalesMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <RevenueTrendPanel trend={trend} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
        <StaffManagementPanel staff={staff} />
        <InventoryAlertsPanel alerts={alerts} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]">
        <CustomerInsightsPanel customers={customers} />
        <SystemHealthPanel metrics={systemHealth} />
      </div>
    </div>
  );
}
