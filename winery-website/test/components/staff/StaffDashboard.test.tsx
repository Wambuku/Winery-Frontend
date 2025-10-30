import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StaffDashboard from '../../../components/staff/StaffDashboard';
import { AuthContext } from '../../../context/AuthContext';

// Mock the auth context
const mockAuthContext = {
  user: {
    id: 'staff1',
    name: 'John Staff',
    email: 'staff@winestore.com',
    role: 'staff' as const,
    createdAt: new Date()
  },
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false
};

// Mock fetch
global.fetch = vi.fn();

const mockDashboardStats = {
  todaySales: 110000,
  todayOrders: 3,
  cashSales: 95000,
  mpesaSales: 45000,
  topWines: [
    {
      id: '1',
      name: 'Château Margaux 2015',
      quantity: 3,
      revenue: 45000
    },
    {
      id: '2',
      name: 'Dom Pérignon 2012',
      quantity: 2,
      revenue: 50000
    }
  ]
};

const renderStaffDashboard = () => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <StaffDashboard />
    </AuthContext.Provider>
  );
};

describe('StaffDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful dashboard stats fetch
    (global.fetch as any).mockImplementation((url: string) => {
      if (url === '/api/staff/dashboard-stats') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardStats)
        });
      }
      
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('should display loading spinner initially', () => {
    renderStaffDashboard();
    
    expect(screen.getByRole('generic')).toHaveClass('animate-spin');
  });

  it('should display dashboard stats after loading', async () => {
    renderStaffDashboard();

    await waitFor(() => {
      expect(screen.getByText('Staff Dashboard')).toBeInTheDocument();
    });

    // Check welcome message
    expect(screen.getByText('Welcome back, John Staff')).toBeInTheDocument();

    // Check stats cards
    expect(screen.getByText("Today's Sales")).toBeInTheDocument();
    expect(screen.getByText('KSh 110,000')).toBeInTheDocument();
    
    expect(screen.getByText('Orders Today')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    expect(screen.getByText('Cash Sales')).toBeInTheDocument();
    expect(screen.getByText('KSh 95,000')).toBeInTheDocument();
    
    expect(screen.getByText('M-Pesa Sales')).toBeInTheDocument();
    expect(screen.getByText('KSh 45,000')).toBeInTheDocument();
  });

  it('should display top selling wines', async () => {
    renderStaffDashboard();

    await waitFor(() => {
      expect(screen.getByText('Top Selling Wines Today')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Wine')).toBeInTheDocument();
    expect(screen.getByText('Quantity Sold')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();

    // Check wine data
    expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('KSh 45,000')).toBeInTheDocument();

    expect(screen.getByText('Dom Pérignon 2012')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('KSh 50,000')).toBeInTheDocument();
  });

  it('should display no sales message when no top wines data', async () => {
    // Mock empty top wines
    (global.fetch as any).mockImplementation((url: string) => {
      if (url === '/api/staff/dashboard-stats') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockDashboardStats,
            topWines: []
          })
        });
      }
      
      return Promise.reject(new Error('Unknown URL'));
    });

    renderStaffDashboard();

    await waitFor(() => {
      expect(screen.getByText('No sales data available for today')).toBeInTheDocument();
    });
  });

  it('should handle API error gracefully', async () => {
    // Mock API error
    (global.fetch as any).mockImplementation(() => {
      return Promise.reject(new Error('API Error'));
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderStaffDashboard();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch dashboard stats:', expect.any(Error));
    });

    // Should still show the dashboard structure
    expect(screen.getByText('Staff Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome back, John Staff')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should fetch dashboard stats on component mount', async () => {
    renderStaffDashboard();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/staff/dashboard-stats');
    });
  });

  it('should display correct currency formatting', async () => {
    renderStaffDashboard();

    await waitFor(() => {
      // Check that numbers are properly formatted with commas
      expect(screen.getByText('KSh 110,000')).toBeInTheDocument();
      expect(screen.getByText('KSh 95,000')).toBeInTheDocument();
      expect(screen.getByText('KSh 45,000')).toBeInTheDocument();
      expect(screen.getByText('KSh 50,000')).toBeInTheDocument();
    });
  });

  it('should have proper styling classes', async () => {
    renderStaffDashboard();

    await waitFor(() => {
      expect(screen.getByText('Staff Dashboard')).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');
    });

    // Check stats cards have proper styling
    const statsCards = screen.getAllByRole('generic').filter(el => 
      el.className.includes('bg-white') && el.className.includes('shadow')
    );
    expect(statsCards.length).toBeGreaterThan(0);
  });
});