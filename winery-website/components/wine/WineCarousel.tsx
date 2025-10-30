import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Wine } from '../../types';

interface WineCarouselProps {
  wines: Wine[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onWineSelect?: (wine: Wine) => void;
  onAddToCart?: (wine: Wine) => void;
  className?: string;
  'data-testid'?: string;
}

export const WineCarousel: React.FC<WineCarouselProps> = ({
  wines,
  autoPlay = true,
  autoPlayInterval = 5000,
  onWineSelect,
  onAddToCart,
  className = '',
  'data-testid': testId
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isHovered || wines.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === wines.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isHovered, wines.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? wines.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === wines.length - 1 ? 0 : currentIndex + 1);
  };

  const handleWineClick = (wine: Wine) => {
    onWineSelect?.(wine);
  };

  const handleAddToCart = (e: React.MouseEvent, wine: Wine) => {
    e.stopPropagation();
    onAddToCart?.(wine);
  };

  if (wines.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-600">No featured wines available</p>
      </div>
    );
  }

  const currentWine = wines[currentIndex];

  return (
    <div 
      className={`relative bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={testId}
    >
      {/* Main Carousel Content */}
      <div className="relative h-96 lg:h-[500px]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src={currentWine.image}
            alt={currentWine.name}
            fill
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Wine Information */}
              <div className="text-white">
                <div className="mb-4">
                  <span className="inline-block bg-red-800 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                    Featured Wine
                  </span>
                  <h2 className="text-4xl lg:text-5xl font-bold mb-2 leading-tight">
                    {currentWine.name}
                  </h2>
                  <p className="text-xl text-gray-300 mb-4">
                    {currentWine.region} • {currentWine.vintage}
                  </p>
                </div>

                <p className="text-lg text-gray-200 mb-6 leading-relaxed max-w-lg">
                  {currentWine.description}
                </p>

                <div className="flex items-center space-x-6 mb-8">
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-4 h-4 rounded-full" 
                          style={{ backgroundColor: currentWine.color.toLowerCase() }} />
                    <span className="text-gray-300 capitalize">{currentWine.color}</span>
                  </div>
                  <span className="text-gray-300">{currentWine.alcoholContent}% ABV</span>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-red-400">
                    KSh {currentWine.price.toLocaleString()}
                  </span>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleWineClick(currentWine)}
                      className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors duration-200"
                    >
                      View Details
                    </button>
                    {currentWine.inStock && (
                      <button
                        onClick={(e) => handleAddToCart(e, currentWine)}
                        className="bg-red-800 hover:bg-red-900 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Wine Image */}
              <div className="hidden lg:flex justify-center">
                <div className="relative w-64 h-80">
                  <Image
                    src={currentWine.image}
                    alt={currentWine.name}
                    fill
                    className="object-cover rounded-lg shadow-2xl"
                    sizes="256px"
                  />
                  {!currentWine.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <span className="text-white font-semibold">Out of Stock</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {wines.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              aria-label="Previous wine"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 z-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              aria-label="Next wine"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 z-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {wines.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {wines.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to wine ${index + 1}`}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-red-500 scale-110'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      )}

      {/* Wine Counter */}
      {wines.length > 1 && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-20">
          {currentIndex + 1} / {wines.length}
        </div>
      )}
    </div>
  );
};

export default WineCarousel;