import React, { useState, useEffect } from 'react';
import { Wine, BulkStockUpdate } from '../../types';

interface BulkStockManagerProps {
  wines: Wine[];
  onUpdate: (updates: BulkStockUpdate[]) => void;
}

export default function BulkStockManager({ wines, onUpdate }: BulkStockManagerProps) {
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});
  const [selectedWines, setSelectedWines] = useState<Set<string>>(new Set());
  const [bulkValue, setBulkValue] = useState<number>(0);
  const [bulkOperation, setBulkOperation] = useState<'set' | 'add' | 'subtract'>('set');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize stock updates with current values
  useEffect(() => {
    const initialUpdates: Record<string, number> = {};
    wines.forEach(wine => {
      initialUpdates[wine.id] = wine.stockQuantity;
    });
    setStockUpdates(initialUpdates);
  }, [wines]);

  const filteredWines = wines.filter(wine =>
    wine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wine.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wine.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockChange = (wineId: string, newStock: number) => {
    setStockUpdates(prev => ({
      ...prev,
      [wineId]: Math.max(0, newStock)
    }));
  };

  const handleWineSelection = (wineId: string, selected: boolean) => {
    const newSelected = new Set(selectedWines);
    if (selected) {
      newSelected.add(wineId);
    } else {
      newSelected.delete(wineId);
    }
    setSelectedWines(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedWines(new Set(filteredWines.map(wine => wine.id)));
    } else {
      setSelectedWines(new Set());
    }
  };

  const applyBulkOperation = () => {
    const newUpdates = { ...stockUpdates };
    
    selectedWines.forEach(wineId => {
      const currentStock = stockUpdates[wineId] || 0;
      let newStock = currentStock;
      
      switch (bulkOperation) {
        case 'set':
          newStock = bulkValue;
          break;
        case 'add':
          newStock = currentStock + bulkValue;
          break;
        case 'subtract':
          newStock = currentStock - bulkValue;
          break;
      }
      
      newUpdates[wineId] = Math.max(0, newStock);
    });
    
    setStockUpdates(newUpdates);
  };

  const handleSaveChanges = async () => {
    const updates: BulkStockUpdate[] = [];
    
    wines.forEach(wine => {
      const newStock = stockUpdates[wine.id];
      if (newStock !== undefined && newStock !== wine.stockQuantity) {
        updates.push({
          id: wine.id,
          stockQuantity: newStock
        });
      }
    });

    if (updates.length === 0) {
      alert('No changes to save');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(updates);
      alert(`Successfully updated stock for ${updates.length} wines`);
    } catch (error) {
      console.error('Failed to update stock:', error);
      alert('Failed to update stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = wines.some(wine => 
    stockUpdates[wine.id] !== undefined && stockUpdates[wine.id] !== wine.stockQuantity
  );

  const changedCount = wines.filter(wine => 
    stockUpdates[wine.id] !== undefined && stockUpdates[wine.id] !== wine.stockQuantity
  ).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Bulk Stock Management</h3>
        <p className="text-gray-600">Update stock quantities for multiple wines at once.</p>
      </div>

      {/* Bulk Operations */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Bulk Operations</h4>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selected Wines: {selectedWines.size}
            </label>
            <p className="text-sm text-gray-500">
              Select wines below to apply bulk operations
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
            <select
              value={bulkOperation}
              onChange={(e) => setBulkOperation(e.target.value as 'set' | 'add' | 'subtract')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-red"
            >
              <option value="set">Set to</option>
              <option value="add">Add</option>
              <option value="subtract">Subtract</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <input
              type="number"
              min="0"
              value={bulkValue}
              onChange={(e) => setBulkValue(parseInt(e.target.value) || 0)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-red w-24"
            />
          </div>
          
          <button
            onClick={applyBulkOperation}
            disabled={selectedWines.size === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Search wines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-red flex-1 max-w-md"
        />
        
        <div className="flex gap-2">
          {hasChanges && (
            <span className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm">
              {changedCount} changes pending
            </span>
          )}
          
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges || loading}
            className="px-4 py-2 bg-wine-red text-white rounded-md hover:bg-wine-red-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Wine Stock Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedWines.size === filteredWines.length && filteredWines.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-wine-red focus:ring-wine-red"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                New Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredWines.map((wine) => {
              const currentStock = wine.stockQuantity;
              const newStock = stockUpdates[wine.id] ?? currentStock;
              const change = newStock - currentStock;
              const hasChanged = change !== 0;

              return (
                <tr key={wine.id} className={`hover:bg-gray-50 ${hasChanged ? 'bg-yellow-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedWines.has(wine.id)}
                      onChange={(e) => handleWineSelection(wine.id, e.target.checked)}
                      className="rounded border-gray-300 text-wine-red focus:ring-wine-red"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-md object-cover"
                        src={wine.image}
                        alt={wine.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/wine-placeholder.jpg';
                        }}
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {wine.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {wine.region}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {wine.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      currentStock === 0 ? 'text-red-600' :
                      currentStock <= 10 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {currentStock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      value={newStock}
                      onChange={(e) => handleStockChange(wine.id, parseInt(e.target.value) || 0)}
                      className={`w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-wine-red ${
                        hasChanged ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'
                      }`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {hasChanged && (
                      <span className={`text-sm font-medium ${
                        change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {change > 0 ? '+' : ''}{change}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredWines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No wines found matching your search.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      {hasChanges && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-md font-medium text-blue-900 mb-2">Summary of Changes</h4>
          <p className="text-blue-700">
            {changedCount} wine{changedCount !== 1 ? 's' : ''} will be updated when you save changes.
          </p>
        </div>
      )}
    </div>
  );
}