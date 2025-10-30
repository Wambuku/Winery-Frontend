// Mobile-optimized cart icon with touch-friendly interactions

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import MiniCart from './MiniCart';

interface CartIconProps {
  className?: string;
  showMiniCart?: boolean;
}

export const CartIcon: React.FC<CartIconProps> = ({ 
  className = '', 
  showMiniCart = true 
}) => {
  const { items } = useCart();
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleCartClick = (e: React.MouseEvent) => {
    if (showMiniCart) {
      e.preventDefault();
      setIsMiniCartOpen(true);
    }
  };

  const handleViewCart = () => {
    setIsMiniCartOpen(false);
    // Navigation will be handled by Link
  };

  return (
    <>
      <Link 
        href="/cart" 
        className={`relative p-2 text-gray-300 hover:text-white transition-colors touch-manipulation ${className}`}
        data-testid="cart-icon"
        onClick={handleCartClick}
      >
        <svg 
          className="w-5 h-5 md:w-6 md:h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" 
          />
        </svg>
        
        {/* Cart Item Count Badge */}
        {cartItemCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center font-medium min-w-[16px] md:min-w-[20px]"
            aria-label={`${cartItemCount} items in cart`}
          >
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </span>
        )}
        
        {/* Screen reader text */}
        <span className="sr-only">
          Shopping cart with {cartItemCount} items
        </span>
      </Link>

      {/* Mini Cart */}
      {showMiniCart && (
        <MiniCart
          isOpen={isMiniCartOpen}
          onClose={() => setIsMiniCartOpen(false)}
          onViewCart={handleViewCart}
        />
      )}
    </>
  );
};

export default CartIcon;