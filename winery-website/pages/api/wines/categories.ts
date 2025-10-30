import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, CategoryData } from '../../../types';
import { verifyToken } from '../../../utils/auth';

// Mock category data (in production, this would be from database)
let wineCategories: CategoryData[] = [
  { id: '1', name: 'Red Wine', description: 'Full-bodied red wines', isActive: true },
  { id: '2', name: 'White Wine', description: 'Crisp and refreshing white wines', isActive: true },
  { id: '3', name: 'Rosé Wine', description: 'Light and fruity rosé wines', isActive: true },
  { id: '4', name: 'Sparkling Wine', description: 'Champagne and sparkling wines', isActive: true },
  { id: '5', name: 'Dessert Wine', description: 'Sweet dessert wines', isActive: true },
  { id: '6', name: 'Fortified Wine', description: 'Port, sherry, and fortified wines', isActive: true },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<CategoryData[] | CategoryData | string[]>>) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGetCategories(req, res);
      case 'POST':
        return handleCreateCategory(req, res);
      case 'PUT':
        return handleUpdateCategory(req, res);
      case 'DELETE':
        return handleDeleteCategory(req, res);
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
    console.error('Categories API error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
}

async function handleGetCategories(req: NextApiRequest, res: NextApiResponse) {
  const { simple } = req.query;
  
  // Return simple string array for backward compatibility
  if (simple === 'true') {
    const categoryNames = wineCategories
      .filter(cat => cat.isActive)
      .map(cat => cat.name);
    
    return res.status(200).json({
      success: true,
      data: categoryNames,
    });
  }

  // Return full category objects
  return res.status(200).json({
    success: true,
    data: wineCategories,
  });
}

async function handleCreateCategory(req: NextApiRequest, res: NextApiResponse) {
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

  if (authResult.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required',
      },
    });
  }

  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Category name is required',
      },
    });
  }

  // Check if category already exists
  const existingCategory = wineCategories.find(cat => 
    cat.name.toLowerCase() === name.toLowerCase()
  );

  if (existingCategory) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'Category already exists',
      },
    });
  }

  const newCategory: CategoryData = {
    id: Date.now().toString(),
    name,
    description: description || '',
    isActive: true,
  };

  wineCategories.push(newCategory);

  return res.status(201).json({
    success: true,
    data: newCategory,
  });
}

async function handleUpdateCategory(req: NextApiRequest, res: NextApiResponse) {
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

  if (authResult.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required',
      },
    });
  }

  const { id, name, description, isActive } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Category ID is required',
      },
    });
  }

  const categoryIndex = wineCategories.findIndex(cat => cat.id === id);
  
  if (categoryIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Category not found',
      },
    });
  }

  // Update category
  const updatedCategory: CategoryData = {
    ...wineCategories[categoryIndex],
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(isActive !== undefined && { isActive }),
  };

  wineCategories[categoryIndex] = updatedCategory;

  return res.status(200).json({
    success: true,
    data: updatedCategory,
  });
}

async function handleDeleteCategory(req: NextApiRequest, res: NextApiResponse) {
  // Verify admin authentication
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

  if (authResult.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required',
      },
    });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Category ID is required',
      },
    });
  }

  const categoryIndex = wineCategories.findIndex(cat => cat.id === id);
  
  if (categoryIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Category not found',
      },
    });
  }

  const deletedCategory = wineCategories[categoryIndex];
  wineCategories.splice(categoryIndex, 1);

  return res.status(200).json({
    success: true,
    data: deletedCategory,
  });
}