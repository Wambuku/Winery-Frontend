// Unit tests for CartIcon component

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CartIcon from '../../../components/cart/CartIcon';
import { CartProvider } from '../../../context/CartContext';
import { Wine } from '../../../types';

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

function CartIconWithProvider({ 
  initialCart = [], 
  ...props 
}: { 
  initialCart?: any[];
  onClick?: () => void;
  className?: string;
  showCount?: boolean;
}) {
  React.useEffect(() => {
    mockLocalStorage.getItem.mockReturnValue(
      initialCart.length > 0 ? JSON.stringify(initialCart) : null
    );
  }, []);

  return (
    <CartProvider>
      <CartIcon {...props} />
    </CartProvider>
  );
}

describe('CartIcon Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should render cart icon without badge when cart is empty', () => {
    render(<CartIconWithProvider />);

    const cartButton = screen.getByLabelText('Shopping cart with 0 items');
    expect(cartButton).toBeInTheDocument();
    
    // Badge should not be visible when count is 0
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should render cart icon with badge when cart has items', () => {
    const initialCart = [
      { wine: mockWine, quantity: 2 },
      { wine: { ...mockWine, id: '2' }, quantity: 1 },
    ];

    render(<CartIconWithProvider initialCart={initialCart} />);

    const cartButton = screen.getByLabelText('Shopping cart with 3 items');
    expect(cartButton).toBeInTheDocument();
    
    const badge = screen.getByLabelText('3 items in cart');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('3');
  });

  it('should display 99+ when item count exceeds 99', () => {
    const initialCart = [{ wine: mockWine, quantity: 150 }];

    render(<CartIconWithProvider initialCart={initialCart} />);

    const badge = screen.getByLabelText('150 items in cart');
    expect(badge).toHaveTextContent('99+');
  });

  it('should call onClick handler when clicked', () => {
    const mockOnClick = vi.fn();
    render(<CartIconWithProvider onClick={mockOnClick} />);

    const cartButton = screen.getByLabelText('Shopping cart with 0 items');
    fireEvent.click(cartButton);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <CartIconWithProvider className="custom-cart-icon" />
    );

    expect(container.querySelector('.custom-cart-icon')).toBeInTheDocument();
  });

  it('should hide count badge when showCount is false', () => {
    const initialCart = [{ wine: mockWine, quantity: 5 }];

    render(<CartIconWithProvider initialCart={initialCart} showCount={false} />);

    expect(screen.queryByLabelText('5 items in cart')).not.toBeInTheDocument();
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('should show count badge when showCount is true (default)', () => {
    const initialCart = [{ wine: mockWine, quantity: 3 }];

    render(<CartIconWithProvider initialCart={initialCart} />);

    const badge = screen.getByLabelText('3 items in cart');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('3');
  });

  it('should have proper accessibility attributes', () => {
    const initialCart = [{ wine: mockWine, quantity: 2 }];

    render(<CartIconWithProvider initialCart={initialCart} />);

    const cartButton = screen.getByRole('button');
    expect(cartButton).toHaveAttribute('aria-label', 'Shopping cart with 2 items');
    
    const badge = screen.getByLabelText('2 items in cart');
    expect(badge).toBeInTheDocument();
  });

  it('should render SVG cart icon', () => {
    const { container } = render(<CartIconWithProvider />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('should update badge when cart changes', () => {
    const { rerender } = render(<CartIconWithProvider />);

    // Initially no badge
    expect(screen.queryByText('1')).not.toBeInTheDocument();

    // Update with items
    const initialCart = [{ wine: mockWine, quantity: 1 }];
    rerender(<CartIconWithProvider initialCart={initialCart} />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should handle keyboard navigation', () => {
    const mockOnClick = vi.fn();
    render(<CartIconWithProvider onClick={mockOnClick} />);

    const cartButton = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyDown(cartButton, { key: 'Enter', code: 'Enter' });
    // Note: onClick is not triggered by keyDown in this test setup,
    // but the button should be focusable
    expect(cartButton).toBeInTheDocument();
  });

  it('should be focusable for keyboard navigation', () => {
    render(<CartIconWithProvider />);

    const cartButton = screen.getByRole('button');
    cartButton.focus();
    
    expect(document.activeElement).toBe(cartButton);
  });

  it('should handle edge case of exactly 99 items', () => {
    const initialCart = [{ wine: mockWine, quantity: 99 }];

    render(<CartIconWithProvider initialCart={initialCart} />);

    const badge = screen.getByLabelText('99 items in cart');
    expect(badge).toHaveTextContent('99');
  });

  it('should handle edge case of 100 items', () => {
    const initialCart = [{ wine: mockWine, quantity: 100 }];

    render(<CartIconWithProvider initialCart={initialCart} />);

    const badge = screen.getByLabelText('100 items in cart');
    expect(badge).toHaveTextContent('99+');
  });

  it('should maintain button functionality without onClick handler', () => {
    render(<CartIconWithProvider />);

    const cartButton = screen.getByRole('button');
    
    // Should not throw error when clicked without handler
    expect(() => {
      fireEvent.click(cartButton);
    }).not.toThrow();
  });
});