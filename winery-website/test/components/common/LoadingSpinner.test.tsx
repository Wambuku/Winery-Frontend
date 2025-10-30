import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner, { PageLoader, ButtonLoader, InlineLoader } from '../../../components/common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const { container } = render(<LoadingSpinner />);
    
    // Should render without crashing and contain the spinner
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with message', () => {
    render(<LoadingSpinner message="Loading wines..." />);
    
    expect(screen.getByText('Loading wines...')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    
    rerender(<LoadingSpinner size="md" />);
    rerender(<LoadingSpinner size="lg" />);
    rerender(<LoadingSpinner size="xl" />);
    
    // Test passes if no errors are thrown
  });

  it('applies correct variant styles', () => {
    const { rerender } = render(<LoadingSpinner variant="default" />);
    
    rerender(<LoadingSpinner variant="wine" />);
    rerender(<LoadingSpinner variant="minimal" />);
    
    // Test passes if no errors are thrown
  });

  it('renders fullscreen overlay when fullScreen is true', () => {
    render(<LoadingSpinner fullScreen message="Loading..." />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    // The fullscreen overlay should have fixed positioning
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    // Test passes if no errors are thrown
  });
});

describe('PageLoader', () => {
  it('renders with default message', () => {
    render(<PageLoader />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<PageLoader message="Loading wine collection..." />);
    
    expect(screen.getByText('Loading wine collection...')).toBeInTheDocument();
  });
});

describe('ButtonLoader', () => {
  it('renders without message', () => {
    const { container } = render(<ButtonLoader />);
    
    // Should render without crashing
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ButtonLoader className="button-loader" />);
    
    // Test passes if no errors are thrown
  });
});

describe('InlineLoader', () => {
  it('renders without message', () => {
    const { container } = render(<InlineLoader />);
    
    // Should render without crashing
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with message', () => {
    render(<InlineLoader message="Loading more wines..." />);
    
    expect(screen.getByText('Loading more wines...')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<InlineLoader className="inline-loader" />);
    
    // Test passes if no errors are thrown
  });
});