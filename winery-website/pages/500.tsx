import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

const Custom500: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-wine-black to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <AlertTriangle className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-white mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">
            Server Error
          </h2>
          <p className="text-gray-400 mb-8">
            Our wine cellar seems to be having some technical difficulties. 
            We're working to fix this issue as quickly as possible.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 bg-wine-red hover:bg-wine-red-dark text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>
          
          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>

        <div className="mt-12 text-gray-500 text-sm">
          <p>Error Code: 500 | Internal Server Error</p>
          <p className="mt-2">
            If this problem persists, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Custom500;