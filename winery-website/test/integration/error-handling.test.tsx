import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import ToastProvider, { useToast } from '../../components/common/ToastContainer';
import OfflineIndicator from '../../components/common/OfflineIndicator';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

// Mock component that can throw errors
const TestComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  const { showError, showSuccess } = useToast();
  
  if (shouldThrow) {
    throw new Error('Test error for error boundary');
  }
  
  return (
    <div>
      <button onClick={() => showError('Test error message')}>Show Error Toast</button>
      <button onClick={() => showSuccess('Test success message')}>Show Success Toast</button>
      <span>Component loaded successfully</span>
    </div>
  );
};

// Mock component that uses online status
const OnlineStatusComponent: React.FC = () => {
  const { isOnline, wasOffline } = useOnlineStatus();
  
  return (
    <div>
      <span>Status: {isOnline ? 'Online' : 'Offline'}</span>
      <span>Was offline: {wasOffline ? 'Yes' : 'No'}</span>
    </div>
  );
};

describe('Error Handling Integration', () => {
  it('integrates error boundary with toast notifications', async () => {
    render(
      <ErrorBoundary>
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      </ErrorBoundary>
    );

    expect(screen.getByText('Component loaded successfully')).toBeInTheDocument();

    // Test toast notifications
    fireEvent.click(screen.getByText('Show Error Toast'));
    
    await waitFor(() => {
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Show Success Toast'));
    
    await waitFor(() => {
      expect(screen.getByText('Test success message')).toBeInTheDocument();
    });
  });

  it('shows error boundary when component throws', () => {
    // Mock console.error to avoid noise in tests
    const originalError = console.error;
    console.error = vi.fn();

    render(
      <ErrorBoundary>
        <ToastProvider>
          <TestComponent shouldThrow />
        </ToastProvider>
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.queryByText('Component loaded successfully')).not.toBeInTheDocument();

    console.error = originalError;
  });

  it('integrates offline indicator with online status hook', () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    render(
      <div>
        <OfflineIndicator />
        <OnlineStatusComponent />
      </div>
    );

    expect(screen.getByText('Status: Online')).toBeInTheDocument();
    expect(screen.getByText('Was offline: No')).toBeInTheDocument();
  });

  it('handles network state changes', () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    render(
      <div>
        <OfflineIndicator />
        <OnlineStatusComponent />
      </div>
    );

    // Initially online
    expect(screen.getByText('Status: Online')).toBeInTheDocument();

    // Simulate going offline
    (navigator as any).onLine = false;
    fireEvent(window, new Event('offline'));

    expect(screen.getByText('Status: Offline')).toBeInTheDocument();
    expect(screen.getByText('Was offline: Yes')).toBeInTheDocument();

    // Simulate coming back online
    (navigator as any).onLine = true;
    fireEvent(window, new Event('online'));

    expect(screen.getByText('Status: Online')).toBeInTheDocument();
    expect(screen.getByText('Was offline: No')).toBeInTheDocument();
  });

  it('provides comprehensive error handling stack', async () => {
    const mockConsoleError = vi.fn();
    const originalError = console.error;
    console.error = mockConsoleError;

    const { rerender } = render(
      <ErrorBoundary>
        <ToastProvider>
          <OfflineIndicator />
          <TestComponent />
        </ToastProvider>
      </ErrorBoundary>
    );

    // Initially everything works
    expect(screen.getByText('Component loaded successfully')).toBeInTheDocument();

    // Test error toast
    fireEvent.click(screen.getByText('Show Error Toast'));
    
    await waitFor(() => {
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    // Test component error (triggers error boundary)
    rerender(
      <ErrorBoundary>
        <ToastProvider>
          <OfflineIndicator />
          <TestComponent shouldThrow />
        </ToastProvider>
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(mockConsoleError).toHaveBeenCalled();

    console.error = originalError;
  });
});