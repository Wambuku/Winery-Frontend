import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WineDetail from '../../../components/wine/WineDetail';
import { Wine } from '../../../types';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockWine: Wine = {
  id: '1',
  name: 'Château Margaux 2015',
  description: 'A prestigious Bordeaux wine with exceptional complexity and elegance, featuring notes of blackcurrant, cedar, and tobacco.',
  price: 45000,
  image: '/images/chateau-margaux.jpg',
  ingredients: ['Cabernet Sauvignon 85%', 'Merlot 10%', 'Petit Verdot 3%', 'Cabernet Franc 2%'],
  color: 'red',
  history: 'Château Margaux has been producing exceptional wines since the 12th century. This particular vintage represents the pinnacle of Bordeaux winemaking tradition.',
  vintage: 2015,
  region: 'Bordeaux, France',
  alcoholContent: 13.5,
  category: 'premium',
  inStock: true,
  stockQuantity: 12,
};

const mockOutOfStockWine: Wine = {
  ...mockWine,
  id: '2',
  inStock: false,
  stockQuantity: 0,
};

describe('WineDetail', () => {
  it('renders wine information correctly', () => {
    render(<WineDetail wine={mockWine} />);
    
    expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'red Wine';
    })).toBeInTheDocument();
    expect(screen.getByText('Bordeaux, France')).toBeInTheDocument();
    expect(screen.getAllByText('2015')).toHaveLength(2); // One in header, one in vintage section
    expect(screen.getByText('13.5% ABV')).toBeInTheDocument();
    expect(screen.getByText('KSh 45,000')).toBeInTheDocument();
    expect(screen.getByText('per bottle')).toBeInTheDocument();
  });

  it('displays wine image with correct alt text', () => {
    render(<WineDetail wine={mockWine} />);
    
    const image = screen.getByAltText('Château Margaux 2015');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/chateau-margaux.jpg');
  });

  it('shows low stock warning when stock is 5 or less', () => {
    const lowStockWine = { ...mockWine, stockQuantity: 3 };
    render(<WineDetail wine={lowStockWine} />);
    
    expect(screen.getByText('Only 3 bottles left in stock')).toBeInTheDocument();
  });

  it('renders tab navigation correctly', () => {
    render(<WineDetail wine={mockWine} />);
    
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Ingredients')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('shows description tab content by default', () => {
    render(<WineDetail wine={mockWine} />);
    
    expect(screen.getByText(/A prestigious Bordeaux wine with exceptional complexity/)).toBeInTheDocument();
    expect(screen.getByText('Category:')).toBeInTheDocument();
    expect(screen.getByText('premium')).toBeInTheDocument();
    expect(screen.getByText('Vintage:')).toBeInTheDocument();
  });

  it('switches to ingredients tab when clicked', () => {
    render(<WineDetail wine={mockWine} />);
    
    const ingredientsTab = screen.getByText('Ingredients');
    fireEvent.click(ingredientsTab);
    
    expect(screen.getByText('Wine Composition')).toBeInTheDocument();
    expect(screen.getByText('Cabernet Sauvignon 85%')).toBeInTheDocument();
    expect(screen.getByText('Merlot 10%')).toBeInTheDocument();
  });

  it('switches to history tab when clicked', () => {
    render(<WineDetail wine={mockWine} />);
    
    const historyTab = screen.getByText('History');
    fireEvent.click(historyTab);
    
    expect(screen.getByText('Wine Heritage')).toBeInTheDocument();
    expect(screen.getByText(/Château Margaux has been producing exceptional wines/)).toBeInTheDocument();
  });

  it('shows quantity selector for in-stock wines', () => {
    render(<WineDetail wine={mockWine} />);
    
    expect(screen.getByText('Quantity:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    
    const decreaseButton = screen.getByRole('button', { name: /decrease quantity/i });
    const increaseButton = screen.getByRole('button', { name: /increase quantity/i });
    
    expect(decreaseButton).toBeInTheDocument();
    expect(increaseButton).toBeInTheDocument();
  });

  it('updates quantity when buttons are clicked', () => {
    render(<WineDetail wine={mockWine} />);
    
    const quantityInput = screen.getByDisplayValue('1') as HTMLInputElement;
    const increaseButton = screen.getByRole('button', { name: /increase quantity/i });
    
    fireEvent.click(increaseButton);
    expect(quantityInput.value).toBe('2');
    
    const decreaseButton = screen.getByRole('button', { name: /decrease quantity/i });
    fireEvent.click(decreaseButton);
    expect(quantityInput.value).toBe('1');
  });

  it('prevents quantity from going below 1', () => {
    render(<WineDetail wine={mockWine} />);
    
    const decreaseButton = screen.getByRole('button', { name: /decrease quantity/i });
    expect(decreaseButton).toBeDisabled();
  });

  it('prevents quantity from exceeding stock', () => {
    const limitedStockWine = { ...mockWine, stockQuantity: 2 };
    render(<WineDetail wine={limitedStockWine} />);
    
    const quantityInput = screen.getByDisplayValue('1') as HTMLInputElement;
    const increaseButton = screen.getByRole('button', { name: /increase quantity/i });
    
    fireEvent.click(increaseButton);
    expect(quantityInput.value).toBe('2');
    
    fireEvent.click(increaseButton);
    expect(quantityInput.value).toBe('2'); // Should not exceed stock
    expect(increaseButton).toBeDisabled();
  });

  it('updates total price based on quantity', () => {
    render(<WineDetail wine={mockWine} />);
    
    const increaseButton = screen.getByRole('button', { name: /increase quantity/i });
    fireEvent.click(increaseButton);
    
    expect(screen.getByText('Add to Cart - KSh 90,000')).toBeInTheDocument();
  });

  it('calls onAddToCart with correct wine and quantity', () => {
    const mockOnAddToCart = vi.fn();
    render(<WineDetail wine={mockWine} onAddToCart={mockOnAddToCart} />);
    
    const increaseButton = screen.getByRole('button', { name: /increase quantity/i });
    fireEvent.click(increaseButton);
    
    const addToCartButton = screen.getByText(/Add to Cart/);
    fireEvent.click(addToCartButton);
    
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockWine, 2);
  });

  it('shows out of stock state for unavailable wines', () => {
    render(<WineDetail wine={mockOutOfStockWine} />);
    
    expect(screen.getAllByText('Out of Stock')).toHaveLength(2); // One in overlay, one in button
    expect(screen.queryByText('Quantity:')).not.toBeInTheDocument();
    
    const outOfStockButton = screen.getByRole('button', { name: /out of stock/i });
    expect(outOfStockButton).toBeDisabled();
  });

  it('shows close button when onClose is provided', () => {
    const mockOnClose = vi.fn();
    render(<WineDetail wine={mockWine} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close wine details/i });
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not show close button when onClose is not provided', () => {
    render(<WineDetail wine={mockWine} />);
    
    expect(screen.queryByRole('button', { name: /close wine details/i })).not.toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <WineDetail wine={mockWine} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows wishlist button', () => {
    render(<WineDetail wine={mockWine} />);
    
    const wishlistButton = screen.getByRole('button', { name: /add to wishlist/i });
    expect(wishlistButton).toBeInTheDocument();
  });
});