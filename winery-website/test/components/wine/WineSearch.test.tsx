import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WineSearch from '../../../components/wine/WineSearch';
import { wineService } from '../../../services/api/wineService';
import { Wine } from '../../../types';

import { vi } from 'vitest';

// Mock the wine service
vi.mock('../../../services/api/wineService');
const mockWineService = wineService as any;

// Mock lodash debounce
vi.mock('lodash', () => ({
  debounce: (fn: any) => {
    fn.cancel = vi.fn();
    return fn;
  }
}));

const mockWines: Wine[] = [
  {
    id: '1',
    name: 'Château Margaux 2015',
    description: 'A legendary Bordeaux wine',
    price: 850.00,
    image: '/images/wines/chateau-margaux.jpg',
    ingredients: ['Cabernet Sauvignon', 'Merlot'],
    color: 'Red',
    history: 'Historic wine from Bordeaux',
    vintage: 2015,
    region: 'Bordeaux, France',
    alcoholContent: 13.5,
    category: 'Red Wine',
    inStock: true,
    stockQuantity: 24,
  },
  {
    id: '2',
    name: 'Sancerre Les Monts Damnés 2020',
    description: 'Crisp Sauvignon Blanc',
    price: 45.00,
    image: '/images/wines/sancerre.jpg',
    ingredients: ['Sauvignon Blanc'],
    color: 'White',
    history: 'From Loire Valley',
    vintage: 2020,
    region: 'Loire Valley, France',
    alcoholContent: 13.0,
    category: 'White Wine',
    inStock: true,
    stockQuantity: 45,
  }
];

const mockCategories = ['Red Wine', 'White Wine', 'Sparkling Wine'];
const mockRegions = ['Bordeaux, France', 'Loire Valley, France', 'Tuscany, Italy'];

describe('WineSearch', () => {
  const mockOnChange = vi.fn();
  const mockOnWineSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockWineService.searchWines.mockResolvedValue({
      success: true,
      data: {
        wines: mockWines,
        pagination: {
          page: 1,
          limit: 5,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }
    });

    mockWineService.getCategories.mockResolvedValue({
      success: true,
      data: mockCategories
    });

    mockWineService.getRegions.mockResolvedValue({
      success: true,
      data: mockRegions
    });
  });

  it('renders search input with placeholder', () => {
    render(
      <WineSearch
        value=""
        onChange={mockOnChange}
        placeholder="Search wines..."
      />
    );

    expect(screen.getByPlaceholderText('Search wines...')).toBeInTheDocument();
  });

  it('calls onChange when input value changes', async () => {
    const user = userEvent.setup();
    
    render(
      <WineSearch
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'Bordeaux');

    expect(mockOnChange).toHaveBeenCalledWith('B');
    expect(mockOnChange).toHaveBeenCalledWith('Bo');
    expect(mockOnChange).toHaveBeenCalledWith('Bor');
  });

  it('shows loading spinner when searching', async () => {
    const user = userEvent.setup();
    
    // Mock a delayed response
    mockWineService.searchWines.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        success: true,
        data: {
          wines: mockWines,
          pagination: {
            page: 1,
            limit: 5,
            total: 2,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }
        }
      }), 100))
    );

    render(
      <WineSearch
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'Bordeaux');

    // Should show loading spinner
    expect(screen.getByTestId('loading-spinner') || document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('displays wine suggestions when search returns results', async () => {
    const user = userEvent.setup();
    
    render(
      <WineSearch
        value="Château"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText('Château Margaux 2015 - Bordeaux, France')).toBeInTheDocument();
    });
  });

  it('displays category suggestions', async () => {
    const user = userEvent.setup();
    
    render(
      <WineSearch
        value="Red"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText('Category: Red Wine')).toBeInTheDocument();
    });
  });

  it('displays region suggestions', async () => {
    const user = userEvent.setup();
    
    render(
      <WineSearch
        value="Bordeaux"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText('Region: Bordeaux, France')).toBeInTheDocument();
    });
  });

  it('calls onWineSelect when wine suggestion is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <WineSearch
        value="Château"
        onChange={mockOnChange}
        onWineSelect={mockOnWineSelect}
      />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);

    await waitFor(() => {
      const wineSuggestion = screen.getByText('Château Margaux 2015 - Bordeaux, France');
      expect(wineSuggestion).toBeInTheDocument();
    });

    const wineSuggestion = screen.getByText('Château Margaux 2015 - Bordeaux, France');
    await user.click(wineSuggestion);

    expect(mockOnWineSelect).toHaveBeenCalledWith(mockWines[0]);
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <WineSearch
        value="wine"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText(/Château Margaux/)).toBeInTheDocument();
    });

    // Test arrow down navigation
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    // Should have called onChange with the selected suggestion
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('hides suggestions on escape key', async () => {
    const user = userEvent.setup();
    
    render(
      <WineSearch
        value="wine"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText(/Château Margaux/)).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText(/Château Margaux/)).not.toBeInTheDocument();
    });
  });

  it('does not show suggestions for short search terms', async () => {
    const user = userEvent.setup();
    
    render(
      <WineSearch
        value="a"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);

    // Should not call search service for short terms
    expect(mockWineService.searchWines).not.toHaveBeenCalled();
  });

  it('handles search service errors gracefully', async () => {
    const user = userEvent.setup();
    
    mockWineService.searchWines.mockRejectedValue(new Error('API Error'));
    
    render(
      <WineSearch
        value="error"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);

    // Should not crash and should not show suggestions
    await waitFor(() => {
      expect(screen.queryByText(/Château Margaux/)).not.toBeInTheDocument();
    });
  });

  it('displays ingredient suggestions', async () => {
    const user = userEvent.setup();
    
    render(
      <WineSearch
        value="Cabernet"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText('Ingredient: Cabernet Sauvignon')).toBeInTheDocument();
    });
  });

  it('shows wine price and vintage in suggestions', async () => {
    const user = userEvent.setup();
    
    render(
      <WineSearch
        value="Château"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText('KSh 850.00 • 2015')).toBeInTheDocument();
    });
  });
});