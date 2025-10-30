import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout';
import { WineGrid } from '../components/wine/WineGrid';
import { WineSearch } from '../components/wine/WineSearch';
import { WineFilters } from '../components/wine/WineFilters';
import { wineService, WineFilters as WineFiltersType, WineSortOptions } from '../services/api/wineService';
import { Wine } from '../types';
import { useCart } from '../context/CartContext';
import { useUrlState, FilterState } from '../utils/urlState';

interface ExtendedFilterState extends FilterState {
  page?: number;
}

const WinesPage: React.FC = () => {
  const router = useRouter();
  const { addItem } = useCart();
  const urlState = useUrlState(router);
  
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWines, setTotalWines] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const [filters, setFilters] = useState<ExtendedFilterState>({
    category: undefined,
    region: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    vintage: undefined,
    color: undefined,
    inStock: true,
    search: undefined,
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1
  });

  // Initialize filters from URL query parameters
  useEffect(() => {
    const urlFilters = urlState.parseFiltersFromUrl();
    const currentPage = urlState.getCurrentPage();
    
    setFilters(prev => ({
      ...prev,
      ...urlFilters,
      // Set defaults for undefined values
      inStock: urlFilters.inStock ?? true,
      sortBy: urlFilters.sortBy ?? 'name',
      sortOrder: urlFilters.sortOrder ?? 'asc',
      page: currentPage
    }));
    
    setCurrentPage(currentPage);
  }, [router.query]);

  // Fetch wines when filters change
  useEffect(() => {
    fetchWines();
  }, [filters, currentPage]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.search !== undefined) {
        fetchWines();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  // Fetch wines when other filters change (immediate)
  useEffect(() => {
    fetchWines();
  }, [
    filters.category,
    filters.region,
    filters.minPrice,
    filters.maxPrice,
    filters.vintage,
    filters.color,
    filters.inStock,
    filters.sortBy,
    filters.sortOrder,
    currentPage
  ]);

  const fetchWines = async () => {
    try {
      setLoading(true);
      setError(null);

      const { sortBy, sortOrder, ...wineFilters } = filters;
      const response = await wineService.getWines(
        wineFilters,
        { field: sortBy, direction: sortOrder },
        { page: currentPage, limit: 12 }
      );

      if (response.success) {
        console.log('Wine service response:', response);
        
        if (response.data && response.data.wines && response.data.pagination) {
          setWines(response.data.wines);
          setTotalPages(response.data.pagination.totalPages);
          setTotalWines(response.data.pagination.total);
        } else {
          console.error('Unexpected response structure:', response);
          console.error('Expected: response.data.wines and response.data.pagination');
          console.error('Actual response.data keys:', response.data ? Object.keys(response.data) : 'response.data is null/undefined');
          console.error('Full response.data:', response.data);
          setError('Unexpected response format from wine service');
        }
      } else {
        console.error('Wine service error:', response.error);
        setError('Failed to load wines');
      }
    } catch (err) {
      setError('Failed to load wines');
      console.error('Error fetching wines:', err);
    } finally {
      setLoading(false);
    }
  };



  const updateFilters = async (newFilters: Partial<ExtendedFilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    
    // Reset to page 1 when filters change (except when explicitly setting page)
    if (!newFilters.hasOwnProperty('page')) {
      updatedFilters.page = 1;
      setCurrentPage(1);
    }
    
    setFilters(updatedFilters);
    
    // Update URL state
    await urlState.updateUrl(updatedFilters);
  };

  const clearFilters = async () => {
    const clearedFilters: ExtendedFilterState = {
      category: undefined,
      region: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      vintage: undefined,
      color: undefined,
      inStock: true,
      search: undefined,
      sortBy: 'name',
      sortOrder: 'asc',
      page: 1
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    await urlState.clearUrl();
  };

  const handleWineSelect = (wine: Wine) => {
    router.push(`/wines/${wine.id}`);
  };

  const handleAddToCart = (wine: Wine) => {
    addItem(wine, 1);
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await updateFilters({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (searchValue: string) => {
    updateFilters({ search: searchValue || undefined });
  };

  const handleWineSelectFromSearch = (wine: Wine) => {
    router.push(`/wines/${wine.id}`);
  };

  const getFilterSummary = () => {
    return urlState.getFilterSummary(filters);
  };

  return (
    <Layout title="Browse Wines - Vintage Cellar" description="Explore our extensive wine collection with advanced filtering and search options.">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-black text-white py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                {filters.search ? `Search Results for "${filters.search}"` : 
                 filters.category ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} Wines` :
                 'Wine Collection'}
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                {totalWines > 0 ? `${totalWines} wines available` : 'Discover exceptional wines'}
              </p>
              
              {/* Mobile Search Toggle */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowMobileSearch(!showMobileSearch)}
                  className="bg-red-800 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors duration-200"
                >
                  {showMobileSearch ? 'Hide Search' : 'Search Wines'}
                </button>
              </div>
            </div>
            
            {/* Desktop Search Bar */}
            <div className="hidden lg:block max-w-2xl mx-auto mt-8">
              <WineSearch
                value={filters.search || ''}
                onChange={handleSearchChange}
                onWineSelect={handleWineSelectFromSearch}
                placeholder="Search wines, regions, or ingredients..."
              />
            </div>
            
            {/* Mobile Search Bar */}
            {showMobileSearch && (
              <div className="lg:hidden max-w-md mx-auto mt-6">
                <WineSearch
                  value={filters.search || ''}
                  onChange={handleSearchChange}
                  onWineSelect={handleWineSelectFromSearch}
                  placeholder="Search wines..."
                />
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filter Summary */}
          {urlState.hasActiveFilters() && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-red-800 mb-1">Active Filters:</h3>
                    <div className="flex flex-wrap gap-2">
                      {getFilterSummary().map((summary, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                        >
                          {summary}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-left flex items-center justify-between"
                >
                  <span className="font-medium">Filters & Sort</span>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
                <WineFilters
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onClearFilters={clearFilters}
                  className="sticky top-4"
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Results Info and View Options */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="text-gray-600">
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      <span>Loading wines...</span>
                    </div>
                  ) : (
                    <div>
                      Showing {wines.length} of {totalWines} wines
                      {currentPage > 1 && (
                        <span className="text-gray-500"> • Page {currentPage} of {totalPages}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      const shareUrl = urlState.generateShareableUrl(filters);
                      navigator.clipboard.writeText(shareUrl);
                      // You could add a toast notification here
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                    title="Copy shareable link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Wine Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md h-96 animate-pulse">
                      <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                      <div className="p-4 space-y-3">
                        <div className="bg-gray-200 h-4 rounded"></div>
                        <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                        <div className="bg-gray-200 h-6 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-600 text-xl mb-4">{error}</div>
                  <button
                    onClick={fetchWines}
                    className="bg-red-800 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>
              ) : wines.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-600 text-xl mb-4">No wines found matching your criteria</div>
                  <button
                    onClick={clearFilters}
                    className="bg-red-800 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <WineGrid
                    wines={wines}
                    onWineSelect={handleWineSelect}
                    onAddToCart={handleAddToCart}
                    data-testid="wine-grid"
                  />

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 rounded-md ${
                                currentPage === page
                                  ? 'bg-red-800 text-white'
                                  : 'text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WinesPage;