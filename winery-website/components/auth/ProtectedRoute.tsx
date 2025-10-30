// Protected route component for role-based access control

import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/auth';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRoles?: string[];
    fallback?: ReactNode;
    redirectTo?: string;
}

export default function ProtectedRoute({
    children,
    requiredRoles = [],
    fallback,
    redirectTo = '/login'
}: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        if (typeof window !== 'undefined') {
            window.location.href = redirectTo;
        }
        return null;
    }

    // Check role permissions
    if (requiredRoles.length > 0 && !hasPermission(user.role, requiredRoles)) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-4">
                        You don't have permission to access this page.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
    Component: React.ComponentType<P>,
    requiredRoles?: string[]
) {
    return function AuthenticatedComponent(props: P) {
        return (
            <ProtectedRoute requiredRoles={requiredRoles}>
                <Component {...props} />
            </ProtectedRoute>
        );
    };
}

// Specific role-based components
export function CustomerOnly({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute requiredRoles={['customer']}>
            {children}
        </ProtectedRoute>
    );
}

export function StaffOnly({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute requiredRoles={['staff', 'admin']}>
            {children}
        </ProtectedRoute>
    );
}

export function AdminOnly({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute requiredRoles={['admin']}>
            {children}
        </ProtectedRoute>
    );
}