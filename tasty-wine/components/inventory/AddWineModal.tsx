'use client';

import React, { useState } from 'react';
import { createWine } from '../../lib/api/wines';
import { useAuth } from '../../context/AuthContext';

interface AddWineModalProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function AddWineModal({ onClose, onComplete }: AddWineModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Red',
    category: 'Signature',
    region: '',
    country: '',
    vintage: new Date().getFullYear(),
    price: 0,
    costPrice: 0,
    stock: 0,
    reorderLevel: 10,
    reorderQuantity: 50,
    imageUrl: '',
    sku: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createWine(
        {
          name: formData.name,
          description: formData.description,
          type: formData.type,
          region: formData.region,
          country: formData.country,
          vintage: formData.vintage,
          price: formData.price,
          category: formData.category,
          stock: formData.stock,
          sku: formData.sku || `WINE-${Date.now()}`,
          imageUrl: formData.imageUrl,
          reorderLevel: formData.reorderLevel,
          reorderQuantity: formData.reorderQuantity,
          costPrice: formData.costPrice,
        },
        { token: user?.accessToken || '' }
      );

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add wine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Add New Wine</h2>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300">Wine Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option>Red</option>
                <option>White</option>
                <option>Rosé</option>
                <option>Sparkling</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option>Reserve</option>
                <option>Signature</option>
                <option>Collector</option>
                <option>Estate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Region *</label>
              <input
                type="text"
                required
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Country *</label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Vintage</label>
              <input
                type="number"
                value={formData.vintage}
                onChange={(e) => setFormData({ ...formData, vintage: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Auto-generated if empty"
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Price (KES) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Initial Stock *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Reorder Level *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Reorder Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.reorderQuantity}
                onChange={(e) => setFormData({ ...formData, reorderQuantity: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300">Image URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
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
              {loading ? 'Adding...' : 'Add Wine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
