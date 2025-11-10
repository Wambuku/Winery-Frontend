'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import InventoryDashboard from '../../components/inventory/InventoryDashboard';
import LoadingState from '../../components/navigation/LoadingState';

export default function InventoryPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="rounded-xl border border-blue-500/50 bg-blue-500/10 p-8 text-center">
          <h2 className="text-2xl font-bold text-blue-400">Authentication Required</h2>
          <p className="mt-2 text-slate-300">Please sign in to access inventory management.</p>
          <a
            href="/login"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const allowed = user.roles?.some((role) => role === 'staff' || role === 'admin');

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-8 text-center">
          <h2 className="text-2xl font-bold text-red-400">Access Denied</h2>
          <p className="mt-2 text-slate-300">You need staff or admin privileges to access inventory management.</p>
        </div>
      </div>
    );
  }

  return <InventoryDashboard />;
}
