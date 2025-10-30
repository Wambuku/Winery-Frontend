import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WineGrid } from '../wine/WineGrid';
import { wineService } from '../../services/api/wineService';
import { Wine } from '../../types';
import { useCart } from '../../context/CartContext';

export const FeaturedSection: React.FC = () => {
  const [featuredWines, setFeaturedWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchFeaturedWines = async () => {
      try {
        setLoading(true);
        const response = await wineService.getFeaturedWines(8);
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
    window.location.href = `/wines/${wine.id}`;
  };

  const handleAddToCart = (wine: Wine) => {
    addItem(wine, 1);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Wines</h2>
            <p className="text-xl text-gray-600">Handpicked selections from our premium collection</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-96 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="bg-gray-200 h-4 rounded"></div>
                  <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                  <div className="bg-gray-200 h-6 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || featuredWines.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Wines</h2>
            <p className="text-xl text-gray-600 mb-8">
              {error || 'No featured wines available at the moment'}
            </p>
            <Link
              href="/wines"
              className="bg-red-800 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
            >
              Browse All Wines
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Wines</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our carefully selected premium wines, chosen for their exceptional quality and unique character
          </p>
        </div>

        <WineGrid
          wines={featuredWines}
          onWineSelect={handleWineSelect}
          onAddToCart={handleAddToCart}
          className="mb-12"
          data-testid="wine-grid"
        />

        <div className="text-center">
          <Link
            href="/wines?category=featured"
            className="inline-flex items-center bg-red-800 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            View All Featured Wines
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;