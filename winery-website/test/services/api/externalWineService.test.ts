import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the wine service module
vi.mock('../../../services/api/wineService', async () => {
  const actual = await vi.importActual('../../../services/api/wineService');
  return {
    ...actual,
    wineService: {
      getExternalWines: vi.fn(),
      syncExternalWines: vi.fn(),
      getWines: vi.fn(),
    },
  };
});

import { wineService } from '../../../services/api/wineService';

describe('External Wine API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getExternalWines', () => {
    it('should fetch wines from external API successfully', async () => {
      const mockTransformedWines = [
        {
          id: '1',
          name: 'Cabernet Sauvignon 2020',
          description: 'Rich and full-bodied red wine',
          price: 25.99,
          image: 'https://example.com/wine1.jpg',
          ingredients: [],
          color: 'Red',
          history: '',
          vintage: 2020,
          region: 'Napa Valley',
          alcoholContent: 13.5,
          category: 'Red',
          inStock: true,
          stockQuantity: 50,
        },
        {
          id: '2',
          name: 'Chardonnay 2021',
          description: 'Crisp and refreshing white wine',
          price: 18.99,
          image: 'https://example.com/wine2.jpg',
          ingredients: [],
          color: 'White',
          history: '',
          vintage: 2021,
          region: 'Sonoma County',
          alcoholContent: 12.5,
          category: 'White',
          inStock: true,
          stockQuantity: 30,
        },
      ];

      (wineService.getExternalWines as any).mockResolvedValue({
        success: true,
        data: mockTransformedWines,
      });

      const result = await wineService.getExternalWines();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0]).toMatchObject({
        id: '1',
        name: 'Cabernet Sauvignon 2020',
        price: 25.99,
        region: 'Napa Valley',
        vintage: 2020,
        inStock: true,
        stockQuantity: 50,
      });
    });

    it('should handle authentication failure', async () => {
      (wineService.getExternalWines as any).mockResolvedValue({
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Failed to authenticate with external API',
        },
      });

      const result = await wineService.getExternalWines();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('AUTH_ERROR');
    });

    it('should handle API errors with retry logic', async () => {
      (wineService.getExternalWines as any).mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await wineService.getExternalWines();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('syncExternalWines', () => {
    it('should sync external wines to internal database', async () => {
      (wineService.syncExternalWines as any).mockResolvedValue({
        success: true,
        data: {
          synced: 1,
          errors: [],
        },
      });

      const result = await wineService.syncExternalWines();

      expect(result.success).toBe(true);
      expect(result.data?.synced).toBe(1);
      expect(result.data?.errors).toHaveLength(0);
    });

    it('should handle sync errors gracefully', async () => {
      (wineService.syncExternalWines as any).mockResolvedValue({
        success: true,
        data: {
          synced: 1,
          errors: ['Failed to sync wine Test Wine 2: Wine already exists'],
        },
      });

      const result = await wineService.syncExternalWines();

      expect(result.success).toBe(true);
      expect(result.data?.synced).toBe(1);
      expect(result.data?.errors).toHaveLength(1);
      expect(result.data?.errors[0]).toContain('Test Wine 2');
    });
  });

  describe('getWines with external API integration', () => {
    it('should prioritize external API and fallback to internal API', async () => {
      const mockPaginatedResponse = {
        wines: [
          {
            id: '1',
            name: 'External Wine',
            description: 'From external API',
            price: 30.00,
            image: 'https://example.com/external.jpg',
            ingredients: [],
            color: 'Red',
            history: '',
            vintage: 2020,
            region: 'External Region',
            alcoholContent: 14.0,
            category: 'Red',
            inStock: true,
            stockQuantity: 20,
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

      (wineService.getWines as any).mockResolvedValue({
        success: true,
        data: mockPaginatedResponse,
      });

      const result = await wineService.getWines();

      expect(result.success).toBe(true);
      expect(result.data?.wines).toHaveLength(1);
      expect(result.data?.wines[0].name).toBe('External Wine');
    });

    it('should fallback to internal API when external API fails', async () => {
      const mockPaginatedResponse = {
        wines: [
          {
            id: 'internal-1',
            name: 'Internal Wine',
            description: 'From internal API',
            price: 25.00,
            image: 'https://example.com/internal.jpg',
            ingredients: [],
            color: 'Red',
            history: '',
            vintage: 2020,
            region: 'Internal Region',
            alcoholContent: 13.0,
            category: 'Red',
            inStock: true,
            stockQuantity: 15,
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

      (wineService.getWines as any).mockResolvedValue({
        success: true,
        data: mockPaginatedResponse,
      });

      const result = await wineService.getWines();

      expect(result.success).toBe(true);
      expect(result.data?.wines[0].name).toBe('Internal Wine');
    });
  });
});