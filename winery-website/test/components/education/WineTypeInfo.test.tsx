import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WineTypeInfo from '../../../components/education/WineTypeInfo';

describe('WineTypeInfo Component', () => {
  it('renders red wine information', () => {
    render(<WineTypeInfo wineType="Red" />);
    
    expect(screen.getByText('Red Wine')).toBeInTheDocument();
    expect(screen.getByText(/made from dark-colored grape varieties/)).toBeInTheDocument();
    expect(screen.getByText('Serving Temperature')).toBeInTheDocument();
    expect(screen.getByText('60-68°F (15-20°C)')).toBeInTheDocument();
  });

  it('displays grape varieties as tags', () => {
    render(<WineTypeInfo wineType="White" />);
    
    expect(screen.getByText('Chardonnay')).toBeInTheDocument();
    expect(screen.getByText('Sauvignon Blanc')).toBeInTheDocument();
  });

  it('shows food pairings', () => {
    render(<WineTypeInfo wineType="Sparkling" />);
    
    expect(screen.getByText('Food Pairings')).toBeInTheDocument();
    expect(screen.getByText('Oysters')).toBeInTheDocument();
    expect(screen.getByText('Caviar')).toBeInTheDocument();
  });

  it('handles unknown wine types', () => {
    render(<WineTypeInfo wineType="Unknown" />);
    
    expect(screen.getByText('Unknown Wine')).toBeInTheDocument();
    expect(screen.getByText(/Learn about the characteristics/)).toBeInTheDocument();
  });
});