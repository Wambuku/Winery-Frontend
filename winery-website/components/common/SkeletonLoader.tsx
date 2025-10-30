// Skeleton loader component for better perceived performance

import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
  lines?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = false,
  lines = 1
}) => {
  const baseClasses = `bg-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${width} ${height}`;

  if (lines === 1) {
    return <div className={`${baseClasses} ${className}`} />;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${index === lines - 1 ? 'w-3/4' : ''}`}
        />
      ))}
    </div>
  );
};

// Specific skeleton components for common use cases
export const WineCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-pulse ${className}`}>
    {/* Image skeleton */}
    <div className="h-48 sm:h-56 md:h-64 w-full bg-gray-200" />
    
    {/* Content skeleton */}
    <div className="p-3 sm:p-4">
      <div className="mb-2">
        <SkeletonLoader height="h-5 sm:h-6" className="mb-2" />
        <SkeletonLoader height="h-3 sm:h-4" width="w-2/3" />
      </div>
      
      <div className="mb-3 hidden sm:block">
        <SkeletonLoader lines={2} />
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <SkeletonLoader width="w-3" height="h-3" rounded />
          <SkeletonLoader width="w-12" height="h-3" />
        </div>
        <SkeletonLoader width="w-16" height="h-3" />
      </div>
      
      <div className="flex items-center justify-between">
        <SkeletonLoader width="w-16 sm:w-20" height="h-6 sm:h-8" />
        <SkeletonLoader width="w-16 sm:w-24" height="h-8" />
      </div>
    </div>
  </div>
);

export const WineDetailSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-xl overflow-hidden animate-pulse ${className}`}>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-4 sm:p-6">
      {/* Image skeleton */}
      <div className="aspect-w-3 aspect-h-4 bg-gray-200 rounded-lg" />
      
      {/* Content skeleton */}
      <div className="flex flex-col space-y-4">
        <div>
          <SkeletonLoader height="h-8 sm:h-10" className="mb-2" />
          <SkeletonLoader height="h-4" width="w-3/4" className="mb-4" />
          <SkeletonLoader height="h-10 sm:h-12" width="w-1/2" />
        </div>
        
        <div className="space-y-2">
          <SkeletonLoader lines={3} />
        </div>
        
        <div className="mt-auto space-y-4">
          <SkeletonLoader height="h-10" width="w-32" />
          <SkeletonLoader height="h-12" />
        </div>
      </div>
    </div>
  </div>
);

export const CartSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg p-4 animate-pulse ${className}`}>
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 bg-gray-200 rounded" />
      <div className="flex-1 space-y-2">
        <SkeletonLoader height="h-4" width="w-3/4" />
        <SkeletonLoader height="h-3" width="w-1/2" />
      </div>
      <div className="space-y-2">
        <SkeletonLoader height="h-4" width="w-16" />
        <SkeletonLoader height="h-8" width="w-20" />
      </div>
    </div>
  </div>
);

export const OrderSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg p-4 animate-pulse ${className}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2">
        <SkeletonLoader height="h-5" width="w-32" />
        <SkeletonLoader height="h-3" width="w-24" />
      </div>
      <SkeletonLoader height="h-6" width="w-20" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded" />
          <div className="flex-1 space-y-1">
            <SkeletonLoader height="h-3" width="w-2/3" />
            <SkeletonLoader height="h-3" width="w-1/3" />
          </div>
          <SkeletonLoader height="h-3" width="w-16" />
        </div>
      ))}
    </div>
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex justify-between">
        <SkeletonLoader height="h-4" width="w-16" />
        <SkeletonLoader height="h-4" width="w-20" />
      </div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; columns?: number; className?: string }> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse ${className}`}>
    {/* Header */}
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonLoader key={index} height="h-4" width="w-3/4" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-4 py-3">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonLoader key={colIndex} height="h-4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SkeletonLoader;