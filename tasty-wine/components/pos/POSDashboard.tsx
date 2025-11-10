'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import SalesInterface from './SalesInterface';
import SalesReporting from './SalesReporting';
import { getDailySummary } from '../../lib/api/pos';
import type { DailySummary } from '../../lib/types/pos';

export default function POSDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'sales' | 'reports'>('sales');
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailySummary();
  }, []);

  const loadDailySummary = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const summary = await getDailySummary(today);
      setDailySummary(summary);
    } catch (error) {
      console.error('Failed to load daily summary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">Winery POS</h1>
                <p className="text-sm text-slate-400">Process sales and monitor daily performance on the go</p>
              </div>
              <div className="h-px w-full bg-slate-700 sm:h-6 sm:w-px" />
              {user && (
                <div className="text-sm text-slate-400">
                  <span className="font-medium text-white">{user.name}</span>
                  {user.roles && user.roles.length > 0 && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{user.roles.join(' • ')}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              {!loading && dailySummary && (
                <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm md:block md:text-right">
                  <div className="text-xs uppercase tracking-wide text-slate-400 md:text-xs">
                    Today&apos;s Revenue
                  </div>
                  <div className="text-base font-bold text-green-400 md:text-lg">
                    KES {dailySummary.totalRevenue.toLocaleString()}
                  </div>
                </div>
              )}
              <button
                onClick={logout}
                className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('sales')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'sales'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              Reports
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === 'sales' && <SalesInterface onSaleComplete={loadDailySummary} />}
        {activeTab === 'reports' && <SalesReporting />}
      </main>
    </div>
  );
}
