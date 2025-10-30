import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WineCard } from '../wine/WineCard';
import { wineService } from '../../services/api/wineService';
import { Wine } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface RecommendationEngine {
  getRecommendations(userId?: string): Promise<Wine[]>;
}

// Simple recommendation engine based on user behavior and wine attributes
class SimpleRecommendationEngine implements RecommendationEngine {
  async getRecommendations(userId?: string): Promise<Wine[]> {
    try {
      // For now, we'll use a simple approach:
      // 1. Get popular wines (high-rated or frequently purchased)
      // 2. Mix different categories for variety
      // 3. Include some premium options
      
      const [redWines, whiteWines, sparklingWines] = await Promise.all([
        wineService.getWines({ category: 'red', inStock: true }, { field: 'price', direction: 'desc' }, { page: 1, limit: 3 }),
        wineService.getWines({ category: 'white', inStock: true }, { field: 'price', direction: 'desc' }, { page: 1, limit: 2 }),
        wineService.getWines({ category: 'sparkling', inStock: true }, { field: 'price', direction: 'desc' }, { page: 1, limit: 1 })
      ]);

      const recommendations: Wine[] = [];
      
      if (redWines.success) recommendations.push(...redWines.data.wines);
      if (whiteWines.success) recommendations.push(...whiteWines.data.wines);
      if (sparklingWines.success) recommendations.push(...sparklingWines.data.wines);

      // Shuffle and limit to 6 recommendations
      return this.shuffleArray(recommendations).slice(0, 6);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

const recommendationEngine = new SimpleRecommendationEngine();

export const RecommendationSection: React.FC = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [recommendations, setRecommendations] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const wines = await recommendationEngine.getRecommendations(user?.id);
        setRecommendations(wines);
      } catch (err) {
        setError('Failed to load recommendations');
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user?.id]);

  const handleWineSelect = (wine: Wine) => {
    window.location.href = `/wines/${wine.id}`;
  };

  const handleAddToCart = (wine: Wine) => {
    addItem(wine, 1);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {user ? `Recommended for You` : 'Popular Selections'}
            </h2>
            <p className="text-xl text-gray-600">Loading personalized recommendations...</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-96 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {user ? `Recommended for You` : 'Popular Selections'}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {error || 'No recommendations available at the moment'}
            </p>
            <Link
              href="/wines"
              className="bg-red-800 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
            >
              Explore All Wines
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {user ? `Recommended for You, ${user.name}` : 'Popular Selections'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {user 
              ? 'Based on your preferences and browsing history, we think you\'ll love these wines'
              : 'Discover what other wine enthusiasts are enjoying from our collection'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {recommendations.map((wine) => (
            <WineCard
              key={wine.id}
              wine={wine}
              onSelect={() => handleWineSelect(wine)}
              onAddToCart={() => handleAddToCart(wine)}
              showRecommendationBadge={true}
              className="transform hover:scale-105 transition-transform duration-300"
            />
          ))}
        </div>

        {/* Recommendation Explanation */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            How We Choose Your Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Your Preferences</h4>
              <p>Based on wines you've viewed and purchased</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Popular Choices</h4>
              <p>Wines that are trending among our customers</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Quality Selection</h4>
              <p>Curated by our wine experts for exceptional quality</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/wines"
            className="inline-flex items-center text-red-800 hover:text-red-600 font-semibold transition-colors duration-300"
          >
            Explore More Wines
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecommendationSection;