import React from 'react';
import Image from 'next/image';
import { Wine } from '../../types';
import { 
  createAriaLabel, 
  getButtonAriaProps, 
  createKeyboardHandler,
  announceToScreenReader 
} from '../../utils/accessibility';
import { useLazyLoading } from '../../hooks/usePerformance';

interface WineCardProps {
  wine: Wine;
  onAddToCart?: (wine: Wine) => void;
  onViewDetails?: (wine: Wine) => void;
  onSelect?: (wine: Wine) => void;
  showRecommendationBadge?: boolean;
  className?: string;
}

export const WineCard: React.FC<WineCardProps> = ({ 
  wine, 
  onAddToCart, 
  onViewDetails,
  onSelect,
  showRecommendationBadge = false,
  className = ''
}) => {
  const { isVisible, ref } = useLazyLoading();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(wine);
    announceToScreenReader(`${wine.name} added to cart`);
  };

  const handleViewDetails = () => {
    onViewDetails?.(wine);
    onSelect?.(wine);
  };

  const cardAriaLabel = createAriaLabel(
    `${wine.name} wine`,
    [
      `${wine.region} region`,
      `${wine.vintage} vintage`,
      `${wine.color} wine`,
      `Price: ${wine.price} Kenyan Shillings`,
      wine.inStock ? 'In stock' : 'Out of stock',
      wine.stockQuantity <= 5 && wine.inStock ? `Only ${wine.stockQuantity} left` : ''
    ]
  );

  const addToCartAriaProps = getButtonAriaProps(
    `Add ${wine.name} to cart`,
    false,
    !wine.inStock
  );

  return (
    <article 
      ref={ref}
      className={`group relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden touch-manipulation focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-offset-2 ${className}`}
      onClick={handleViewDetails}
      onKeyDown={createKeyboardHandler(handleViewDetails)}
      role="button"
      tabIndex={0}
      aria-label={cardAriaLabel}
      data-testid="wine-card"
    >
      {/* Wine Image */}
      <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden bg-gray-50">
        {isVisible && (
          <Image
            src={wine.image}
            alt={`${wine.name} wine bottle from ${wine.region}, vintage ${wine.vintage}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
            loading="lazy"
          />
        )}
        
        {/* Stock Status Overlay */}
        {!wine.inStock && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            role="status"
            aria-label="Out of stock"
          >
            <span className="text-white font-semibold text-base sm:text-lg">Out of Stock</span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
      </div>

      {/* Wine Information */}
      <div className="p-3 sm:p-4">
        <div className="mb-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-red-800 transition-colors duration-200 line-clamp-2 leading-tight">
            {wine.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {wine.region} • {wine.vintage}
          </p>
        </div>

        <div className="mb-3 hidden sm:block">
          <p className="text-sm text-gray-700 line-clamp-2">
            {wine.description}
          </p>
        </div>

        {/* Wine Details */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span 
              className="inline-block w-3 h-3 rounded-full" 
              style={{ backgroundColor: wine.color.toLowerCase() }}
              aria-label={`${wine.color} wine color indicator`}
            />
            <span className="text-xs text-gray-600 capitalize">{wine.color}</span>
          </div>
          <span className="text-xs text-gray-600" aria-label={`${wine.alcoholContent} percent alcohol by volume`}>
            {wine.alcoholContent}% ABV
          </span>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-red-800">
              KSh {wine.price.toLocaleString()}
            </span>
            {wine.stockQuantity <= 5 && wine.inStock && (
              <span className="text-xs text-orange-600">
                Only {wine.stockQuantity} left
              </span>
            )}
          </div>
          
          {wine.inStock && (
            <button
              onClick={handleAddToCart}
              onKeyDown={createKeyboardHandler(() => handleAddToCart({} as React.MouseEvent))}
              className="bg-red-800 hover:bg-red-900 active:bg-red-950 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 transform hover:scale-105 active:scale-95 touch-manipulation focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              {...addToCartAriaProps}
            >
              <span className="hidden sm:inline">Add to Cart</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-2 left-2 space-y-1" role="group" aria-label="Wine badges">
        {wine.category === 'featured' && (
          <span 
            className="block bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-semibold"
            role="status"
            aria-label="Featured wine"
          >
            Featured
          </span>
        )}
        {showRecommendationBadge && (
          <span 
            className="block bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold"
            role="status"
            aria-label="Recommended wine"
          >
            Recommended
          </span>
        )}
      </div>
    </article>
  );
};

export default WineCard;