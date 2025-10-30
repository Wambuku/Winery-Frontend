// Simple test for CartIcon component

import React from 'react';
import { render, screen } from '@testing-library/react';
import CartIcon from '../../../components/cart/CartIcon';
import { CartProvider } from '../../../context/CartContext';

describe('CartIcon Simple Test', () => {
  it('should render cart icon', () => {
    render(
      <CartProvider>
        <CartIcon />
      </CartProvider>
    );

    const cartButton = screen.getByRole('button');
    expect(cartButton).toBeInTheDocument();
  });

  it('should render SVG icon', () => {
    const { container } = render(
      <CartProvider>
        <CartIcon />
      </CartProvider>
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});