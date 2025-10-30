import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/wines/external';

// Mock the wine service
vi.mock('../../../../services/api/wineService', () => ({
  wineService: {
    getExternalWines: vi.fn(),
    syncExternalWines: vi.fn(),
  },
}));

import { wineService } from '../../../../services/api/wineService';

describe('/api/wines/external', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/wines/external', () => {
    it('should return external wines successfully', async () => {
      const mockWines = [
        {
          id: '1',
          name: 'Test Wine',
          description: 'Test Description',
          price: 25.99,
          image: 'https://example.com/wine.jpg',
          ingredients: [],
          color: 'Red',
          history: '',
          vintage: 2020,
          region: 'Test Region',
          alcoholContent: 13.5,
          category: 'Red',
          inStock: true,
          stockQuantity: 50,
        },
      ];

      (wineService.getExternalWines as any).mockResolvedValue({
        success: true,
        data: mockWines,
      });

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockWines);
      expect(data.source).toBe('external_api');
    });

    it('should handle external API errors', async () => {
      (wineService.getExternalWines as any).mockResolvedValue({
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Failed to fetch wines',
        },
      });

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('API_ERROR');
    });

    it('should handle unexpected errors', async () => {
      (wineService.getExternalWines as any).mockRejectedValue(
        new Error('Network error')
      );

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXTERNAL_API_ERROR');
      expect(data.error.details).toBe('Network error');
    });
  });

  describe('POST /api/wines/external?action=sync', () => {
    it('should sync external wines successfully', async () => {
      const mockSyncResult = {
        synced: 5,
        errors: [],
      };

      (wineService.syncExternalWines as any).mockResolvedValue({
        success: true,
        data: mockSyncResult,
      });

      const { req, res } = createMocks({
        method: 'POST',
        query: { action: 'sync' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockSyncResult);
      expect(data.message).toBe('Successfully synced 5 wines');
    });

    it('should handle sync errors', async () => {
      (wineService.syncExternalWines as any).mockResolvedValue({
        success: false,
        error: {
          code: 'SYNC_ERROR',
          message: 'Failed to sync wines',
        },
      });

      const { req, res } = createMocks({
        method: 'POST',
        query: { action: 'sync' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SYNC_ERROR');
    });

    it('should handle sync with partial errors', async () => {
      const mockSyncResult = {
        synced: 3,
        errors: ['Failed to sync Wine A', 'Failed to sync Wine B'],
      };

      (wineService.syncExternalWines as any).mockResolvedValue({
        success: true,
        data: mockSyncResult,
      });

      const { req, res } = createMocks({
        method: 'POST',
        query: { action: 'sync' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.synced).toBe(3);
      expect(data.data.errors).toHaveLength(2);
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

    it('should return 405 for POST without sync action', async () => {
      const { req, res } = createMocks({
        method: 'POST',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('METHOD_NOT_ALLOWED');
    });
  });
});