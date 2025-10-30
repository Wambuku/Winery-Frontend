import React from 'react';
import { Loader2, Wine } from 'lucide-react';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'default' | 'wine' | 'minimal';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  message,
  className = '',
  fullScreen = false
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'md':
        return 'h-6 w-6';
      case 'lg':
        return 'h-8 w-8';
      case 'xl':
        return 'h-12 w-12';
      default:
        return 'h-6 w-6';
    }
  };

  const getColorClasses = () => {
    switch (variant) {
      case 'wine':
        return 'text-wine-red';
      case 'minimal':
        return 'text-gray-400';
      default:
        return 'text-wine-red';
    }
  };

  const getIcon = () => {
    if (variant === 'wine') {
      return <Wine className={`${getSizeClasses()} ${getColorClasses()} animate-pulse`} />;
    }
    return <Loader2 className={`${getSizeClasses()} ${getColorClasses()} animate-spin`} />;
  };

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {getIcon()}
      {message && (
        <p className={`mt-2 text-sm text-gray-600 ${size === 'sm' ? 'text-xs' : ''}`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Specific loading components for common use cases
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="xl" variant="wine" message={message} />
  </div>
);

export const ButtonLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <LoadingSpinner size="sm" variant="minimal" className={className} />
);

export const InlineLoader: React.FC<{ message?: string; className?: string }> = ({ 
  message, 
  className = '' 
}) => (
  <div className={`flex items-center justify-center py-8 ${className}`}>
    <LoadingSpinner size="md" variant="wine" message={message} />
  </div>
);

export default LoadingSpinner;