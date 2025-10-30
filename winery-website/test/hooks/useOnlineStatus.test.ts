import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('useOnlineStatus', () => {
  beforeEach(() => {
    // Reset navigator.onLine to true before each test
    (navigator as any).onLine = true;
  });

  afterEach(() => {
    // Clean up event listeners
    vi.clearAllMocks();
  });

  it('returns initial online status', () => {
    const { result } = renderHook(() => useOnlineStatus());
    
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
  });

  it('updates status when going offline', () => {
    const { result } = renderHook(() => useOnlineStatus());
    
    act(() => {
      (navigator as any).onLine = false;
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(result.current.isOnline).toBe(false);
    expect(result.current.wasOffline).toBe(true);
  });

  it('updates status when coming back online', () => {
    const { result } = renderHook(() => useOnlineStatus());
    
    // Go offline first
    act(() => {
      (navigator as any).onLine = false;
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(result.current.isOnline).toBe(false);
    expect(result.current.wasOffline).toBe(true);
    
    // Come back online
    act(() => {
      (navigator as any).onLine = true;
      window.dispatchEvent(new Event('online'));
    });
    
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
  });

  it('dispatches network-reconnected event when coming back online after being offline', () => {
    const { result } = renderHook(() => useOnlineStatus());
    
    const eventSpy = vi.spyOn(window, 'dispatchEvent');
    
    // Go offline first
    act(() => {
      (navigator as any).onLine = false;
      window.dispatchEvent(new Event('offline'));
    });
    
    // Come back online
    act(() => {
      (navigator as any).onLine = true;
      window.dispatchEvent(new Event('online'));
    });
    
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'network-reconnected'
      })
    );
  });

  it('does not dispatch network-reconnected event if was never offline', () => {
    const { result } = renderHook(() => useOnlineStatus());
    
    const eventSpy = vi.spyOn(window, 'dispatchEvent');
    
    // Trigger online event without going offline first
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    
    expect(eventSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'network-reconnected'
      })
    );
  });

  it('handles initial offline state', () => {
    (navigator as any).onLine = false;
    
    const { result } = renderHook(() => useOnlineStatus());
    
    expect(result.current.isOnline).toBe(false);
    expect(result.current.wasOffline).toBe(false);
  });
});