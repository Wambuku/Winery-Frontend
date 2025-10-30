// Dashboard page - protected route example

import React from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to your Dashboard
              </h1>
              
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  User Information
                </h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p><strong>Name:</strong> {user?.name}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Role:</strong> {user?.role}</p>
                  <p><strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">
                    Customer Features
                  </h3>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Browse wine catalog</li>
                    <li>• Add wines to cart</li>
                    <li>• Place orders with M-Pesa payment</li>
                    <li>• View order history</li>
                  </ul>
                </div>

                {(user?.role === 'staff' || user?.role === 'admin') && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h3 className="text-lg font-medium text-green-900 mb-2">
                      Staff Features
                    </h3>
                    <ul className="text-green-800 space-y-1">
                      <li>• Manage wine inventory</li>
                      <li>• Process in-store sales</li>
                      <li>• View sales reports</li>
                      <li>• Handle cash and M-Pesa payments</li>
                    </ul>
                  </div>
                )}

                {user?.role === 'admin' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                    <h3 className="text-lg font-medium text-purple-900 mb-2">
                      Admin Features
                    </h3>
                    <ul className="text-purple-800 space-y-1">
                      <li>• Manage staff accounts</li>
                      <li>• View comprehensive analytics</li>
                      <li>• System configuration</li>
                      <li>• User management</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-4">
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
                <a
                  href="/"
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}