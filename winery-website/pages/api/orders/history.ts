import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, Order } from '../../../types';
import { verifyToken } from '../../../utils/auth';

interface OrderWithDetails extends Order {
  orderNumber: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
  };
}

// Mock order data - in a real app, this would come from a database
const mockOrders: OrderWithDetails[] = [
  {
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
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Wine Street',
      city: 'Nairobi',
    },
  },
  {
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
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Wine Street',
      city: 'Nairobi',
    },
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<OrderWithDetails[]>>
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

    // Filter orders for the authenticated user
    const userOrders = mockOrders.filter(order => order.userId === user.id);

    // Sort orders by creation date (newest first)
    userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({
      success: true,
      data: userOrders,
    });

  } catch (error) {
    console.error('Order history fetch error:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch order history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}