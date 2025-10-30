import React, { useState, useEffect } from 'react';
import { WineFilters as WineFiltersType, WineSortOptions } from '../../services/api/wineService';
import { wineService } from '../../services/api/wineService';

interface FilterState extends WineFiltersType {
  sortBy: WineSortOptions['field'];
  sortOrder: WineSortOptions['direction'];
}

interface WineFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  className?: string;
}

interface FilterSection {
  id: string;
  title: string;
  isOpen: boolean;
}

export const WineFilters: React.FC<WineFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className = ""
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSections, setFilterSections] = useState<FilterSection[]>([
    { id: 'basic', title: 'Basic Filters', isOpen: true },
    { id: 'price', title: 'Price Range', isOpen: true },
    { id: 'details', title: 'Wine Details', isOpen: false },
    { id: 'availability', title: 'Availability', isOpen: true }
  ]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setLoading(true);
      const [categoriesResponse, regionsResponse] = await Promise.all([
        wineService.getCategories(),
        wineService.getRegions()
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }
      if (regionsResponse.success) {
        setRegions(regionsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setFilterSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, isOpen: !section.isOpen }
          : section
      )
    );
  };

  const getSectionState = (sectionId: string) => {
    return filterSections.find(section => section.id === sectionId)?.isOpen ?? false;
  };

  const hasActiveFilters = () => {
    return (
      filters.category ||
      filters.region ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.vintage ||
      filters.color ||
      filters.search ||
      !filters.inStock
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.region) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.vintage) count++;
    if (filters.color) count++;
    if (filters.search) count++;
    if (!filters.inStock) count++;
    return count;
  };

  const priceRanges = [
    { label: 'Under KSh 50', min: 0, max: 50 },
    { label: 'KSh 50 - 100', min: 50, max: 100 },
    { label: 'KSh 100 - 200', min: 100, max: 200 },
    { label: 'KSh 200 - 500', min: 200, max: 500 },
    { label: 'Over KSh 500', min: 500, max: undefined }
  ];

  const vintageRanges = [
    { label: '2020-2024', min: 2020, max: 2024 },
    { label: '2015-2019', min: 2015, max: 2019 },
    { label: '2010-2014', min: 2010, max: 2014 },
    { label: '2000-2009', min: 2000, max: 2009 },
    { label: 'Before 2000', min: 1900, max: 1999 }
  ];

  const wineColors = [
    { value: 'red', label: 'Red', color: 'bg-red-600' },
    { value: 'white', label: 'White', color: 'bg-yellow-100 border border-gray-300' },
    { value: 'rosé', label: 'Rosé', color: 'bg-pink-300' },
    { value: 'sparkling', label: 'Sparkling', color: 'bg-blue-200' }
  ];

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'vintage-desc', label: 'Vintage (Newest)' },
    { value: 'vintage-asc', label: 'Vintage (Oldest)' },
    { value: 'alcoholContent-desc', label: 'Alcohol Content (High to Low)' },
    { value: 'alcoholContent-asc', label: 'Alcohol Content (Low to High)' }
  ];

  const handlePriceRangeSelect = (min: number, max?: number) => {
    onFiltersChange({
      minPrice: min,
      maxPrice: max
    });
  };

  const handleVintageRangeSelect = (min: number, max: number) => {
    // For vintage ranges, we'll use the middle year as the filter
    const middleYear = Math.floor((min + max) / 2);
    onFiltersChange({ vintage: middleYear });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
          {hasActiveFilters() && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        <button
          onClick={onClearFilters}
          disabled={!hasActiveFilters()}
          className="text-sm text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [WineSortOptions['field'], WineSortOptions['direction']];
              onFiltersChange({ sortBy, sortOrder });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Basic Filters */}
        <div>
          <button
            onClick={() => toggleSection('basic')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-700">Basic Filters</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                getSectionState('basic') ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {getSectionState('basic') && (
            <div className="mt-3 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => onFiltersChange({ category: e.target.value || undefined })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Region
                </label>
                <select
                  value={filters.region || ''}
                  onChange={(e) => onFiltersChange({ region: e.target.value || undefined })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Regions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Price Range */}
        <div>
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-700">Price Range</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                getSectionState('price') ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {getSectionState('price') && (
            <div className="mt-3 space-y-3">
              {/* Quick Price Ranges */}
              <div className="space-y-2">
                {priceRanges.map((range, index) => (
                  <button
                    key={index}
                    onClick={() => handlePriceRangeSelect(range.min, range.max)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md border transition-colors ${
                      filters.minPrice === range.min && filters.maxPrice === range.max
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {/* Custom Price Range */}
              <div className="pt-3 border-t border-gray-200">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Custom Range (KSh)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minPrice || ''}
                    onChange={(e) => onFiltersChange({ 
                      minPrice: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    placeholder="Min"
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice || ''}
                    onChange={(e) => onFiltersChange({ 
                      maxPrice: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    placeholder="Max"
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wine Details */}
        <div>
          <button
            onClick={() => toggleSection('details')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-700">Wine Details</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                getSectionState('details') ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {getSectionState('details') && (
            <div className="mt-3 space-y-4">
              {/* Wine Color */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Wine Color
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {wineColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => onFiltersChange({ 
                        color: filters.color === color.value ? undefined : color.value 
                      })}
                      className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md border transition-colors ${
                        filters.color === color.value
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${color.color}`}></div>
                      <span>{color.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vintage */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Vintage Year
                </label>
                <div className="space-y-2">
                  {vintageRanges.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => handleVintageRangeSelect(range.min, range.max)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md border transition-colors ${
                        filters.vintage && filters.vintage >= range.min && filters.vintage <= range.max
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
                
                <div className="mt-2">
                  <input
                    type="number"
                    value={filters.vintage || ''}
                    onChange={(e) => onFiltersChange({ 
                      vintage: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    placeholder="Specific year"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Availability */}
        <div>
          <button
            onClick={() => toggleSection('availability')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-700">Availability</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                getSectionState('availability') ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {getSectionState('availability') && (
            <div className="mt-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.inStock ?? true}
                  onChange={(e) => onFiltersChange({ inStock: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WineFilters;