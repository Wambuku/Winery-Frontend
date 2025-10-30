import { NextRouter } from 'next/router';
import { WineFilters, WineSortOptions } from '../services/api/wineService';

export interface FilterState extends WineFilters {
  sortBy: WineSortOptions['field'];
  sortOrder: WineSortOptions['direction'];
  page?: number;
}

export interface UrlStateOptions {
  shallow?: boolean;
  scroll?: boolean;
}

/**
 * Utility class for managing filter state in URL query parameters
 */
export class UrlStateManager {
  private router: NextRouter;
  private basePath: string;

  constructor(router: NextRouter, basePath: string = '/wines') {
    this.router = router;
    this.basePath = basePath;
  }

  /**
   * Parse URL query parameters into filter state
   */
  parseFiltersFromUrl(): Partial<FilterState> {
    const query = this.router.query;
    const filters: Partial<FilterState> = {};

    // String filters
    if (query.category && typeof query.category === 'string') {
      filters.category = query.category;
    }
    if (query.region && typeof query.region === 'string') {
      filters.region = query.region;
    }
    if (query.color && typeof query.color === 'string') {
      filters.color = query.color;
    }
    if (query.search && typeof query.search === 'string') {
      filters.search = query.search;
    }

    // Number filters
    if (query.minPrice && typeof query.minPrice === 'string') {
      const minPrice = parseFloat(query.minPrice);
      if (!isNaN(minPrice)) {
        filters.minPrice = minPrice;
      }
    }
    if (query.maxPrice && typeof query.maxPrice === 'string') {
      const maxPrice = parseFloat(query.maxPrice);
      if (!isNaN(maxPrice)) {
        filters.maxPrice = maxPrice;
      }
    }
    if (query.vintage && typeof query.vintage === 'string') {
      const vintage = parseInt(query.vintage);
      if (!isNaN(vintage)) {
        filters.vintage = vintage;
      }
    }

    // Boolean filters
    if (query.inStock && typeof query.inStock === 'string') {
      filters.inStock = query.inStock.toLowerCase() === 'true';
    }

    // Sort options
    if (query.sortBy && typeof query.sortBy === 'string') {
      const validSortFields: WineSortOptions['field'][] = ['name', 'price', 'vintage', 'alcoholContent'];
      if (validSortFields.includes(query.sortBy as WineSortOptions['field'])) {
        filters.sortBy = query.sortBy as WineSortOptions['field'];
      }
    }
    if (query.sortOrder && typeof query.sortOrder === 'string') {
      const validSortOrders: WineSortOptions['direction'][] = ['asc', 'desc'];
      if (validSortOrders.includes(query.sortOrder as WineSortOptions['direction'])) {
        filters.sortOrder = query.sortOrder as WineSortOptions['direction'];
      }
    }

    // Pagination
    if (query.page && typeof query.page === 'string') {
      const page = parseInt(query.page);
      if (!isNaN(page) && page > 0) {
        filters.page = page;
      }
    }

    return filters;
  }

  /**
   * Update URL with current filter state
   */
  async updateUrl(
    filters: Partial<FilterState>, 
    options: UrlStateOptions = { shallow: true, scroll: false }
  ): Promise<void> {
    const query: Record<string, string> = {};

    // Add non-empty filter values to query
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Handle boolean values
        if (typeof value === 'boolean') {
          query[key] = value.toString();
        }
        // Handle number values
        else if (typeof value === 'number') {
          query[key] = value.toString();
        }
        // Handle string values
        else if (typeof value === 'string') {
          query[key] = value;
        }
      }
    });

    try {
      await this.router.push(
        {
          pathname: this.basePath,
          query
        },
        undefined,
        options
      );
    } catch (error) {
      console.error('Error updating URL state:', error);
    }
  }

  /**
   * Clear all filters from URL
   */
  async clearUrl(options: UrlStateOptions = { shallow: true, scroll: false }): Promise<void> {
    try {
      await this.router.push(this.basePath, undefined, options);
    } catch (error) {
      console.error('Error clearing URL state:', error);
    }
  }

  /**
   * Get current page from URL
   */
  getCurrentPage(): number {
    const page = this.router.query.page;
    if (typeof page === 'string') {
      const pageNum = parseInt(page);
      return !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
    }
    return 1;
  }

  /**
   * Update only the page parameter in URL
   */
  async updatePage(page: number, options: UrlStateOptions = { shallow: true, scroll: false }): Promise<void> {
    const currentQuery = { ...this.router.query };
    
    if (page === 1) {
      // Remove page parameter for page 1 to keep URLs clean
      delete currentQuery.page;
    } else {
      currentQuery.page = page.toString();
    }

    try {
      await this.router.push(
        {
          pathname: this.basePath,
          query: currentQuery
        },
        undefined,
        options
      );
    } catch (error) {
      console.error('Error updating page in URL:', error);
    }
  }

  /**
   * Generate shareable URL for current filter state
   */
  generateShareableUrl(filters: Partial<FilterState>): string {
    const query = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value.toString());
      }
    });

    const queryString = query.toString();
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    return `${baseUrl}${this.basePath}${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Check if current URL has any filter parameters
   */
  hasActiveFilters(): boolean {
    const query = this.router.query;
    const filterKeys = [
      'category', 'region', 'color', 'search', 'minPrice', 'maxPrice', 
      'vintage', 'inStock', 'sortBy', 'sortOrder'
    ];
    
    return filterKeys.some(key => query[key] !== undefined);
  }

  /**
   * Get filter summary for display
   */
  getFilterSummary(filters: Partial<FilterState>): string[] {
    const summary: string[] = [];

    if (filters.search) {
      summary.push(`Search: "${filters.search}"`);
    }
    if (filters.category) {
      summary.push(`Category: ${filters.category}`);
    }
    if (filters.region) {
      summary.push(`Region: ${filters.region}`);
    }
    if (filters.color) {
      summary.push(`Color: ${filters.color}`);
    }
    if (filters.minPrice || filters.maxPrice) {
      const priceRange = [
        filters.minPrice ? `KSh ${filters.minPrice}` : '',
        filters.maxPrice ? `KSh ${filters.maxPrice}` : ''
      ].filter(Boolean).join(' - ');
      summary.push(`Price: ${priceRange}`);
    }
    if (filters.vintage) {
      summary.push(`Vintage: ${filters.vintage}`);
    }
    if (filters.inStock === false) {
      summary.push('Including out of stock');
    }
    if (filters.sortBy && filters.sortOrder) {
      const sortLabel = this.getSortLabel(filters.sortBy, filters.sortOrder);
      summary.push(`Sorted by: ${sortLabel}`);
    }

    return summary;
  }

  /**
   * Get human-readable sort label
   */
  private getSortLabel(sortBy: WineSortOptions['field'], sortOrder: WineSortOptions['direction']): string {
    const sortLabels: Record<string, string> = {
      'name-asc': 'Name (A-Z)',
      'name-desc': 'Name (Z-A)',
      'price-asc': 'Price (Low to High)',
      'price-desc': 'Price (High to Low)',
      'vintage-asc': 'Vintage (Oldest)',
      'vintage-desc': 'Vintage (Newest)',
      'alcoholContent-asc': 'Alcohol Content (Low to High)',
      'alcoholContent-desc': 'Alcohol Content (High to Low)'
    };

    return sortLabels[`${sortBy}-${sortOrder}`] || `${sortBy} (${sortOrder})`;
  }
}

/**
 * Hook for using URL state management in components
 */
export const useUrlState = (router: NextRouter, basePath?: string) => {
  return new UrlStateManager(router, basePath);
};

export default UrlStateManager;