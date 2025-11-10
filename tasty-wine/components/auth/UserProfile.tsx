"use client";

import React from "react";
import { useAuth } from "../../context/AuthContext";

interface UserProfileProps {
  onLogout?: () => void;
  showRoles?: boolean;
}

export default function UserProfile({ onLogout, showRoles = true }: UserProfileProps) {
  const { user, logout, status } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  if (status === "initializing") {
    return (
      <div className="rounded-lg border border-red-500/30 bg-black/80 px-4 py-3 text-sm font-medium text-white/85 shadow-lg shadow-red-900/15 backdrop-blur">
        Preparing your profile…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-red-400/60 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 shadow-sm">
        No team member is currently signed in.
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-5 rounded-xl border border-black/10 bg-white/95 p-6 shadow-xl shadow-red-900/10 backdrop-blur">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Signed in as</p>
        <p className="text-2xl font-bold text-black">{user.name}</p>
        <p className="text-sm text-black/70">{user.email}</p>
      </div>

      {showRoles && user.roles?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-yellow-600">Access tier</p>
          <ul className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <li
                key={role}
                className="inline-flex items-center rounded-full border border-black/60 bg-black px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-400 shadow shadow-black/40"
              >
                {role}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={handleLogout}
        className="w-full rounded-lg border border-red-600/40 bg-red-700 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-red-600"
      >
        Sign out
      </button>
    </div>
  );
}
