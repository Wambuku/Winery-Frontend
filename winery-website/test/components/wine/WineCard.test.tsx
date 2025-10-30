import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WineCard from '../../../components/wine/WineCard';
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
  description: 'A prestigious Bordeaux wine with exceptional complexity and elegance.',
  price: 45000,
  image: '/images/chateau-margaux.jpg',
  ingredients: ['Cabernet Sauvignon', 'Merlot', 'Petit Verdot', 'Cabernet Franc'],
  color: 'red',
  history: 'One of the most prestigious wines from Bordeaux, France.',
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

const mockLowStockWine: Wine = {
  ...mockWine,
  id: '3',
  stockQuantity: 3,
};

const mockFeaturedWine: Wine = {
  ...mockWine,
  id: '4',
  category: 'featured',
};

describe('WineCard', () => {
  it('renders wine information correctly', () => {
    render(<WineCard wine={mockWine} />);
    
    expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
    expect(screen.getByText('Bordeaux, France • 2015')).toBeInTheDocument();
    expect(screen.getByText('A prestigious Bordeaux wine with exceptional complexity and elegance.')).toBeInTheDocument();
    expect(screen.getByText('KSh 45,000')).toBeInTheDocument();
    expect(screen.getByText('13.5% ABV')).toBeInTheDocument();
    expect(screen.getByText('red')).toBeInTheDocument();
  });

  it('displays wine image with correct alt text', () => {
    render(<WineCard wine={mockWine} />);
    
    const image = screen.getByAltText('Château Margaux 2015');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/chateau-margaux.jpg');
  });

  it('shows add to cart button when wine is in stock', () => {
    render(<WineCard wine={mockWine} />);
    
    const addToCartButton = screen.getByText('Add to Cart');
    expect(addToCartButton).toBeInTheDocument();
    expect(addToCartButton).not.toBeDisabled();
  });

  it('does not show add to cart button when wine is out of stock', () => {
    render(<WineCard wine={mockOutOfStockWine} />);
    
    expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument();
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('shows low stock warning when stock is 5 or less', () => {
    render(<WineCard wine={mockLowStockWine} />);
    
    expect(screen.getByText('Only 3 left')).toBeInTheDocument();
  });

  it('shows featured badge for featured wines', () => {
    render(<WineCard wine={mockFeaturedWine} />);
    
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('calls onAddToCart when add to cart button is clicked', () => {
    const mockOnAddToCart = vi.fn();
    render(<WineCard wine={mockWine} onAddToCart={mockOnAddToCart} />);
    
    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);
    
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockWine);
  });

  it('calls onViewDetails when card is clicked', () => {
    const mockOnViewDetails = vi.fn();
    render(<WineCard wine={mockWine} onViewDetails={mockOnViewDetails} />);
    
    const card = screen.getByText('Château Margaux 2015').closest('div');
    fireEvent.click(card!);
    
    expect(mockOnViewDetails).toHaveBeenCalledWith(mockWine);
  });

  it('prevents event propagation when add to cart is clicked', () => {
    const mockOnAddToCart = vi.fn();
    const mockOnViewDetails = vi.fn();
    render(
      <WineCard 
        wine={mockWine} 
        onAddToCart={mockOnAddToCart} 
        onViewDetails={mockOnViewDetails} 
      />
    );
    
    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);
    
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockWine);
    expect(mockOnViewDetails).not.toHaveBeenCalled();
  });

  it('applies hover effects with correct CSS classes', () => {
    const { container } = render(<WineCard wine={mockWine} />);
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('group', 'hover:shadow-xl', 'transition-all', 'duration-300');
  });

  it('displays wine color indicator', () => {
    const { container } = render(<WineCard wine={mockWine} />);
    
    const colorIndicator = container.querySelector('span[style*="background-color: red"]');
    expect(colorIndicator).toBeInTheDocument();
  });

  it('formats price correctly with locale', () => {
    render(<WineCard wine={mockWine} />);
    
    expect(screen.getByText('KSh 45,000')).toBeInTheDocument();
  });
});