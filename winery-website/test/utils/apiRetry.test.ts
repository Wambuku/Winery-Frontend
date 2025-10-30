import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withRetry, isRetryableError, ApiError, createApiClient, handleApiError } from '../../utils/apiRetry';

// Mock fetch
global.fetch = vi.fn();

describe('isRetryableError', () => {
  it('returns true for network errors', () => {
    const networkError = new TypeError('Failed to fetch');
    expect(isRetryableError(networkError)).toBe(true);
  });

  it('returns true for retryable HTTP status codes', () => {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    
    retryableStatuses.forEach(status => {
      const error = { status };
      expect(isRetryableError(error)).toBe(true);
    });
  });

  it('returns false for non-retryable HTTP status codes', () => {
    const nonRetryableStatuses = [400, 401, 403, 404];
    
    nonRetryableStatuses.forEach(status => {
      const error = { status };
      expect(isRetryableError(error)).toBe(false);
    });
  });

  it('returns false for other errors', () => {
    const error = new Error('Some other error');
    expect(isRetryableError(error)).toBe(false);
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns result on first success', async () => {
    const mockFunction = vi.fn().mockResolvedValue('success');
    
    const result = await withRetry(mockFunction, { delay: 10 });
    
    expect(result).toBe('success');
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable errors', async () => {
    const mockFunction = vi.fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue('success');
    
    const result = await withRetry(mockFunction, { delay: 10 });
    
    expect(result).toBe('success');
    expect(mockFunction).toHaveBeenCalledTimes(2);
  });

  it('does not retry on non-retryable errors', async () => {
    const error = new ApiError('Bad Request', 'BAD_REQUEST', 400);
    const mockFunction = vi.fn().mockRejectedValue(error);
    
    await expect(withRetry(mockFunction, { delay: 10 })).rejects.toThrow(error);
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it('throws error after max attempts', async () => {
    const error = new TypeError('Failed to fetch');
    const mockFunction = vi.fn().mockRejectedValue(error);
    
    await expect(
      withRetry(mockFunction, { maxAttempts: 2, delay: 10 })
    ).rejects.toThrow(error);
    
    expect(mockFunction).toHaveBeenCalledTimes(2);
  });

  it('uses custom retry condition', async () => {
    const error = new Error('Custom error');
    const mockFunction = vi.fn().mockRejectedValue(error);
    const customRetryCondition = vi.fn().mockReturnValue(true);
    
    await expect(
      withRetry(mockFunction, { 
        maxAttempts: 2, 
        delay: 10, 
        retryCondition: customRetryCondition 
      })
    ).rejects.toThrow(error);
    
    expect(mockFunction).toHaveBeenCalledTimes(2);
    expect(customRetryCondition).toHaveBeenCalledWith(error);
  });

  it('applies exponential backoff', async () => {
    const mockFunction = vi.fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue('success');
    
    const startTime = Date.now();
    
    const result = await withRetry(mockFunction, { 
      delay: 10, 
      backoff: true 
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(result).toBe('success');
    expect(mockFunction).toHaveBeenCalledTimes(3);
    // Should take at least base delay + exponential backoff
    expect(duration).toBeGreaterThan(20);
  });
});

describe('ApiError', () => {
  it('creates error with correct properties', () => {
    const error = new ApiError('Test message', 'TEST_CODE', 400, { detail: 'test' });
    
    expect(error.message).toBe('Test message');
    expect(error.code).toBe('TEST_CODE');
    expect(error.status).toBe(400);
    expect(error.details).toEqual({ detail: 'test' });
    expect(error.name).toBe('ApiError');
  });
});

describe('createApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('makes GET request successfully', async () => {
    const mockResponse = { success: true, data: { id: 1 } };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });
    
    const client = createApiClient('/api');
    const result = await client.get('/wines');
    
    expect(fetch).toHaveBeenCalledWith('/api/wines', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    expect(result).toEqual(mockResponse);
  });

  it('makes POST request with data', async () => {
    const mockResponse = { success: true, data: { id: 1 } };
    const postData = { name: 'Test Wine' };
    
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });
    
    const client = createApiClient('/api');
    const result = await client.post('/wines', postData);
    
    expect(fetch).toHaveBeenCalledWith('/api/wines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });
    expect(result).toEqual(mockResponse);
  });

  it('throws ApiError on HTTP error', async () => {
    const errorResponse = { message: 'Not found', code: 'NOT_FOUND' };
    
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve(errorResponse)
    });
    
    const client = createApiClient('/api');
    
    await expect(client.get('/wines/999')).rejects.toThrow(ApiError);
  });

  it('applies retry options when provided', async () => {
    (fetch as any)
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} })
      });
    
    const client = createApiClient('/api');
    const result = await client.get('/wines', { maxAttempts: 2, delay: 10 });
    
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ success: true, data: {} });
  });
});

describe('handleApiError', () => {
  it('returns ApiError message', () => {
    const error = new ApiError('Custom error message', 'CUSTOM_ERROR');
    const message = handleApiError(error);
    
    expect(message).toBe('Custom error message');
  });

  it('returns network error message for fetch errors', () => {
    const error = new TypeError('Failed to fetch');
    const message = handleApiError(error);
    
    expect(message).toBe('Network error. Please check your internet connection.');
  });

  it('returns generic error message for other errors', () => {
    const error = new Error('Some other error');
    const message = handleApiError(error);
    
    expect(message).toBe('An unexpected error occurred. Please try again.');
  });
});