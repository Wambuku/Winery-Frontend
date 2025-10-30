import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { wineService } from '../../services/api/wineService';

interface CategoryData {
  name: string;
  displayName: string;
  description: string;
  image: string;
  color: string;
  count?: number;
}

const defaultCategories: CategoryData[] = [
  {
    name: 'red',
    displayName: 'Red Wines',
    description: 'Bold and complex flavors from premium red varietals',
    image: '/images/red-wine-category.jpg',
    color: 'from-red-900 to-red-700'
  },
  {
    name: 'white',
    displayName: 'White Wines',
    description: 'Crisp and elegant whites perfect for any occasion',
    image: '/images/white-wine-category.jpg',
    color: 'from-yellow-600 to-yellow-400'
  },
  {
    name: 'sparkling',
    displayName: 'Sparkling Wines',
    description: 'Celebrate with our selection of premium bubbles',
    image: '/images/sparkling-wine-category.jpg',
    color: 'from-purple-600 to-pink-500'
  },
  {
    name: 'rosé',
    displayName: 'Rosé Wines',
    description: 'Delicate and refreshing rosés for summer enjoyment',
    image: '/images/rose-wine-category.jpg',
    color: 'from-pink-500 to-rose-400'
  }
];

export const CategorySection: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData[]>(defaultCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await wineService.getCategories();
        if (response.success) {
          // Map API categories to our display format
          const apiCategories = response.data.map(categoryName => {
            const defaultCategory = defaultCategories.find(
              cat => cat.name.toLowerCase() === categoryName.toLowerCase()
            );
            return defaultCategory || {
              name: categoryName,
              displayName: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
              description: `Explore our ${categoryName} wine collection`,
              image: '/images/default-wine-category.jpg',
              color: 'from-gray-600 to-gray-800'
            };
          });
          setCategories(apiCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Keep default categories on error
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Wine Categories</h2>
            <p className="text-xl text-gray-600">Explore our curated wine collections</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Wine Categories</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated wine collections, each offering unique flavors and experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/wines?category=${category.name}`}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="relative h-80">
                {/* Background Image */}
                <div className="absolute inset-0 bg-gray-800">
                  <Image
                    src={category.image}
                    alt={category.displayName}
                    fill
                    className="object-cover opacity-70 group-hover:opacity-50 transition-opacity duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80 group-hover:opacity-90 transition-opacity duration-300`} />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                    {category.displayName}
                  </h3>
                  <p className="text-sm opacity-90 mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  
                  {/* Category Stats */}
                  {category.count && (
                    <div className="text-xs opacity-75 mb-2">
                      {category.count} wines available
                    </div>
                  )}

                  {/* Arrow Icon */}
                  <div className="flex items-center text-sm font-semibold group-hover:text-yellow-300 transition-colors duration-300">
                    <span>Explore Collection</span>
                    <svg 
                      className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </div>
            </Link>
          ))}
        </div>

        {/* View All Categories Link */}
        <div className="text-center mt-12">
          <Link
            href="/wines"
            className="inline-flex items-center bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300"
          >
            View All Wines
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;