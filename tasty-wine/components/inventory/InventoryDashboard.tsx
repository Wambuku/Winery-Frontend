'use client';

import React, { useState, useEffect } from 'react';
import { fetchInventory } from '../../lib/api/inventory';
import { useAuth } from '../../context/AuthContext';
import type { WineInventory, StockAlert, InventoryFilters } from '../../lib/types/inventory';
import InventoryTable from './InventoryTable';
import StockAlerts from './StockAlerts';
import AddWineModal from './AddWineModal';
import EditWineModal from './EditWineModal';
import BulkUpdateModal from './BulkUpdateModal';

export default function InventoryDashboard() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<WineInventory[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [loading, setLoading] = useState(true);
  const [selectedWine, setSelectedWine] = useState<WineInventory | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    loadInventory();
  }, [filters]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const inventoryResponse = await fetchInventory(filters, { token: user?.accessToken });
      setInventory(inventoryResponse.data);
      setAlerts(inventoryResponse.alerts);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (wine: WineInventory) => {
    setSelectedWine(wine);
    setShowEditModal(true);
  };

  const handleUpdateComplete = () => {
    loadInventory();
    setShowAddModal(false);
    setShowEditModal(false);
    setShowBulkModal(false);
    setSelectedWine(null);
  };

  const lowStockCount = alerts.filter((a) => a.severity === 'critical').length;
  const totalValue = inventory.reduce((sum, item) => sum + item.currentStock * item.unitPrice, 0);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Wine Inventory Management</h1>
              <p className="mt-1 text-sm text-slate-400">
                Track stock levels, manage wine catalog, and receive low stock alerts
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <button
                onClick={() => setShowBulkModal(true)}
                className="rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                Bulk Update
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                + Add Wine
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <div className="text-sm text-slate-400">Total Items</div>
              <div className="mt-1 text-2xl font-bold text-white">{inventory.length}</div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <div className="text-sm text-slate-400">Inventory Value</div>
              <div className="mt-1 text-2xl font-bold text-green-400">
                KES {totalValue.toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <div className="text-sm text-slate-400">Low Stock Alerts</div>
              <div className="mt-1 text-2xl font-bold text-red-400">{lowStockCount}</div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <div className="text-sm text-slate-400">Total Stock</div>
              <div className="mt-1 text-2xl font-bold text-blue-400">
                {inventory.reduce((sum, item) => sum + item.currentStock, 0)} bottles
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Alerts */}
          {alerts.length > 0 && <StockAlerts alerts={alerts} onRefresh={loadInventory} />}

          {/* Inventory Table */}
          <InventoryTable
            inventory={inventory}
            filters={filters}
            loading={loading}
            onFilterChange={setFilters}
            onEdit={handleEdit}
            onRefresh={loadInventory}
          />
        </div>
      </main>

      {showAddModal && (
        <AddWineModal onClose={() => setShowAddModal(false)} onComplete={handleUpdateComplete} />
      )}

      {showEditModal && selectedWine && (
        <EditWineModal
          wine={selectedWine}
          onClose={() => {
            setShowEditModal(false);
            setSelectedWine(null);
          }}
          onComplete={handleUpdateComplete}
        />
      )}

      {showBulkModal && (
        <BulkUpdateModal onClose={() => setShowBulkModal(false)} onComplete={handleUpdateComplete} />
      )}
    </div>
  );
}
