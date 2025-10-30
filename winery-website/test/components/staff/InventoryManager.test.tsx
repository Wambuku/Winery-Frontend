import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import InventoryManager from '../../../components/staff/InventoryManager';
import { useAuth } from '../../../context/AuthContext';

// Mock the useAuth hook
vi.mock('../../../context/AuthContext');

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const mockUser = {
  id: '1',
  email: 'staff@test.com',
  name: 'Staff User',
  role: 'staff' as const,
  createdAt: new Date(),
};

const mockWines = [
  {
    id: '1',
    name: 'Test Wine 1',
    description: 'Test description',
    price: 100,
    image: '/test-image.jpg',
    ingredients: ['Grape'],
    color: 'Red',
    history: 'Test history',
    vintage: 2020,
    region: 'Test Region',
    alcoholContent: 12.5,
    category: 'Red Wine',
    inStock: true,
    stockQuantity: 25,
  },
  {
    id: '2',
    name: 'Test Wine 2',
    description: 'Test description 2',
    price: 50,
    image: '/test-image2.jpg',
    ingredients: ['Grape'],
    color: 'White',
    history: 'Test history 2',
    vintage: 2021,
    region: 'Test Region 2',
    alcoholContent: 11.5,
    category: 'White Wine',
    inStock: true,
    stockQuantity: 5,
  },
];

const mockCategories = [
  { id: '1', name: 'Red Wine', description: 'Red wines', isActive: true },
  { id: '2', name: 'White Wine', description: 'White wines', isActive: true },
];

const mockUseAuth = vi.mocked(useAuth);

describe('InventoryManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
    
    // Mock useAuth hook
    mockUseAuth.mockReturnValue({
      user: mockUser,
      token: 'mock-token',
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });
    
    // Mock successful API responses
    vi.mocked(fetch).mockImplementation((url) => {
      if (url === '/api/wines?limit=100') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { wines: mockWines },
          }),
        } as Response);
      }
      
      if (url === '/api/wines/categories') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: mockCategories,
          }),
        } as Response);
      }
      
      if (url === '/api/wines/low-stock?threshold=10') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [mockWines[1]], // Wine with stock quantity 5
          }),
        } as Response);
      }
      
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('renders inventory manager with tabs', async () => {
    render(<InventoryManager />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Inventory Management')).toBeInTheDocument();
    expect(screen.getByText('Wine Inventory')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Bulk Stock')).toBeInTheDocument();
    expect(screen.getByText('Stock Alerts')).toBeInTheDocument();
  });

  it('displays wines in the wine inventory tab', async () => {
    render(<InventoryManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Wine 1')).toBeInTheDocument();
      expect(screen.getByText('Test Wine 2')).toBeInTheDocument();
    });

    expect(screen.getByText('Red Wine')).toBeInTheDocument();
    expect(screen.getByText('KSh 100')).toBeInTheDocument();
  });

  it('filters wines by search term', async () => {
    render(<InventoryManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Wine 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search wines...');
    fireEvent.change(searchInput, { target: { value: 'Wine 1' } });

    expect(screen.getByText('Test Wine 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Wine 2')).not.toBeInTheDocument();
  });

  it('filters wines by category', async () => {
    render(<InventoryManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Wine 1')).toBeInTheDocument();
    });

    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'Red Wine' } });

    expect(screen.getByText('Test Wine 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Wine 2')).not.toBeInTheDocument();
  });

  it('filters wines by stock level', async () => {
    render(<InventoryManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Wine 1')).toBeInTheDocument();
    });

    const stockSelect = screen.getByDisplayValue('All Stock Levels');
    fireEvent.change(stockSelect, { target: { value: 'low_stock' } });

    expect(screen.queryByText('Test Wine 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Wine 2')).toBeInTheDocument();
  });

  it('switches between tabs', async () => {
    render(<InventoryManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Wine 1')).toBeInTheDocument();
    });

    // Switch to categories tab
    const categoryButtons = screen.getAllByText('Categories');
    fireEvent.click(categoryButtons[0]);
    expect(screen.getByText('Category Management')).toBeInTheDocument();

    // Switch to bulk stock tab
    const bulkStockButtons = screen.getAllByText('Bulk Stock');
    fireEvent.click(bulkStockButtons[0]);
    expect(screen.getByText('Bulk Stock Management')).toBeInTheDocument();

    // Switch to alerts tab
    const alertButtons = screen.getAllByText('Stock Alerts');
    fireEvent.click(alertButtons[0]);
    expect(screen.getAllByText('Stock Alerts')[1]).toBeInTheDocument(); // Check for the header, not the tab
  });

  it('opens wine form when Add Wine is clicked', async () => {
    render(<InventoryManager />);

    await waitFor(() => {
      expect(screen.getByText('Add Wine')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Wine'));
    expect(screen.getByText('Add New Wine')).toBeInTheDocument();
  });

  it('opens wine form for editing when Edit is clicked', async () => {
    render(<InventoryManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Wine 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    expect(screen.getByText('Edit Wine')).toBeInTheDocument();
  });

  it('handles wine deletion', async () => {
    // Mock window.confirm
    window.confirm = vi.fn(() => true);
    
    vi.mocked(fetch).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockWines[0] }),
      } as Response)
    );

    render(<InventoryManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Wine 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this wine?');
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/wines/manage?id=1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
        })
      );
    });
  });

  it('displays loading state initially', () => {
    render(<InventoryManager />);
    expect(screen.getByText('Loading', { exact: false })).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('API Error'));
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<InventoryManager />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});