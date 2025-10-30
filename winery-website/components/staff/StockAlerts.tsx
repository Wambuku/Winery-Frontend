import React, { useState } from 'react';
import { StockAlert } from '../../types';

interface StockAlertsProps {
  alerts: StockAlert[];
  onRefresh: () => void;
}

export default function StockAlerts({ alerts, onRefresh }: StockAlertsProps) {
  const [thresholdFilter, setThresholdFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'type'>('stock');

  const filteredAlerts = alerts.filter(alert => {
    if (thresholdFilter === 'all') return true;
    return alert.alertType === thresholdFilter;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.wineName.localeCompare(b.wineName);
      case 'stock':
        return a.currentStock - b.currentStock;
      case 'type':
        return a.alertType.localeCompare(b.alertType);
      default:
        return 0;
    }
  });

  const outOfStockCount = alerts.filter(alert => alert.alertType === 'out_of_stock').length;
  const lowStockCount = alerts.filter(alert => alert.alertType === 'low_stock').length;

  const getAlertIcon = (alertType: string) => {
    if (alertType === 'out_of_stock') {
      return (
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      );
    }
  };

  const getAlertColor = (alertType: string) => {
    return alertType === 'out_of_stock' ? 'text-red-600' : 'text-yellow-600';
  };

  const getAlertBgColor = (alertType: string) => {
    return alertType === 'out_of_stock' ? 'bg-red-50' : 'bg-yellow-50';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Stock Alerts</h3>
        <p className="text-gray-600">Monitor wines with low or out-of-stock inventory.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Out of Stock</p>
              <p className="text-2xl font-semibold text-red-600">{outOfStockCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Low Stock</p>
              <p className="text-2xl font-semibold text-yellow-600">{lowStockCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Alerts</p>
              <p className="text-2xl font-semibold text-blue-600">{alerts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex gap-4">
          <select
            value={thresholdFilter}
            onChange={(e) => setThresholdFilter(e.target.value as 'all' | 'low_stock' | 'out_of_stock')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-red"
          >
            <option value="all">All Alerts</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="low_stock">Low Stock</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'stock' | 'type')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-red"
          >
            <option value="stock">Sort by Stock Level</option>
            <option value="name">Sort by Name</option>
            <option value="type">Sort by Alert Type</option>
          </select>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-wine-red text-white rounded-md hover:bg-wine-red-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Alerts List */}
      {sortedAlerts.length > 0 ? (
        <div className="space-y-3">
          {sortedAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 ${
                alert.alertType === 'out_of_stock' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-yellow-500 bg-yellow-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getAlertIcon(alert.alertType)}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {alert.wineName}
                    </h4>
                    <p className={`text-sm ${getAlertColor(alert.alertType)}`}>
                      {alert.alertType === 'out_of_stock' 
                        ? 'Out of stock - Immediate attention required'
                        : `Low stock - Only ${alert.currentStock} remaining`
                      }
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-semibold ${getAlertColor(alert.alertType)}`}>
                    {alert.currentStock}
                  </div>
                  <div className="text-xs text-gray-500">
                    Threshold: {alert.threshold}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Alert created: {alert.createdAt.toLocaleDateString()}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Navigate to wine edit - in a real app, this would use router
                      console.log('Edit wine:', alert.wineId);
                    }}
                    className="text-xs text-wine-red hover:text-wine-red-dark font-medium"
                  >
                    Update Stock
                  </button>
                  <button
                    onClick={() => {
                      // View wine details - in a real app, this would use router
                      console.log('View wine:', alert.wineId);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">All Good!</h3>
          <p className="text-gray-500">
            {thresholdFilter === 'all' 
              ? 'No stock alerts at this time. All wines are adequately stocked.'
              : `No ${thresholdFilter.replace('_', ' ')} alerts found.`
            }
          </p>
        </div>
      )}

      {/* Quick Actions */}
      {alerts.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                // Navigate to bulk stock management
                console.log('Navigate to bulk stock management');
              }}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Bulk Update Stock
            </button>
            <button
              onClick={() => {
                // Export alerts to CSV
                console.log('Export alerts');
              }}
              className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
            >
              Export Alerts
            </button>
            <button
              onClick={() => {
                // Set up automated reorder
                console.log('Set up reorder');
              }}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
            >
              Set Reorder Points
            </button>
          </div>
        </div>
      )}
    </div>
  );
}