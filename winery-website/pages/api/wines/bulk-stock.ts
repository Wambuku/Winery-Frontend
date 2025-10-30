import { NextApiRequest, NextApiResponse } from 'next';
import { Wine, ApiResponse } from '../../../types';
import { verifyToken } from '../../../utils/auth';

// Mock wine data (in production, this would be from database)
let mockWines: Wine[] = [
  {
    id: '1',
    name: 'Château Margaux 2015',
    description: 'A legendary Bordeaux wine with exceptional elegance and complexity.',
    price: 850.00,
    image: '/images/wines/chateau-margaux.jpg',
    ingredients: ['Cabernet Sauvignon', 'Merlot', 'Petit Verdot', 'Cabernet Franc'],
    color: 'Red',
    history: 'One of the most prestigious wines from Bordeaux, with a history dating back to the 12th century.',
    vintage: 2015,
    region: 'Bordeaux, France',
    alcoholContent: 13.5,
    category: 'Red Wine',
    inStock: true,
    stockQuantity: 24,
  },
  {
    id: '2',
    name: 'Dom Pérignon 2012',
    description: 'Prestigious champagne with refined bubbles and complex flavors.',
    price: 220.00,
    image: '/images/wines/dom-perignon.jpg',
    ingredients: ['Chardonnay', 'Pinot Noir'],
    color: 'White',
    history: 'Created by Dom Pierre Pérignon, this champagne represents centuries of expertise.',
    vintage: 2012,
    region: 'Champagne, France',
    alcoholContent: 12.5,
    category: 'Sparkling Wine',
    inStock: true,
    stockQuantity: 18,
  },
];

interface BulkStockUpdate {
  id: string;
  stockQuantity: number;
}

interface BulkStockRequest {
  updates: BulkStockUpdate[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<Wine[]>>) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: `Method ${req.method} not allowed`,
      },
    });
  }

  try {
    // Verify staff/admin authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const authResult = await verifyToken(token);
    if (!authResult.success || !authResult.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
        },
      });
    }

    if (authResult.user.role === 'customer') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Staff or admin access required',
        },
      });
    }

    const { updates }: BulkStockRequest = req.body;

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Updates array is required',
        },
      });
    }

    // Validate updates
    for (const update of updates) {
      if (!update.id || typeof update.stockQuantity !== 'number' || update.stockQuantity < 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Each update must have a valid id and non-negative stockQuantity',
          },
        });
      }
    }

    const updatedWines: Wine[] = [];
    const notFoundIds: string[] = [];

    // Process each update
    for (const update of updates) {
      const wineIndex = mockWines.findIndex(wine => wine.id === update.id);
      
      if (wineIndex === -1) {
        notFoundIds.push(update.id);
        continue;
      }

      // Update wine stock
      mockWines[wineIndex] = {
        ...mockWines[wineIndex],
        stockQuantity: update.stockQuantity,
        inStock: update.stockQuantity > 0,
      };

      updatedWines.push(mockWines[wineIndex]);
    }

    // Return results with any errors
    if (notFoundIds.length > 0) {
      return res.status(207).json({ // 207 Multi-Status
        success: true,
        data: updatedWines,
        // @ts-ignore - Adding extra field for partial success
        warnings: {
          notFound: notFoundIds,
          message: `Some wines were not found: ${notFoundIds.join(', ')}`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedWines,
    });
  } catch (error) {
    console.error('Bulk stock update API error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
}