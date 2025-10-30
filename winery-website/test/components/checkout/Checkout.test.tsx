// Integration tests for checkout component

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import Checkout from '../../../components/checkout/Checkout';
import { CartProvider } from '../../../context/CartContext';
import { AuthProvider } from '../../../context/AuthContext';
import { Wine, User } from '../../../types';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
  push: mockPush,
});

// Mock wine data
const mockWine: Wine = {
  id: '1',
  name: 'Test Wine',
  description: 'A test wine',
  price: 1500,
  image: '/test-wine.jpg',
  ingredients: ['Grapes'],
  color: 'Red',
  history: 'Test history',
  vintage: 2020,
  region: 'Test Region',
  alcoholContent: 12.5,
  category: 'Red Wine',
  inStock: true,
  stockQuantity: 10,
};

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'customer',
  createdAt: new Date(),
};

// Mock cart context with items
const MockCartProvider = ({ children }: { children: React.ReactNode }) => {
  const mockCartValue = {
    items: [{ wine: mockWine, quantity: 2 }],
    total: 3000,
    itemCount: 2,
    addItem: jest.fn(),
    removeItem: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    getItemQuantity: jest.fn(),
  };

  return (
    <div data-testid="mock-cart-provider">
      {React.cloneElement(children as React.ReactElement, { mockCartValue })}
    </div>
  );
};

// Mock auth context with user
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockAuthValue = {
    user: mockUser,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    isLoading: false,
  };

  return (
    <div data-testid="mock-auth-provider">
      {React.cloneElement(children as React.ReactElement, { mockAuthValue })}
    </div>
  );
};

const renderCheckout = () => {
  return render(
    <MockAuthProvider>
      <MockCartProvider>
        <Checkout />
      </MockCartProvider>
    </MockAuthProvider>
  );
};

describe('Checkout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('renders checkout stepper and shipping form initially', () => {
    renderCheckout();
    
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Shipping Information')).toBeInTheDocument();
  });

  it('validates shipping form fields', async () => {
    renderCheckout();
    
    const continueButton = screen.getByText('Continue to Payment');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('progresses to payment step after valid shipping info', async () => {
    renderCheckout();
    
    // Fill shipping form
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '+254712345678' },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: '123 Test Street' },
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: 'Nairobi' },
    });
    fireEvent.change(screen.getByLabelText(/postal code/i), {
      target: { value: '00100' },
    });

    const continueButton = screen.getByText('Continue to Payment');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
      expect(screen.getByText('M-Pesa')).toBeInTheDocument();
    });
  });

  it('handles M-Pesa payment selection and validation', async () => {
    renderCheckout();
    
    // Navigate to payment step (assuming shipping is filled)
    // ... (fill shipping form as above)
    
    // Select M-Pesa payment method
    const mpesaRadio = screen.getByDisplayValue('mpesa');
    fireEvent.click(mpesaRadio);

    // Try to submit without phone number
    const completeOrderButton = screen.getByText('Complete Order');
    fireEvent.click(completeOrderButton);

    await waitFor(() => {
      expect(screen.getByText('M-Pesa phone number is required')).toBeInTheDocument();
    });

    // Fill phone number
    const phoneInput = screen.getByLabelText(/m-pesa phone number/i);
    fireEvent.change(phoneInput, { target: { value: '+254712345678' } });

    expect(phoneInput).toHaveValue('+254712345678');
  });

  it('processes order creation and payment initiation', async () => {
    // Mock successful API responses
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { orderId: 'order_123', orderNumber: 'WO-123456-ABC' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { checkoutRequestId: 'checkout_123' },
        }),
      });

    renderCheckout();
    
    // Fill and submit shipping form
    // ... (fill shipping form)
    
    // Fill and submit payment form
    const mpesaRadio = screen.getByDisplayValue('mpesa');
    fireEvent.click(mpesaRadio);
    
    const phoneInput = screen.getByLabelText(/m-pesa phone number/i);
    fireEvent.change(phoneInput, { target: { value: '+254712345678' } });

    const completeOrderButton = screen.getByText('Complete Order');
    fireEvent.click(completeOrderButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/orders/create', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/payments/mpesa/initiate', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
    });
  });

  it('handles payment errors gracefully', async () => {
    // Mock failed API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: 'Payment failed' },
      }),
    });

    renderCheckout();
    
    // ... (fill forms and submit)
    
    await waitFor(() => {
      expect(screen.getByText(/payment failed/i)).toBeInTheDocument();
    });
  });

  it('displays order confirmation after successful payment', async () => {
    // Mock successful responses
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { orderId: 'order_123', orderNumber: 'WO-123456-ABC' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { checkoutRequestId: 'checkout_123' },
        }),
      });

    renderCheckout();
    
    // ... (complete checkout flow)
    
    await waitFor(() => {
      expect(screen.getByText('Order Confirmed!')).toBeInTheDocument();
      expect(screen.getByText('Thank you for your purchase')).toBeInTheDocument();
    });
  });

  it('redirects to login if user not authenticated', () => {
    // Mock no user
    const MockAuthProviderNoUser = ({ children }: { children: React.ReactNode }) => {
      const mockAuthValue = {
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        isLoading: false,
      };

      return (
        <div data-testid="mock-auth-provider">
          {React.cloneElement(children as React.ReactElement, { mockAuthValue })}
        </div>
      );
    };

    render(
      <MockAuthProviderNoUser>
        <MockCartProvider>
          <Checkout />
        </MockCartProvider>
      </MockAuthProviderNoUser>
    );

    expect(mockPush).toHaveBeenCalledWith('/login?redirect=/checkout');
  });

  it('redirects to home if cart is empty', () => {
    // Mock empty cart
    const MockEmptyCartProvider = ({ children }: { children: React.ReactNode }) => {
      const mockCartValue = {
        items: [],
        total: 0,
        itemCount: 0,
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getItemQuantity: jest.fn(),
      };

      return (
        <div data-testid="mock-cart-provider">
          {React.cloneElement(children as React.ReactElement, { mockCartValue })}
        </div>
      );
    };

    render(
      <MockAuthProvider>
        <MockEmptyCartProvider>
          <Checkout />
        </MockEmptyCartProvider>
      </MockAuthProvider>
    );

    expect(mockPush).toHaveBeenCalledWith('/');
  });
});