import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TastingNotes from '../../../components/wine/TastingNotes';
import { Wine, TastingNote } from '../../../types';

const mockWine: Wine = {
  id: '1',
  name: 'Test Wine',
  description: 'A test wine',
  price: 2500,
  image: '/wine1.jpg',
  ingredients: ['Grape'],
  color: 'Red',
  history: 'Test history',
  vintage: 2020,
  region: 'Test Region',
  alcoholContent: 13,
  category: 'red',
  inStock: true,
  stockQuantity: 10
};

const mockTastingNotes: TastingNote[] = [
  {
    id: '1',
    wineId: '1',
    userId: 'user1',
    userName: 'John Doe',
    rating: 4,
    appearance: 'Deep ruby red',
    aroma: 'Blackberry and oak',
    taste: 'Rich and full-bodied',
    finish: 'Long and smooth',
    overallNotes: 'Excellent wine with great potential',
    createdAt: new Date('2023-01-01'),
    isVerifiedPurchase: true
  }
];

describe('TastingNotes Component', () => {
  it('renders tasting notes section', () => {
    render(<TastingNotes wine={mockWine} tastingNotes={mockTastingNotes} />);
    
    expect(screen.getByText('Tasting Notes & Reviews')).toBeInTheDocument();
    expect(screen.getByText('Add Tasting Note')).toBeInTheDocument();
  });

  it('displays existing tasting notes', () => {
    render(<TastingNotes wine={mockWine} tastingNotes={mockTastingNotes} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Excellent wine with great potential')).toBeInTheDocument();
    expect(screen.getByText('Verified Purchase')).toBeInTheDocument();
  });

  it('shows tasting profile chart', () => {
    render(<TastingNotes wine={mockWine} tastingNotes={mockTastingNotes} />);
    
    expect(screen.getByText('Tasting Profile')).toBeInTheDocument();
    expect(screen.getByText('Sweetness')).toBeInTheDocument();
    expect(screen.getByText('Acidity')).toBeInTheDocument();
  });

  it('opens tasting note form when button is clicked', () => {
    render(<TastingNotes wine={mockWine} tastingNotes={[]} />);
    
    fireEvent.click(screen.getByText('Add Tasting Note'));
    
    expect(screen.getByText('Add Your Tasting Note')).toBeInTheDocument();
    expect(screen.getByText('Overall Rating')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your overall impression and recommendations...')).toBeInTheDocument();
  });
});