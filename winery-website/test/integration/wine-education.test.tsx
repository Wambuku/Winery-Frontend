import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WineDetail from '../../components/wine/WineDetail';
import { Wine, TastingNote } from '../../types';

const mockWine: Wine = {
  id: '1',
  name: 'Château Margaux 2015',
  description: 'A prestigious Bordeaux wine with exceptional complexity',
  price: 15000,
  image: '/wine1.jpg',
  ingredients: ['Cabernet Sauvignon 85%', 'Merlot 10%', 'Petit Verdot 3%', 'Cabernet Franc 2%'],
  color: 'Red',
  history: 'This exceptional wine comes from one of Bordeaux\'s most prestigious estates, established in the 16th century. The vineyard has been producing world-class wines for over 400 years, with a reputation for elegance and longevity that has made it one of the most sought-after wines in the world.',
  vintage: 2015,
  region: 'Bordeaux',
  alcoholContent: 13.5,
  category: 'red',
  inStock: true,
  stockQuantity: 12
};

const mockTastingNotes: TastingNote[] = [
  {
    id: '1',
    wineId: '1',
    userId: 'user1',
    userName: 'Wine Expert',
    rating: 5,
    appearance: 'Deep garnet red with purple highlights',
    aroma: 'Complex bouquet of blackcurrant, cedar, and subtle spice',
    taste: 'Full-bodied with silky tannins, dark fruit flavors, and mineral notes',
    finish: 'Long and elegant with lingering fruit and oak',
    overallNotes: 'An exceptional vintage that showcases the terroir beautifully. This wine has incredible aging potential and represents the pinnacle of Bordeaux winemaking.',
    createdAt: new Date('2023-06-15'),
    isVerifiedPurchase: true
  }
];

describe('Wine Education Integration', () => {
  it('displays comprehensive wine education across all tabs', () => {
    const mockAddToCart = vi.fn();
    const mockAddTastingNote = vi.fn();

    render(
      <WineDetail 
        wine={mockWine} 
        onAddToCart={mockAddToCart}
        tastingNotes={mockTastingNotes}
        onAddTastingNote={mockAddTastingNote}
      />
    );

    // Test History tab
    fireEvent.click(screen.getByText('History'));
    expect(screen.getByText('Wine History & Heritage')).toBeInTheDocument();
    expect(screen.getByText(/This exceptional wine comes from one of Bordeaux's most prestigious estates/)).toBeInTheDocument();
    expect(screen.getByText('Vintage Information')).toBeInTheDocument();

    // Test Pairings tab
    fireEvent.click(screen.getByText('Pairings'));
    expect(screen.getByText('Perfect Pairings')).toBeInTheDocument();
    expect(screen.getByText('Main Courses')).toBeInTheDocument();
    expect(screen.getByText('Grilled ribeye steak')).toBeInTheDocument();
    expect(screen.getByText('Pairing Tip')).toBeInTheDocument();

    // Test Tasting Notes tab
    fireEvent.click(screen.getByText('Tasting Notes'));
    expect(screen.getByText('Tasting Notes & Reviews')).toBeInTheDocument();
    expect(screen.getByText('Wine Expert')).toBeInTheDocument();
    expect(screen.getByText('Tasting Profile')).toBeInTheDocument();
    expect(screen.getByText(/An exceptional vintage that showcases the terroir beautifully/)).toBeInTheDocument();

    // Test Education tab
    fireEvent.click(screen.getByText('Learn More'));
    expect(screen.getByRole('heading', { name: 'Red Wine' })).toBeInTheDocument();
    expect(screen.getByText('Bordeaux, France')).toBeInTheDocument();
    expect(screen.getByText(/made from dark-colored grape varieties/)).toBeInTheDocument();
    expect(screen.getByText(/one of the world's most prestigious wine regions/)).toBeInTheDocument();
  });

  it('allows adding new tasting notes', () => {
    const mockAddToCart = vi.fn();
    const mockAddTastingNote = vi.fn();

    render(
      <WineDetail 
        wine={mockWine} 
        onAddToCart={mockAddToCart}
        tastingNotes={[]}
        onAddTastingNote={mockAddTastingNote}
      />
    );

    // Navigate to tasting notes tab
    fireEvent.click(screen.getByText('Tasting Notes'));
    
    // Open the form
    fireEvent.click(screen.getByText('Add Tasting Note'));
    
    // Fill out the form
    const overallNotesTextarea = screen.getByPlaceholderText('Your overall impression and recommendations...');
    fireEvent.change(overallNotesTextarea, { 
      target: { value: 'Excellent wine with great potential for aging' } 
    });

    const appearanceTextarea = screen.getByPlaceholderText('Color, clarity, viscosity...');
    fireEvent.change(appearanceTextarea, { 
      target: { value: 'Deep ruby red with excellent clarity' } 
    });

    // Submit the form
    fireEvent.click(screen.getByText('Submit Tasting Note'));

    // Verify the callback was called
    expect(mockAddTastingNote).toHaveBeenCalledWith({
      wineId: '1',
      userId: 'current-user',
      userName: 'Current User',
      isVerifiedPurchase: false,
      rating: 5,
      appearance: 'Deep ruby red with excellent clarity',
      aroma: '',
      taste: '',
      finish: '',
      overallNotes: 'Excellent wine with great potential for aging'
    });
  });

  it('displays appropriate educational content based on wine characteristics', () => {
    const whiteWine: Wine = {
      ...mockWine,
      color: 'White',
      name: 'Chardonnay Reserve',
      region: 'Napa Valley'
    };

    render(<WineDetail wine={whiteWine} />);

    // Check pairings are appropriate for white wine
    fireEvent.click(screen.getByText('Pairings'));
    expect(screen.getByText('Seafood & Poultry')).toBeInTheDocument();
    expect(screen.getByText('Grilled salmon')).toBeInTheDocument();

    // Check education content shows white wine info
    fireEvent.click(screen.getByText('Learn More'));
    expect(screen.getByRole('heading', { name: 'White Wine' })).toBeInTheDocument();
    expect(screen.getByText('Napa Valley, United States')).toBeInTheDocument();
  });

  it('handles wines without complete educational data gracefully', () => {
    const incompleteWine: Wine = {
      ...mockWine,
      history: '',
      region: 'Unknown Region'
    };

    render(<WineDetail wine={incompleteWine} />);

    // History tab should not show content when history is empty
    fireEvent.click(screen.getByText('History'));
    expect(screen.queryByText('Wine History & Heritage')).not.toBeInTheDocument();

    // Education tab should show fallback content for unknown region
    fireEvent.click(screen.getByText('Learn More'));
    expect(screen.getByText('Unknown Region Region')).toBeInTheDocument();
    expect(screen.getByText(/Discover the unique characteristics/)).toBeInTheDocument();
  });
});