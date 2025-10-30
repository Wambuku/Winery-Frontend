import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, Order } from '../../../../types';
import { verifyToken } from '../../../../utils/auth';

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  timestamp?: Date;
}

interface OrderTrackingData extends Order {
  orderNumber: string;
  trackingSteps: TrackingStep[];
  estimatedDelivery?: Date;
}

// Mock tracking data - in a real app, this would come from a database
const mockTrackingData: Record<string, OrderTrackingData> = {
  'order_1703123456789_abc123': {
    id: 'order_1703123456789_abc123',
    userId: 'user_123',
    orderNumber: 'WO-123456-AB',
    items: [
      {
        wine: {
          id: '1',
          name: 'Château Margaux 2015',
          description: 'A prestigious Bordeaux wine',
          price: 15000,
          image: '/images/wines/chateau-margaux.jpg',
          ingredients: ['Cabernet Sauvignon', 'Merlot', 'Petit Verdot'],
          color: 'Deep Ruby Red',
          history: 'Historic vineyard dating back to the 12th century',
          vintage: 2015,
          region: 'Bordeaux, France',
          alcoholContent: 13.5,
          category: 'Red Wine',
          inStock: true,
          stockQuantity: 5,
        },
        quantity: 2,
      },
    ],
    total: 30000,
    paymentMethod: 'mpesa',
    paymentStatus: 'completed',
    orderStatus: 'completed',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    estimatedDelivery: new Date('2024-01-20T16:00:00Z'),
    trackingSteps: [
      {
        id: 'order-placed',
        title: 'Order Placed',
        description: 'Your order has been successfully placed and payment confirmed.',
        completed: true,
        current: false,
        timestamp: new Date('2024-01-15T10:30:00Z'),
      },
      {
        id: 'payment-confirmed',
        title: 'Payment Confirmed',
        description: 'Payment has been processed and confirmed.',
        completed: true,
        current: false,
        timestamp: new Date('2024-01-15T10:35:00Z'),
      },
      {
        id: 'preparing',
        title: 'Preparing Order',
        description: 'Your wines are being carefully selected and prepared for shipment.',
        completed: true,
        current: false,
        timestamp: new Date('2024-01-16T09:00:00Z'),
      },
      {
        id: 'shipped',
        title: 'Shipped',
        description: 'Your order has been shipped and is on its way to you.',
        completed: true,
        current: false,
        timestamp: new Date('2024-01-17T14:30:00Z'),
      },
      {
        id: 'delivered',
        title: 'Delivered',
        description: 'Your order has been successfully delivered.',
        completed: true,
        current: false,
        timestamp: new Date('2024-01-19T15:45:00Z'),
      },
    ],
  },
  'order_1703123456790_def456': {
    id: 'order_1703123456790_def456',
    userId: 'user_123',
    orderNumber: 'WO-123457-CD',
    items: [
      {
        wine: {
          id: '2',
          name: 'Dom Pérignon 2012',
          description: 'Premium champagne',
          price: 25000,
          image: '/images/wines/dom-perignon.jpg',
          ingredients: ['Chardonnay', 'Pinot Noir'],
          color: 'Golden Yellow',
          history: 'Created by Dom Pierre Pérignon',
          vintage: 2012,
          region: 'Champagne, France',
          alcoholContent: 12.5,
          category: 'Champagne',
          inStock: true,
          stockQuantity: 3,
        },
        quantity: 1,
      },
    ],
    total: 25000,
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    orderStatus: 'processing',
    createdAt: new Date('2024-01-20T14:15:00Z'),
    estimatedDelivery: new Date('2024-01-25T16:00:00Z'),
    trackingSteps: [
      {
        id: 'order-placed',
        title: 'Order Placed',
        description: 'Your order has been successfully placed.',
        completed: true,
        current: false,
        timestamp: new Date('2024-01-20T14:15:00Z'),
      },
      {
        id: 'payment-confirmed',
        title: 'Payment Confirmed',
        description: 'Cash payment has been recorded and confirmed.',
        completed: true,
        current: false,
        timestamp: new Date('2024-01-20T14:20:00Z'),
      },
      {
        id: 'preparing',
        title: 'Preparing Order',
        description: 'Your wines are being carefully selected and prepared for shipment.',
        completed: false,
        current: true,
      },
      {
        id: 'shipped',
        title: 'Shipped',
        description: 'Your order will be shipped once preparation is complete.',
        completed: false,
        current: false,
      },
      {
        id: 'delivered',
        title: 'Delivered',
        description: 'Your order will be delivered to your specified address.',
        completed: false,
        current: false,
      },
    ],
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<OrderTrackingData>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET method is allowed',
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

    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ORDER_ID',
          message: 'Valid order ID is required',
        },
      });
    }

    // Get tracking data for the order
    const trackingData = mockTrackingData[id];
    
    if (!trackingData) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    // Verify the order belongs to the authenticated user
    if (trackingData.userId !== user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You do not have permission to view this order',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: trackingData,
    });

  } catch (error) {
    console.error('Order tracking fetch error:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch order tracking data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}