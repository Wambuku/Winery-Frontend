import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/wines/[id]';
import { verifyToken } from '../../../../utils/auth';

// Mock the auth utility
vi.mock('../../../../utils/auth', () => ({
  verifyToken: vi.fn(),
}));

const mockVerifyToken = vi.mocked(verifyToken);

describe('/api/wines/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/wines/[id]', () => {
    it('should return a wine by ID', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: '1' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('1');
      expect(data.data.name).toBe('Château Margaux 2015');
    });

    it('should return 404 for non-existent wine', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: '999' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('WINE_NOT_FOUND');
    });

    it('should return 400 for invalid ID', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: ['1', '2'] }, // Array instead of string
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_ID');
    });
  });

  describe('PATCH /api/wines/[id]', () => {
    it('should update a wine with valid staff authentication', async () => {
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

      const updateData = {
        name: 'Updated Wine Name',
        price: 999,
        stockQuantity: 15,
      };

      const { req, res } = createMocks({
        method: 'PATCH',
        query: { id: '1' },
        body: updateData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated Wine Name');
      expect(data.data.price).toBe(999);
      expect(data.data.stockQuantity).toBe(15);
      expect(data.data.inStock).toBe(true);
    });

    it('should update stock status when stockQuantity is 0', async () => {
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

      const updateData = {
        stockQuantity: 0,
      };

      const { req, res } = createMocks({
        method: 'PATCH',
        query: { id: '1' },
        body: updateData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(true);
      expect(data.data.stockQuantity).toBe(0);
      expect(data.data.inStock).toBe(false);
    });

    it('should require authentication for wine updates', async () => {
      mockVerifyToken.mockResolvedValueOnce({
        success: false,
        error: 'Invalid token',
      });

      const { req, res } = createMocks({
        method: 'PATCH',
        query: { id: '1' },
        body: { name: 'Updated Name' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should require staff or admin role for wine updates', async () => {
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
        method: 'PATCH',
        query: { id: '1' },
        body: { name: 'Updated Name' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 for non-existent wine update', async () => {
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
        method: 'PATCH',
        query: { id: '999' },
        body: { name: 'Updated Name' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('WINE_NOT_FOUND');
    });
  });

  describe('DELETE /api/wines/[id]', () => {
    it('should delete a wine with valid staff authentication', async () => {
      mockVerifyToken.mockResolvedValueOnce({
        success: true,
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          createdAt: new Date(),
        },
      });

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: '1' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(true);
      expect(data.data.success).toBe(true);
    });

    it('should require authentication for wine deletion', async () => {
      mockVerifyToken.mockResolvedValueOnce({
        success: false,
        error: 'Invalid token',
      });

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: '1' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should require staff or admin role for wine deletion', async () => {
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
        method: 'DELETE',
        query: { id: '1' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 for non-existent wine deletion', async () => {
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
        method: 'DELETE',
        query: { id: '999' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('WINE_NOT_FOUND');
    });
  });

  describe('Unsupported methods', () => {
    it('should return 405 for unsupported methods', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { id: '1' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('METHOD_NOT_ALLOWED');
    });
  });
});