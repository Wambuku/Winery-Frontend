// Tests for order creation API

import { createMocks } from 'node-mocks-http';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import handler from '../../../../pages/api/orders/create';
import { CartItem, Wine } from '../../../../types';
import { verifyToken } from '../../../../utils/auth';

// Mock the auth utility
vi.mock('../../../../utils/auth');
const mockVerifyToken = vi.mocked(verifyToken);

// Mock wine data
const mockWine: Wine = {
  id: '1',
  name: 'Test Wine',
  description: 'A test wine',
  price: 1500,
  image: '/test-wine.jpg',
  ingredients: ['Grapes'],
  color: 'Red',
  history: 'Test history',
  vintage: 2020,
  region: 'Test Region',
  alcoholContent: 12.5,
  category: 'Red Wine',
  inStock: true,
  stockQuantity: 10,
};

const mockCartItems: CartItem[] = [
  { wine: mockWine, quantity: 2 },
];

const mockShippingAddress = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+254712345678',
  address: '123 Test Street',
  city: 'Nairobi',
  postalCode: '00100',
  country: 'Kenya',
};

const mockPaymentDetails = {
  method: 'mpesa' as const,
  mpesaPhone: '+254712345678',
};

const mockUser = {
  id: '1',
  email: 'john@example.com',
  name: 'John Doe',
  role: 'customer' as const,
};

describe('/api/orders/create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed',
      },
    });
  });

  it('should require authentication token', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        items: mockCartItems,
        total: 3000,
        shippingAddress: mockShippingAddress,
        paymentDetails: mockPaymentDetails,
      },
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

  it('should validate authentication token', async () => {
    mockVerifyToken.mockReturnValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer invalid_token',
      },
      body: {
        items: mockCartItems,
        total: 3000,
        shippingAddress: mockShippingAddress,
        paymentDetails: mockPaymentDetails,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token',
      },
    });
  });

  it('should validate required fields', async () => {
    mockVerifyToken.mockReturnValue(mockUser);

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid_token',
      },
      body: {
        // Missing required fields
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'Items, total, shipping address, and payment details are required',
      },
    });
  });

  it('should validate order items', async () => {
    mockVerifyToken.mockReturnValue(mockUser);

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid_token',
      },
      body: {
        items: [], // Empty items array
        total: 3000,
        shippingAddress: mockShippingAddress,
        paymentDetails: mockPaymentDetails,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'INVALID_ITEMS',
        message: 'Invalid order items provided',
      },
    });
  });

  it('should validate total amount matches calculated total', async () => {
    mockVerifyToken.mockReturnValue(mockUser);

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid_token',
      },
      body: {
        items: mockCartItems,
        total: 5000, // Incorrect total (should be 3000)
        shippingAddress: mockShippingAddress,
        paymentDetails: mockPaymentDetails,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'TOTAL_MISMATCH',
        message: 'Order total does not match calculated total',
      },
    });
  });

  it('should validate shipping address completeness', async () => {
    mockVerifyToken.mockReturnValue(mockUser);

    const incompleteAddress = {
      ...mockShippingAddress,
      firstName: '', // Missing required field
    };

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid_token',
      },
      body: {
        items: mockCartItems,
        total: 3000,
        shippingAddress: incompleteAddress,
        paymentDetails: mockPaymentDetails,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'INCOMPLETE_ADDRESS',
        message: 'Missing required address fields: firstName',
      },
    });
  });

  it('should validate payment method', async () => {
    mockVerifyToken.mockReturnValue(mockUser);

    const invalidPaymentDetails = {
      method: 'invalid_method' as any,
    };

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid_token',
      },
      body: {
        items: mockCartItems,
        total: 3000,
        shippingAddress: mockShippingAddress,
        paymentDetails: invalidPaymentDetails,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'INVALID_PAYMENT_METHOD',
        message: 'Payment method must be either "mpesa" or "cash"',
      },
    });
  });

  it('should require M-Pesa phone number for M-Pesa payments', async () => {
    mockVerifyToken.mockReturnValue(mockUser);

    const mpesaPaymentWithoutPhone = {
      method: 'mpesa' as const,
      // Missing mpesaPhone
    };

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid_token',
      },
      body: {
        items: mockCartItems,
        total: 3000,
        shippingAddress: mockShippingAddress,
        paymentDetails: mpesaPaymentWithoutPhone,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'MISSING_MPESA_PHONE',
        message: 'M-Pesa phone number is required for M-Pesa payments',
      },
    });
  });

  it('should create order successfully with M-Pesa payment', async () => {
    mockVerifyToken.mockReturnValue(mockUser);

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid_token',
      },
      body: {
        items: mockCartItems,
        total: 3000,
        shippingAddress: mockShippingAddress,
        paymentDetails: mockPaymentDetails,
        orderNotes: 'Test order notes',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(true);
    expect(responseData.data).toMatchObject({
      orderId: expect.any(String),
      orderNumber: expect.stringMatching(/^WO-\d{6}-[A-Z0-9]{2}$/),
      total: 3000,
      paymentStatus: 'pending', // M-Pesa payments start as pending
    });
  });

  it('should create order successfully with cash payment', async () => {
    mockVerifyToken.mockReturnValue(mockUser);

    const cashPaymentDetails = {
      method: 'cash' as const,
    };

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid_token',
      },
      body: {
        items: mockCartItems,
        total: 3000,
        shippingAddress: mockShippingAddress,
        paymentDetails: cashPaymentDetails,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(true);
    expect(responseData.data).toMatchObject({
      orderId: expect.any(String),
      orderNumber: expect.stringMatching(/^WO-\d{6}-[A-Z0-9]{2}$/),
      total: 3000,
      paymentStatus: 'completed', // Cash payments are immediately completed
    });
  });

  it('should handle invalid order items structure', async () => {
    mockVerifyToken.mockReturnValue(mockUser);

    const invalidItems = [
      {
        wine: {
          id: '1',
          name: 'Test Wine',
          // Missing required fields like price
        },
        quantity: 2,
      },
    ];

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid_token',
      },
      body: {
        items: invalidItems,
        total: 3000,
        shippingAddress: mockShippingAddress,
        paymentDetails: mockPaymentDetails,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'INVALID_ITEMS',
        message: 'Invalid order items provided',
      },
    });
  });

  it('should generate unique order IDs and numbers', async () => {
    mockVerifyToken.mockReturnValue(mockUser);

    const requestBody = {
      items: mockCartItems,
      total: 3000,
      shippingAddress: mockShippingAddress,
      paymentDetails: mockPaymentDetails,
    };

    // Create two orders
    const { req: req1, res: res1 } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer valid_token' },
      body: requestBody,
    });

    const { req: req2, res: res2 } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer valid_token' },
      body: requestBody,
    });

    await handler(req1, res1);
    await handler(req2, res2);

    const response1 = JSON.parse(res1._getData());
    const response2 = JSON.parse(res2._getData());

    expect(response1.data.orderId).not.toBe(response2.data.orderId);
    expect(response1.data.orderNumber).not.toBe(response2.data.orderNumber);
  });
});