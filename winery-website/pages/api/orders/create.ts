// Order creation API endpoint

import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, Order, CartItem } from '../../../types';
import { ShippingAddress, PaymentDetails } from '../../../types/checkout';
import { verifyToken } from '../../../utils/auth';

interface CreateOrderRequest {
  items: CartItem[];
  total: number;
  shippingAddress: ShippingAddress;
  paymentDetails: PaymentDetails;
  orderNotes?: string;
}

interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  total: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
}

// Generate unique order ID
function generateOrderId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `order_${timestamp}_${random}`;
}

// Generate human-readable order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `WO-${timestamp}-${random}`;
}

// Validate order items
function validateOrderItems(items: CartItem[]): boolean {
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }

  return items.every(item => {
    return (
      item.wine &&
      typeof item.wine.id === 'string' &&
      typeof item.wine.name === 'string' &&
      typeof item.wine.price === 'number' &&
      typeof item.quantity === 'number' &&
      item.quantity > 0 &&
      item.wine.price > 0
    );
  });
}

// Calculate order total
function calculateOrderTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + (item.wine.price * item.quantity);
  }, 0);
}

// Mock function to save order to database
async function saveOrder(orderData: {
  orderId: string;
  orderNumber: string;
  userId: string;
  items: CartItem[];
  total: number;
  shippingAddress: ShippingAddress;
  paymentDetails: PaymentDetails;
  orderNotes?: string;
}): Promise<Order> {
  // In a real application, this would save to your database
  // For now, we'll just simulate the save operation
  
  const order: Order = {
    id: orderData.orderId,
    userId: orderData.userId,
    items: orderData.items,
    total: orderData.total,
    paymentMethod: orderData.paymentDetails.method,
    paymentStatus: orderData.paymentDetails.method === 'cash' ? 'completed' : 'pending',
    orderStatus: 'processing',
    createdAt: new Date(),
  };

  // Simulate database save delay
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('Order saved:', {
    orderId: orderData.orderId,
    orderNumber: orderData.orderNumber,
    total: orderData.total,
    paymentMethod: orderData.paymentDetails.method,
  });

  return order;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<CreateOrderResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed',
      },
    });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token is required',
        },
      });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired authentication token',
        },
      });
    }

    const {
      items,
      total,
      shippingAddress,
      paymentDetails,
      orderNotes,
    }: CreateOrderRequest = req.body;

    // Validate required fields
    if (!items || !total || !shippingAddress || !paymentDetails) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Items, total, shipping address, and payment details are required',
        },
      });
    }

    // Validate order items
    if (!validateOrderItems(items)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ITEMS',
          message: 'Invalid order items provided',
        },
      });
    }

    // Validate total amount
    const calculatedTotal = calculateOrderTotal(items);
    if (Math.abs(calculatedTotal - total) > 0.01) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOTAL_MISMATCH',
          message: 'Order total does not match calculated total',
        },
      });
    }

    // Validate shipping address
    const requiredAddressFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
    const missingFields = requiredAddressFields.filter(field => !shippingAddress[field as keyof ShippingAddress]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INCOMPLETE_ADDRESS',
          message: `Missing required address fields: ${missingFields.join(', ')}`,
        },
      });
    }

    // Validate payment details
    if (!['mpesa', 'cash'].includes(paymentDetails.method)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PAYMENT_METHOD',
          message: 'Payment method must be either "mpesa" or "cash"',
        },
      });
    }

    if (paymentDetails.method === 'mpesa' && !paymentDetails.mpesaPhone) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_MPESA_PHONE',
          message: 'M-Pesa phone number is required for M-Pesa payments',
        },
      });
    }

    // Generate order identifiers
    const orderId = generateOrderId();
    const orderNumber = generateOrderNumber();

    // Save order to database
    const order = await saveOrder({
      orderId,
      orderNumber,
      userId: user.id,
      items,
      total,
      shippingAddress,
      paymentDetails,
      orderNotes,
    });

    // Return success response
    return res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber,
        total: order.total,
        paymentStatus: order.paymentStatus,
      },
    });

  } catch (error) {
    console.error('Order creation error:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}