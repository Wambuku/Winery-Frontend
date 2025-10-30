import { NextRouter } from 'next/router';
import { UrlStateManager } from '../../utils/urlState';
import { vi } from 'vitest';

// Mock Next.js router
const mockRouter: Partial<NextRouter> = {
  query: {},
  push: vi.fn(),
  pathname: '/wines',
  asPath: '/wines'
};

describe('UrlStateManager', () => {
  let urlStateManager: UrlStateManager;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.query = {};
    urlStateManager = new UrlStateManager(mockRouter as NextRouter);
  });

  describe('parseFiltersFromUrl', () => {
    it('parses string filters from URL query', () => {
      mockRouter.query = {
        category: 'red-wine',
        region: 'bordeaux',
        color: 'red',
        search: 'château'
      };

      const filters = urlStateManager.parseFiltersFromUrl();

      expect(filters).toEqual({
        category: 'red-wine',
        region: 'bordeaux',
        color: 'red',
        search: 'château'
      });
    });

    it('parses number filters from URL query', () => {
      mockRouter.query = {
        minPrice: '50',
        maxPrice: '200',
        vintage: '2020'
      };

      const filters = urlStateManager.parseFiltersFromUrl();

      expect(filters).toEqual({
        minPrice: 50,
        maxPrice: 200,
        vintage: 2020
      });
    });

    it('parses boolean filters from URL query', () => {
      mockRouter.query = {
        inStock: 'false'
      };

      const filters = urlStateManager.parseFiltersFromUrl();

      expect(filters).toEqual({
        inStock: false
      });
    });

    it('parses sort options from URL query', () => {
      mockRouter.query = {
        sortBy: 'price',
        sortOrder: 'desc'
      };

      const filters = urlStateManager.parseFiltersFromUrl();

      expect(filters).toEqual({
        sortBy: 'price',
        sortOrder: 'desc'
      });
    });

    it('parses pagination from URL query', () => {
      mockRouter.query = {
        page: '3'
      };

      const filters = urlStateManager.parseFiltersFromUrl();

      expect(filters).toEqual({
        page: 3
      });
    });

    it('ignores invalid number values', () => {
      mockRouter.query = {
        minPrice: 'invalid',
        maxPrice: 'NaN',
        vintage: 'not-a-number'
      };

      const filters = urlStateManager.parseFiltersFromUrl();

      expect(filters).toEqual({});
    });

    it('ignores invalid sort values', () => {
      mockRouter.query = {
        sortBy: 'invalid-field',
        sortOrder: 'invalid-order'
      };

      const filters = urlStateManager.parseFiltersFromUrl();

      expect(filters).toEqual({});
    });

    it('handles array query parameters by taking first value', () => {
      mockRouter.query = {
        category: ['red-wine', 'white-wine']
      };

      const filters = urlStateManager.parseFiltersFromUrl();

      expect(filters).toEqual({});
    });
  });

  describe('updateUrl', () => {
    it('updates URL with filter parameters', async () => {
      const filters = {
        category: 'red-wine',
        minPrice: 50,
        inStock: true
      };

      await urlStateManager.updateUrl(filters);

      expect(mockRouter.push).toHaveBeenCalledWith(
        {
          pathname: '/wines',
          query: {
            category: 'red-wine',
            minPrice: '50',
            inStock: 'true'
          }
        },
        undefined,
        { shallow: true, scroll: false }
      );
    });

    it('excludes undefined and empty values from URL', async () => {
      const filters = {
        category: 'red-wine',
        region: undefined,
        search: '',
        minPrice: 0
      };

      await urlStateManager.updateUrl(filters);

      expect(mockRouter.push).toHaveBeenCalledWith(
        {
          pathname: '/wines',
          query: {
            category: 'red-wine',
            minPrice: '0'
          }
        },
        undefined,
        { shallow: true, scroll: false }
      );
    });

    it('handles router push errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (mockRouter.push as any).mockRejectedValue(new Error('Router error'));

      const filters = { category: 'red-wine' };

      await urlStateManager.updateUrl(filters);

      expect(consoleSpy).toHaveBeenCalledWith('Error updating URL state:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('clearUrl', () => {
    it('clears all query parameters', async () => {
      await urlStateManager.clearUrl();

      expect(mockRouter.push).toHaveBeenCalledWith(
        '/wines',
        undefined,
        { shallow: true, scroll: false }
      );
    });
  });

  describe('getCurrentPage', () => {
    it('returns current page from URL', () => {
      mockRouter.query = { page: '3' };

      const page = urlStateManager.getCurrentPage();

      expect(page).toBe(3);
    });

    it('returns 1 for invalid page values', () => {
      mockRouter.query = { page: 'invalid' };

      const page = urlStateManager.getCurrentPage();

      expect(page).toBe(1);
    });

    it('returns 1 when no page parameter', () => {
      mockRouter.query = {};

      const page = urlStateManager.getCurrentPage();

      expect(page).toBe(1);
    });

    it('returns 1 for negative page values', () => {
      mockRouter.query = { page: '-1' };

      const page = urlStateManager.getCurrentPage();

      expect(page).toBe(1);
    });
  });

  describe('updatePage', () => {
    it('updates page parameter in URL', async () => {
      mockRouter.query = { category: 'red-wine' };

      await urlStateManager.updatePage(3);

      expect(mockRouter.push).toHaveBeenCalledWith(
        {
          pathname: '/wines',
          query: {
            category: 'red-wine',
            page: '3'
          }
        },
        undefined,
        { shallow: true, scroll: false }
      );
    });

    it('removes page parameter for page 1', async () => {
      mockRouter.query = { category: 'red-wine', page: '2' };

      await urlStateManager.updatePage(1);

      expect(mockRouter.push).toHaveBeenCalledWith(
        {
          pathname: '/wines',
          query: {
            category: 'red-wine'
          }
        },
        undefined,
        { shallow: true, scroll: false }
      );
    });
  });

  describe('generateShareableUrl', () => {
    it('generates shareable URL with filters', () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com' },
        writable: true
      });

      const filters = {
        category: 'red-wine',
        minPrice: 50,
        search: 'château'
      };

      const url = urlStateManager.generateShareableUrl(filters);

      expect(url).toBe('https://example.com/wines?category=red-wine&minPrice=50&search=ch%C3%A2teau');
    });

    it('generates URL without query parameters when no filters', () => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com' },
        writable: true
      });

      const filters = {};

      const url = urlStateManager.generateShareableUrl(filters);

      expect(url).toBe('https://example.com/wines');
    });
  });

  describe('hasActiveFilters', () => {
    it('returns true when filter parameters exist', () => {
      mockRouter.query = { category: 'red-wine' };

      const hasFilters = urlStateManager.hasActiveFilters();

      expect(hasFilters).toBe(true);
    });

    it('returns false when no filter parameters exist', () => {
      mockRouter.query = {};

      const hasFilters = urlStateManager.hasActiveFilters();

      expect(hasFilters).toBe(false);
    });

    it('ignores non-filter parameters', () => {
      mockRouter.query = { someOtherParam: 'value' };

      const hasFilters = urlStateManager.hasActiveFilters();

      expect(hasFilters).toBe(false);
    });
  });

  describe('getFilterSummary', () => {
    it('generates filter summary for display', () => {
      const filters = {
        search: 'château',
        category: 'red-wine',
        region: 'bordeaux',
        minPrice: 50,
        maxPrice: 200,
        vintage: 2020,
        inStock: false,
        sortBy: 'price' as const,
        sortOrder: 'desc' as const
      };

      const summary = urlStateManager.getFilterSummary(filters);

      expect(summary).toEqual([
        'Search: "château"',
        'Category: red-wine',
        'Region: bordeaux',
        'Price: KSh 50 - KSh 200',
        'Vintage: 2020',
        'Including out of stock',
        'Sorted by: Price (High to Low)'
      ]);
    });

    it('handles partial price ranges', () => {
      const filters = {
        minPrice: 50
      };

      const summary = urlStateManager.getFilterSummary(filters);

      expect(summary).toEqual(['Price: KSh 50']);
    });

    it('returns empty array for no filters', () => {
      const filters = {};

      const summary = urlStateManager.getFilterSummary(filters);

      expect(summary).toEqual([]);
    });
  });

  describe('getSortLabel', () => {
    it('returns correct sort labels', () => {
      const testCases = [
        { sortBy: 'name' as const, sortOrder: 'asc' as const, expected: 'Name (A-Z)' },
        { sortBy: 'name' as const, sortOrder: 'desc' as const, expected: 'Name (Z-A)' },
        { sortBy: 'price' as const, sortOrder: 'asc' as const, expected: 'Price (Low to High)' },
        { sortBy: 'price' as const, sortOrder: 'desc' as const, expected: 'Price (High to Low)' },
        { sortBy: 'vintage' as const, sortOrder: 'asc' as const, expected: 'Vintage (Oldest)' },
        { sortBy: 'vintage' as const, sortOrder: 'desc' as const, expected: 'Vintage (Newest)' }
      ];

      testCases.forEach(({ sortBy, sortOrder, expected }) => {
        const filters = { sortBy, sortOrder };
        const summary = urlStateManager.getFilterSummary(filters);
        expect(summary).toContain(`Sorted by: ${expected}`);
      });
    });
  });
});