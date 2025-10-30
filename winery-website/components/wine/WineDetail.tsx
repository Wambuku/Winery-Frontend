import React, { useState } from 'react';
import Image from 'next/image';
import { Wine, TastingNote } from '../../types';
import WineHistory from './WineHistory';
import WinePairings from './WinePairings';
import TastingNotes from './TastingNotes';
import { WineRegionInfo, WineTypeInfo } from '../education';

interface WineDetailProps {
  wine: Wine;
  onAddToCart?: (wine: Wine, quantity: number) => void;
  onClose?: () => void;
  className?: string;
  tastingNotes?: TastingNote[];
  onAddTastingNote?: (note: Omit<TastingNote, 'id' | 'createdAt'>) => void;
}

export const WineDetail: React.FC<WineDetailProps> = ({
  wine,
  onAddToCart,
  onClose,
  className = '',
  tastingNotes = [],
  onAddTastingNote
}) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'history' | 'pairings' | 'tasting' | 'education'>('description');

  const handleAddToCart = () => {
    onAddToCart?.(wine, quantity);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= wine.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-xl overflow-hidden ${className}`}>
      {/* Close button for modal usage */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close wine details"
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-4 sm:p-6">
        {/* Wine Image */}
        <div className="relative">
          <div className="aspect-w-3 aspect-h-4 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={wine.image}
              alt={wine.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          
          {/* Stock status overlay */}
          {!wine.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <span className="text-white font-semibold text-lg sm:text-xl">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Wine Information */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">{wine.name}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-gray-600 mb-4">
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-2" 
                      style={{ backgroundColor: wine.color.toLowerCase() }} />
                {wine.color} Wine
              </span>
              <span>{wine.region}</span>
              <span>{wine.vintage}</span>
              <span>{wine.alcoholContent}% ABV</span>
            </div>
            
            {/* Price */}
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-2">
              <span className="text-3xl sm:text-4xl font-bold text-red-800">
                KSh {wine.price.toLocaleString()}
              </span>
              <span className="text-sm sm:text-base text-gray-600">per bottle</span>
            </div>
            
            {/* Stock info */}
            {wine.inStock && wine.stockQuantity <= 5 && (
              <p className="text-orange-600 font-medium mt-2 text-sm sm:text-base">
                Only {wine.stockQuantity} bottles left in stock
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="mb-4 sm:mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
                {[
                  { key: 'description', label: 'Description' },
                  { key: 'ingredients', label: 'Ingredients' },
                  { key: 'history', label: 'History' },
                  { key: 'pairings', label: 'Pairings' },
                  { key: 'tasting', label: 'Tasting Notes' },
                  { key: 'education', label: 'Learn More' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors touch-manipulation ${
                      activeTab === tab.key
                        ? 'border-red-800 text-red-800'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-4 min-h-[100px] sm:min-h-[120px]">
              {activeTab === 'description' && (
                <div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{wine.description}</p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Category:</span>
                      <span className="ml-2 text-gray-600 capitalize">{wine.category}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Vintage:</span>
                      <span className="ml-2 text-gray-600">{wine.vintage}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'ingredients' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Wine Composition</h4>
                  <ul className="space-y-2">
                    {wine.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-center text-sm sm:text-base text-gray-700">
                        <span className="w-2 h-2 bg-red-800 rounded-full mr-3 flex-shrink-0" />
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {activeTab === 'history' && (
                <WineHistory wine={wine} />
              )}
              
              {activeTab === 'pairings' && (
                <WinePairings wine={wine} />
              )}
              
              {activeTab === 'tasting' && (
                <TastingNotes 
                  wine={wine} 
                  tastingNotes={tastingNotes}
                  onAddTastingNote={onAddTastingNote}
                />
              )}
              
              {activeTab === 'education' && (
                <div className="space-y-6">
                  <WineTypeInfo wineType={wine.color} />
                  <WineRegionInfo region={wine.region} />
                </div>
              )}
            </div>
          </div>

          {/* Purchase Section */}
          {wine.inStock && (
            <div className="mt-auto">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
                <label htmlFor="quantity" className="font-medium text-gray-900 text-sm sm:text-base">
                  Quantity:
                </label>
                <div className="flex items-center border border-gray-300 rounded-md w-fit">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="p-2 sm:p-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={wine.stockQuantity}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-16 sm:w-20 text-center border-0 focus:ring-0 focus:outline-none text-base"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= wine.stockQuantity}
                    aria-label="Increase quantity"
                    className="p-2 sm:p-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-red-800 hover:bg-red-900 active:bg-red-950 text-white py-3 px-6 rounded-md font-medium transition-colors duration-200 transform hover:scale-105 active:scale-95 touch-manipulation text-sm sm:text-base"
                >
                  <span className="block sm:hidden">Add - KSh {(wine.price * quantity).toLocaleString()}</span>
                  <span className="hidden sm:block">Add to Cart - KSh {(wine.price * quantity).toLocaleString()}</span>
                </button>
                <button 
                  aria-label="Add to wishlist"
                  className="px-6 py-3 border border-red-800 text-red-800 hover:bg-red-50 active:bg-red-100 rounded-md font-medium transition-colors duration-200 touch-manipulation"
                >
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {!wine.inStock && (
            <div className="mt-auto">
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-md font-medium cursor-not-allowed text-sm sm:text-base"
              >
                Out of Stock
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WineDetail;