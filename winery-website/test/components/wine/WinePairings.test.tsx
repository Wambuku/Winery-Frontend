import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WinePairings from '../../../components/wine/WinePairings';
import { Wine } from '../../../types';

const mockRedWine: Wine = {
  id: '1',
  name: 'Cabernet Sauvignon',
  description: 'Full-bodied red wine',
  price: 2500,
  image: '/wine1.jpg',
  ingredients: ['Cabernet Sauvignon'],
  color: 'Red',
  history: 'Classic red wine',
  vintage: 2020,
  region: 'Bordeaux',
  alcoholContent: 14,
  category: 'red',
  inStock: true,
  stockQuantity: 10
};

const mockWhiteWine: Wine = {
  ...mockRedWine,
  color: 'White',
  name: 'Chardonnay'
};

describe('WinePairings Component', () => {
  it('renders pairing suggestions for red wine', () => {
    render(<WinePairings wine={mockRedWine} />);
    
    expect(screen.getByText('Perfect Pairings')).toBeInTheDocument();
    expect(screen.getByText('Main Courses')).toBeInTheDocument();
    expect(screen.getByText('Grilled ribeye steak')).toBeInTheDocument();
  });

  it('renders different pairings for white wine', () => {
    render(<WinePairings wine={mockWhiteWine} />);
    
    expect(screen.getByText('Seafood & Poultry')).toBeInTheDocument();
    expect(screen.getByText('Grilled salmon')).toBeInTheDocument();
  });

  it('includes pairing tip section', () => {
    render(<WinePairings wine={mockRedWine} />);
    
    expect(screen.getByText('Pairing Tip')).toBeInTheDocument();
    expect(screen.getByText(/When pairing wine with food/)).toBeInTheDocument();
  });
});