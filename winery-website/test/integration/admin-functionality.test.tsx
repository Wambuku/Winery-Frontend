import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

// Mock the useAuth hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

const mockAdminUser = {
  id: '1',
  name: 'Admin User',
  email: 'admin@test.com',
  role: 'admin' as const,
};

const mockDashboardStats = {
  totalSales: 125000,
  totalOrders: 450,
  totalCustomers: 320,
  totalStaff: 8,
  revenueToday: 2500,
  revenueThisMonth: 45000,
  topSellingWines: [],
  recentOrders: [],
  systemHealth: {
    apiStatus: 'healthy' as const,
    databaseStatus: 'healthy' as const,
    paymentStatus: 'healthy' as const,
    errorCount: 0,
  },
};

const mockStaff = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@winestore.com',
    role: 'admin' as const,
    permissions: ['manage_inventory'],
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
];

const mockCustomers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@test.com',
    isActive: true,
    totalOrders: 5,
    totalSpent: 1000,
    averageOrderValue: 200,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

describe('Admin Functionality Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: mockAdminUser,
      logout: vi.fn(),
    });

    // Setup default fetch responses
    (fetch as any).mockImplementation((url: string) => {
      if (url.includes('dashboard-stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardStats),
        });
      }
      if (url.includes('/staff')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStaff),
        });
      }
      if (url.includes('/customers')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCustomers),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  it('renders admin layout with navigation', async () => {
    render(<AdminLayout />);
    
    await waitFor(() => {
      expect(screen.getByText('Wine Admin')).toBeInTheDocument();
      expect(screen.getByText('Management Panel')).toBeInTheDocument();
    });

    // Check navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Sales Analytics')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Staff Management')).toBeInTheDocument();
    expect(screen.getByText('System Health')).toBeInTheDocument();
  });

  it('navigates between different admin views', async () => {
    render(<AdminLayout />);
    
    // Wait for initial dashboard load
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Navigate to Staff Management
    fireEvent.click(screen.getByText('Staff Management'));
    
    await waitFor(() => {
      expect(screen.getByText('Staff Management')).toBeInTheDocument();
      expect(screen.getByText('Manage staff members and their permissions')).toBeInTheDocument();
    });

    // Navigate to Customers
    fireEvent.click(screen.getByText('Customers'));
    
    await waitFor(() => {
      expect(screen.getByText('Customer Management')).toBeInTheDocument();
    });
  });

  it('displays user information in sidebar', async () => {
    render(<AdminLayout />);
    
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  it('allows sidebar collapse and expansion', async () => {
    render(<AdminLayout />);
    
    await waitFor(() => {
      expect(screen.getByText('Wine Admin')).toBeInTheDocument();
    });

    // Find and click the collapse button
    const collapseButton = screen.getByText('←');
    fireEvent.click(collapseButton);

    // After collapse, the text should not be visible but icons should remain
    await waitFor(() => {
      expect(screen.queryByText('Wine Admin')).not.toBeInTheDocument();
    });

    // Click to expand again
    const expandButton = screen.getByText('→');
    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText('Wine Admin')).toBeInTheDocument();
    });
  });

  it('handles logout functionality', async () => {
    const mockLogout = vi.fn();
    (useAuth as any).mockReturnValue({
      user: mockAdminUser,
      logout: mockLogout,
    });

    render(<AdminLayout />);
    
    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Logout'));
    
    expect(mockLogout).toHaveBeenCalled();
  });

  it('loads dashboard data on initial render', async () => {
    render(<AdminLayout />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/dashboard-stats');
    });

    expect(screen.getByText('$125,000')).toBeInTheDocument();
    expect(screen.getByText('450')).toBeInTheDocument();
  });

  it('loads staff data when navigating to staff management', async () => {
    render(<AdminLayout />);
    
    await waitFor(() => {
      expect(screen.getByText('Staff Management')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Staff Management'));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/staff');
    });

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  });

  it('loads customer data when navigating to customer management', async () => {
    render(<AdminLayout />);
    
    fireEvent.click(screen.getByText('Customers'));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/customers');
    });

    expect(screen.getByText('John Smith')).toBeInTheDocument();
  });

  it('handles API errors gracefully across views', async () => {
    (fetch as any).mockRejectedValue(new Error('Network error'));

    render(<AdminLayout />);
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('maintains active view state when switching between views', async () => {
    render(<AdminLayout />);
    
    // Start on dashboard
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Navigate to staff management
    fireEvent.click(screen.getByText('Staff Management'));
    
    await waitFor(() => {
      expect(screen.getByText('Staff Management')).toBeInTheDocument();
    });

    // Navigate back to dashboard
    fireEvent.click(screen.getByText('Dashboard'));
    
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  it('denies access for non-admin users', () => {
    (useAuth as any).mockReturnValue({
      user: { ...mockAdminUser, role: 'customer' },
      logout: vi.fn(),
    });

    render(<AdminLayout />);
    
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText("You don't have permission to access the admin panel.")).toBeInTheDocument();
  });
});