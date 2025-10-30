// Staff-only page - demonstrates role-based access control

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StaffOnly } from '../components/auth/ProtectedRoute';
import { StaffDashboard, POSSystem, SalesReports } from '../components/staff';

type StaffView = 'dashboard' | 'pos' | 'reports' | 'inventory' | 'orders';

function StaffContent() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<StaffView>('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <StaffDashboard />;
      case 'pos':
        return <POSSystem />;
      case 'reports':
        return <SalesReports />;
      case 'inventory':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Inventory Management</h2>
              <p className="text-gray-600">This feature will be implemented in a future task.</p>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="mt-4 bg-wine-red text-white px-4 py-2 rounded-md hover:bg-wine-red-dark transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Management</h2>
              <p className="text-gray-600">Order management features are available in the existing order components.</p>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="mt-4 bg-wine-red text-white px-4 py-2 rounded-md hover:bg-wine-red-dark transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      default:
        return <StaffDashboard />;
    }
  };

  if (currentView !== 'dashboard') {
    return (
      <div>
        {/* Navigation Bar */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="text-wine-red hover:text-wine-red-dark font-medium"
                >
                  ← Back to Dashboard
                </button>
                <span className="text-gray-500">|</span>
                <span className="font-medium text-gray-900">
                  {currentView === 'pos' && 'Point of Sale'}
                  {currentView === 'reports' && 'Sales Reports'}
                  {currentView === 'inventory' && 'Inventory Management'}
                  {currentView === 'orders' && 'Order Management'}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                <button
                  onClick={logout}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>
        {renderCurrentView()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Staff Dashboard
              </h1>
              
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h2 className="text-lg font-medium text-green-900 mb-2">
                    Welcome, {user?.name}!
                  </h2>
                  <p className="text-green-800">
                    You have {user?.role} access to the wine management system.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-blue-900 mb-3">
                    Inventory Management
                  </h3>
                  <ul className="text-blue-800 space-y-2">
                    <li>• Add new wines to catalog</li>
                    <li>• Update wine information</li>
                    <li>• Manage stock levels</li>
                    <li>• Set pricing and promotions</li>
                  </ul>
                  <button 
                    onClick={() => setCurrentView('inventory')}
                    className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Manage Inventory
                  </button>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-green-900 mb-3">
                    Point of Sale
                  </h3>
                  <ul className="text-green-800 space-y-2">
                    <li>• Process in-store sales</li>
                    <li>• Accept cash payments</li>
                    <li>• Handle M-Pesa transactions</li>
                    <li>• Print receipts</li>
                  </ul>
                  <button 
                    onClick={() => setCurrentView('pos')}
                    className="mt-3 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Open POS
                  </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-yellow-900 mb-3">
                    Sales Reports
                  </h3>
                  <ul className="text-yellow-800 space-y-2">
                    <li>• Daily sales summary</li>
                    <li>• Popular wine analytics</li>
                    <li>• Payment method breakdown</li>
                    <li>• Customer insights</li>
                  </ul>
                  <button 
                    onClick={() => setCurrentView('reports')}
                    className="mt-3 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                  >
                    View Reports
                  </button>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-purple-900 mb-3">
                    Order Management
                  </h3>
                  <ul className="text-purple-800 space-y-2">
                    <li>• View pending orders</li>
                    <li>• Update order status</li>
                    <li>• Process refunds</li>
                    <li>• Customer communication</li>
                  </ul>
                  <button 
                    onClick={() => setCurrentView('orders')}
                    className="mt-3 bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                  >
                    Manage Orders
                  </button>
                </div>
              </div>

              {user?.role === 'admin' && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-red-900 mb-3">
                    Admin Functions
                  </h3>
                  <div className="flex space-x-3">
                    <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                      Manage Staff
                    </button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                      System Settings
                    </button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                      User Management
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 flex space-x-4">
                <button
                  onClick={logout}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Sign Out
                </button>
                <a
                  href="/dashboard"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  User Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffPage() {
  return (
    <StaffOnly>
      <StaffContent />
    </StaffOnly>
  );
}