// Tests for M-Pesa payment initiation API

import { createMocks } from 'node-mocks-http';
import handler from '../../../../../pages/api/payments/mpesa/initiate';

// Mock the config
jest.mock('../../../../../utils/config', () => ({
  config: {
    mpesa: {
      consumerKey: 'test_consumer_key',
      consumerSecret: 'test_consumer_secret',
      shortcode: '174379',
      passkey: 'test_passkey',
      callbackUrl: 'https://test.com/callback',
    },
    app: {
      url: 'https://test.com',
    },
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('/api/payments/mpesa/initiate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
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

  it('should validate required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
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
        message: 'Phone number, amount, and order ID are required',
      },
    });
  });

  it('should validate phone number format', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        phoneNumber: 'invalid_phone',
        amount: 1000,
        orderId: 'order_123',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'INVALID_PHONE',
        message: 'Please provide a valid Kenyan phone number',
      },
    });
  });

  it('should validate amount range', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        phoneNumber: '+254712345678',
        amount: 200000, // Too high
        orderId: 'order_123',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'INVALID_AMOUNT',
        message: 'Amount must be between KSh 1 and KSh 150,000',
      },
    });
  });

  it('should format phone number correctly', async () => {
    // Mock successful M-Pesa API responses
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test_token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ResponseCode: '0',
          ResponseDescription: 'Success',
          CheckoutRequestID: 'ws_CO_123456789',
          CustomerMessage: 'Success. Request accepted for processing',
        }),
      });

    const testCases = [
      { input: '+254712345678', expected: '254712345678' },
      { input: '0712345678', expected: '254712345678' },
      { input: '254712345678', expected: '254712345678' },
    ];

    for (const testCase of testCases) {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          phoneNumber: testCase.input,
          amount: 1000,
          orderId: 'order_123',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      // Check that the STK push was called with correctly formatted phone
      const stkPushCall = (fetch as jest.Mock).mock.calls.find(call => 
        call[0].includes('stkpush')
      );
      
      if (stkPushCall) {
        const requestBody = JSON.parse(stkPushCall[1].body);
        expect(requestBody.PhoneNumber).toBe(testCase.expected);
        expect(requestBody.PartyA).toBe(testCase.expected);
      }

      // Reset mocks for next iteration
      (fetch as jest.Mock).mockClear();
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'test_token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ResponseCode: '0',
            ResponseDescription: 'Success',
            CheckoutRequestID: 'ws_CO_123456789',
            CustomerMessage: 'Success. Request accepted for processing',
          }),
        });
    }
  });

  it('should handle successful M-Pesa STK push', async () => {
    // Mock successful M-Pesa API responses
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test_token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ResponseCode: '0',
          ResponseDescription: 'Success. Request accepted for processing',
          CheckoutRequestID: 'ws_CO_123456789',
          CustomerMessage: 'Success. Request accepted for processing',
        }),
      });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        phoneNumber: '+254712345678',
        amount: 1000,
        orderId: 'order_123',
        description: 'Test payment',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        success: true,
        checkoutRequestId: 'ws_CO_123456789',
        responseCode: '0',
        responseDescription: 'Success. Request accepted for processing',
        customerMessage: 'Success. Request accepted for processing',
      },
    });

    // Verify M-Pesa API calls
    expect(fetch).toHaveBeenCalledTimes(2);
    
    // Check access token request
    expect(fetch).toHaveBeenNthCalledWith(1,
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Basic'),
        }),
      })
    );

    // Check STK push request
    expect(fetch).toHaveBeenNthCalledWith(2,
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test_token',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should handle M-Pesa API errors', async () => {
    // Mock failed access token request
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        phoneNumber: '+254712345678',
        amount: 1000,
        orderId: 'order_123',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to initiate M-Pesa payment',
        details: expect.any(String),
      },
    });
  });

  it('should handle M-Pesa STK push failure', async () => {
    // Mock successful access token but failed STK push
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test_token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ResponseCode: '1',
          ResponseDescription: 'Insufficient funds',
        }),
      });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        phoneNumber: '+254712345678',
        amount: 1000,
        orderId: 'order_123',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        code: 'MPESA_REQUEST_FAILED',
        message: 'Insufficient funds',
        details: expect.any(Object),
      },
    });
  });

  it('should generate correct password and timestamp', async () => {
    // Mock successful M-Pesa API responses
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test_token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ResponseCode: '0',
          ResponseDescription: 'Success',
          CheckoutRequestID: 'ws_CO_123456789',
        }),
      });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        phoneNumber: '+254712345678',
        amount: 1000,
        orderId: 'order_123',
      },
    });

    await handler(req, res);

    // Check that STK push was called with proper structure
    const stkPushCall = (fetch as jest.Mock).mock.calls.find(call => 
      call[0].includes('stkpush')
    );
    
    expect(stkPushCall).toBeDefined();
    
    const requestBody = JSON.parse(stkPushCall[1].body);
    expect(requestBody).toMatchObject({
      BusinessShortCode: '174379',
      TransactionType: 'CustomerPayBillOnline',
      Amount: 1000,
      PartyA: '254712345678',
      PartyB: '174379',
      PhoneNumber: '254712345678',
      AccountReference: 'order_123',
      TransactionDesc: 'Payment for order order_123',
    });

    // Verify password and timestamp format
    expect(requestBody.Password).toBeDefined();
    expect(requestBody.Timestamp).toMatch(/^\d{14}$/); // YYYYMMDDHHMMSS format
  });
});