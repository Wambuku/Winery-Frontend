import React, { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';
import { wineService } from '../../services/api/wineService';
import { Wine } from '../../types';

interface SearchSuggestion {
  type: 'wine' | 'category' | 'region' | 'ingredient';
  value: string;
  label: string;
  wine?: Wine;
}

interface WineSearchProps {
  value: string;
  onChange: (value: string) => void;
  onWineSelect?: (wine: Wine) => void;
  placeholder?: string;
  className?: string;
}

export const WineSearch: React.FC<WineSearchProps> = ({
  value,
  onChange,
  onWineSelect,
  placeholder = "Search wines, regions, or ingredients...",
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        // Search for wines
        const wineResponse = await wineService.searchWines(searchTerm, {}, { page: 1, limit: 5 });
        
        // Get categories and regions for additional suggestions
        const [categoriesResponse, regionsResponse] = await Promise.all([
          wineService.getCategories(),
          wineService.getRegions()
        ]);

        const newSuggestions: SearchSuggestion[] = [];

        // Add wine suggestions
        if (wineResponse.success) {
          wineResponse.data.wines.forEach(wine => {
            newSuggestions.push({
              type: 'wine',
              value: wine.name,
              label: `${wine.name} - ${wine.region}`,
              wine
            });
          });
        }

        // Add category suggestions
        if (categoriesResponse.success) {
          categoriesResponse.data
            .filter(category => category.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 3)
            .forEach(category => {
              newSuggestions.push({
                type: 'category',
                value: category,
                label: `Category: ${category}`
              });
            });
        }

        // Add region suggestions
        if (regionsResponse.success) {
          regionsResponse.data
            .filter(region => region.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 3)
            .forEach(region => {
              newSuggestions.push({
                type: 'region',
                value: region,
                label: `Region: ${region}`
              });
            });
        }

        // Add ingredient suggestions (from wine data)
        if (wineResponse.success) {
          const ingredients = new Set<string>();
          wineResponse.data.wines.forEach(wine => {
            wine.ingredients.forEach(ingredient => {
              if (ingredient.toLowerCase().includes(searchTerm.toLowerCase())) {
                ingredients.add(ingredient);
              }
            });
          });

          Array.from(ingredients).slice(0, 2).forEach(ingredient => {
            newSuggestions.push({
              type: 'ingredient',
              value: ingredient,
              label: `Ingredient: ${ingredient}`
            });
          });
        }

        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search suggestions error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(value);
    return () => {
      debouncedSearch.cancel();
    };
  }, [value, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'wine' && suggestion.wine && onWineSelect) {
      onWineSelect(suggestion.wine);
    } else {
      onChange(suggestion.value);
    }
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 200);
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'wine':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'category':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'region':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'ingredient':
        return (
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.value}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-red-50 border-red-200' : ''
              }`}
            >
              {getSuggestionIcon(suggestion.type)}
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {suggestion.label}
                </div>
                {suggestion.wine && (
                  <div className="text-xs text-gray-500">
                    KSh {suggestion.wine.price.toFixed(2)} • {suggestion.wine.vintage}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default WineSearch;