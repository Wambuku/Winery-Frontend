// Unit tests for Cart component

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Cart from '../../../components/cart/Cart';
import { CartProvider, useCart } from '../../../context/CartContext';
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

const mockWine2: Wine = {
  ...mockWine,
  id: '2',
  name: 'Test Wine 2',
  price: 1500,
  vintage: 2019,
  region: 'Another Region',
};

function TestCartComponent({ initialCart = [] }: { initialCart?: any[] }) {
  const { addItem } = useCart();
  
  React.useEffect(() => {
    // Add initial items to cart
    initialCart.forEach(item => {
      addItem(item.wine, item.quantity);
    });
  }, [addItem, initialCart]);

  return <Cart />;
}

function CartWithProvider({ initialCart = [] }: { initialCart?: any[] }) {
  return (
    <CartProvider>
      <TestCartComponent initialCart={initialCart} />
    </CartProvider>
  );
}

describe('Cart Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should render empty cart message when no items', () => {
    render(<CartWithProvider />);

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Add some wines to get started!')).toBeInTheDocument();
  });

  it('should render cart items when items exist', () => {
    const initialCart = [
      { wine: mockWine, quantity: 2 },
      { wine: mockWine2, quantity: 1 },
    ];

    render(<CartWithProvider initialCart={initialCart} />);

    expect(screen.getByText('Shopping Cart (3 items)')).toBeInTheDocument();
    expect(screen.getByText('Test Wine')).toBeInTheDocument();
    expect(screen.getByText('Test Wine 2')).toBeInTheDocument();
    expect(screen.getByText('Total: KSh 3,500')).toBeInTheDocument();
  });

  it('should display correct item information', () => {
    const initialCart = [{ wine: mockWine, quantity: 2 }];

    render(<CartWithProvider initialCart={initialCart} />);

    expect(screen.getByText('Test Wine')).toBeInTheDocument();
    expect(screen.getByText('KSh 1,000')).toBeInTheDocument();
    expect(screen.getByText('2020 • Test Region')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByText('KSh 2,000')).toBeInTheDocument();
  });

  it('should update quantity when input changes', () => {
    const initialCart = [{ wine: mockWine, quantity: 2 }];

    render(<CartWithProvider initialCart={initialCart} />);

    const quantityInput = screen.getByDisplayValue('2');
    fireEvent.change(quantityInput, { target: { value: '5' } });

    // The component should update the quantity
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });

  it('should increment quantity when plus button clicked', () => {
    const initialCart = [{ wine: mockWine, quantity: 2 }];

    render(<CartWithProvider initialCart={initialCart} />);

    const incrementButton = screen.getByLabelText('Increase quantity');
    fireEvent.click(incrementButton);

    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  });

  it('should decrement quantity when minus button clicked', () => {
    const initialCart = [{ wine: mockWine, quantity: 3 }];

    render(<CartWithProvider initialCart={initialCart} />);

    const decrementButton = screen.getByLabelText('Decrease quantity');
    fireEvent.click(decrementButton);

    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('should disable decrement button when quantity is 1', () => {
    const initialCart = [{ wine: mockWine, quantity: 1 }];

    render(<CartWithProvider initialCart={initialCart} />);

    const decrementButton = screen.getByLabelText('Decrease quantity');
    expect(decrementButton).toBeDisabled();
  });

  it('should remove item when remove button clicked', () => {
    const initialCart = [
      { wine: mockWine, quantity: 2 },
      { wine: mockWine2, quantity: 1 },
    ];

    render(<CartWithProvider initialCart={initialCart} />);

    const removeButton = screen.getByLabelText('Remove Test Wine from cart');
    fireEvent.click(removeButton);

    expect(screen.queryByText('Test Wine')).not.toBeInTheDocument();
    expect(screen.getByText('Test Wine 2')).toBeInTheDocument();
    expect(screen.getByText('Shopping Cart (1 items)')).toBeInTheDocument();
  });

  it('should clear entire cart when clear button clicked', () => {
    const initialCart = [
      { wine: mockWine, quantity: 2 },
      { wine: mockWine2, quantity: 1 },
    ];

    render(<CartWithProvider initialCart={initialCart} />);

    const clearButton = screen.getByLabelText('Clear entire cart');
    fireEvent.click(clearButton);

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.queryByText('Test Wine')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Wine 2')).not.toBeInTheDocument();
  });

  it('should display correct total calculation', () => {
    const initialCart = [
      { wine: mockWine, quantity: 2 }, // 2 × 1000 = 2000
      { wine: mockWine2, quantity: 3 }, // 3 × 1500 = 4500
    ];

    render(<CartWithProvider initialCart={initialCart} />);

    expect(screen.getByText('Total: KSh 6,500')).toBeInTheDocument();
    expect(screen.getByText('Shopping Cart (5 items)')).toBeInTheDocument();
  });

  it('should render checkout button', () => {
    const initialCart = [{ wine: mockWine, quantity: 1 }];

    render(<CartWithProvider initialCart={initialCart} />);

    const checkoutButton = screen.getByText('Proceed to Checkout');
    expect(checkoutButton).toBeInTheDocument();
    expect(checkoutButton).toHaveClass('checkout-btn');
  });

  it('should handle invalid quantity input gracefully', () => {
    const initialCart = [{ wine: mockWine, quantity: 2 }];

    render(<CartWithProvider initialCart={initialCart} />);

    const quantityInput = screen.getByDisplayValue('2');
    
    // Try to enter invalid values
    fireEvent.change(quantityInput, { target: { value: 'abc' } });
    expect(screen.getByDisplayValue('2')).toBeInTheDocument(); // Should remain unchanged

    fireEvent.change(quantityInput, { target: { value: '-5' } });
    expect(screen.getByDisplayValue('2')).toBeInTheDocument(); // Should remain unchanged
  });

  it('should apply custom className', () => {
    const { container } = render(<CartWithProvider />);
    
    render(
      <CartProvider>
        <Cart className="custom-cart" />
      </CartProvider>
    );

    expect(container.querySelector('.custom-cart')).toBeInTheDocument();
  });

  it('should show item images with correct alt text', () => {
    const initialCart = [{ wine: mockWine, quantity: 1 }];

    render(<CartWithProvider initialCart={initialCart} />);

    const image = screen.getByAltText('Test Wine');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-wine.jpg');
  });

  it('should format prices with thousand separators', () => {
    const expensiveWine = {
      ...mockWine,
      price: 12500,
    };
    const initialCart = [{ wine: expensiveWine, quantity: 2 }];

    render(<CartWithProvider initialCart={initialCart} />);

    expect(screen.getByText('KSh 12,500')).toBeInTheDocument();
    expect(screen.getByText('KSh 25,000')).toBeInTheDocument();
    expect(screen.getByText('Total: KSh 25,000')).toBeInTheDocument();
  });

  it('should handle accessibility attributes correctly', () => {
    const initialCart = [{ wine: mockWine, quantity: 2 }];

    render(<CartWithProvider initialCart={initialCart} />);

    expect(screen.getByLabelText('Item quantity')).toBeInTheDocument();
    expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument();
    expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Test Wine from cart')).toBeInTheDocument();
    expect(screen.getByLabelText('Clear entire cart')).toBeInTheDocument();
  });
});