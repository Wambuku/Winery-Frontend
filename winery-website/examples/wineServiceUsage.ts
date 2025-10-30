// Example usage of the Wine API Service Layer
import { wineService } from '../services/api/wineService';

// Example: Fetch wines with pagination and filters
async function fetchWinesExample() {
  try {
    const result = await wineService.getWines(
      {
        category: 'Red Wine',
        region: 'Bordeaux',
        minPrice: 50,
        maxPrice: 500,
        inStock: true,
      },
      { field: 'price', direction: 'desc' },
      { page: 1, limit: 10 }
    );

    if (result.success) {
      console.log('Wines found:', result.data.wines.length);
      console.log('Total pages:', result.data.pagination.totalPages);
      result.data.wines.forEach(wine => {
        console.log(`${wine.name} - $${wine.price}`);
      });
    } else {
      console.error('Error fetching wines:', result.error.message);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Example: Search wines
async function searchWinesExample() {
  try {
    const result = await wineService.searchWines('Château', {
      category: 'Red Wine',
    });

    if (result.success) {
      console.log('Search results:', result.data.wines.length);
    }
  } catch (error) {
    console.error('Search error:', error);
  }
}

// Example: Get wine by ID
async function getWineByIdExample() {
  try {
    const result = await wineService.getWineById('1');

    if (result.success) {
      console.log('Wine details:', result.data.name);
      console.log('Description:', result.data.description);
      console.log('Price:', result.data.price);
    } else {
      console.error('Wine not found:', result.error.message);
    }
  } catch (error) {
    console.error('Error fetching wine:', error);
  }
}

// Example: Create new wine (staff/admin only)
async function createWineExample() {
  try {
    const newWineData = {
      name: 'New Vintage Wine 2023',
      description: 'A exceptional vintage from our collection',
      price: 125.00,
      image: '/images/wines/new-vintage-2023.jpg',
      ingredients: ['Cabernet Sauvignon', 'Merlot'],
      color: 'Red',
      history: 'Crafted using traditional methods passed down through generations',
      vintage: 2023,
      region: 'Napa Valley, California',
      alcoholContent: 14.2,
      category: 'Red Wine',
      stockQuantity: 50,
    };

    const result = await wineService.createWine(newWineData);

    if (result.success) {
      console.log('Wine created successfully:', result.data.id);
    } else {
      console.error('Error creating wine:', result.error.message);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Example: Update wine stock (staff/admin only)
async function updateWineStockExample() {
  try {
    const result = await wineService.updateWine({
      id: '1',
      stockQuantity: 25,
      price: 899.99, // Update price as well
    });

    if (result.success) {
      console.log('Wine updated:', result.data.name);
      console.log('New stock:', result.data.stockQuantity);
      console.log('In stock:', result.data.inStock);
    }
  } catch (error) {
    console.error('Error updating wine:', error);
  }
}

// Example: Bulk update stock levels (staff/admin only)
async function bulkUpdateStockExample() {
  try {
    const updates = [
      { id: '1', stockQuantity: 30 },
      { id: '2', stockQuantity: 15 },
      { id: '3', stockQuantity: 0 }, // This will set inStock to false
    ];

    const result = await wineService.bulkUpdateStock(updates);

    if (result.success) {
      console.log('Bulk update completed for', result.data.length, 'wines');
      result.data.forEach(wine => {
        console.log(`${wine.name}: ${wine.stockQuantity} units (${wine.inStock ? 'In Stock' : 'Out of Stock'})`);
      });
    }
  } catch (error) {
    console.error('Error in bulk update:', error);
  }
}

// Example: Get featured wines for homepage
async function getFeaturedWinesExample() {
  try {
    const result = await wineService.getFeaturedWines(6);

    if (result.success) {
      console.log('Featured wines for homepage:');
      result.data.forEach(wine => {
        console.log(`- ${wine.name} ($${wine.price})`);
      });
    }
  } catch (error) {
    console.error('Error fetching featured wines:', error);
  }
}

// Example: Get low stock wines for inventory management
async function getLowStockWinesExample() {
  try {
    const result = await wineService.getLowStockWines(10); // Threshold of 10 units

    if (result.success) {
      console.log('Wines with low stock:');
      result.data.forEach(wine => {
        console.log(`- ${wine.name}: ${wine.stockQuantity} units remaining`);
      });
    }
  } catch (error) {
    console.error('Error fetching low stock wines:', error);
  }
}

// Example: Get wine categories and regions for filters
async function getFiltersDataExample() {
  try {
    const [categoriesResult, regionsResult] = await Promise.all([
      wineService.getCategories(),
      wineService.getRegions(),
    ]);

    if (categoriesResult.success && regionsResult.success) {
      console.log('Available categories:', categoriesResult.data);
      console.log('Available regions:', regionsResult.data);
    }
  } catch (error) {
    console.error('Error fetching filter data:', error);
  }
}

// Export examples for use in components
export {
  fetchWinesExample,
  searchWinesExample,
  getWineByIdExample,
  createWineExample,
  updateWineStockExample,
  bulkUpdateStockExample,
  getFeaturedWinesExample,
  getLowStockWinesExample,
  getFiltersDataExample,
};