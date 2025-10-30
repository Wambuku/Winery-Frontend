import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/wines/index';
import { verifyToken } from '../../../../utils/auth';

// Mock the auth utility
vi.mock('../../../../utils/auth', () => ({
  verifyToken: vi.fn(),
}));

const mockVerifyToken = vi.mocked(verifyToken);

describe('/api/wines', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/wines', () => {
    it('should return paginated wines with default parameters', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('wines');
      expect(data.data).toHaveProperty('pagination');
      expect(data.data.pagination.page).toBe(1);
      expect(data.data.pagination.limit).toBe(20);
      expect(Array.isArray(data.data.wines)).toBe(true);
    });

    it('should apply pagination parameters', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          page: '2',
          limit: '5',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      
      expect(data.data.pagination.page).toBe(2);
      expect(data.data.pagination.limit).toBe(5);
    });

    it('should apply category filter', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          category: 'Red Wine',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      
      // All returned wines should be Red Wine category
      data.data.wines.forEach((wine: any) => {
        expect(wine.category).toContain('Red');
      });
    });

    it('should apply price range filter', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          minPrice: '100',
          maxPrice: '500',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      
      // All returned wines should be within price range
      data.data.wines.forEach((wine: any) => {
        expect(wine.price).toBeGreaterThanOrEqual(100);
        expect(wine.price).toBeLessThanOrEqual(500);
      });
    });

    it('should apply search filter', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          search: 'Château',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      
      // Should find wines matching the search term
      expect(data.data.wines.length).toBeGreaterThan(0);
      data.data.wines.forEach((wine: any) => {
        const matchesSearch = 
          wine.name.toLowerCase().includes('château') ||
          wine.description.toLowerCase().includes('château') ||
          wine.region.toLowerCase().includes('château');
        expect(matchesSearch).toBe(true);
      });
    });

    it('should apply sorting', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          sortBy: 'price',
          sortOrder: 'desc',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      
      // Wines should be sorted by price in descending order
      for (let i = 1; i < data.data.wines.length; i++) {
        expect(data.data.wines[i - 1].price).toBeGreaterThanOrEqual(data.data.wines[i].price);
      }
    });

    it('should filter by stock status', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          inStock: 'true',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      
      // All returned wines should be in stock
      data.data.wines.forEach((wine: any) => {
        expect(wine.inStock).toBe(true);
      });
    });
  });

  describe('POST /api/wines', () => {
    it('should create a new wine with valid staff authentication', async () => {
      mockVerifyToken.mockResolvedValueOnce({
        success: true,
        user: {
          id: '1',
          email: 'staff@example.com',
          name: 'Staff User',
          role: 'staff',
          createdAt: new Date(),
        },
      });

      const wineData = {
        name: 'New Test Wine',
        description: 'A test wine for creation',
        price: 75,
        image: '/test-wine.jpg',
        ingredients: ['Cabernet Sauvignon', 'Merlot'],
        color: 'Red',
        history: 'Test wine history',
        vintage: 2021,
        region: 'Test Region',
        alcoholContent: 14.0,
        category: 'Red Wine',
        stockQuantity: 25,
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: wineData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('New Test Wine');
      expect(data.data.inStock).toBe(true);
      expect(data.data.stockQuantity).toBe(25);
    });

    it('should require authentication for wine creation', async () => {
      mockVerifyToken.mockResolvedValueOnce({
        success: false,
        error: 'Invalid token',
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Test Wine',
          price: 50,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should require staff or admin role for wine creation', async () => {
      mockVerifyToken.mockResolvedValueOnce({
        success: true,
        user: {
          id: '1',
          email: 'customer@example.com',
          name: 'Customer User',
          role: 'customer',
          createdAt: new Date(),
        },
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Test Wine',
          price: 50,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should validate required fields', async () => {
      mockVerifyToken.mockResolvedValueOnce({
        success: true,
        user: {
          id: '1',
          email: 'staff@example.com',
          name: 'Staff User',
          role: 'staff',
          createdAt: new Date(),
        },
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Test Wine',
          // Missing required fields
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('Missing required fields');
    });
  });

  describe('Unsupported methods', () => {
    it('should return 405 for unsupported methods', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('METHOD_NOT_ALLOWED');
    });
  });


});