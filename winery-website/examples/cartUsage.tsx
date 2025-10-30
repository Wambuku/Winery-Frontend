// Example usage of cart functionality with wine components

import React from 'react';
import { CartProvider, useCart } from '../context/CartContext';
import { WineCard } from '../components/wine/WineCard';
import CartIcon from '../components/cart/CartIcon';
import MiniCart from '../components/cart/MiniCart';
import Cart from '../components/cart/Cart';
import { Wine } from '../types';

// Sample wine data
const sampleWines: Wine[] = [
  {
    id: '1',
    name: 'Château Margaux 2015',
    description: 'A prestigious Bordeaux wine with exceptional complexity and elegance.',
    price: 15000,
    image: '/wines/chateau-margaux.jpg',
    ingredients: ['Cabernet Sauvignon', 'Merlot', 'Petit Verdot', 'Cabernet Franc'],
    color: 'red',
    history: 'One of the most prestigious wines from Bordeaux, France.',
    vintage: 2015,
    region: 'Bordeaux, France',
    alcoholContent: 13.5,
    category: 'red',
    inStock: true,
    stockQuantity: 12,
  },
  {
    id: '2',
    name: 'Dom Pérignon 2012',
    description: 'Legendary champagne with fine bubbles and complex flavors.',
    price: 25000,
    image: '/wines/dom-perignon.jpg',
    ingredients: ['Chardonnay', 'Pinot Noir'],
    color: 'white',
    history: 'Named after Dom Pierre Pérignon, a Benedictine monk.',
    vintage: 2012,
    region: 'Champagne, France',
    alcoholContent: 12.5,
    category: 'sparkling',
    inStock: true,
    stockQuantity: 8,
  },
];

// Header component with cart icon
function Header() {
  const [isMiniCartOpen, setIsMiniCartOpen] = React.useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-gray-900">Wine Store</h1>
          
          <div className="flex items-center space-x-4">
            <CartIcon 
              className="hover:bg-gray-100"
            />
          </div>
        </div>
      </div>
      
      <MiniCart 
        isOpen={isMiniCartOpen}
        onClose={() => setIsMiniCartOpen(false)}
        onViewCart={() => {
          setIsMiniCartOpen(false);
          // Navigate to cart page
          console.log('Navigate to cart page');
        }}
      />
    </header>
  );
}

// Wine grid component
function WineGrid() {
  const { addItem } = useCart();

  const handleAddToCart = (wine: Wine) => {
    addItem(wine, 1);
    // Optional: Show toast notification
    console.log(`Added ${wine.name} to cart`);
  };

  const handleViewDetails = (wine: Wine) => {
    // Navigate to wine details page
    console.log(`View details for ${wine.name}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Wines</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleWines.map((wine) => (
          <WineCard
            key={wine.id}
            wine={wine}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    </div>
  );
}

// Cart page component
function CartPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Cart />
    </div>
  );
}

// Main app component demonstrating cart usage
export function CartUsageExample() {
  const [currentPage, setCurrentPage] = React.useState<'home' | 'cart'>('home');

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 h-12 items-center">
              <button
                onClick={() => setCurrentPage('home')}
                className={`text-sm font-medium ${
                  currentPage === 'home' 
                    ? 'text-red-800 border-b-2 border-red-800' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('cart')}
                className={`text-sm font-medium ${
                  currentPage === 'cart' 
                    ? 'text-red-800 border-b-2 border-red-800' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cart
              </button>
            </div>
          </div>
        </nav>
        
        <main>
          {currentPage === 'home' && <WineGrid />}
          {currentPage === 'cart' && <CartPage />}
        </main>
      </div>
    </CartProvider>
  );
}

export default CartUsageExample;