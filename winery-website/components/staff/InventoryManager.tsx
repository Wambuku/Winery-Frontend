import React, { useState, useEffect } from 'react';
import { Wine, CategoryData, BulkStockUpdate, StockAlert } from '../../types';
import WineForm from './WineForm';
import BulkStockManager from './BulkStockManager';
import CategoryManager from './CategoryManager';
import StockAlerts from './StockAlerts';

interface InventoryManagerProps {
  onClose?: () => void;
}

type TabType = 'wines' | 'categories' | 'stock' | 'alerts';

export default function InventoryManager({ onClose }: InventoryManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('wines');
  const [wines, setWines] = useState<Wine[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [showWineForm, setShowWineForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchWines(),
        fetchCategories(),
        fetchStockAlerts(),
      ]);
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWines = async () => {
    try {
      const response = await fetch('/api/wines?limit=100');
      if (response.ok) {
        const data = await response.json();
        setWines(data.data.wines || []);
      }
    } catch (error) {
      console.error('Failed to fetch wines:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/wines/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchStockAlerts = async () => {
    try {
      const response = await fetch('/api/wines/low-stock?threshold=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const alerts: StockAlert[] = data.data.map((wine: Wine) => ({
          id: `alert-${wine.id}`,
          wineId: wine.id,
          wineName: wine.name,
          currentStock: wine.stockQuantity,
          threshold: 10,
          alertType: wine.stockQuantity === 0 ? 'out_of_stock' : 'low_stock',
          createdAt: new Date(),
        }));
        setStockAlerts(alerts);
      }
    } catch (error) {
      console.error('Failed to fetch stock alerts:', error);
    }
  };

  const handleWineUpdate = (updatedWine: Wine) => {
    setWines(prev => prev.map(wine => 
      wine.id === updatedWine.id ? updatedWine : wine
    ));
    setSelectedWine(null);
    setShowWineForm(false);
  };

  const handleWineCreate = (newWine: Wine) => {
    setWines(prev => [...prev, newWine]);
    setShowWineForm(false);
  };

  const handleWineDelete = async (wineId: string) => {
    if (!confirm('Are you sure you want to delete this wine?')) return;

    try {
      const response = await fetch(`/api/wines/manage?id=${wineId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setWines(prev => prev.filter(wine => wine.id !== wineId));
      }
    } catch (error) {
      console.error('Failed to delete wine:', error);
    }
  };

  const handleBulkStockUpdate = async (updates: BulkStockUpdate[]) => {
    try {
      const response = await fetch('/api/wines/bulk-stock', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ updates }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedWines = data.data;
        
        setWines(prev => prev.map(wine => {
          const updated = updatedWines.find((uw: Wine) => uw.id === wine.id);
          return updated || wine;
        }));
        
        // Refresh stock alerts
        await fetchStockAlerts();
      }
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  const tabs = [
    { id: 'wines', label: 'Wine Inventory', count: wines.length },
    { id: 'categories', label: 'Categories', count: categories.length },
    { id: 'stock', label: 'Bulk Stock', count: wines.length },
    { id: 'alerts', label: 'Stock Alerts', count: stockAlerts.length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-wine-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Inventory Management
                </h1>
                <p className="text-gray-600">Manage wines, categories, and stock levels</p>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="px-6">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-wine-red text-wine-red'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white shadow rounded-lg">
            {activeTab === 'wines' && (
              <WineInventoryTab
                wines={wines}
                categories={categories}
                onEdit={(wine) => {
                  setSelectedWine(wine);
                  setShowWineForm(true);
                }}
                onDelete={handleWineDelete}
                onAdd={() => {
                  setSelectedWine(null);
                  setShowWineForm(true);
                }}
              />
            )}

            {activeTab === 'categories' && (
              <CategoryManager
                categories={categories}
                onUpdate={fetchCategories}
              />
            )}

            {activeTab === 'stock' && (
              <BulkStockManager
                wines={wines}
                onUpdate={handleBulkStockUpdate}
              />
            )}

            {activeTab === 'alerts' && (
              <StockAlerts
                alerts={stockAlerts}
                onRefresh={fetchStockAlerts}
              />
            )}
          </div>
        </div>
      </div>

      {/* Wine Form Modal */}
      {showWineForm && (
        <WineForm
          wine={selectedWine}
          categories={categories}
          onSave={selectedWine ? handleWineUpdate : handleWineCreate}
          onCancel={() => {
            setShowWineForm(false);
            setSelectedWine(null);
          }}
        />
      )}
    </div>
  );
}

// Wine Inventory Tab Component
interface WineInventoryTabProps {
  wines: Wine[];
  categories: CategoryData[];
  onEdit: (wine: Wine) => void;
  onDelete: (wineId: string) => void;
  onAdd: () => void;
}

function WineInventoryTab({ wines, categories, onEdit, onDelete, onAdd }: WineInventoryTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  const filteredWines = wines.filter(wine => {
    const matchesSearch = wine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wine.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || wine.category === selectedCategory;
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'in_stock' && wine.inStock) ||
                        (stockFilter === 'low_stock' && wine.stockQuantity <= 10) ||
                        (stockFilter === 'out_of_stock' && !wine.inStock);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="p-6">
      {/* Filters and Add Button */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <input
            type="text"
            placeholder="Search wines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-red"
          />
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-red"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-red"
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock (≤10)</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        <button
          onClick={onAdd}
          className="bg-wine-red text-white px-4 py-2 rounded-md hover:bg-wine-red-dark transition-colors"
        >
          Add Wine
        </button>
      </div>

      {/* Wine Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredWines.map((wine) => (
              <tr key={wine.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded-md object-cover"
                      src={wine.image}
                      alt={wine.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/wine-placeholder.jpg';
                      }}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {wine.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {wine.region} • {wine.vintage}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {wine.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  KSh {wine.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`font-medium ${
                    wine.stockQuantity === 0 ? 'text-red-600' :
                    wine.stockQuantity <= 10 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {wine.stockQuantity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    wine.inStock
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {wine.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(wine)}
                    className="text-wine-red hover:text-wine-red-dark mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(wine.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredWines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No wines found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}