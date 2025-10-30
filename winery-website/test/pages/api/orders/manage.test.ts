import { createMocks } from 'node-mocks-http';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import handler from '../../../../pages/api/orders/manage';
import { verifyToken } from '../../../../utils/auth';

// Mock the auth utility
vi.mock('../../../../utils/auth');
const mockVerifyToken = vi.mocked(verifyToken);

describe('/api/orders/manage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 405 for non-GET requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET method is allowed',
      },
    });
  });

  it('should return 401 when no token is provided', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is required',
      },
    });
  });

  it('should return 403 for customer users', async () => {
    const mockUser = {
      id: 'user_123',
      email: 'customer@example.com',
      name: 'Customer User',
      role: 'customer' as const,
      createdAt: new Date(),
    };

    mockVerifyToken.mockReturnValue(mockUser);

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'Staff or admin privileges required',
      },
    });
  });

  it('should return all orders for staff users', async () => {
    const mockUser = {
      id: 'staff_123',
      email: 'staff@example.com',
      name: 'Staff User',
      role: 'staff' as const,
      createdAt: new Date(),
    };

    mockVerifyToken.mockReturnValue(mockUser);

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(true);
    expect(Array.isArray(responseData.data)).toBe(true);
    
    // Check that response includes customer details
    responseData.data.forEach((order: any) => {
      expect(order).toHaveProperty('customerName');
      expect(order).toHaveProperty('customerEmail');
      expect(order).toHaveProperty('shippingAddress');
    });
  });

  it('should return all orders for admin users', async () => {
    const mockUser = {
      id: 'admin_123',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin' as const,
      createdAt: new Date(),
    };

    mockVerifyToken.mockReturnValue(mockUser);

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(true);
    expect(Array.isArray(responseData.data)).toBe(true);
  });

  it('should return orders sorted by creation date (newest first)', async () => {
    const mockUser = {
      id: 'staff_123',
      email: 'staff@example.com',
      name: 'Staff User',
      role: 'staff' as const,
      createdAt: new Date(),
    };

    mockVerifyToken.mockReturnValue(mockUser);

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(true);
    
    const orders = responseData.data;
    if (orders.length > 1) {
      for (let i = 0; i < orders.length - 1; i++) {
        const currentDate = new Date(orders[i].createdAt);
        const nextDate = new Date(orders[i + 1].createdAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    }
  });

  it('should handle server errors gracefully', async () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch orders for management',
        details: 'Database connection failed',
      },
    });
  });
});