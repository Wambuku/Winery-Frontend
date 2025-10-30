import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WineCarousel from '../../../components/wine/WineCarousel';
import { Wine } from '../../../types';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockWines: Wine[] = [
  {
    id: '1',
    name: 'Château Margaux 2015',
    description: 'A prestigious Bordeaux wine with exceptional complexity and elegance.',
    price: 45000,
    image: '/images/wine1.jpg',
    ingredients: ['Cabernet Sauvignon'],
    color: 'red',
    history: 'Historic wine',
    vintage: 2015,
    region: 'Bordeaux, France',
    alcoholContent: 13.5,
    category: 'featured',
    inStock: true,
    stockQuantity: 12,
  },
  {
    id: '2',
    name: 'Dom Pérignon 2012',
    description: 'Exceptional champagne with delicate bubbles and complex flavors.',
    price: 35000,
    image: '/images/wine2.jpg',
    ingredients: ['Chardonnay', 'Pinot Noir'],
    color: 'white',
    history: 'Legendary champagne',
    vintage: 2012,
    region: 'Champagne, France',
    alcoholContent: 12.5,
    category: 'featured',
    inStock: true,
    stockQuantity: 8,
  },
  {
    id: '3',
    name: 'Barolo Brunate 2018',
    description: 'Powerful Italian red wine with intense tannins and rich flavors.',
    price: 28000,
    image: '/images/wine3.jpg',
    ingredients: ['Nebbiolo'],
    color: 'red',
    history: 'Traditional Piedmont wine',
    vintage: 2018,
    region: 'Piedmont, Italy',
    alcoholContent: 14.0,
    category: 'featured',
    inStock: false,
    stockQuantity: 0,
  },
];

describe('WineCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the first wine by default', () => {
    render(<WineCarousel wines={mockWines} />);
    
    expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
    expect(screen.getByText('Bordeaux, France • 2015')).toBeInTheDocument();
    expect(screen.getByText('KSh 45,000')).toBeInTheDocument();
    expect(screen.getByText('Featured Wine')).toBeInTheDocument();
  });

  it('displays wine images correctly', () => {
    render(<WineCarousel wines={mockWines} />);
    
    // Featured image (desktop view)
    const images = screen.getAllByAltText('Château Margaux 2015');
    expect(images).toHaveLength(2); // Background and featured image
    expect(images[0]).toHaveAttribute('src', '/images/wine1.jpg');
    expect(images[1]).toHaveAttribute('src', '/images/wine1.jpg');
  });

  it('shows navigation arrows when multiple wines are present', () => {
    render(<WineCarousel wines={mockWines} />);
    
    const prevButton = screen.getByRole('button', { name: /previous wine/i });
    const nextButton = screen.getByRole('button', { name: /next wine/i });
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it('does not show navigation arrows for single wine', () => {
    render(<WineCarousel wines={[mockWines[0]]} />);
    
    expect(screen.queryByRole('button', { name: /previous wine/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next wine/i })).not.toBeInTheDocument();
  });

  it('navigates to next wine when next button is clicked', () => {
    render(<WineCarousel wines={mockWines} />);
    
    const nextButton = screen.getByRole('button', { name: /next wine/i });
    fireEvent.click(nextButton);
    
    expect(screen.getByText('Dom Pérignon 2012')).toBeInTheDocument();
    expect(screen.getByText('Champagne, France • 2012')).toBeInTheDocument();
  });

  it('navigates to previous wine when previous button is clicked', () => {
    render(<WineCarousel wines={mockWines} />);
    
    // First go to next wine
    const nextButton = screen.getByRole('button', { name: /next wine/i });
    fireEvent.click(nextButton);
    
    // Then go back to previous
    const prevButton = screen.getByRole('button', { name: /previous wine/i });
    fireEvent.click(prevButton);
    
    expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
  });

  it('wraps around to first wine when next is clicked on last wine', () => {
    render(<WineCarousel wines={mockWines} />);
    
    const nextButton = screen.getByRole('button', { name: /next wine/i });
    
    // Click next twice to get to last wine
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    expect(screen.getByText('Barolo Brunate 2018')).toBeInTheDocument();
    
    // Click next again to wrap to first
    fireEvent.click(nextButton);
    expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
  });

  it('wraps around to last wine when previous is clicked on first wine', () => {
    render(<WineCarousel wines={mockWines} />);
    
    const prevButton = screen.getByRole('button', { name: /previous wine/i });
    fireEvent.click(prevButton);
    
    expect(screen.getByText('Barolo Brunate 2018')).toBeInTheDocument();
  });

  it('shows dot indicators for multiple wines', () => {
    render(<WineCarousel wines={mockWines} />);
    
    const dots = screen.getAllByRole('button').filter(button => 
      button.className.includes('rounded-full') && button.className.includes('w-3')
    );
    expect(dots).toHaveLength(3);
  });

  it('navigates to specific wine when dot is clicked', () => {
    render(<WineCarousel wines={mockWines} />);
    
    const thirdDot = screen.getByRole('button', { name: /go to wine 3/i });
    fireEvent.click(thirdDot);
    expect(screen.getByText('Barolo Brunate 2018')).toBeInTheDocument();
  });

  it('shows wine counter', () => {
    render(<WineCarousel wines={mockWines} />);
    
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('updates counter when navigating', () => {
    render(<WineCarousel wines={mockWines} />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('shows View Details and Add to Cart buttons for in-stock wines', () => {
    render(<WineCarousel wines={mockWines} />);
    
    expect(screen.getByText('View Details')).toBeInTheDocument();
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('does not show Add to Cart button for out-of-stock wines', () => {
    render(<WineCarousel wines={mockWines} />);
    
    // Navigate to out-of-stock wine
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    
    expect(screen.getByText('View Details')).toBeInTheDocument();
    expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument();
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('calls onWineSelect when View Details is clicked', () => {
    const mockOnWineSelect = vi.fn();
    render(<WineCarousel wines={mockWines} onWineSelect={mockOnWineSelect} />);
    
    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);
    
    expect(mockOnWineSelect).toHaveBeenCalledWith(mockWines[0]);
  });

  it('calls onAddToCart when Add to Cart is clicked', () => {
    const mockOnAddToCart = vi.fn();
    render(<WineCarousel wines={mockWines} onAddToCart={mockOnAddToCart} />);
    
    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);
    
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockWines[0]);
  });

  it('pauses auto-play on hover', () => {
    render(<WineCarousel wines={mockWines} autoPlayInterval={1000} />);
    
    const carousel = screen.getByText('Château Margaux 2015').closest('div')!;
    
    // Hover over carousel
    fireEvent.mouseEnter(carousel);
    
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    
    // Should still be on first wine
    expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
  });

  it('shows empty state when no wines are provided', () => {
    render(<WineCarousel wines={[]} />);
    
    expect(screen.getByText('No featured wines available')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <WineCarousel wines={mockWines} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('disables auto-play when autoPlay is false', () => {
    render(<WineCarousel wines={mockWines} autoPlay={false} autoPlayInterval={1000} />);
    
    expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
    
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    
    // Should still be on first wine
    expect(screen.getByText('Château Margaux 2015')).toBeInTheDocument();
  });
});