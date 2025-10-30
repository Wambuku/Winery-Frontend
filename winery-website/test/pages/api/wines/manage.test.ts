import { createMocks } from 'node-mocks-http';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import handler from '../../../../pages/api/wines/manage';
import * as auth from '../../../../utils/auth';

// Mock the auth module
vi.mock('../../../../utils/auth');
const mockVerifyToken = vi.mocked(auth.verifyToken);

describe('/api/wines/manage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PUT /api/wines/manage', () => {
    it('should update wine successfully with valid data', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        headers: {
          authorization: 'Bearer valid-token',
        },
        body: {
          id: '1',
          name: 'Updated Wine Name',
          price: 100,
          stockQuantity: 50,
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'staff@test.com', name: 'Staff', role: 'staff', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated Wine Name');
      expect(data.data.price).toBe(100);
      expect(data.data.stockQuantity).toBe(50);
    });

    it('should return 401 when no token provided', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          id: '1',
          name: 'Updated Wine Name',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 when customer tries to update wine', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        headers: {
          authorization: 'Bearer customer-token',
        },
        body: {
          id: '1',
          name: 'Updated Wine Name',
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'customer@test.com', name: 'Customer', role: 'customer', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 when wine ID is missing', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        headers: {
          authorization: 'Bearer staff-token',
        },
        body: {
          name: 'Updated Wine Name',
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'staff@test.com', name: 'Staff', role: 'staff', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when wine not found', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        headers: {
          authorization: 'Bearer staff-token',
        },
        body: {
          id: 'non-existent-id',
          name: 'Updated Wine Name',
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'staff@test.com', name: 'Staff', role: 'staff', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/wines/manage', () => {
    it('should delete wine successfully', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: '1' },
        headers: {
          authorization: 'Bearer staff-token',
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'staff@test.com', name: 'Staff', role: 'staff', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('should return 400 when wine ID is missing', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        headers: {
          authorization: 'Bearer staff-token',
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'staff@test.com', name: 'Staff', role: 'staff', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when wine not found', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: 'non-existent-id' },
        headers: {
          authorization: 'Bearer staff-token',
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'staff@test.com', name: 'Staff', role: 'staff', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Unsupported methods', () => {
    it('should return 405 for GET method', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: 'Bearer staff-token',
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'staff@test.com', name: 'Staff', role: 'staff', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('METHOD_NOT_ALLOWED');
    });
  });
});