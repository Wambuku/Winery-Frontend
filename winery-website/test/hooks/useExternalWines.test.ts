import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useExternalWines } from '../../hooks/useExternalWines';

// Mock fetch globally
global.fetch = vi.fn();

describe('useExternalWines', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch external wines on mount', async () => {
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

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockWines,
      }),
    });

    const { result } = renderHook(() => useExternalWines());

    expect(result.current.loading).toBe(true);
    expect(result.current.wines).toEqual([]);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.wines).toEqual(mockWines);
    expect(result.current.error).toBe(null);
    expect(fetch).toHaveBeenCalledWith('/api/wines/external');
  });

  it('should handle fetch errors', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        error: {
          message: 'Failed to fetch wines',
        },
      }),
    });

    const { result } = renderHook(() => useExternalWines());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.wines).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch wines');
  });

  it('should handle network errors', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useExternalWines());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.wines).toEqual([]);
    expect(result.current.error).toBe('Network error');
  });

  it('should refetch wines when refetch is called', async () => {
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

    // Initial fetch
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockWines,
      }),
    });

    const { result } = renderHook(() => useExternalWines());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Refetch with same data (simpler test)
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockWines,
      }),
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.wines).toEqual(mockWines);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should sync wines successfully', async () => {
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

    // Initial fetch
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockWines,
      }),
    });

    const { result } = renderHook(() => useExternalWines());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock sync response
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          synced: 5,
          errors: [],
        },
      }),
    });

    // Mock refetch after sync
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockWines,
      }),
    });

    let syncResult;
    await act(async () => {
      syncResult = await result.current.syncWines();
    });

    expect(syncResult).toEqual({
      synced: 5,
      errors: [],
    });

    expect(fetch).toHaveBeenCalledWith('/api/wines/external?action=sync', {
      method: 'POST',
    });
  });

  it('should handle sync errors', async () => {
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

    // Initial fetch
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockWines,
      }),
    });

    const { result } = renderHook(() => useExternalWines());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock sync error
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        error: {
          message: 'Sync failed',
        },
      }),
    });

    let syncResult;
    await act(async () => {
      syncResult = await result.current.syncWines();
    });

    expect(syncResult).toBe(null);
    expect(result.current.error).toBe('Sync failed');
  });
});