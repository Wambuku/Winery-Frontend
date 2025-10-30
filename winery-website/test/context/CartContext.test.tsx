// Unit tests for CartContext operations

import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '../../context/CartContext';
import { Wine } from '../../types';

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

// Test component to access cart context
function TestComponent() {
  const cart = useCart();
  
  return (
    <div>
      <div data-testid="item-count">{cart.itemCount}</div>
      <div data-testid="total">{cart.total}</div>
      <div data-testid="items-length">{cart.items.length}</div>
      <button 
        data-testid="add-item" 
        onClick={() => cart.addItem(mockWine, 2)}
      >
        Add Item
      </button>
      <button 
        data-testid="remove-item" 
        onClick={() => cart.removeItem(mockWine.id)}
      >
        Remove Item
      </button>
      <button 
        data-testid="update-quantity" 
        onClick={() => cart.updateQuantity(mockWine.id, 5)}
      >
        Update Quantity
      </button>
      <button 
        data-testid="clear-cart" 
        onClick={() => cart.clearCart()}
      >
        Clear Cart
      </button>
      <div data-testid="item-quantity">
        {cart.getItemQuantity(mockWine.id)}
      </div>
    </div>
  );
}

const mockWine: Wine = {
  id: '1',
  name: 'Test Wine',
  description: 'A test wine',
  price: 1000,
  image: '/test-wine.jpg',
  ingredients: ['grapes'],
  color: 'red',
  history: 'Test history',
  vintage: 2020,
  region: 'Test Region',
  alcoholContent: 12.5,
  category: 'red',
  inStock: true,
  stockQuantity: 10,
};

const mockWine2: Wine = {
  ...mockWine,
  id: '2',
  name: 'Test Wine 2',
  price: 1500,
};

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should provide initial empty cart state', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
    expect(screen.getByTestId('items-length')).toHaveTextContent('0');
  });

  it('should add items to cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('add-item'));
    });

    expect(screen.getByTestId('item-count')).toHaveTextContent('2');
    expect(screen.getByTestId('total')).toHaveTextContent('2000');
    expect(screen.getByTestId('items-length')).toHaveTextContent('1');
    expect(screen.getByTestId('item-quantity')).toHaveTextContent('2');
  });

  it('should update quantity when adding existing item', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add item twice
    act(() => {
      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('add-item'));
    });

    expect(screen.getByTestId('item-count')).toHaveTextContent('4');
    expect(screen.getByTestId('total')).toHaveTextContent('4000');
    expect(screen.getByTestId('items-length')).toHaveTextContent('1');
    expect(screen.getByTestId('item-quantity')).toHaveTextContent('4');
  });

  it('should remove items from cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add then remove item
    act(() => {
      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('remove-item'));
    });

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
    expect(screen.getByTestId('items-length')).toHaveTextContent('0');
    expect(screen.getByTestId('item-quantity')).toHaveTextContent('0');
  });

  it('should update item quantity', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add item then update quantity
    act(() => {
      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('update-quantity'));
    });

    expect(screen.getByTestId('item-count')).toHaveTextContent('5');
    expect(screen.getByTestId('total')).toHaveTextContent('5000');
    expect(screen.getByTestId('item-quantity')).toHaveTextContent('5');
  });

  it('should remove item when quantity updated to 0', () => {
    function TestUpdateToZero() {
      const cart = useCart();
      
      return (
        <div>
          <div data-testid="items-length">{cart.items.length}</div>
          <button 
            data-testid="add-item" 
            onClick={() => cart.addItem(mockWine, 2)}
          >
            Add Item
          </button>
          <button 
            data-testid="update-to-zero" 
            onClick={() => cart.updateQuantity(mockWine.id, 0)}
          >
            Update to Zero
          </button>
        </div>
      );
    }

    render(
      <CartProvider>
        <TestUpdateToZero />
      </CartProvider>
    );

    // Add item then update quantity to 0
    act(() => {
      fireEvent.click(screen.getByTestId('add-item'));
      fireEvent.click(screen.getByTestId('update-to-zero'));
    });

    expect(screen.getByTestId('items-length')).toHaveTextContent('0');
  });

  it('should clear entire cart', () => {
    function TestClearCart() {
      const cart = useCart();
      
      return (
        <div>
          <div data-testid="item-count">{cart.itemCount}</div>
          <div data-testid="total">{cart.total}</div>
          <button 
            data-testid="add-item1" 
            onClick={() => cart.addItem(mockWine, 2)}
          >
            Add Item 1
          </button>
          <button 
            data-testid="add-item2" 
            onClick={() => cart.addItem(mockWine2, 1)}
          >
            Add Item 2
          </button>
          <button 
            data-testid="clear-cart" 
            onClick={() => cart.clearCart()}
          >
            Clear Cart
          </button>
        </div>
      );
    }

    render(
      <CartProvider>
        <TestClearCart />
      </CartProvider>
    );

    // Add multiple items then clear
    act(() => {
      fireEvent.click(screen.getByTestId('add-item1'));
      fireEvent.click(screen.getByTestId('add-item2'));
      fireEvent.click(screen.getByTestId('clear-cart'));
    });

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
  });

  it('should calculate totals correctly with multiple items', () => {
    function TestMultipleItems() {
      const cart = useCart();
      
      return (
        <div>
          <div data-testid="item-count">{cart.itemCount}</div>
          <div data-testid="total">{cart.total}</div>
          <button 
            data-testid="add-item1" 
            onClick={() => cart.addItem(mockWine, 2)}
          >
            Add Item 1
          </button>
          <button 
            data-testid="add-item2" 
            onClick={() => cart.addItem(mockWine2, 3)}
          >
            Add Item 2
          </button>
        </div>
      );
    }

    render(
      <CartProvider>
        <TestMultipleItems />
      </CartProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('add-item1')); // 2 × 1000 = 2000
      fireEvent.click(screen.getByTestId('add-item2')); // 3 × 1500 = 4500
    });

    expect(screen.getByTestId('item-count')).toHaveTextContent('5');
    expect(screen.getByTestId('total')).toHaveTextContent('6500');
  });

  it('should load cart from localStorage on mount', () => {
    const savedCart = [
      { wine: mockWine, quantity: 2 },
      { wine: mockWine2, quantity: 1 },
    ];
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedCart));

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('item-count')).toHaveTextContent('3');
    expect(screen.getByTestId('total')).toHaveTextContent('3500');
    expect(screen.getByTestId('items-length')).toHaveTextContent('2');
  });

  it('should save cart to localStorage when items change', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('add-item'));
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'shopping_cart',
      JSON.stringify([{ wine: mockWine, quantity: 2 }])
    );
  });

  it('should handle localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error loading cart from localStorage:',
      expect.any(Error)
    );
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('shopping_cart');

    consoleSpy.mockRestore();
  });

  it('should throw error when useCart is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useCart must be used within a CartProvider');

    consoleSpy.mockRestore();
  });

  it('should not add items with zero or negative quantity', () => {
    function TestInvalidQuantity() {
      const cart = useCart();
      
      return (
        <div>
          <div data-testid="item-count">{cart.itemCount}</div>
          <button 
            data-testid="add-zero" 
            onClick={() => cart.addItem(mockWine, 0)}
          >
            Add Zero
          </button>
          <button 
            data-testid="add-negative" 
            onClick={() => cart.addItem(mockWine, -1)}
          >
            Add Negative
          </button>
        </div>
      );
    }

    render(
      <CartProvider>
        <TestInvalidQuantity />
      </CartProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('add-zero'));
      fireEvent.click(screen.getByTestId('add-negative'));
    });

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
  });
});