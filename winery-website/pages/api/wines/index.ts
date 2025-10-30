import { NextApiRequest, NextApiResponse } from 'next';
import { Wine, ApiResponse, CreateWineData } from '../../../types';
import { verifyToken } from '../../../utils/auth';
import { wineService } from '../../../services/api/wineService';

// Mock wine data for development (replace with actual database/API calls)
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
    {
        id: '3',
        name: 'Barolo Brunate 2018',
        description: 'Full-bodied Italian red wine with intense tannins and rich flavors.',
        price: 95.00,
        image: '/images/wines/barolo-brunate.jpg',
        ingredients: ['Nebbiolo'],
        color: 'Red',
        history: 'From the prestigious Brunate vineyard in Barolo, known for producing exceptional Nebbiolo.',
        vintage: 2018,
        region: 'Piedmont, Italy',
        alcoholContent: 14.0,
        category: 'Red Wine',
        inStock: true,
        stockQuantity: 32,
    },
    {
        id: '4',
        name: 'Sancerre Les Monts Damnés 2020',
        description: 'Crisp and mineral Sauvignon Blanc from the Loire Valley.',
        price: 45.00,
        image: '/images/wines/sancerre.jpg',
        ingredients: ['Sauvignon Blanc'],
        color: 'White',
        history: 'From the famous Les Monts Damnés vineyard, known for its unique terroir.',
        vintage: 2020,
        region: 'Loire Valley, France',
        alcoholContent: 13.0,
        category: 'White Wine',
        inStock: true,
        stockQuantity: 45,
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
        stockQuantity: 0,
    },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) {
    try {
        switch (req.method) {
            case 'GET':
                return handleGetWines(req, res);
            case 'POST':
                return handleCreateWine(req, res);
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

async function handleGetWines(req: NextApiRequest, res: NextApiResponse) {
    const {
        page = '1',
        limit = '20',
        sortBy = 'name',
        sortOrder = 'asc',
        category,
        region,
        minPrice,
        maxPrice,
        vintage,
        color,
        inStock,
        search,
    } = req.query;

    // Build filters object
    const filters: any = {};
    if (category) filters.category = category.toString();
    if (region) filters.region = region.toString();
    if (minPrice) filters.minPrice = parseFloat(minPrice.toString());
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice.toString());
    if (vintage) filters.vintage = parseInt(vintage.toString());
    if (color) filters.color = color.toString();
    if (inStock !== undefined) filters.inStock = inStock.toString().toLowerCase() === 'true';
    if (search) filters.search = search.toString();

    // Build sort options
    const sort = {
        field: sortBy.toString() as any,
        direction: sortOrder.toString() as any,
    };

    // Build pagination options
    const pagination = {
        page: parseInt(page.toString()),
        limit: parseInt(limit.toString()),
    };

    try {
        // Use the wine service which handles external API + fallbacks
        const result = await wineService.getWines(filters, sort, pagination);
        
        if (result.success) {
            return res.status(200).json(result);
        } else {
            console.error('Wine service failed:', result.error);
            // Fallback to mock data processing
            return handleMockWines(req, res);
        }
    } catch (error) {
        console.error('Error in handleGetWines:', error);
        // Fallback to mock data processing
        return handleMockWines(req, res);
    }
}

// Fallback function to handle mock wines (original logic)
async function handleMockWines(req: NextApiRequest, res: NextApiResponse) {
    const {
        page = '1',
        limit = '20',
        sortBy = 'name',
        sortOrder = 'asc',
        category,
        region,
        minPrice,
        maxPrice,
        vintage,
        color,
        inStock,
        search,
    } = req.query;

    let filteredWines = [...mockWines];

    // Apply filters
    if (category) {
        filteredWines = filteredWines.filter(wine =>
            wine.category.toLowerCase().includes(category.toString().toLowerCase())
        );
    }

    if (region) {
        filteredWines = filteredWines.filter(wine =>
            wine.region.toLowerCase().includes(region.toString().toLowerCase())
        );
    }

    if (minPrice) {
        filteredWines = filteredWines.filter(wine => wine.price >= parseFloat(minPrice.toString()));
    }

    if (maxPrice) {
        filteredWines = filteredWines.filter(wine => wine.price <= parseFloat(maxPrice.toString()));
    }

    if (vintage) {
        filteredWines = filteredWines.filter(wine => wine.vintage === parseInt(vintage.toString()));
    }

    if (color) {
        filteredWines = filteredWines.filter(wine =>
            wine.color.toLowerCase() === color.toString().toLowerCase()
        );
    }

    if (inStock !== undefined) {
        const stockFilter = inStock.toString().toLowerCase() === 'true';
        filteredWines = filteredWines.filter(wine => wine.inStock === stockFilter);
    }

    if (search) {
        const searchTerm = search.toString().toLowerCase();
        filteredWines = filteredWines.filter(wine =>
            wine.name.toLowerCase().includes(searchTerm) ||
            wine.description.toLowerCase().includes(searchTerm) ||
            wine.region.toLowerCase().includes(searchTerm) ||
            wine.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm))
        );
    }

    // Apply sorting
    filteredWines.sort((a, b) => {
        const aValue = a[sortBy as keyof Wine];
        const bValue = b[sortBy as keyof Wine];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
    });

    // Apply pagination
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedWines = filteredWines.slice(startIndex, endIndex);

    const totalPages = Math.ceil(filteredWines.length / limitNum);

    console.log('Serving mock wine data from API fallback');
    return res.status(200).json({
        success: true,
        data: {
            wines: paginatedWines,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: filteredWines.length,
                totalPages,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1,
            },
        },
    });
}

async function handleCreateWine(req: NextApiRequest, res: NextApiResponse) {
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

    const wineData: CreateWineData = req.body;

    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'vintage', 'region', 'category'];
    const missingFields = requiredFields.filter(field => !wineData[field as keyof CreateWineData]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: `Missing required fields: ${missingFields.join(', ')}`,
            },
        });
    }

    // Create new wine
    const newWine: Wine = {
        id: Date.now().toString(), // In production, use proper ID generation
        ...wineData,
        image: wineData.image || '/images/wines/default-wine.jpg', // Provide default image
        inStock: wineData.stockQuantity > 0,
    };

    // In production, save to database
    mockWines.push(newWine);

    return res.status(201).json({
        success: true,
        data: newWine,
    });
}