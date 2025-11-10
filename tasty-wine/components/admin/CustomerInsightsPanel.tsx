'use client';

import React from 'react';
import type { CustomerSummary } from '../../lib/types/admin';

interface CustomerInsightsPanelProps {
  customers: CustomerSummary[];
}

export default function CustomerInsightsPanel({ customers }: CustomerInsightsPanelProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow shadow-black/30">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-white/60">Customer insights</p>
        <h2 className="text-lg font-semibold text-white">Top members</h2>
        <p className="text-xs text-white/60">
          Focus retention efforts on your highest-value and high-potential members.
        </p>
      </header>

      <table className="w-full text-sm text-white/80">
        <thead className="text-left text-xs uppercase tracking-wide text-white/50">
          <tr>
            <th scope="col" className="pb-3">Member</th>
            <th scope="col" className="pb-3">Lifetime value</th>
            <th scope="col" className="pb-3">Recent activity</th>
            <th scope="col" className="pb-3 sr-only">Status</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-t border-white/10 text-sm">
              <th scope="row" className="py-3 font-semibold text-white">
                <div>
                  <p>{customer.name}</p>
                  <p className="text-xs text-white/50">{customer.email}</p>
                </div>
              </th>
              <td className="py-3">KES {customer.lifetimeValue.toLocaleString()}</td>
              <td className="py-3">
                {customer.recentPurchaseDate
                  ? new Date(customer.recentPurchaseDate).toLocaleDateString()
                  : 'No purchases recorded'}
              </td>
              <td className="py-3 text-right">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    customer.status === 'vip'
                      ? 'bg-yellow-300/20 text-yellow-200'
                      : customer.status === 'active'
                      ? 'bg-green-400/20 text-green-200'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {customer.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="flex flex-col gap-2 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <p>Track membership journeys to deliver tailored pairing recommendations.</p>
        <button
          type="button"
          className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-yellow-300 hover:text-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
        >
          View CRM report
        </button>
      </footer>
    </section>
  );
}
