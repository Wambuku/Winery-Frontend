import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdminDashboard from '../../../components/admin/AdminDashboard';
import { useAuth } from '../../../context/AuthContext';

// Mock the useAuth hook
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

const mockUser = {
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
  topSellingWines: [
    {
      id: '1',
      name: 'Château Margaux 2015',
      sales: 45,
      revenue: 22500,
    },
  ],
  recentOrders: [
    {
      id: 'ORD-001',
      customerName: 'John Smith',
      total: 450,
      status: 'completed',
      createdAt: new Date().toISOString(),
    },
  ],
  systemHealth: {
    apiStatus: 'healthy' as const,
    databaseStatus: 'healthy' as const,
    paymentStatus: 'healthy' as const,
    errorCount: 2,
  },
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDashboardStats),
    });
  });

  it('renders access denied for non-admin users', () => {
    (useAuth as any).mockReturnValue({
      user: { ...mockUser, role: 'customer' },
    });

    render(<AdminDashboard />);
    
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText("You don't have permission to access this page.")).toBeInTheDocument();
  });

  it('renders loading state initially', () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    render(<AdminDashboard />);
    
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('renders dashboard stats after loading', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome back, Admin User')).toBeInTheDocument();
    });

    // Check key metrics
    expect(screen.getByText('$125,000')).toBeInTheDocument();
    expect(screen.getByText('450')).toBeInTheDocument();
    expect(screen.getByText('320')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('displays system health indicators', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });

    expect(screen.getByText('API Status')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('Payment System')).toBeInTheDocument();
  });

  it('displays top selling wines', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Top Selling Wines')).toBeInTheDocument();
    });

    expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
    expect(screen.getByText('45 sold')).toBeInTheDocument();
  });

  it('displays recent orders', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Orders')).toBeInTheDocument();
    });

    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('$450')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    (fetch as any).mockRejectedValue(new Error('API Error'));

    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
  });

  it('allows retrying after error', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    (fetch as any).mockRejectedValueOnce(new Error('API Error'))
                   .mockResolvedValue({
                     ok: true,
                     json: () => Promise.resolve(mockDashboardStats),
                   });

    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  it('fetches dashboard stats on mount', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/dashboard-stats');
    });
  });
});