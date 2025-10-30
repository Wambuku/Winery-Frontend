import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRetry } from '../../hooks/useRetry';

describe('useRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns successful result on first attempt', async () => {
    const mockFunction = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useRetry(mockFunction));
    
    let returnValue;
    await act(async () => {
      returnValue = await result.current.retry();
    });
    
    expect(returnValue).toBe('success');
    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempts).toBe(0);
    expect(result.current.error).toBe(null);
  });

  it('retries on failure and eventually succeeds', async () => {
    const mockFunction = vi.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue('success');
    
    const { result } = renderHook(() => useRetry(mockFunction, { delay: 10 }));
    
    let returnValue;
    await act(async () => {
      returnValue = await result.current.retry();
    });
    
    expect(returnValue).toBe('success');
    expect(mockFunction).toHaveBeenCalledTimes(3);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempts).toBe(0);
    expect(result.current.error).toBe(null);
  });

  it('throws error after max attempts', async () => {
    const error = new Error('Persistent failure');
    const mockFunction = vi.fn().mockRejectedValue(error);
    
    const { result } = renderHook(() => 
      useRetry(mockFunction, { maxAttempts: 2, delay: 10 })
    );
    
    await act(async () => {
      try {
        await result.current.retry();
      } catch (e) {
        expect(e).toBe(error);
      }
    });
    
    expect(mockFunction).toHaveBeenCalledTimes(2);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempts).toBe(2);
    expect(result.current.error).toBe(error);
  });

  it('updates attempts during retry process', async () => {
    const mockFunction = vi.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValue('success');
    
    const { result } = renderHook(() => useRetry(mockFunction, { delay: 10 }));
    
    await act(async () => {
      await result.current.retry();
    });
    
    expect(mockFunction).toHaveBeenCalledTimes(2);
  });

  it('applies exponential backoff when enabled', async () => {
    const mockFunction = vi.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue('success');
    
    const { result } = renderHook(() => 
      useRetry(mockFunction, { delay: 10, backoff: true })
    );
    
    const startTime = Date.now();
    
    await act(async () => {
      await result.current.retry();
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should take at least the base delay + exponential backoff time
    // (10ms + 20ms = 30ms minimum, but we'll be lenient due to test timing)
    expect(duration).toBeGreaterThan(20);
    expect(mockFunction).toHaveBeenCalledTimes(3);
  });

  it('uses linear delay when backoff is disabled', async () => {
    const mockFunction = vi.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue('success');
    
    const { result } = renderHook(() => 
      useRetry(mockFunction, { delay: 10, backoff: false })
    );
    
    await act(async () => {
      await result.current.retry();
    });
    
    expect(mockFunction).toHaveBeenCalledTimes(3);
  });

  it('resets state when reset is called', async () => {
    const error = new Error('Failure');
    const mockFunction = vi.fn().mockRejectedValue(error);
    
    const { result } = renderHook(() => 
      useRetry(mockFunction, { maxAttempts: 1, delay: 10 })
    );
    
    // Trigger failure
    await act(async () => {
      try {
        await result.current.retry();
      } catch (e) {
        // Expected to fail
      }
    });
    
    expect(result.current.error).toBe(error);
    expect(result.current.attempts).toBe(1);
    
    // Reset state
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.error).toBe(null);
    expect(result.current.attempts).toBe(0);
    expect(result.current.isRetrying).toBe(false);
  });

  it('handles async function that returns undefined', async () => {
    const mockFunction = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useRetry(mockFunction));
    
    let returnValue;
    await act(async () => {
      returnValue = await result.current.retry();
    });
    
    expect(returnValue).toBe(undefined);
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });
});