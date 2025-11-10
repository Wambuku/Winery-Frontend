'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import StaffLogin from '../../components/pos/StaffLogin';
import POSDashboard from '../../components/pos/POSDashboard';
import LoadingState from '../../components/navigation/LoadingState';

export default function POSPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!user) {
    return <StaffLogin />;
  }

  const allowed = user.roles?.some((role) => role === 'staff' || role === 'admin');

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-8 text-center">
          <h2 className="text-2xl font-bold text-red-400">Access Denied</h2>
          <p className="mt-2 text-slate-300">You need staff or admin privileges to access the POS system.</p>
        </div>
      </div>
    );
  }

  return <POSDashboard />;
}
