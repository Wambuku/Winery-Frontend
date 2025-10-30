import React from 'react';
import Link from 'next/link';
import { Wine, Home, Search } from 'lucide-react';

const Custom404: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-wine-black to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <Wine className="h-24 w-24 text-wine-red mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-400 mb-8">
            The wine you're looking for seems to have been uncorked already. 
            Let's help you find something else from our collection.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-wine-red hover:bg-wine-red-dark text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/wines"
              className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Wine className="h-4 w-4" />
              Browse Wines
            </Link>
            
            <Link
              href="/wines?search="
              className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Search className="h-4 w-4" />
              Search Wines
            </Link>
          </div>
        </div>

        <div className="mt-12 text-gray-500 text-sm">
          <p>Error Code: 404 | Page Not Found</p>
        </div>
      </div>
    </div>
  );
};

export default Custom404;