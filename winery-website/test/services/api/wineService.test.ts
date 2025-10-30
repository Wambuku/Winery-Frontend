import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { wineService } from '../../../services/api/wineService';
import { Wine, ApiResponse } from '../../../types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock config
vi.mock('../../../utils/config', () => ({
  config: {
    api: {
      wineApiUrl: 'http://localhost:3000/api',
      wineApiKey: 'test-api-key',
    },
  },
}));

describe('WineService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getWines', () => {
    it('should fetch wines with default parameters', async () => {
      const mockResponse = {
        wines: [
          {
            id: '1',
            name: 'Test Wine',
            price: 50,
            category: 'Red Wine',
            region: 'Test Region',
            vintage: 2020,
            inStock: true,
            stockQuantity: 10,
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await wineService.getWines();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/wines?page=1&limit=20&sortBy=name&sortOrder=asc',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
          },
        }
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.wines).toHaveLength(1);
        expect(result.data.wines[0].name).toBe('Test Wine');
      }
    });

    it('should apply filters correctly', async () => {
      const mockResponse = {
        wines: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const filters = {
        category: 'Red Wine',
        region: 'Bordeaux',
        minPrice: 100,
        maxPrice: 500,
        vintage: 2015,
        inStock: true,
      };

      await wineService.getWines(filters);

      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain('category=Red+Wine');
      expect(callUrl).toContain('region=Bordeaux');
      expect(callUrl).toContain('minPrice=100');
      expect(callUrl).toContain('maxPrice=500');
      expect(callUrl).toContain('vintage=2015');
      expect(callUrl).toContain('inStock=true');
    });



    it('should retry on network errors', async () => {
      // First call fails with network error
      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));
      
      // Second call succeeds
      const mockResponse = {
        wines: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await wineService.getWines();

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });

    it('should fail after max retries', async () => {
      // All calls fail with network error
      mockFetch.mockRejectedValue(new TypeError('fetch failed'));

      const result = await wineService.getWines();

      expect(mockFetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('API_ERROR');
        expect(result.error.details.retryCount).toBe(3);
      }
    }, 10000); // Increase timeout to 10 seconds
  });

  describe('getWineById', () => {
    it('should fetch a single wine by ID', async () => {
      const mockWine: Wine = {
        id: '1',
        name: 'Test Wine',
        description: 'A test wine',
        price: 50,
        image: '/test.jpg',
        ingredients: ['Grapes'],
        color: 'Red',
        history: 'Test history',
        vintage: 2020,
        region: 'Test Region',
        alcoholContent: 13.5,
        category: 'Red Wine',
        inStock: true,
        stockQuantity: 10,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWine,
      });

      const result = await wineService.getWineById('1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/wines/1',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('1');
        expect(result.data.name).toBe('Test Wine');
      }
    });
  });

  describe('searchWines', () => {
    it('should search wines with query', async () => {
      const mockResponse = {
        wines: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await wineService.searchWines('bordeaux');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=bordeaux'),
        expect.any(Object)
      );
    });
  });

  describe('getCategories', () => {
    it('should fetch wine categories', async () => {
      const mockCategories = ['Red Wine', 'White Wine', 'Sparkling Wine'];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      });

      const result = await wineService.getCategories();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/wines/categories',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockCategories);
      }
    });
  });

  describe('getRegions', () => {
    it('should fetch wine regions', async () => {
      const mockRegions = ['Bordeaux, France', 'Tuscany, Italy', 'Napa Valley, California'];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegions,
      });

      const result = await wineService.getRegions();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/wines/regions',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockRegions);
      }
    });
  });

  describe('createWine', () => {
    it('should create a new wine', async () => {
      const wineData = {
        name: 'New Wine',
        description: 'A new wine',
        price: 75,
        image: '/new-wine.jpg',
        ingredients: ['Cabernet Sauvignon'],
        color: 'Red',
        history: 'New wine history',
        vintage: 2021,
        region: 'New Region',
        alcoholContent: 14.0,
        category: 'Red Wine',
        stockQuantity: 20,
      };

      const mockCreatedWine: Wine = {
        id: '123',
        ...wineData,
        inStock: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreatedWine,
      });

      const result = await wineService.createWine(wineData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/wines',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            ...wineData,
            inStock: true,
          }),
        })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('New Wine');
        expect(result.data.inStock).toBe(true);
      }
    });
  });

  describe('updateWine', () => {
    it('should update an existing wine', async () => {
      const updateData = {
        id: '1',
        name: 'Updated Wine',
        price: 100,
        stockQuantity: 5,
      };

      const mockUpdatedWine: Wine = {
        id: '1',
        name: 'Updated Wine',
        description: 'Original description',
        price: 100,
        image: '/wine.jpg',
        ingredients: ['Grapes'],
        color: 'Red',
        history: 'History',
        vintage: 2020,
        region: 'Region',
        alcoholContent: 13.5,
        category: 'Red Wine',
        inStock: true,
        stockQuantity: 5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedWine,
      });

      const result = await wineService.updateWine(updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/wines/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            name: 'Updated Wine',
            price: 100,
            stockQuantity: 5,
            inStock: true,
          }),
        })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Updated Wine');
        expect(result.data.price).toBe(100);
      }
    });
  });

  describe('deleteWine', () => {
    it('should delete a wine', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await wineService.deleteWine('1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/wines/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
      }
    });
  });

  describe('bulkUpdateStock', () => {
    it('should update stock for multiple wines', async () => {
      const updates = [
        { id: '1', stockQuantity: 15 },
        { id: '2', stockQuantity: 8 },
      ];

      const mockUpdatedWines: Wine[] = [
        {
          id: '1',
          name: 'Wine 1',
          description: 'Description 1',
          price: 50,
          image: '/wine1.jpg',
          ingredients: ['Grapes'],
          color: 'Red',
          history: 'History 1',
          vintage: 2020,
          region: 'Region 1',
          alcoholContent: 13.5,
          category: 'Red Wine',
          inStock: true,
          stockQuantity: 15,
        },
        {
          id: '2',
          name: 'Wine 2',
          description: 'Description 2',
          price: 75,
          image: '/wine2.jpg',
          ingredients: ['Grapes'],
          color: 'White',
          history: 'History 2',
          vintage: 2021,
          region: 'Region 2',
          alcoholContent: 12.5,
          category: 'White Wine',
          inStock: true,
          stockQuantity: 8,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedWines,
      });

      const result = await wineService.bulkUpdateStock(updates);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/wines/bulk-stock',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ updates }),
        })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0].stockQuantity).toBe(15);
        expect(result.data[1].stockQuantity).toBe(8);
      }
    });
  });

  describe('getFeaturedWines', () => {
    it('should fetch featured wines with default limit', async () => {
      const mockFeaturedWines: Wine[] = [
        {
          id: '1',
          name: 'Featured Wine',
          description: 'A featured wine',
          price: 100,
          image: '/featured.jpg',
          ingredients: ['Grapes'],
          color: 'Red',
          history: 'Featured history',
          vintage: 2020,
          region: 'Featured Region',
          alcoholContent: 13.5,
          category: 'Red Wine',
          inStock: true,
          stockQuantity: 10,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFeaturedWines,
      });

      const result = await wineService.getFeaturedWines();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/wines/featured?limit=6',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].name).toBe('Featured Wine');
      }
    });
  });

  describe('getLowStockWines', () => {
    it('should fetch low stock wines with default threshold', async () => {
      const mockLowStockWines: Wine[] = [
        {
          id: '1',
          name: 'Low Stock Wine',
          description: 'A wine with low stock',
          price: 50,
          image: '/low-stock.jpg',
          ingredients: ['Grapes'],
          color: 'Red',
          history: 'Low stock history',
          vintage: 2020,
          region: 'Low Stock Region',
          alcoholContent: 13.5,
          category: 'Red Wine',
          inStock: true,
          stockQuantity: 3,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLowStockWines,
      });

      const result = await wineService.getLowStockWines();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/wines/low-stock?threshold=10',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].stockQuantity).toBe(3);
      }
    });
  });
});