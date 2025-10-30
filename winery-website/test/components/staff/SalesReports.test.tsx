import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SalesReports from '../../../components/staff/SalesReports';
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

const mockSalesReport = {
  period: 'today',
  data: [
    {
      date: '2024-10-28',
      totalSales: 110000,
      totalOrders: 3,
      cashSales: 65000,
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
    }
  ],
  summary: {
    totalRevenue: 110000,
    totalOrders: 3,
    averageOrderValue: 36667,
    cashPercentage: 59.1,
    mpesaPercentage: 40.9
  }
};

const renderSalesReports = () => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <SalesReports />
    </AuthContext.Provider>
  );
};

describe('SalesReports Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful sales report fetch
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/staff/sales-report')) {
        if (url.includes('format=csv')) {
          return Promise.resolve({
            ok: true,
            blob: () => Promise.resolve(new Blob(['CSV data'], { type: 'text/csv' }))
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSalesReport)
        });
      }
      
      return Promise.reject(new Error('Unknown URL'));
    });

    // Mock URL.createObjectURL and related methods
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock document methods
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn()
    };
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockAnchor as any;
      }
      return document.createElement(tagName);
    });
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);
  });

  it('should display loading spinner initially', () => {
    renderSalesReports();
    
    expect(screen.getByRole('generic')).toHaveClass('animate-spin');
  });

  it('should display sales report after loading', async () => {
    renderSalesReports();

    await waitFor(() => {
      expect(screen.getByText('Sales Reports')).toBeInTheDocument();
    });

    // Check summary cards
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('KSh 110,000')).toBeInTheDocument();
    
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    expect(screen.getByText('Avg Order Value')).toBeInTheDocument();
    expect(screen.getByText('KSh 36,667')).toBeInTheDocument();
    
    expect(screen.getByText('Cash Sales')).toBeInTheDocument();
    expect(screen.getByText('59.1%')).toBeInTheDocument();
    
    expect(screen.getByText('M-Pesa Sales')).toBeInTheDocument();
    expect(screen.getByText('40.9%')).toBeInTheDocument();
  });

  it('should display daily breakdown table', async () => {
    renderSalesReports();

    await waitFor(() => {
      expect(screen.getByText('Daily Breakdown')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Cash')).toBeInTheDocument();
    expect(screen.getByText('M-Pesa')).toBeInTheDocument();

    // Check data row
    expect(screen.getByText('10/28/2024')).toBeInTheDocument();
    expect(screen.getByText('KSh 110,000')).toBeInTheDocument();
    expect(screen.getByText('KSh 65,000')).toBeInTheDocument();
    expect(screen.getByText('KSh 45,000')).toBeInTheDocument();
  });

  it('should display top selling wines table', async () => {
    renderSalesReports();

    await waitFor(() => {
      expect(screen.getByText('Top Selling Wines')).toBeInTheDocument();
    });

    // Check wine data
    expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
    expect(screen.getByText('Dom Pérignon 2012')).toBeInTheDocument();
    
    // Check quantities and revenues
    const quantities = screen.getAllByText('3');
    expect(quantities.length).toBeGreaterThan(0);
    
    const revenues = screen.getAllByText('KSh 45,000');
    expect(revenues.length).toBeGreaterThan(0);
  });

  it('should change period when dropdown is changed', async () => {
    renderSalesReports();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Today')).toBeInTheDocument();
    });

    // Change to week
    const periodSelect = screen.getByDisplayValue('Today');
    fireEvent.change(periodSelect, { target: { value: 'week' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('period=week')
      );
    });
  });

  it('should apply custom date range', async () => {
    renderSalesReports();

    await waitFor(() => {
      expect(screen.getByText('Sales Reports')).toBeInTheDocument();
    });

    // Set custom dates
    const startDateInput = screen.getAllByDisplayValue('2024-10-28')[0];
    const endDateInput = screen.getAllByDisplayValue('2024-10-28')[1];
    
    fireEvent.change(startDateInput, { target: { value: '2024-10-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-10-31' } });

    // Click Apply button
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2024-10-01&endDate=2024-10-31')
      );
    });
  });

  it('should export CSV when export button is clicked', async () => {
    renderSalesReports();

    await waitFor(() => {
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });

    // Click export button
    const exportButton = screen.getByText('Export CSV');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('format=csv')
      );
    });

    // Check that download was triggered
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('should handle API error gracefully', async () => {
    // Mock API error
    (global.fetch as any).mockImplementation(() => {
      return Promise.reject(new Error('API Error'));
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderSalesReports();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch sales report:', expect.any(Error));
    });

    // Should show no data message
    expect(screen.getByText('No sales data available for the selected period.')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should display no sales data message when report is empty', async () => {
    // Mock empty report
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/staff/sales-report')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockSalesReport,
            data: [{
              ...mockSalesReport.data[0],
              topWines: []
            }]
          })
        });
      }
      
      return Promise.reject(new Error('Unknown URL'));
    });

    renderSalesReports();

    await waitFor(() => {
      expect(screen.getByText('No sales data available')).toBeInTheDocument();
    });
  });

  it('should calculate percentages correctly in top wines table', async () => {
    renderSalesReports();

    await waitFor(() => {
      expect(screen.getByText('Top Selling Wines')).toBeInTheDocument();
    });

    // Check percentage calculations
    // Château Margaux: 45000 / 110000 * 100 = 40.9%
    expect(screen.getByText('40.9%')).toBeInTheDocument();
    
    // Dom Pérignon: 50000 / 110000 * 100 = 45.5%
    expect(screen.getByText('45.5%')).toBeInTheDocument();
  });

  it('should have proper styling and layout', async () => {
    renderSalesReports();

    await waitFor(() => {
      expect(screen.getByText('Sales Reports')).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');
    });

    // Check that summary cards are displayed
    const summaryCards = screen.getAllByRole('generic').filter(el => 
      el.className.includes('bg-white') && el.className.includes('shadow')
    );
    expect(summaryCards.length).toBeGreaterThan(0);
  });
});