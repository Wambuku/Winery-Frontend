import { createMocks } from 'node-mocks-http';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import handler from '../../../../../pages/api/orders/[id]/status';
import { verifyToken } from '../../../../../utils/auth';

// Mock the auth utility
vi.mock('../../../../../utils/auth');
const mockVerifyToken = vi.mocked(verifyToken);

describe('/api/orders/[id]/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 405 for non-PATCH requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { id: 'order_123' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only PATCH method is allowed',
      },
    });
  });

  it('should return 401 when no token is provided', async () => {
    const { req, res } = createMocks({
      method: 'PATCH',
      query: { id: 'order_123' },
      body: { status: 'completed' },
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
      method: 'PATCH',
      query: { id: 'order_123' },
      headers: {
        authorization: 'Bearer valid-token',
      },
      body: { status: 'completed' },
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

  it('should return 400 for invalid order ID', async () => {
    const mockUser = {
      id: 'staff_123',
      email: 'staff@example.com',
      name: 'Staff User',
      role: 'staff' as const,
      createdAt: new Date(),
    };

    mockVerifyToken.mockReturnValue(mockUser);

    const { req, res } = createMocks({
      method: 'PATCH',
      query: { id: '' },
      headers: {
        authorization: 'Bearer valid-token',
      },
      body: { status: 'completed' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'INVALID_ORDER_ID',
        message: 'Valid order ID is required',
      },
    });
  });

  it('should return 400 for invalid status', async () => {
    const mockUser = {
      id: 'staff_123',
      email: 'staff@example.com',
      name: 'Staff User',
      role: 'staff' as const,
      createdAt: new Date(),
    };

    mockVerifyToken.mockReturnValue(mockUser);

    const { req, res } = createMocks({
      method: 'PATCH',
      query: { id: 'order_123' },
      headers: {
        authorization: 'Bearer valid-token',
      },
      body: { status: 'invalid-status' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'INVALID_STATUS',
        message: 'Status must be one of: processing, completed, cancelled',
      },
    });
  });

  it('should successfully update order status for staff', async () => {
    const mockUser = {
      id: 'staff_123',
      email: 'staff@example.com',
      name: 'Staff User',
      role: 'staff' as const,
      createdAt: new Date(),
    };

    mockVerifyToken.mockReturnValue(mockUser);

    const { req, res } = createMocks({
      method: 'PATCH',
      query: { id: 'order_123' },
      headers: {
        authorization: 'Bearer valid-token',
      },
      body: { status: 'completed' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(true);
    expect(responseData.data).toEqual({
      orderId: 'order_123',
      status: 'completed',
      updatedAt: expect.any(String),
    });
  });

  it('should successfully update order status for admin', async () => {
    const mockUser = {
      id: 'admin_123',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin' as const,
      createdAt: new Date(),
    };

    mockVerifyToken.mockReturnValue(mockUser);

    const { req, res } = createMocks({
      method: 'PATCH',
      query: { id: 'order_123' },
      headers: {
        authorization: 'Bearer valid-token',
      },
      body: { status: 'cancelled' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(true);
    expect(responseData.data.status).toBe('cancelled');
  });

  it('should handle server errors gracefully', async () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const { req, res } = createMocks({
      method: 'PATCH',
      query: { id: 'order_123' },
      headers: {
        authorization: 'Bearer valid-token',
      },
      body: { status: 'completed' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update order status',
        details: 'Database connection failed',
      },
    });
  });
});