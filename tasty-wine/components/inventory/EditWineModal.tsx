'use client';

import React, { useState } from 'react';
import { updateWine } from '../../lib/api/wines';
import { updateStock } from '../../lib/api/inventory';
import { useAuth } from '../../context/AuthContext';
import type { WineInventory } from '../../lib/types/inventory';

interface EditWineModalProps {
  wine: WineInventory;
  onClose: () => void;
  onComplete: () => void;
}

export default function EditWineModal({ wine, onClose, onComplete }: EditWineModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: wine.wineName,
    type: wine.type,
    category: wine.category,
    region: wine.region,
    country: wine.country,
    vintage: wine.vintage,
    price: wine.unitPrice,
    costPrice: wine.costPrice,
    reorderLevel: wine.reorderLevel,
    reorderQuantity: wine.reorderQuantity,
    imageUrl: wine.imageUrl || '',
  });
  const [stockAdjustment, setStockAdjustment] = useState({
    type: 'restock' as 'restock' | 'correction',
    quantity: 0,
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateWine(
        wine.wineId,
        {
          name: formData.name,
          type: formData.type,
          category: formData.category,
          region: formData.region,
          country: formData.country,
          vintage: formData.vintage,
          price: formData.price,
          imageUrl: formData.imageUrl,
          costPrice: formData.costPrice,
          reorderLevel: formData.reorderLevel,
          reorderQuantity: formData.reorderQuantity,
        },
        { token: user?.accessToken || '' }
      );

      // Apply stock adjustment if quantity changed
      if (stockAdjustment.quantity !== 0) {
        await updateStock(
          wine.wineId,
          {
            wineId: wine.wineId,
            adjustmentType: stockAdjustment.type,
            quantity: stockAdjustment.quantity,
            reason: stockAdjustment.reason,
            performedBy: user?.id || 'unknown',
          },
          { token: user?.accessToken || '' }
        );
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update wine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Edit Wine</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <h3 className="mb-3 font-semibold text-white">Current Stock</h3>
            <div className="text-3xl font-bold text-blue-400">{wine.currentStock} bottles</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300">Wine Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option>Red</option>
                <option>White</option>
                <option>Rosé</option>
                <option>Sparkling</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option>Reserve</option>
                <option>Signature</option>
                <option>Collector</option>
                <option>Estate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Region</label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Price (KES)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Cost Price (KES)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Reorder Level</label>
              <input
                type="number"
                min="0"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Reorder Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.reorderQuantity}
                onChange={(e) => setFormData({ ...formData, reorderQuantity: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300">Image URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
            <h3 className="mb-3 font-semibold text-blue-400">Stock Adjustment (Optional)</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-slate-300">Type</label>
                <select
                  value={stockAdjustment.type}
                  onChange={(e) =>
                    setStockAdjustment({
                      ...stockAdjustment,
                      type: e.target.value as 'restock' | 'correction',
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="restock">Restock</option>
                  <option value="correction">Correction</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Quantity (+ or -)
                </label>
                <input
                  type="number"
                  value={stockAdjustment.quantity}
                  onChange={(e) =>
                    setStockAdjustment({
                      ...stockAdjustment,
                      quantity: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Reason</label>
                <input
                  type="text"
                  value={stockAdjustment.reason}
                  onChange={(e) =>
                    setStockAdjustment({ ...stockAdjustment, reason: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            {stockAdjustment.quantity !== 0 && (
              <div className="mt-3 text-sm text-blue-400">
                New stock will be: {wine.currentStock + stockAdjustment.quantity} bottles
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-700 px-4 py-3 font-semibold text-slate-400 transition-colors hover:bg-slate-700/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Wine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
