import { NextApiRequest, NextApiResponse } from 'next';
import { Wine, ApiResponse } from '../../../types';
import { verifyToken } from '../../../utils/auth';

// Mock wine data for low stock checking
const mockWines: Wine[] = [
  {
    id: '5',
    name: 'Opus One 2019',
    description: 'Bordeaux-style blend from Napa Valley, a collaboration between Rothschild and Mondavi.',
    price: 420.00,
    image: '/images/wines/opus-one.jpg',
    ingredients: ['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc', 'Petit Verdot', 'Malbec'],
    color: 'Red',
    history: 'Born from the partnership between Baron Philippe de Rothschild and Robert Mondavi in 1979.',
    vintage: 2019,
    region: 'Napa Valley, California',
    alcoholContent: 14.5,
    category: 'Red Wine',
    inStock: true,
    stockQuantity: 5, // Low stock
  },
  {
    id: '7',
    name: 'Vintage Port 2000',
    description: 'Exceptional vintage port with rich, complex flavors.',
    price: 180.00,
    image: '/images/wines/vintage-port.jpg',
    ingredients: ['Touriga Nacional', 'Touriga Franca', 'Tinta Roriz'],
    color: 'Red',
    history: 'Traditional Portuguese port wine from a declared vintage year.',
    vintage: 2000,
    region: 'Douro, Portugal',
    alcoholContent: 20.0,
    category: 'Fortified Wine',
    inStock: true,
    stockQuantity: 3, // Very low stock
  },
  {
    id: '6',
    name: 'Riesling Spätlese 2021',
    description: 'Sweet German Riesling with perfect balance of acidity and sweetness.',
    price: 35.00,
    image: '/images/wines/riesling-spatlese.jpg',
    ingredients: ['Riesling'],
    color: 'White',
    history: 'Traditional German winemaking techniques passed down through generations.',
    vintage: 2021,
    region: 'Mosel, Germany',
    alcoholContent: 8.5,
    category: 'White Wine',
    inStock: false,
    stockQuantity: 0, // Out of stock
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<Wine[]>>) {
  if (req.method !== 'GET') {
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

    const { threshold = '10' } = req.query;
    const thresholdNum = parseInt(threshold.toString());
    
    // Filter wines with stock below threshold
    const lowStockWines = mockWines.filter(wine => wine.stockQuantity <= thresholdNum);

    return res.status(200).json({
      success: true,
      data: lowStockWines,
    });
  } catch (error) {
    console.error('Low stock API error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
}