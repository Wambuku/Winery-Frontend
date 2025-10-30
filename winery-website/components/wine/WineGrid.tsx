import React from 'react';
import { Wine } from '../../types';
import WineCard from './WineCard';

interface WineGridProps {
  wines: Wine[];
  loading?: boolean;
  onAddToCart?: (wine: Wine) => void;
  onViewDetails?: (wine: Wine) => void;
  onWineSelect?: (wine: Wine) => void;
  className?: string;
  'data-testid'?: string;
}

export const WineGrid: React.FC<WineGridProps> = ({
  wines,
  loading = false,
  onAddToCart,
  onViewDetails,
  onWineSelect,
  className = '',
  'data-testid': testId
}) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 ${className}`}>
        {Array.from({ length: 10 }).map((_, index) => (
          <WineCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (wines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 text-center">No wines found</h3>
        <p className="text-sm sm:text-base text-gray-600 text-center max-w-md">
          We couldn't find any wines matching your criteria. Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 ${className}`} data-testid={testId}>
      {wines.map((wine) => (
        <WineCard
          key={wine.id}
          wine={wine}
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
          onSelect={onWineSelect}
        />
      ))}
    </div>
  );
};

// Skeleton component for loading state
const WineCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 sm:h-56 md:h-64 w-full bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-3 sm:p-4">
        <div className="mb-2">
          <div className="h-5 sm:h-6 bg-gray-200 rounded mb-2" />
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3" />
        </div>
        
        <div className="mb-3 hidden sm:block">
          <div className="h-4 bg-gray-200 rounded mb-1" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200 rounded-full" />
            <div className="h-3 bg-gray-200 rounded w-12" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-16 sm:w-20" />
          <div className="h-8 bg-gray-200 rounded w-16 sm:w-24" />
        </div>
      </div>
    </div>
  );
};

export default WineGrid;