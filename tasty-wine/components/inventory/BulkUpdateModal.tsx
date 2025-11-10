'use client';

import React, { useState, useEffect } from 'react';
import { fetchInventory, bulkUpdateStock } from '../../lib/api/inventory';
import { useAuth } from '../../context/AuthContext';
import type { WineInventory, BulkStockUpdate } from '../../lib/types/inventory';

interface BulkUpdateModalProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function BulkUpdateModal({ onClose, onComplete }: BulkUpdateModalProps) {
  const { user } = useAuth();
  const [wines, setWines] = useState<WineInventory[]>([]);
  const [updates, setUpdates] = useState<Map<string, BulkStockUpdate>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWines();
  }, []);

  const loadWines = async () => {
    try {
      const data = await fetchInventory({}, { token: user?.accessToken });
      setWines(data.data);
    } catch (err) {
      setError('Failed to load wines');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChange = (wineId: string, field: keyof BulkStockUpdate, value: any) => {
    const current = updates.get(wineId) || {
      wineId,
      quantity: 0,
      adjustmentType: 'restock',
    };
    
    setUpdates(new Map(updates.set(wineId, { ...current, [field]: value })));
  };

  const handleSubmit = async () => {
    const updatesList = Array.from(updates.values()).filter((u) => u.quantity !== 0);
    
    if (updatesList.length === 0) {
      setError('No updates to apply');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await bulkUpdateStock(updatesList, { token: user?.accessToken || '' });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Bulk Stock Update</h2>
            <p className="mt-1 text-sm text-slate-400">
              Update multiple wine stock levels at once
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading wines...</div>
        ) : (
          <>
            <div className="mb-6 max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-800">
                  <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                    <th className="pb-3">Wine</th>
                    <th className="pb-3 text-center">Current</th>
                    <th className="pb-3 text-center">Type</th>
                    <th className="pb-3 text-center">Quantity</th>
                    <th className="pb-3">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {wines.map((wine) => {
                    const update = updates.get(wine.wineId);
                    return (
                      <tr key={wine.id} className="border-b border-slate-800">
                        <td className="py-3">
                          <div className="font-medium text-white">{wine.wineName}</div>
                          <div className="text-xs text-slate-400">{wine.sku}</div>
                        </td>
                        <td className="py-3 text-center text-white">{wine.currentStock}</td>
                        <td className="py-3">
                          <select
                            value={update?.adjustmentType || 'restock'}
                            onChange={(e) =>
                              handleUpdateChange(wine.wineId, 'adjustmentType', e.target.value)
                            }
                            className="w-full rounded border border-slate-600 bg-slate-700/50 px-2 py-1 text-sm text-white"
                          >
                            <option value="restock">Restock</option>
                            <option value="correction">Correction</option>
                          </select>
                        </td>
                        <td className="py-3">
                          <input
                            type="number"
                            value={update?.quantity || 0}
                            onChange={(e) =>
                              handleUpdateChange(wine.wineId, 'quantity', parseInt(e.target.value) || 0)
                            }
                            className="w-20 rounded border border-slate-600 bg-slate-700/50 px-2 py-1 text-center text-sm text-white"
                          />
                        </td>
                        <td className="py-3">
                          <input
                            type="text"
                            value={update?.reason || ''}
                            onChange={(e) =>
                              handleUpdateChange(wine.wineId, 'reason', e.target.value)
                            }
                            placeholder="Optional"
                            className="w-full rounded border border-slate-600 bg-slate-700/50 px-2 py-1 text-sm text-white"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              <div className="text-sm text-blue-400">
                {Array.from(updates.values()).filter((u) => u.quantity !== 0).length} wines will be
                updated
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-slate-700 px-4 py-3 font-semibold text-slate-400 transition-colors hover:bg-slate-700/50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Apply Updates'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
