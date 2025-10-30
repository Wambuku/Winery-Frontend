import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WineFilters from '../../../components/wine/WineFilters';
import { wineService } from '../../../services/api/wineService';

import { vi } from 'vitest';

// Mock the wine service
vi.mock('../../../services/api/wineService');
const mockWineService = wineService as any;

const mockCategories = ['Red Wine', 'White Wine', 'Sparkling Wine'];
const mockRegions = ['Bordeaux, France', 'Loire Valley, France', 'Tuscany, Italy'];

const defaultFilters = {
  category: undefined,
  region: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  vintage: undefined,
  color: undefined,
  inStock: true,
  search: undefined,
  sortBy: 'name' as const,
  sortOrder: 'asc' as const
};

describe('WineFilters', () => {
  const mockOnFiltersChange = vi.fn();
  const mockOnClearFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockWineService.getCategories.mockResolvedValue({
      success: true,
      data: mockCategories
    });

    mockWineService.getRegions.mockResolvedValue({
      success: true,
      data: mockRegions
    });
  });

  it('renders filter sections', async () => {
    render(
      <WineFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByText('Sort By')).toBeInTheDocument();
      expect(screen.getByText('Basic Filters')).toBeInTheDocument();
      expect(screen.getByText('Price Range')).toBeInTheDocument();
    });
  });

  it('loads categories and regions on mount', async () => {
    render(
      <WineFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    await waitFor(() => {
      expect(mockWineService.getCategories).toHaveBeenCalled();
      expect(mockWineService.getRegions).toHaveBeenCalled();
    });
  });

  it('displays loading state initially', () => {
    render(
      <WineFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByTestId('loading-skeleton') || document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('calls onFiltersChange when sort option changes', async () => {
    const user = userEvent.setup();
    
    render(
      <WineFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Name (A-Z)')).toBeInTheDocument();
    });

    const sortSelect = screen.getByDisplayValue('Name (A-Z)');
    await user.selectOptions(sortSelect, 'price-asc');

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      sortBy: 'price',
      sortOrder: 'asc'
    });
  });

  it('toggles filter sections when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <WineFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Wine Details')).toBeInTheDocument();
    });

    const wineDetailsButton = screen.getByText('Wine Details');
    await user.click(wineDetailsButton);

    // Wine Details section should now be expanded
    expect(screen.getByText('Wine Color')).toBeInTheDocument();
  });

  it('calls onFiltersChange when category changes', async () => {
    const user = userEvent.setup();
    
    render(
      <WineFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('All Categories')).toBeInTheDocument();
    });

    const categorySelect = screen.getByDisplayValue('All Categories');
    await user.selectOptions(categorySelect, 'Red Wine');

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      category: 'Red Wine'
    });
  });

  it('calls onFiltersChange when region changes', async () => {
    const user = userEvent.setup();
    
    render(
      <WineFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('All Regions')).toBeInTheDocument();
    });

    const regionSelect = screen.getByDisplayValue('All Regions');
    await user.selectOptions(regionSelect, 'Bordeaux, France');

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      region: 'Bordeaux, France'
    });
  });

  it('handles price range selection', async () => {
    const user = userEvent.setup();
    
    render(
      <WineFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('KSh 50 - 100')).toBeInTheDocument();
    });

    const priceRangeButton = screen.getByText('KSh 50 - 100');
    await user.click(priceRangeButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      minPrice: 50,
      maxPrice: 100
    });
  });

  it('handles custom price range input', async () => {
    const user = userEvent.setup();
    
    render(
      <WineFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
    });

    const minPriceInput = screen.getByPlaceholderText('Min');
    await user.type(minPriceInput, '100');

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      minPrice: 100
    });
  });

  it('handles wine color selection', async () => {
    const user = userEvent.setup();
    
    render(
      <WineFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    // Expand Wine Details section first
    await waitFor(() => {
      expect(screen.getByText('Wine Details')).toBeInTheDocument();
    });

    const wineDetailsButton = screen.getByText('Wine Details');
    await user.click(wineDetailsButton);

    await waitFor(() => {
      expect(screen.getByText('Red')).toBeInTheDocument();
    });

    const redColorButton = screen.getByText('Red');
    await user.click(redColorButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      color: 'red'
    });
  });

  it('handles vintage year input', async () => {
    const user = userEvent.setup();
    
    render(
      <WineFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    // Expand Wine Details section first
    await waitFor(() => {
      expect(screen.getByText('Wine Details')).toBeInTheDocument();
    });

    const wineDetailsButton = screen.getByText('Wine Details');
    await user.click(wineDetailsButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Specific year')).toBeInTheDocument();
    });

    const vintageInput = screen.getByPlaceholderText('Specific year');
    await user.type(vintageInput, '2020');

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      vintage: 2020
    });
  });

  it('handles in stock checkbox', async () => {
    const user = userEvent.setup();
    
    render(
      <WineFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('In Stock Only')).toBeInTheDocument();
    });

    const inStockCheckbox = screen.getByRole('checkbox', { name: /in stock only/i });
    await user.click(inStockCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      inStock: false
    });
  });

  it('shows active filter count', () => {
    const filtersWithActive = {
      ...defaultFilters,
      category: 'Red Wine',
      minPrice: 50,
      search: 'Bordeaux'
    };

    render(
      <WineFilters
        filters={filtersWithActive}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument(); // Active filter count badge
  });

  it('enables clear all button when filters are active', () => {
    const filtersWithActive = {
      ...defaultFilters,
      category: 'Red Wine'
    };

    render(
      <WineFilters
        filters={filtersWithActive}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const clearButton = screen.getByText('Clear All');
    expect(clearButton).not.toBeDisabled();
  });

  it('disables clear all button when no filters are active', async () => {
    render(
      <WineFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    await waitFor(() => {
      const clearButton = screen.getByText('Clear All');
      expect(clearButton).toBeDisabled();
    });
  });

  it('calls onClearFilters when clear all is clicked', async () => {
    const user = userEvent.setup();
    const filtersWithActive = {
      ...defaultFilters,
      category: 'Red Wine'
    };

    render(
      <WineFilters
        filters={filtersWithActive}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const clearButton = screen.getByText('Clear All');
    await user.click(clearButton);

    expect(mockOnClearFilters).toHaveBeenCalled();
  });

  it('handles vintage range selection', async () => {
    const user = userEvent.setup();
    
    render(
      <WineFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    // Expand Wine Details section first
    await waitFor(() => {
      expect(screen.getByText('Wine Details')).toBeInTheDocument();
    });

    const wineDetailsButton = screen.getByText('Wine Details');
    await user.click(wineDetailsButton);

    await waitFor(() => {
      expect(screen.getByText('2020-2024')).toBeInTheDocument();
    });

    const vintageRangeButton = screen.getByText('2020-2024');
    await user.click(vintageRangeButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      vintage: 2022 // Middle year of the range
    });
  });

  it('highlights selected price range', () => {
    const filtersWithPriceRange = {
      ...defaultFilters,
      minPrice: 50,
      maxPrice: 100
    };

    render(
      <WineFilters
        filters={filtersWithPriceRange}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const priceRangeButton = screen.getByText('KSh 50 - 100');
    expect(priceRangeButton).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
  });

  it('highlights selected wine color', async () => {
    const user = userEvent.setup();
    const filtersWithColor = {
      ...defaultFilters,
      color: 'red'
    };

    render(
      <WineFilters
        filters={filtersWithColor}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    // Expand Wine Details section first
    const wineDetailsButton = screen.getByText('Wine Details');
    await user.click(wineDetailsButton);

    await waitFor(() => {
      const redColorButton = screen.getByText('Red');
      expect(redColorButton).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
    });
  });
});