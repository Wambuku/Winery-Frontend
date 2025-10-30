import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, Order } from '../../../../types';
import { verifyToken } from '../../../../utils/auth';

interface ReceiptData extends Order {
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  receiptNumber: string;
}

// Mock receipt data - in a real app, this would come from a database
const mockReceiptData: Record<string, ReceiptData> = {
  'order_1703123456789_abc123': {
    id: 'order_1703123456789_abc123',
    userId: 'user_123',
    orderNumber: 'WO-123456-AB',
    receiptNumber: 'RCP-123456-AB-001',
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
    customerInfo: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+254712345678',
      address: '123 Wine Street',
      city: 'Nairobi',
    },
    companyInfo: {
      name: 'Premium Wine Collection',
      address: '456 Vineyard Avenue, Nairobi, Kenya',
      phone: '+254700123456',
      email: 'info@premiumwines.co.ke',
      website: 'www.premiumwines.co.ke',
    },
  },
  'order_1703123456790_def456': {
    id: 'order_1703123456790_def456',
    userId: 'user_123',
    orderNumber: 'WO-123457-CD',
    receiptNumber: 'RCP-123457-CD-001',
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
    customerInfo: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+254712345678',
      address: '123 Wine Street',
      city: 'Nairobi',
    },
    companyInfo: {
      name: 'Premium Wine Collection',
      address: '456 Vineyard Avenue, Nairobi, Kenya',
      phone: '+254700123456',
      email: 'info@premiumwines.co.ke',
      website: 'www.premiumwines.co.ke',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ReceiptData>>
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

    // Get receipt data for the order
    const receiptData = mockReceiptData[id];
    
    if (!receiptData) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RECEIPT_NOT_FOUND',
          message: 'Receipt not found for this order',
        },
      });
    }

    // Verify the order belongs to the authenticated user or user is staff/admin
    if (receiptData.userId !== user.id && user.role !== 'staff' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You do not have permission to view this receipt',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: receiptData,
    });

  } catch (error) {
    console.error('Receipt fetch error:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch receipt data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}