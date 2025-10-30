import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExternalWineManager } from '../../components/admin/ExternalWineManager';

// Mock the useExternalWines hook
vi.mock('../../hooks/useExternalWines', () => ({
  useExternalWines: vi.fn(),
}));

import { useExternalWines } from '../../hooks/useExternalWines';

describe('External Wine API Integration', () => {
  const mockUseExternalWines = useExternalWines as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockUseExternalWines.mockReturnValue({
      wines: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
      syncWines: vi.fn(),
    });

    render(<ExternalWineManager />);

    expect(screen.getByText('Loading external wines...')).toBeInTheDocument();
  });

  it('should display wines from external API', async () => {
    const mockWines = [
      {
        id: '1',
        name: 'Cabernet Sauvignon 2020',
        description: 'Rich and full-bodied red wine',
        price: 25.99,
        image: 'https://example.com/wine1.jpg',
        ingredients: [],
        color: 'Red',
        history: '',
        vintage: 2020,
        region: 'Napa Valley',
        alcoholContent: 13.5,
        category: 'Red',
        inStock: true,
        stockQuantity: 50,
      },
      {
        id: '2',
        name: 'Chardonnay 2021',
        description: 'Crisp and refreshing white wine',
        price: 18.99,
        image: 'https://example.com/wine2.jpg',
        ingredients: [],
        color: 'White',
        history: '',
        vintage: 2021,
        region: 'Sonoma County',
        alcoholContent: 12.5,
        category: 'White',
        inStock: true,
        stockQuantity: 30,
      },
    ];

    mockUseExternalWines.mockReturnValue({
      wines: mockWines,
      loading: false,
      error: null,
      refetch: vi.fn(),
      syncWines: vi.fn(),
    });

    render(<ExternalWineManager />);

    expect(screen.getByText('External Wine API Manager')).toBeInTheDocument();
    expect(screen.getByText('Found 2 wines from external API')).toBeInTheDocument();
    
    // Check if wines are displayed in the table
    expect(screen.getByText('Cabernet Sauvignon 2020')).toBeInTheDocument();
    expect(screen.getByText('Chardonnay 2021')).toBeInTheDocument();
    expect(screen.getByText('$25.99')).toBeInTheDocument();
    expect(screen.getByText('$18.99')).toBeInTheDocument();
    expect(screen.getByText('Napa Valley')).toBeInTheDocument();
    expect(screen.getByText('Sonoma County')).toBeInTheDocument();
  });

  it('should display error message when API fails', () => {
    mockUseExternalWines.mockReturnValue({
      wines: [],
      loading: false,
      error: 'Failed to fetch wines from external API',
      refetch: vi.fn(),
      syncWines: vi.fn(),
    });

    render(<ExternalWineManager />);

    expect(screen.getByText('Failed to fetch wines from external API')).toBeInTheDocument();
  });

  it('should handle refresh button click', async () => {
    const mockRefetch = vi.fn();
    
    mockUseExternalWines.mockReturnValue({
      wines: [],
      loading: false,
      error: null,
      refetch: mockRefetch,
      syncWines: vi.fn(),
    });

    render(<ExternalWineManager />);

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('should handle sync button click and display results', async () => {
    const mockSyncWines = vi.fn().mockResolvedValue({
      synced: 3,
      errors: ['Failed to sync Wine A'],
    });

    mockUseExternalWines.mockReturnValue({
      wines: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      syncWines: mockSyncWines,
    });

    render(<ExternalWineManager />);

    const syncButton = screen.getByText('Sync to Database');
    fireEvent.click(syncButton);

    expect(mockSyncWines).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText('Successfully synced 3 wines to database')).toBeInTheDocument();
    });

    // Check if sync errors are displayed
    expect(screen.getByText('Sync Errors:')).toBeInTheDocument();
    expect(screen.getByText('• Failed to sync Wine A')).toBeInTheDocument();
  });

  it('should display stock status correctly', () => {
    const mockWines = [
      {
        id: '1',
        name: 'In Stock Wine',
        description: 'Available wine',
        price: 25.99,
        image: 'https://example.com/wine1.jpg',
        ingredients: [],
        color: 'Red',
        history: '',
        vintage: 2020,
        region: 'Test Region',
        alcoholContent: 13.5,
        category: 'Red',
        inStock: true,
        stockQuantity: 50,
      },
      {
        id: '2',
        name: 'Out of Stock Wine',
        description: 'Unavailable wine',
        price: 18.99,
        image: 'https://example.com/wine2.jpg',
        ingredients: [],
        color: 'White',
        history: '',
        vintage: 2021,
        region: 'Test Region 2',
        alcoholContent: 12.5,
        category: 'White',
        inStock: false,
        stockQuantity: 0,
      },
    ];

    mockUseExternalWines.mockReturnValue({
      wines: mockWines,
      loading: false,
      error: null,
      refetch: vi.fn(),
      syncWines: vi.fn(),
    });

    render(<ExternalWineManager />);

    expect(screen.getByText('50 in stock')).toBeInTheDocument();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('should handle image loading errors', () => {
    const mockWines = [
      {
        id: '1',
        name: 'Wine with Bad Image',
        description: 'Wine with broken image URL',
        price: 25.99,
        image: 'https://broken-url.com/wine.jpg',
        ingredients: [],
        color: 'Red',
        history: '',
        vintage: 2020,
        region: 'Test Region',
        alcoholContent: 13.5,
        category: 'Red',
        inStock: true,
        stockQuantity: 50,
      },
    ];

    mockUseExternalWines.mockReturnValue({
      wines: mockWines,
      loading: false,
      error: null,
      refetch: vi.fn(),
      syncWines: vi.fn(),
    });

    render(<ExternalWineManager />);

    const image = screen.getByAltText('Wine with Bad Image') as HTMLImageElement;
    
    // Simulate image error
    fireEvent.error(image);
    
    expect(image.src).toBe('http://localhost:3000/placeholder-wine.jpg');
  });

  it('should display empty state when no wines are found', () => {
    mockUseExternalWines.mockReturnValue({
      wines: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      syncWines: vi.fn(),
    });

    render(<ExternalWineManager />);

    expect(screen.getByText('Found 0 wines from external API')).toBeInTheDocument();
    expect(screen.getByText('No wines found from external API')).toBeInTheDocument();
  });

  it('should disable buttons during loading and syncing', () => {
    mockUseExternalWines.mockReturnValue({
      wines: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
      syncWines: vi.fn(),
    });

    render(<ExternalWineManager />);

    const refreshButton = screen.getByText('Refresh');
    const syncButton = screen.getByText('Sync to Database');

    expect(refreshButton).toBeDisabled();
    expect(syncButton).toBeDisabled();
  });
});