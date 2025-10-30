import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import POSSystem from '../../components/staff/POSSystem';
import { AuthContext } from '../../context/AuthContext';

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

const mockWines = [
  {
    id: '1',
    name: 'Château Margaux 2015',
    description: 'Premium Bordeaux wine',
    price: 15000,
    image: '/images/wine1.jpg',
    ingredients: ['Cabernet Sauvignon', 'Merlot'],
    color: 'Red',
    history: 'Historic vineyard',
    vintage: 2015,
    region: 'Bordeaux',
    alcoholContent: 13.5,
    category: 'red',
    inStock: true,
    stockQuantity: 10
  },
  {
    id: '2',
    name: 'Dom Pérignon 2012',
    description: 'Luxury champagne',
    price: 25000,
    image: '/images/wine2.jpg',
    ingredients: ['Chardonnay', 'Pinot Noir'],
    color: 'White',
    history: 'Famous champagne house',
    vintage: 2012,
    region: 'Champagne',
    alcoholContent: 12.5,
    category: 'sparkling',
    inStock: true,
    stockQuantity: 5
  }
];

const renderPOSSystem = () => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <POSSystem />
    </AuthContext.Provider>
  );
};

describe('POS System Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful wines fetch
    (global.fetch as any).mockImplementation((url: string) => {
      if (url === '/api/wines') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ wines: mockWines })
        });
      }
      
      if (url === '/api/staff/pos-transaction') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            transactionId: 'txn_123',
            receiptNumber: 'RCP-20241028-1234',
            timestamp: new Date().toISOString()
          })
        });
      }
      
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('should load wines and display them in the selection area', async () => {
    renderPOSSystem();

    await waitFor(() => {
      expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
      expect(screen.getByText('Dom Pérignon 2012')).toBeInTheDocument();
    });

    expect(screen.getByText('KSh 15,000')).toBeInTheDocument();
    expect(screen.getByText('KSh 25,000')).toBeInTheDocument();
  });

  it('should add wines to cart when clicked', async () => {
    renderPOSSystem();

    await waitFor(() => {
      expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
    });

    // Initially cart should be empty
    expect(screen.getByText('Cart is empty')).toBeInTheDocument();

    // Click on a wine to add it to cart
    fireEvent.click(screen.getByText('Château Margaux 2015'));

    await waitFor(() => {
      expect(screen.queryByText('Cart is empty')).not.toBeInTheDocument();
      expect(screen.getByText('KSh 15,000 each')).toBeInTheDocument();
    });

    // Check total is displayed
    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getByText('KSh 15,000')).toBeInTheDocument();
  });

  it('should update quantity when + and - buttons are clicked', async () => {
    renderPOSSystem();

    await waitFor(() => {
      expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
    });

    // Add wine to cart
    fireEvent.click(screen.getByText('Château Margaux 2015'));

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    // Click + button to increase quantity
    const plusButton = screen.getByText('+');
    fireEvent.click(plusButton);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    // Check total is updated
    expect(screen.getByText('KSh 30,000')).toBeInTheDocument();

    // Click - button to decrease quantity
    const minusButton = screen.getByText('-');
    fireEvent.click(minusButton);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    expect(screen.getByText('KSh 15,000')).toBeInTheDocument();
  });

  it('should remove item from cart when × button is clicked', async () => {
    renderPOSSystem();

    await waitFor(() => {
      expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
    });

    // Add wine to cart
    fireEvent.click(screen.getByText('Château Margaux 2015'));

    await waitFor(() => {
      expect(screen.queryByText('Cart is empty')).not.toBeInTheDocument();
    });

    // Click × button to remove item
    const removeButton = screen.getByText('×');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText('Cart is empty')).toBeInTheDocument();
    });
  });

  it('should filter wines by search term', async () => {
    renderPOSSystem();

    await waitFor(() => {
      expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
      expect(screen.getByText('Dom Pérignon 2012')).toBeInTheDocument();
    });

    // Search for "Château"
    const searchInput = screen.getByPlaceholderText('Search wines...');
    fireEvent.change(searchInput, { target: { value: 'Château' } });

    await waitFor(() => {
      expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
      expect(screen.queryByText('Dom Pérignon 2012')).not.toBeInTheDocument();
    });
  });

  it('should filter wines by category', async () => {
    renderPOSSystem();

    await waitFor(() => {
      expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
      expect(screen.getByText('Dom Pérignon 2012')).toBeInTheDocument();
    });

    // Filter by sparkling wine
    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'sparkling' } });

    await waitFor(() => {
      expect(screen.queryByText('Château Margaux 2015')).not.toBeInTheDocument();
      expect(screen.getByText('Dom Pérignon 2012')).toBeInTheDocument();
    });
  });

  it('should process cash transaction successfully', async () => {
    renderPOSSystem();

    await waitFor(() => {
      expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
    });

    // Add wine to cart
    fireEvent.click(screen.getByText('Château Margaux 2015'));

    await waitFor(() => {
      expect(screen.getByText('KSh 15,000')).toBeInTheDocument();
    });

    // Select cash payment method (should be default)
    const cashRadio = screen.getByDisplayValue('cash');
    expect(cashRadio).toBeChecked();

    // Enter cash received
    const cashInput = screen.getByPlaceholderText('Cash Received');
    fireEvent.change(cashInput, { target: { value: '20000' } });

    // Check change calculation
    await waitFor(() => {
      expect(screen.getByText('Change: KSh 5,000')).toBeInTheDocument();
    });

    // Complete transaction
    const completeButton = screen.getByText('Complete Transaction');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText('Transaction Complete')).toBeInTheDocument();
    });

    // Verify API was called
    expect(global.fetch).toHaveBeenCalledWith('/api/staff/pos-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"paymentMethod":"cash"')
    });
  });

  it('should process M-Pesa transaction successfully', async () => {
    renderPOSSystem();

    await waitFor(() => {
      expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
    });

    // Add wine to cart
    fireEvent.click(screen.getByText('Château Margaux 2015'));

    await waitFor(() => {
      expect(screen.getByText('KSh 15,000')).toBeInTheDocument();
    });

    // Select M-Pesa payment method
    const mpesaRadio = screen.getByDisplayValue('mpesa');
    fireEvent.click(mpesaRadio);

    expect(mpesaRadio).toBeChecked();

    // Complete transaction
    const completeButton = screen.getByText('Complete Transaction');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText('Transaction Complete')).toBeInTheDocument();
    });

    // Verify API was called
    expect(global.fetch).toHaveBeenCalledWith('/api/staff/pos-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"paymentMethod":"mpesa"')
    });
  });

  it('should display receipt after successful transaction', async () => {
    renderPOSSystem();

    await waitFor(() => {
      expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
    });

    // Add wine to cart
    fireEvent.click(screen.getByText('Château Margaux 2015'));

    // Enter cash received
    const cashInput = screen.getByPlaceholderText('Cash Received');
    fireEvent.change(cashInput, { target: { value: '20000' } });

    // Complete transaction
    const completeButton = screen.getByText('Complete Transaction');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText('Transaction Complete')).toBeInTheDocument();
      expect(screen.getByText('Wine Store Receipt')).toBeInTheDocument();
      expect(screen.getByText('Staff: John Staff')).toBeInTheDocument();
      expect(screen.getByText('Cash Received:')).toBeInTheDocument();
      expect(screen.getByText('Change:')).toBeInTheDocument();
    });

    // Check receipt buttons
    expect(screen.getByText('Print Receipt')).toBeInTheDocument();
    expect(screen.getByText('New Transaction')).toBeInTheDocument();
  });

  it('should clear cart when Clear Cart button is clicked', async () => {
    renderPOSSystem();

    await waitFor(() => {
      expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
    });

    // Add wine to cart
    fireEvent.click(screen.getByText('Château Margaux 2015'));

    await waitFor(() => {
      expect(screen.queryByText('Cart is empty')).not.toBeInTheDocument();
    });

    // Click Clear Cart button
    const clearButton = screen.getByText('Clear Cart');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText('Cart is empty')).toBeInTheDocument();
    });
  });

  it('should prevent transaction with empty cart', async () => {
    renderPOSSystem();

    // Try to complete transaction with empty cart
    const completeButton = screen.getByText('Complete Transaction');
    expect(completeButton).toBeDisabled();
  });

  it('should prevent cash transaction with insufficient cash', async () => {
    // Mock alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderPOSSystem();

    await waitFor(() => {
      expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
    });

    // Add wine to cart
    fireEvent.click(screen.getByText('Château Margaux 2015'));

    // Enter insufficient cash
    const cashInput = screen.getByPlaceholderText('Cash Received');
    fireEvent.change(cashInput, { target: { value: '10000' } });

    // Try to complete transaction
    const completeButton = screen.getByText('Complete Transaction');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Insufficient cash received');
    });

    alertSpy.mockRestore();
  });
});