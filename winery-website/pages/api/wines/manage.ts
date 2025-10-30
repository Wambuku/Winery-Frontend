import { NextApiRequest, NextApiResponse } from 'next';
import { Wine, ApiResponse, UpdateWineData } from '../../../types';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<Wine | Wine[]>>) {
  try {
    // Verify staff/admin authentication for all operations
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

    switch (req.method) {
      case 'PUT':
        return handleUpdateWine(req, res);
      case 'DELETE':
        return handleDeleteWine(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: `Method ${req.method} not allowed`,
          },
        });
    }
  } catch (error) {
    console.error('Wine management API error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
}

async function handleUpdateWine(req: NextApiRequest, res: NextApiResponse) {
  const updateData: UpdateWineData = req.body;

  if (!updateData.id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Wine ID is required',
      },
    });
  }

  const wineIndex = mockWines.findIndex(wine => wine.id === updateData.id);
  
  if (wineIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Wine not found',
      },
    });
  }

  // Update wine with provided data
  const updatedWine: Wine = {
    ...mockWines[wineIndex],
    ...updateData,
    inStock: updateData.stockQuantity !== undefined ? updateData.stockQuantity > 0 : mockWines[wineIndex].inStock,
  };

  mockWines[wineIndex] = updatedWine;

  return res.status(200).json({
    success: true,
    data: updatedWine,
  });
}

async function handleDeleteWine(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Wine ID is required',
      },
    });
  }

  const wineIndex = mockWines.findIndex(wine => wine.id === id);
  
  if (wineIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Wine not found',
      },
    });
  }

  const deletedWine = mockWines[wineIndex];
  mockWines.splice(wineIndex, 1);

  return res.status(200).json({
    success: true,
    data: deletedWine,
  });
}