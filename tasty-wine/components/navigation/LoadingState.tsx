'use client';

import React from 'react';

export default function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-red-500" />
        <p className="text-lg text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
