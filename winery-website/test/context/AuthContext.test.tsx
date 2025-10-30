// Unit tests for AuthContext

import React, { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Test component that uses auth context
function TestComponent() {
  const { user, loading, error, login, register, logout, clearError } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.name : 'no-user'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password123' })}>
        Login
      </button>
      <button onClick={() => register({ name: 'Test User', email: 'test@example.com', password: 'password123' })}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
}

function renderWithProvider(children: ReactNode) {
  return render(
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide initial state', async () => {
    renderWithProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
    
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  it('should load user from localStorage on mount', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    const mockToken = 'valid-token';
    
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'auth_token') return mockToken;
      if (key === 'user_data') return JSON.stringify(mockUser);
      return null;
    });

    // Mock token validation (assume it's valid)
    vi.mock('../../utils/auth', () => ({
      isTokenExpired: vi.fn().mockReturnValue(false),
    }));

    renderWithProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });
  });

  it('should handle successful login', async () => {
    const mockResponse = {
      success: true,
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'customer',
          createdAt: new Date(),
        },
        token: 'auth-token',
        expiresAt: new Date(),
      },
    };

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    renderWithProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    act(() => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', 'auth-token');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_data', expect.any(String));
  });

  it('should handle login error', async () => {
    const mockResponse = {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    };

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    renderWithProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    // Handle the expected error
    await act(async () => {
      try {
        screen.getByText('Login').click();
        // Wait a bit for the async operation to complete
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        // Expected error, ignore
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid email or password');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('should handle successful registration', async () => {
    const mockResponse = {
      success: true,
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'customer',
          createdAt: new Date(),
        },
        token: 'auth-token',
        expiresAt: new Date(),
      },
    };

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    renderWithProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    act(() => {
      screen.getByText('Register').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', 'auth-token');
  });

  it('should handle logout', async () => {
    // Set up initial logged-in state
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'auth_token') return 'valid-token';
      if (key === 'user_data') return JSON.stringify(mockUser);
      return null;
    });

    renderWithProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    act(() => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_data');
  });

  it('should clear error', async () => {
    // First trigger an error
    const mockResponse = {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    };

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    renderWithProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    // Handle the expected error
    await act(async () => {
      try {
        screen.getByText('Login').click();
        // Wait a bit for the async operation to complete
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        // Expected error, ignore
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid email or password');
    });

    // Clear the error
    act(() => {
      screen.getByText('Clear Error').click();
    });

    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  it('should throw error when used outside provider', () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });
});