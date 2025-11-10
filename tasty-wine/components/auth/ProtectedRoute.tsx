"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

const defaultLoading = (
  <div className="rounded-lg border border-red-500/30 bg-black/80 px-4 py-3 text-sm font-medium text-white/90 shadow-lg shadow-red-900/10 backdrop-blur">
    Checking permissions…
  </div>
);

const defaultSigninMessage = (
  <div className="rounded-lg border border-red-500/50 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 shadow-sm">
    Sign in to unlock this secure area.
  </div>
);

const defaultForbiddenMessage = (
  <div className="rounded-lg border border-black/80 bg-black px-4 py-3 text-sm font-semibold uppercase tracking-wide text-yellow-400 shadow-lg shadow-black/40">
    Administration clearance required.
  </div>
);

export default function ProtectedRoute({
  children,
  allowedRoles,
  fallback,
  redirectTo,
  loadingComponent,
}: ProtectedRouteProps) {
  const { isAuthenticated, status, user } = useAuth();
  const router = useRouter();

  const hasRequiredRole = useMemo(() => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!user?.roles || user.roles.length === 0) return false;
    return allowedRoles.some((role) => user.roles.includes(role));
  }, [allowedRoles, user]);

  const isLoading = status === "initializing" || status === "loading";

  useEffect(() => {
    if (!redirectTo || fallback) return;
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (!hasRequiredRole) {
      router.replace(redirectTo);
    }
  }, [fallback, hasRequiredRole, isAuthenticated, isLoading, redirectTo, router]);

  if (isLoading) {
    return <>{loadingComponent ?? defaultLoading}</>;
  }

  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    return defaultSigninMessage;
  }

  if (!hasRequiredRole) {
    if (fallback) return <>{fallback}</>;
    return defaultForbiddenMessage;
  }

  return <>{children}</>;
}
