import Image from 'next/image';
import React from 'react';
import type { InventoryFilters, WineInventory } from '../../lib/types/inventory';

interface InventoryTableProps {
  inventory: WineInventory[];
  filters: InventoryFilters;
  loading: boolean;
  onFilterChange: (filters: InventoryFilters) => void;
  onEdit: (wine: WineInventory) => void;
  onRefresh: () => void;
}

export default function InventoryTable({
  inventory,
  filters,
  loading,
  onFilterChange,
  onEdit,
}: InventoryTableProps) {
  const getStockStatus = (item: WineInventory) => {
    if (item.currentStock === 0) return { label: 'Out', color: 'text-red-400 bg-red-500/10' };
    if (item.currentStock <= item.reorderLevel)
      return { label: 'Low', color: 'text-yellow-400 bg-yellow-500/10' };
    return { label: 'OK', color: 'text-green-400 bg-green-500/10' };
  };

  const renderStatusPill = (item: WineInventory) => {
    const status = getStockStatus(item);
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
        {status.label}
      </span>
    );
  };

  const renderCard = (item: WineInventory) => (
    <article
      key={item.id}
      className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900/50 p-4 shadow-sm"
    >
      <div className="flex items-start gap-4">
        {item.imageUrl ? (
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
            <Image src={item.imageUrl} alt={item.wineName} fill className="object-cover" sizes="64px" />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-800 text-xs uppercase tracking-wide text-slate-300">
            {item.wineName.slice(0, 2)}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white">{item.wineName}</h3>
          <p className="text-xs text-slate-400">
            {item.region}, {item.country}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="rounded-full bg-slate-800 px-2 py-1">{item.type}</span>
            <span className="rounded-full bg-slate-800 px-2 py-1">{item.category}</span>
            {renderStatusPill(item)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">SKU</p>
          <p className="font-semibold text-white">{item.sku}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">Price</p>
          <p className="font-semibold text-white">KES {item.unitPrice.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Stock</p>
          <p className="font-semibold text-white">{item.currentStock} bottles</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">Reorder</p>
          <p className="font-semibold text-white">{item.reorderLevel}</p>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="rounded-lg border border-blue-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-300 transition hover:border-blue-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
        >
          Edit wine
        </button>
      </div>
    </article>
  );

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 sm:p-6">
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          placeholder="Search wines..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />

        <select
          value={filters.category || ''}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value || undefined })}
          className="rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="">All Categories</option>
          <option value="Reserve">Reserve</option>
          <option value="Signature">Signature</option>
          <option value="Collector">Collector</option>
          <option value="Estate">Estate</option>
        </select>

        <select
          value={filters.type || ''}
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value || undefined })}
          className="rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="">All Types</option>
          <option value="Red">Red</option>
          <option value="White">White</option>
          <option value="Rosé">Rosé</option>
          <option value="Sparkling">Sparkling</option>
        </select>

        <select
          value={filters.stockLevel || 'all'}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              stockLevel: e.target.value as InventoryFilters['stockLevel'],
            })
          }
          className="rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Stock Levels</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
          <option value="sufficient">Sufficient</option>
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading inventory...</div>
      ) : inventory.length === 0 ? (
        <div className="py-12 text-center text-slate-400">No wines found</div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                  <th className="pb-3">Wine</th>
                  <th className="pb-3">SKU</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-right">Stock</th>
                  <th className="pb-3 text-right">Reorder</th>
                  <th className="pb-3 text-right">Price</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b border-slate-800 text-sm">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                            <Image
                              src={item.imageUrl}
                              alt={item.wineName}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 text-xs uppercase tracking-wide text-slate-300">
                            {item.wineName.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-white">{item.wineName}</div>
                          <div className="text-xs text-slate-400">
                            {item.region}, {item.country}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-slate-400">{item.sku}</td>
                    <td className="py-4 text-slate-400">{item.type}</td>
                    <td className="py-4 text-slate-400">{item.category}</td>
                    <td className="py-4 text-right font-medium text-white">{item.currentStock}</td>
                    <td className="py-4 text-right text-slate-400">{item.reorderLevel}</td>
                    <td className="py-4 text-right font-medium text-white">
                      KES {item.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-4">{renderStatusPill(item)}</td>
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="rounded-lg border border-blue-400/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-300 transition hover:border-blue-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {inventory.map((item) => renderCard(item))}
          </div>
        </>
      )}
    </div>
  );
}
