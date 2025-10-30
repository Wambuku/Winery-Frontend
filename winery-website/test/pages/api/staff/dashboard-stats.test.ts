import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/staff/dashboard-stats';
import * as auth from '../../../../utils/auth';

// Mock the auth utility
vi.mock('../../../../utils/auth', () => ({
  verifyToken: vi.fn()
}));

describe('/api/staff/dashboard-stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return dashboard stats for authenticated staff', async () => {
    // Mock successful authentication
    vi.mocked(auth.verifyToken).mockReturnValue({
      id: 'staff1',
      email: 'staff@winestore.com',
      role: 'staff'
    });

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('todaySales');
    expect(data).toHaveProperty('todayOrders');
    expect(data).toHaveProperty('cashSales');
    expect(data).toHaveProperty('mpesaSales');
    expect(data).toHaveProperty('topWines');
    expect(Array.isArray(data.topWines)).toBe(true);
  });

  it('should return dashboard stats for authenticated admin', async () => {
    // Mock successful authentication as admin
    vi.mocked(auth.verifyToken).mockReturnValue({
      id: 'admin1',
      email: 'admin@winestore.com',
      role: 'admin'
    });

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-admin-token'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('todaySales');
    expect(data).toHaveProperty('todayOrders');
    expect(data).toHaveProperty('cashSales');
    expect(data).toHaveProperty('mpesaSales');
    expect(data).toHaveProperty('topWines');
  });

  it('should return 401 when no token is provided', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ error: 'No token provided' });
  });

  it('should return 403 when token is invalid', async () => {
    // Mock invalid token
    vi.mocked(auth.verifyToken).mockReturnValue(null);

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer invalid-token'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ error: 'Staff access required' });
  });

  it('should return 403 when user is not staff or admin', async () => {
    // Mock customer token
    vi.mocked(auth.verifyToken).mockReturnValue({
      id: 'customer1',
      email: 'customer@winestore.com',
      role: 'customer'
    });

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer customer-token'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ error: 'Staff access required' });
  });

  it('should return 405 for non-GET methods', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ error: 'Method not allowed' });
  });

  it('should return proper data structure', async () => {
    vi.mocked(auth.verifyToken).mockReturnValue({
      id: 'staff1',
      email: 'staff@winestore.com',
      role: 'staff'
    });

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    
    // Check data types
    expect(typeof data.todaySales).toBe('number');
    expect(typeof data.todayOrders).toBe('number');
    expect(typeof data.cashSales).toBe('number');
    expect(typeof data.mpesaSales).toBe('number');
    expect(Array.isArray(data.topWines)).toBe(true);
    
    // Check top wines structure
    if (data.topWines.length > 0) {
      const wine = data.topWines[0];
      expect(wine).toHaveProperty('id');
      expect(wine).toHaveProperty('name');
      expect(wine).toHaveProperty('quantity');
      expect(wine).toHaveProperty('revenue');
      expect(typeof wine.quantity).toBe('number');
      expect(typeof wine.revenue).toBe('number');
    }
  });

  it('should handle server errors gracefully', async () => {
    // Mock auth to throw an error
    vi.mocked(auth.verifyToken).mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ error: 'Internal server error' });
    
    expect(consoleSpy).toHaveBeenCalledWith('Dashboard stats error:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
});