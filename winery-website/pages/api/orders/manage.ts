import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, Order } from '../../../types';
import { verifyToken } from '../../../utils/auth';

interface OrderWithDetails extends Order {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    phone: string;
  };
}

// Mock order data for staff/admin management
const mockOrdersForManagement: OrderWithDetails[] = [
  {
    id: 'order_1703123456789_abc123',
    userId: 'user_123',
    orderNumber: 'WO-123456-AB',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
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
      phone: '+254712345678',
    },
  },
  {
    id: 'order_1703123456790_def456',
    userId: 'user_456',
    orderNumber: 'WO-123457-CD',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
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
      firstName: 'Jane',
      lastName: 'Smith',
      address: '456 Vineyard Ave',
      city: 'Mombasa',
      phone: '+254787654321',
    },
  },
  {
    id: 'order_1703123456791_ghi789',
    userId: 'user_789',
    orderNumber: 'WO-123458-EF',
    customerName: 'Michael Johnson',
    customerEmail: 'michael.johnson@example.com',
    items: [
      {
        wine: {
          id: '3',
          name: 'Barolo Brunate 2018',
          description: 'Premium Italian red wine',
          price: 12000,
          image: '/images/wines/barolo-brunate.jpg',
          ingredients: ['Nebbiolo'],
          color: 'Deep Garnet',
          history: 'From the prestigious Brunate vineyard',
          vintage: 2018,
          region: 'Piedmont, Italy',
          alcoholContent: 14.0,
          category: 'Red Wine',
          inStock: true,
          stockQuantity: 8,
        },
        quantity: 3,
      },
    ],
    total: 36000,
    paymentMethod: 'mpesa',
    paymentStatus: 'pending',
    orderStatus: 'processing',
    createdAt: new Date('2024-01-22T09:45:00Z'),
    shippingAddress: {
      firstName: 'Michael',
      lastName: 'Johnson',
      address: '789 Oak Street',
      city: 'Kisumu',
      phone: '+254798765432',
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

    // Check if user has staff or admin privileges
    if (user.role !== 'staff' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Staff or admin privileges required',
        },
      });
    }

    // Sort orders by creation date (newest first)
    const sortedOrders = [...mockOrdersForManagement].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.status(200).json({
      success: true,
      data: sortedOrders,
    });

  } catch (error) {
    console.error('Order management fetch error:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch orders for management',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}