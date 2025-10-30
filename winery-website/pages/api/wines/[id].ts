import { NextApiRequest, NextApiResponse } from 'next';
import { Wine, ApiResponse, UpdateWineData } from '../../../types';
import { verifyToken } from '../../../utils/auth';

// Mock wine data (same as in index.ts - in production, this would be from database)
const mockWines: Wine[] = [
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
  // Add other wines as needed for testing
];

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Valid wine ID is required',
      },
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        return handleGetWine(req, res, id);
      case 'PATCH':
        return handleUpdateWine(req, res, id);
      case 'DELETE':
        return handleDeleteWine(req, res, id);
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
    console.error('Wine API error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
}

async function handleGetWine(req: NextApiRequest, res: NextApiResponse, id: string) {
  const wine = mockWines.find(w => w.id === id);

  if (!wine) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'WINE_NOT_FOUND',
        message: 'Wine not found',
      },
    });
  }

  return res.status(200).json({
    success: true,
    data: wine,
  });
}

async function handleUpdateWine(req: NextApiRequest, res: NextApiResponse, id: string) {
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
        message: 'Authentication required',
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

  const wineIndex = mockWines.findIndex(w => w.id === id);

  if (wineIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'WINE_NOT_FOUND',
        message: 'Wine not found',
      },
    });
  }

  const updateData = req.body;
  const currentWine = mockWines[wineIndex];

  // Update wine with new data
  const updatedWine: Wine = {
    ...currentWine,
    ...updateData,
    id, // Ensure ID doesn't change
    inStock: updateData.stockQuantity !== undefined 
      ? updateData.stockQuantity > 0 
      : currentWine.inStock,
  };

  // In production, save to database
  mockWines[wineIndex] = updatedWine;

  return res.status(200).json({
    success: true,
    data: updatedWine,
  });
}

async function handleDeleteWine(req: NextApiRequest, res: NextApiResponse, id: string) {
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
        message: 'Authentication required',
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

  const wineIndex = mockWines.findIndex(w => w.id === id);

  if (wineIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'WINE_NOT_FOUND',
        message: 'Wine not found',
      },
    });
  }

  // In production, delete from database
  mockWines.splice(wineIndex, 1);

  return res.status(200).json({
    success: true,
    data: { success: true },
  });
}