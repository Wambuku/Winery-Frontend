import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WineRegionInfo from '../../../components/education/WineRegionInfo';

describe('WineRegionInfo Component', () => {
  it('renders known wine region information', () => {
    render(<WineRegionInfo region="Bordeaux" />);
    
    expect(screen.getByText('Bordeaux, France')).toBeInTheDocument();
    expect(screen.getByText(/one of the world's most prestigious wine regions/)).toBeInTheDocument();
    expect(screen.getByText('Key Characteristics')).toBeInTheDocument();
    expect(screen.getByText('Famous Wines')).toBeInTheDocument();
  });

  it('renders fallback for unknown region', () => {
    render(<WineRegionInfo region="Unknown Region" />);
    
    expect(screen.getByText('Unknown Region Region')).toBeInTheDocument();
    expect(screen.getByText(/Discover the unique characteristics/)).toBeInTheDocument();
  });

  it('displays climate information for known regions', () => {
    render(<WineRegionInfo region="Tuscany" />);
    
    expect(screen.getByText('Climate')).toBeInTheDocument();
    expect(screen.getByText(/Mediterranean climate/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<WineRegionInfo region="Bordeaux" className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('wine-region-info', 'custom-class');
  });
});