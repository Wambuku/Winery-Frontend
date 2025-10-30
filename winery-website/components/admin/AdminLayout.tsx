import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import StaffManagement from './StaffManagement';
import SalesAnalytics from './SalesAnalytics';
import CustomerManagement from './CustomerManagement';
import SystemHealth from './SystemHealth';

type AdminView = 'dashboard' | 'staff' | 'analytics' | 'customers' | 'health';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'analytics', name: 'Sales Analytics', icon: '📈' },
    { id: 'customers', name: 'Customers', icon: '👥' },
    { id: 'staff', name: 'Staff Management', icon: '👨‍💼' },
    { id: 'health', name: 'System Health', icon: '🔧' },
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'staff':
        return <StaffManagement />;
      case 'analytics':
        return <SalesAnalytics />;
      case 'customers':
        return <CustomerManagement />;
      case 'health':
        return <SystemHealth />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-red-400">Wine Admin</h1>
                <p className="text-sm text-gray-300">Management Panel</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id as AdminView)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeView === item.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="ml-3 text-sm font-medium">{item.name}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-700">
          {sidebarOpen ? (
            <div>
              <div className="mb-3">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 mt-1">
                  Admin
                </span>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
              >
                <span className="text-lg">🚪</span>
                <span className="ml-3">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
              title="Logout"
            >
              🚪
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderActiveView()}
      </div>
    </div>
  );
};

export default AdminLayout;