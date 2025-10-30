import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { OrderHistory } from '../../../components/orders/OrderHistory';
import { useAuth } from '../../../context/AuthContext';

// Mock the auth context
vi.mock('../../../context/AuthContext');
const mockUseAuth = vi.mocked(useAuth);

// Mock fetch
global.fetch = vi.fn();
const mockFetch = vi.mocked(fetch);

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

describe('OrderHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  it('should display orders when loaded successfully', async () => {
    const mockOrders = [
      {
        id: 'order_123',
        userId: 'user_123',
        orderNumber: 'WO-123456-AB',
        items: [
          {
            wine: {
              id: '1',
              name: 'Test Wine',
              price: 1000,
              image: '/test-image.jpg',
              description: 'Test description',
              ingredients: ['Grape'],
              color: 'Red',
              history: 'Test history',
              vintage: 2020,
              region: 'Test Region',
              alcoholContent: 12,
              category: 'Red Wine',
              inStock: true,
              stockQuantity: 10,
            },
            quantity: 2,
          },
        ],
        total: 2000,
        paymentMethod: 'mpesa' as const,
        paymentStatus: 'completed' as const,
        orderStatus: 'completed' as const,
        createdAt: new Date('2024-01-15T10:30:00Z'),
      },
    ];

    mockUseAuth.mockReturnValue({
      user: {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        createdAt: new Date(),
      },
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockOrders,
      }),
    } as Response);

    render(<OrderHistory />);

    await waitFor(() => {
      expect(screen.getByText('Order History')).toBeInTheDocument();
      expect(screen.getByText('Order #WO-123456-AB')).toBeInTheDocument();
      expect(screen.getByText('Test Wine')).toBeInTheDocument();
    });
  });

  it('should display empty state when no orders exist', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        createdAt: new Date(),
      },
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    } as Response);

    render(<OrderHistory />);

    await waitFor(() => {
      expect(screen.getByText('No Orders Yet')).toBeInTheDocument();
      expect(screen.getByText(/You haven't placed any orders yet/)).toBeInTheDocument();
    });
  });

  it('should display error state when fetch fails', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        createdAt: new Date(),
      },
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<OrderHistory />);

    await waitFor(() => {
      expect(screen.getByText('Error Loading Orders')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should not fetch orders when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    render(<OrderHistory />);

    expect(mockFetch).not.toHaveBeenCalled();
  });
});