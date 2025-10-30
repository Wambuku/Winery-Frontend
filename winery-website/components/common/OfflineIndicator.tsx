import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  className?: string;
  showReconnected?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className = '',
  showReconnected = true
}) => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [showReconnectedMessage, setShowReconnectedMessage] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline && showReconnected) {
      setShowReconnectedMessage(true);
      const timer = setTimeout(() => {
        setShowReconnectedMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, showReconnected]);

  // Show reconnected message
  if (showReconnectedMessage) {
    return (
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-slide-down">
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Back online</span>
        </div>
      </div>
    );
  }

  // Show offline indicator
  if (!isOnline) {
    return (
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-slide-down">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">You're offline</span>
        </div>
      </div>
    );
  }

  return null;
};

// Full-screen offline overlay for critical operations
export const OfflineOverlay: React.FC<{
  isVisible: boolean;
  onRetry?: () => void;
  message?: string;
}> = ({ 
  isVisible, 
  onRetry, 
  message = "You're currently offline. Please check your internet connection." 
}) => {
  const { isOnline } = useOnlineStatus();

  if (!isVisible || isOnline) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <WifiOff className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Internet Connection
        </h3>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full bg-wine-red hover:bg-wine-red-dark text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Wifi className="h-4 w-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

// Inline offline message for components
export const InlineOfflineMessage: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className = '' }) => {
  const { isOnline } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-800">
            You're currently offline. Some features may not be available.
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;