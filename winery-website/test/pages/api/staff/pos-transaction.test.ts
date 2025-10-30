import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/staff/pos-transaction';
import * as auth from '../../../../utils/auth';

// Mock the auth utility
vi.mock('../../../../utils/auth', () => ({
  verifyToken: vi.fn()
}));

const mockTransactionData = {
  items: [
    {
      wine: {
        id: '1',
        name: 'Château Margaux 2015',
        price: 15000
      },
      quantity: 2,
      subtotal: 30000
    },
    {
      wine: {
        id: '2',
        name: 'Dom Pérignon 2012',
        price: 25000
      },
      quantity: 1,
      subtotal: 25000
    }
  ],
  total: 55000,
  paymentMethod: 'cash' as const,
  customerName: 'John Doe',
  customerPhone: '+254700000000',
  staffId: 'staff1',
  staffName: 'Jane Staff'
};

describe('/api/staff/pos-transaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process cash transaction successfully', async () => {
    // Mock successful authentication
    vi.mocked(auth.verifyToken).mockReturnValue({
      id: 'staff1',
      email: 'staff@winestore.com',
      role: 'staff'
    });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
        'content-type': 'application/json'
      },
      body: mockTransactionData
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('transactionId');
    expect(data).toHaveProperty('receiptNumber');
    expect(data).toHaveProperty('timestamp');
    
    // Check receipt number format
    expect(data.receiptNumber).toMatch(/^RCP-\d{8}-\d{4}$/);
    
    // Check transaction ID format
    expect(data.transactionId).toMatch(/^txn_\d+_[a-z0-9]+$/);
  });

  it('should process M-Pesa transaction successfully', async () => {
    vi.mocked(auth.verifyToken).mockReturnValue({
      id: 'staff1',
      email: 'staff@winestore.com',
      role: 'staff'
    });

    const mpesaTransaction = {
      ...mockTransactionData,
      paymentMethod: 'mpesa' as const
    };

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
        'content-type': 'application/json'
      },
      body: mpesaTransaction
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('transactionId');
    expect(data).toHaveProperty('receiptNumber');
    expect(data).toHaveProperty('timestamp');
  });

  it('should process transaction without customer info', async () => {
    vi.mocked(auth.verifyToken).mockReturnValue({
      id: 'staff1',
      email: 'staff@winestore.com',
      role: 'staff'
    });

    const transactionWithoutCustomer = {
      ...mockTransactionData,
      customerName: undefined,
      customerPhone: undefined
    };

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
        'content-type': 'application/json'
      },
      body: transactionWithoutCustomer
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('success', true);
  });

  it('should return 401 when no token is provided', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: mockTransactionData
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ error: 'No token provided' });
  });

  it('should return 403 when user is not staff or admin', async () => {
    vi.mocked(auth.verifyToken).mockReturnValue({
      id: 'customer1',
      email: 'customer@winestore.com',
      role: 'customer'
    });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer customer-token'
      },
      body: mockTransactionData
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ error: 'Staff access required' });
  });

  it('should return 405 for non-POST methods', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ error: 'Method not allowed' });
  });

  it('should return 400 when no items in transaction', async () => {
    vi.mocked(auth.verifyToken).mockReturnValue({
      id: 'staff1',
      email: 'staff@winestore.com',
      role: 'staff'
    });

    const emptyTransaction = {
      ...mockTransactionData,
      items: []
    };

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token'
      },
      body: emptyTransaction
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ error: 'No items in transaction' });
  });

  it('should return 400 when total is invalid', async () => {
    vi.mocked(auth.verifyToken).mockReturnValue({
      id: 'staff1',
      email: 'staff@winestore.com',
      role: 'staff'
    });

    const invalidTotalTransaction = {
      ...mockTransactionData,
      total: 0
    };

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token'
      },
      body: invalidTotalTransaction
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ error: 'Invalid transaction total' });
  });

  it('should return 400 when payment method is invalid', async () => {
    vi.mocked(auth.verifyToken).mockReturnValue({
      id: 'staff1',
      email: 'staff@winestore.com',
      role: 'staff'
    });

    const invalidPaymentTransaction = {
      ...mockTransactionData,
      paymentMethod: 'invalid' as any
    };

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token'
      },
      body: invalidPaymentTransaction
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ error: 'Invalid payment method' });
  });

  it('should return 400 when total calculation is incorrect', async () => {
    vi.mocked(auth.verifyToken).mockReturnValue({
      id: 'staff1',
      email: 'staff@winestore.com',
      role: 'staff'
    });

    const incorrectTotalTransaction = {
      ...mockTransactionData,
      total: 60000 // Should be 55000
    };

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token'
      },
      body: incorrectTotalTransaction
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ error: 'Total calculation mismatch' });
  });

  it('should handle server errors gracefully', async () => {
    // Mock auth to throw an error
    vi.mocked(auth.verifyToken).mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token'
      },
      body: mockTransactionData
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ error: 'Transaction processing failed' });
    
    expect(consoleSpy).toHaveBeenCalledWith('POS transaction error:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('should log transaction details', async () => {
    vi.mocked(auth.verifyToken).mockReturnValue({
      id: 'staff1',
      email: 'staff@winestore.com',
      role: 'staff'
    });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token'
      },
      body: mockTransactionData
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    expect(consoleSpy).toHaveBeenCalledWith('POS Transaction processed:', expect.objectContaining({
      staffId: 'staff1',
      total: 55000,
      paymentMethod: 'cash',
      itemCount: 2
    }));
    
    consoleSpy.mockRestore();
  });
});