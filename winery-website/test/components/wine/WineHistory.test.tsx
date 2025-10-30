import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WineHistory from '../../../components/wine/WineHistory';
import { Wine } from '../../../types';

const mockWine: Wine = {
  id: '1',
  name: 'Château Margaux 2015',
  description: 'A prestigious Bordeaux wine',
  price: 15000,
  image: '/wine1.jpg',
  ingredients: ['Cabernet Sauvignon', 'Merlot', 'Petit Verdot'],
  color: 'Red',
  history: 'This exceptional wine comes from one of Bordeaux\'s most prestigious estates, established in the 16th century. The vineyard has been producing world-class wines for over 400 years, with a reputation for elegance and longevity.',
  vintage: 2015,
  region: 'Bordeaux',
  alcoholContent: 13.5,
  category: 'red',
  inStock: true,
  stockQuantity: 12
};

const mockWineWithoutHistory: Wine = {
  ...mockWine,
  history: ''
};

describe('WineHistory Component', () => {
  it('renders wine history when history is provided', () => {
    render(<WineHistory wine={mockWine} />);
    
    expect(screen.getByText('Wine History & Heritage')).toBeInTheDocument();
    expect(screen.getByText(/This exceptional wine comes from one of Bordeaux's most prestigious estates/)).toBeInTheDocument();
  });

  it('displays vintage information when vintage is provided', () => {
    render(<WineHistory wine={mockWine} />);
    
    expect(screen.getByText('Vintage Information')).toBeInTheDocument();
    expect(screen.getByText(/This exceptional wine was crafted in/)).toBeInTheDocument();
    expect(screen.getByText('2015')).toBeInTheDocument();
  });

  it('does not render when history is empty', () => {
    const { container } = render(<WineHistory wine={mockWineWithoutHistory} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className when provided', () => {
    const { container } = render(<WineHistory wine={mockWine} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('wine-history', 'custom-class');
  });

  it('handles wine without vintage gracefully', () => {
    const wineWithoutVintage = { ...mockWine, vintage: 0 };
    render(<WineHistory wine={wineWithoutVintage} />);
    
    expect(screen.getByText('Wine History & Heritage')).toBeInTheDocument();
    expect(screen.queryByText('Vintage Information')).not.toBeInTheDocument();
  });

  it('preserves line breaks in history text', () => {
    const wineWithMultilineHistory = {
      ...mockWine,
      history: 'First paragraph.\n\nSecond paragraph with more details.'
    };
    
    render(<WineHistory wine={wineWithMultilineHistory} />);
    
    const historyText = screen.getByText(/First paragraph/);
    expect(historyText).toHaveClass('whitespace-pre-line');
  });
});