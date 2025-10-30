import { createMocks } from 'node-mocks-http';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import handler from '../../../../pages/api/wines/categories';
import * as auth from '../../../../utils/auth';

// Mock the auth module
vi.mock('../../../../utils/auth');
const mockVerifyToken = vi.mocked(auth.verifyToken);

describe('/api/wines/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/wines/categories', () => {
    it('should return simple category names when simple=true', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { simple: 'true' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(typeof data.data[0]).toBe('string');
    });

    it('should return full category objects by default', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data[0]).toHaveProperty('id');
      expect(data.data[0]).toHaveProperty('name');
      expect(data.data[0]).toHaveProperty('isActive');
    });
  });

  describe('POST /api/wines/categories', () => {
    it('should create category successfully with admin access', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          authorization: 'Bearer admin-token',
        },
        body: {
          name: 'New Category',
          description: 'Test category description',
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'admin@test.com', name: 'Admin', role: 'admin', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('New Category');
      expect(data.data.description).toBe('Test category description');
      expect(data.data.isActive).toBe(true);
    });

    it('should return 401 when no token provided', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'New Category',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 when non-admin tries to create category', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          authorization: 'Bearer staff-token',
        },
        body: {
          name: 'New Category',
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'staff@test.com', name: 'Staff', role: 'staff', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 when name is missing', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          authorization: 'Bearer admin-token',
        },
        body: {
          description: 'Test category description',
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'admin@test.com', name: 'Admin', role: 'admin', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/wines/categories', () => {
    it('should update category successfully with admin access', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        headers: {
          authorization: 'Bearer admin-token',
        },
        body: {
          id: '1',
          name: 'Updated Category',
          description: 'Updated description',
          isActive: false,
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'admin@test.com', name: 'Admin', role: 'admin', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated Category');
      expect(data.data.description).toBe('Updated description');
      expect(data.data.isActive).toBe(false);
    });

    it('should return 400 when ID is missing', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        headers: {
          authorization: 'Bearer admin-token',
        },
        body: {
          name: 'Updated Category',
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'admin@test.com', name: 'Admin', role: 'admin', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when category not found', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        headers: {
          authorization: 'Bearer admin-token',
        },
        body: {
          id: 'non-existent-id',
          name: 'Updated Category',
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'admin@test.com', name: 'Admin', role: 'admin', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/wines/categories', () => {
    it('should delete category successfully with admin access', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: '1' },
        headers: {
          authorization: 'Bearer admin-token',
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'admin@test.com', name: 'Admin', role: 'admin', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('should return 400 when ID is missing', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        headers: {
          authorization: 'Bearer admin-token',
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'admin@test.com', name: 'Admin', role: 'admin', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when category not found', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: 'non-existent-id' },
        headers: {
          authorization: 'Bearer admin-token',
        },
      });

      mockVerifyToken.mockResolvedValue({
        success: true,
        user: { id: '1', email: 'admin@test.com', name: 'Admin', role: 'admin', createdAt: new Date() },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });
});