import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { wineService } from '../../services/api/wineService';
import { 
  createAriaLabel, 
  getButtonAriaProps, 
  createKeyboardHandler,
  trapFocus,
  KEYBOARD_KEYS 
} from '../../utils/accessibility';

interface SearchSuggestion {
  id: string;
  name: string;
  category: string;
  price: number;
}

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Search suggestions with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const response = await wineService.searchWines(searchQuery, {}, { page: 1, limit: 5 });
          if (response.success) {
            const suggestions = response.data.wines.map(wine => ({
              id: wine.id,
              name: wine.name,
              category: wine.category,
              price: wine.price
            }));
            setSearchSuggestions(suggestions);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Search suggestions error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/wines?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    router.push(`/wines/${suggestion.id}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;

    switch (e.key) {
      case KEYBOARD_KEYS.ARROW_DOWN:
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case KEYBOARD_KEYS.ARROW_UP:
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        break;
      case KEYBOARD_KEYS.ENTER:
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSuggestionClick(searchSuggestions[activeSuggestionIndex]);
        } else {
          handleSearch(e as any);
        }
        break;
      case KEYBOARD_KEYS.ESCAPE:
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
    }
  };

  // Trap focus in mobile menu
  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuRef.current) {
      const cleanup = trapFocus(mobileMenuRef.current);
      return cleanup;
    }
  }, [isMobileMenuOpen]);

  return (
    <header className="bg-black text-white shadow-lg sticky top-0 z-50" role="banner">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-red-800 text-white px-4 py-2 rounded z-50 focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-4">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded"
            aria-label="Vintage Cellar - Premium Wine Collection - Go to homepage"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-800 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors">
              <svg 
                className="w-4 h-4 md:w-6 md:h-6 text-white" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold">Vintage Cellar</h1>
              <p className="text-xs text-gray-300">Premium Wine Collection</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
            <Link 
              href="/wines" 
              className="text-gray-300 hover:text-white transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
              aria-current={router.pathname === '/wines' ? 'page' : undefined}
            >
              Browse Wines
            </Link>
            <Link 
              href="/wines?category=featured" 
              className="text-gray-300 hover:text-white transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
              aria-current={router.asPath === '/wines?category=featured' ? 'page' : undefined}
            >
              Featured
            </Link>
            <Link 
              href="/about" 
              className="text-gray-300 hover:text-white transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
              aria-current={router.pathname === '/about' ? 'page' : undefined}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-300 hover:text-white transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
              aria-current={router.pathname === '/contact' ? 'page' : undefined}
            >
              Contact
            </Link>
          </nav>

          {/* Search Bar - Desktop Only */}
          <div className="hidden lg:block relative flex-1 max-w-md mx-8" role="search">
            <form onSubmit={handleSearch} className="relative">
              <label htmlFor="desktop-search" className="sr-only">
                Search wines
              </label>
              <input
                id="desktop-search"
                ref={searchInputRef}
                type="text"
                placeholder="Search wines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={handleSearchKeyDown}
                className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-gray-700 transition-colors"
                aria-expanded={showSuggestions}
                aria-haspopup="listbox"
                aria-controls={showSuggestions ? "search-suggestions" : undefined}
                aria-activedescendant={activeSuggestionIndex >= 0 ? `suggestion-${activeSuggestionIndex}` : undefined}
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                aria-label="Search wines"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" aria-hidden="true"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </form>

            {/* Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                id="search-suggestions"
                className="absolute top-full left-0 right-0 bg-white text-black rounded-lg shadow-lg mt-1 py-2 z-50" 
                role="listbox"
                aria-label="Search suggestions"
                data-testid="search-suggestions"
              >
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    id={`suggestion-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100 ${
                      index === activeSuggestionIndex ? 'bg-gray-100' : ''
                    }`}
                    role="option"
                    aria-selected={index === activeSuggestionIndex}
                  >
                    <div className="font-medium">{suggestion.name}</div>
                    <div className="text-sm text-gray-600">
                      {suggestion.category} • KSh {suggestion.price.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Cart Icon */}
            <Link 
              href="/cart" 
              className="relative p-2 text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded" 
              data-testid="cart-icon"
              aria-label={createAriaLabel('Shopping cart', [`${cartItemCount} items`])}
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {cartItemCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center text-xs"
                  aria-hidden="true"
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <span className="hidden lg:block text-sm text-gray-300 truncate max-w-32">
                  Welcome, {user.name}
                </span>
                <Link
                  href="/dashboard"
                  className="bg-red-800 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                {(user.role === 'staff' || user.role === 'admin') && (
                  <Link
                    href="/staff"
                    className="hidden lg:block bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Staff
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white transition-colors p-1"
                  aria-label="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white transition-colors font-medium text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-red-800 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded"
              data-testid="mobile-menu-button"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            id="mobile-menu"
            className="md:hidden border-t border-gray-700 py-4 animate-slideDown" 
            data-testid="mobile-menu"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search wines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 touch-manipulation"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </form>

              {/* Mobile Navigation */}
              <nav className="space-y-1">
                <Link 
                  href="/wines" 
                  className="block text-gray-300 hover:text-white hover:bg-gray-800 transition-colors py-3 px-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Browse Wines
                </Link>
                <Link 
                  href="/wines?category=featured" 
                  className="block text-gray-300 hover:text-white hover:bg-gray-800 transition-colors py-3 px-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Featured
                </Link>
                <Link 
                  href="/about" 
                  className="block text-gray-300 hover:text-white hover:bg-gray-800 transition-colors py-3 px-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="block text-gray-300 hover:text-white hover:bg-gray-800 transition-colors py-3 px-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </nav>

              {/* Mobile User Actions */}
              {user ? (
                <div className="border-t border-gray-700 pt-4 space-y-2">
                  <div className="text-sm text-gray-300 px-2 py-1">
                    Welcome, {user.name}
                  </div>
                  <Link
                    href="/dashboard"
                    className="block bg-red-800 hover:bg-red-700 text-white px-4 py-3 rounded-md text-base font-medium transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {(user.role === 'staff' || user.role === 'admin') && (
                    <Link
                      href="/staff"
                      className="block bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-md text-base font-medium transition-colors text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Staff Portal
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-gray-300 hover:text-white hover:bg-gray-800 transition-colors py-3 px-2 rounded-md text-base font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-700 pt-4 space-y-2">
                  <Link
                    href="/login"
                    className="block text-gray-300 hover:text-white hover:bg-gray-800 transition-colors py-3 px-2 rounded-md text-base font-medium text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="block bg-red-800 hover:bg-red-700 text-white px-4 py-3 rounded-md text-base font-medium transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;