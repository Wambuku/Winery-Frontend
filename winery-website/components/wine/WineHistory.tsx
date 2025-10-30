import React from 'react';
import { Wine } from '../../types';

interface WineHistoryProps {
  wine: Wine;
  className?: string;
}

export const WineHistory: React.FC<WineHistoryProps> = ({ wine, className = '' }) => {
  if (!wine.history) {
    return null;
  }

  return (
    <div className={`wine-history ${className}`}>
      <h3 className="text-xl font-semibold text-wine-black mb-4 font-serif">
        Wine History & Heritage
      </h3>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {wine.history}
        </p>
      </div>
      
      {wine.vintage && (
        <div className="mt-4 p-4 bg-cream rounded-lg border-l-4 border-wine-red">
          <h4 className="font-semibold text-wine-black mb-2">Vintage Information</h4>
          <p className="text-gray-700">
            This exceptional wine was crafted in <span className="font-semibold text-wine-red">{wine.vintage}</span>, 
            representing the unique characteristics and weather conditions of that particular year.
          </p>
        </div>
      )}
    </div>
  );
};

export default WineHistory;