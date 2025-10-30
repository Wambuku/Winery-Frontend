import { NextApiRequest, NextApiResponse } from 'next';
import { Wine, ApiResponse } from '../../../types';

// Mock featured wines (in production, this would be from database with featured flag)
const featuredWines: Wine[] = [
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
    stockQuantity: 12,
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
    const { limit = '6' } = req.query;
    const limitNum = parseInt(limit.toString());
    
    const limitedFeaturedWines = featuredWines.slice(0, limitNum);

    return res.status(200).json({
      success: true,
      data: limitedFeaturedWines,
    });
  } catch (error) {
    console.error('Featured wines API error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
}