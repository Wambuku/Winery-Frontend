'use client';

import React, { useState, useEffect } from 'react';
import { getSalesReport, getTransactions } from '../../lib/api/pos';
import { useAuth } from '../../context/AuthContext';
import type { SalesReport, POSTransaction } from '../../lib/types/pos';

export default function SalesReporting() {
  const { user } = useAuth();
  const [report, setReport] = useState<SalesReport | null>(null);
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadReport();
  }, [dateRange, startDate, endDate]);

  const getDateRange = () => {
    const now = new Date();
    let start: Date;
    let end = now;

    switch (dateRange) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        start = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        start = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'custom':
        if (!startDate || !endDate) return null;
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        start = new Date(now.setHours(0, 0, 0, 0));
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  const loadReport = async () => {
    const range = getDateRange();
    if (!range) return;

    try {
      setLoading(true);
      const [reportData, transactionData] = await Promise.all([
        getSalesReport(range.startDate, range.endDate, { token: user?.accessToken }),
        getTransactions(
          { startDate: range.startDate, endDate: range.endDate },
          { token: user?.accessToken }
        ),
      ]);

      setReport(reportData);
      setTransactions(transactionData.data);
    } catch (error) {
      console.error('Failed to load sales report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400">Loading report...</div>;
  }

  if (!report) {
    return <div className="py-12 text-center text-slate-400">No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Report Period</h3>
        <div className="flex flex-wrap gap-3">
          {(['today', 'week', 'month', 'custom'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-700 text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {dateRange === 'custom' && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-400">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent p-6">
          <div className="text-sm text-slate-400">Total Revenue</div>
          <div className="mt-2 text-3xl font-bold text-green-400">
            KES {report.summary.totalRevenue.toLocaleString()}
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent p-6">
          <div className="text-sm text-slate-400">Transactions</div>
          <div className="mt-2 text-3xl font-bold text-blue-400">
            {report.summary.totalTransactions}
          </div>
        </div>

        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent p-6">
          <div className="text-sm text-slate-400">Items Sold</div>
          <div className="mt-2 text-3xl font-bold text-purple-400">
            {report.summary.totalItems}
          </div>
        </div>

        <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent p-6">
          <div className="text-sm text-slate-400">Avg Transaction</div>
          <div className="mt-2 text-3xl font-bold text-yellow-400">
            KES {report.summary.averageTransaction.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Top Wines */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Top Selling Wines</h3>
        <div className="space-y-3">
          {report.topWines.slice(0, 5).map((wine, index) => (
            <div key={wine.wineId} className="flex items-center gap-4 rounded-lg bg-slate-900/50 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{wine.wineName}</div>
                <div className="text-sm text-slate-400">{wine.quantitySold} bottles sold</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">
                  KES {wine.revenue.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Payment Methods</h3>
          <div className="space-y-3">
            {report.paymentMethods.map((method) => (
              <div key={method.method} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white capitalize">{method.method}</div>
                  <div className="text-sm text-slate-400">{method.count} transactions</div>
                </div>
                <div className="text-lg font-bold text-blue-400">
                  KES {method.total.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Staff Performance</h3>
          <div className="space-y-3">
            {report.staffPerformance.map((staff) => (
              <div key={staff.staffId} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{staff.staffName}</div>
                  <div className="text-sm text-slate-400">{staff.transactions} transactions</div>
                </div>
                <div className="text-lg font-bold text-green-400">
                  KES {staff.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                <th className="pb-3">Transaction</th>
                <th className="pb-3">Staff</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3 text-right">Total</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {transactions.slice(0, 10).map((transaction) => (
                <tr key={transaction.id} className="border-b border-slate-800">
                  <td className="py-3 text-white">{transaction.transactionNumber}</td>
                  <td className="py-3 text-slate-400">{transaction.staffName}</td>
                  <td className="py-3 text-slate-400">{transaction.items.length}</td>
                  <td className="py-3 text-slate-400 capitalize">{transaction.paymentMethod}</td>
                  <td className="py-3 text-right font-medium text-white">
                    KES {transaction.total.toLocaleString()}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        transaction.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : transaction.status === 'cancelled'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
