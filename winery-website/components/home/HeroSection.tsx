import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WineCarousel } from '../wine/WineCarousel';
import { wineService } from '../../services/api/wineService';
import { Wine } from '../../types';
import { useCart } from '../../context/CartContext';

export const HeroSection: React.FC = () => {
  const [featuredWines, setFeaturedWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchFeaturedWines = async () => {
      try {
        setLoading(true);
        const response = await wineService.getFeaturedWines(5);
        if (response.success) {
          setFeaturedWines(response.data);
        } else {
          setError('Failed to load featured wines');
        }
      } catch (err) {
        setError('Failed to load featured wines');
        console.error('Error fetching featured wines:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedWines();
  }, []);

  const handleWineSelect = (wine: Wine) => {
    // Navigate to wine detail page
    window.location.href = `/wines/${wine.id}`;
  };

  const handleAddToCart = (wine: Wine) => {
    addItem(wine, 1);
    // Show success notification (could be implemented with a toast library)
    console.log(`Added ${wine.name} to cart`);
  };

  if (loading) {
    return (
      <section className="relative bg-gradient-to-br from-black to-gray-900 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading featured wines...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || featuredWines.length === 0) {
    return (
      <section className="relative bg-gradient-to-br from-black to-gray-900 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Welcome to <span className="text-red-500">Vintage Cellar</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover exceptional wines from around the world. Our curated collection 
              features premium vintages perfect for every occasion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/wines"
                className="bg-red-800 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Browse Collection
              </Link>
              <Link
                href="/about"
                className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative" data-testid="hero-section">
      <WineCarousel
        wines={featuredWines}
        autoPlay={true}
        autoPlayInterval={6000}
        onWineSelect={handleWineSelect}
        onAddToCart={handleAddToCart}
        className="h-[600px] lg:h-[700px]"
        data-testid="wine-carousel"
      />
      
      {/* Overlay Content */}
      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-end">
        <div className="container mx-auto px-4 pb-12">
          <div className="text-center text-white">
            <div className="bg-black bg-opacity-50 rounded-lg p-6 inline-block">
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                Featured Wine Collection
              </h2>
              <p className="text-gray-200 mb-4">
                Handpicked selections from our premium collection
              </p>
              <Link
                href="/wines?category=featured"
                className="inline-flex items-center text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                View All Featured Wines
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;