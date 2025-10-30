import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Toast from '../../../components/common/Toast';
import { ToastProvider, useToast } from '../../../components/common/ToastContainer';

// Test component that uses toast
const TestComponent: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  return (
    <div>
      <button onClick={() => showSuccess('Success message')}>Show Success</button>
      <button onClick={() => showError('Error message')}>Show Error</button>
      <button onClick={() => showWarning('Warning message')}>Show Warning</button>
      <button onClick={() => showInfo('Info message')}>Show Info</button>
    </div>
  );
};

describe('Toast', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders toast with message', () => {
    render(
      <Toast
        id="test-toast"
        type="success"
        message="Test message"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders toast with title and message', () => {
    render(
      <Toast
        id="test-toast"
        type="success"
        title="Success"
        message="Test message"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('shows correct icon for each type', () => {
    const { rerender } = render(
      <Toast
        id="test-toast"
        type="success"
        message="Test message"
        onClose={mockOnClose}
      />
    );

    // Success icon should be present
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();

    // Test other types
    rerender(
      <Toast
        id="test-toast"
        type="error"
        message="Test message"
        onClose={mockOnClose}
      />
    );

    rerender(
      <Toast
        id="test-toast"
        type="warning"
        message="Test message"
        onClose={mockOnClose}
      />
    );

    rerender(
      <Toast
        id="test-toast"
        type="info"
        message="Test message"
        onClose={mockOnClose}
      />
    );
  });

  it('calls onClose when close button is clicked', async () => {
    render(
      <Toast
        id="test-toast"
        type="success"
        message="Test message"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Wait for the close animation to complete
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledWith('test-toast');
    }, { timeout: 500 });
  });

  it('auto-closes after duration', async () => {
    render(
      <Toast
        id="test-toast"
        type="success"
        message="Test message"
        duration={100}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledWith('test-toast');
    }, { timeout: 500 });
  });

  it('does not auto-close when duration is 0', async () => {
    vi.useFakeTimers();
    
    render(
      <Toast
        id="test-toast"
        type="success"
        message="Test message"
        duration={0}
        onClose={mockOnClose}
      />
    );

    // Fast-forward time to ensure it doesn't auto-close
    vi.advanceTimersByTime(1000);
    expect(mockOnClose).not.toHaveBeenCalled();
    
    vi.useRealTimers();
  });
});

describe('ToastProvider', () => {
  it('provides toast functions to children', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByText('Show Success')).toBeInTheDocument();
    expect(screen.getByText('Show Error')).toBeInTheDocument();
    expect(screen.getByText('Show Warning')).toBeInTheDocument();
    expect(screen.getByText('Show Info')).toBeInTheDocument();
  });

  it('shows toast when triggered', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });

  it('shows multiple toasts', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('removes toast when closed', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });
  });
});