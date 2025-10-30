import { test, expect } from '@playwright/test';

test.describe('Homepage and Navigation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage with all sections', async ({ page }) => {
    // Check if main sections are visible
    await expect(page.locator('h1')).toContainText('Vintage Cellar');
    
    // Hero section should be visible
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    
    // Categories section should be visible
    await expect(page.locator('h2')).toContainText('Wine Categories');
    
    // Featured wines section should be visible
    await expect(page.locator('h2')).toContainText('Featured Wines');
    
    // Recommendations section should be visible
    await expect(page.locator('h2')).toContainText('Popular Selections');
  });

  test('should navigate through wine carousel', async ({ page }) => {
    // Wait for carousel to load
    await page.waitForSelector('[data-testid="wine-carousel"]', { timeout: 10000 });
    
    // Check if carousel navigation buttons are present
    const prevButton = page.locator('[aria-label="Previous wine"]');
    const nextButton = page.locator('[aria-label="Next wine"]');
    
    if (await prevButton.count() > 0) {
      await expect(prevButton).toBeVisible();
      await expect(nextButton).toBeVisible();
      
      // Click next button
      await nextButton.click();
      await page.waitForTimeout(1000);
      
      // Click previous button
      await prevButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should navigate to wine categories', async ({ page }) => {
    // Click on a category (Red Wines)
    const redWineCategory = page.locator('text=Red Wines').first();
    await redWineCategory.click();
    
    // Should navigate to wines page with category filter
    await expect(page).toHaveURL(/\/wines\?category=red/);
    await expect(page.locator('h1')).toContainText('Red Wines');
  });

  test('should search for wines', async ({ page }) => {
    // Find search input in header
    const searchInput = page.locator('input[placeholder*="Search wines"]');
    await searchInput.fill('Cabernet');
    await searchInput.press('Enter');
    
    // Should navigate to wines page with search query
    await expect(page).toHaveURL(/\/wines\?search=Cabernet/);
    await expect(page.locator('h1')).toContainText('Search Results for "Cabernet"');
  });

  test('should display search suggestions', async ({ page }) => {
    // Type in search input
    const searchInput = page.locator('input[placeholder*="Search wines"]');
    await searchInput.fill('wine');
    
    // Wait for suggestions to appear
    await page.waitForSelector('[data-testid="search-suggestions"]', { timeout: 5000 });
    
    // Check if suggestions are visible
    const suggestions = page.locator('[data-testid="search-suggestions"]');
    await expect(suggestions).toBeVisible();
  });

  test('should navigate to featured wines', async ({ page }) => {
    // Click "View All Featured Wines" button
    const viewAllButton = page.locator('text=View All Featured Wines').first();
    await viewAllButton.click();
    
    // Should navigate to wines page with featured filter
    await expect(page).toHaveURL(/\/wines\?category=featured/);
  });

  test('should add wine to cart from homepage', async ({ page }) => {
    // Wait for featured wines to load
    await page.waitForSelector('[data-testid="wine-card"]', { timeout: 10000 });
    
    // Click "Add to Cart" on first available wine
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click();
      
      // Check if cart icon shows item count
      const cartIcon = page.locator('[data-testid="cart-icon"]');
      await expect(cartIcon).toBeVisible();
    }
  });

  test('should navigate to wine detail page', async ({ page }) => {
    // Wait for wine cards to load
    await page.waitForSelector('[data-testid="wine-card"]', { timeout: 10000 });
    
    // Click on first wine card
    const wineCard = page.locator('[data-testid="wine-card"]').first();
    await wineCard.click();
    
    // Should navigate to wine detail page
    await expect(page).toHaveURL(/\/wines\/[^\/]+$/);
  });

  test('should display mobile menu on small screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile menu button should be visible
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // Click mobile menu button
    await mobileMenuButton.click();
    
    // Mobile menu should be visible
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();
  });

  test('should filter wines by price range', async ({ page }) => {
    // Navigate to wines page
    await page.goto('/wines');
    
    // Set price filters
    const minPriceInput = page.locator('input[placeholder="Min"]');
    const maxPriceInput = page.locator('input[placeholder="Max"]');
    
    await minPriceInput.fill('1000');
    await maxPriceInput.fill('5000');
    
    // Wait for results to update
    await page.waitForTimeout(2000);
    
    // Check if URL contains price filters
    await expect(page).toHaveURL(/minPrice=1000/);
    await expect(page).toHaveURL(/maxPrice=5000/);
  });

  test('should sort wines by different criteria', async ({ page }) => {
    // Navigate to wines page
    await page.goto('/wines');
    
    // Change sort option
    const sortSelect = page.locator('select').last();
    await sortSelect.selectOption('price-desc');
    
    // Wait for results to update
    await page.waitForTimeout(2000);
    
    // Check if URL contains sort parameters
    await expect(page).toHaveURL(/sortBy=price/);
    await expect(page).toHaveURL(/sortOrder=desc/);
  });

  test('should paginate through wine results', async ({ page }) => {
    // Navigate to wines page
    await page.goto('/wines');
    
    // Wait for wines to load
    await page.waitForSelector('[data-testid="wine-grid"]', { timeout: 10000 });
    
    // Check if pagination exists
    const nextPageButton = page.locator('button:has-text("Next")');
    if (await nextPageButton.count() > 0 && await nextPageButton.isEnabled()) {
      await nextPageButton.click();
      
      // Should navigate to page 2
      await expect(page).toHaveURL(/page=2/);
      
      // Previous button should be enabled
      const prevPageButton = page.locator('button:has-text("Previous")');
      await expect(prevPageButton).toBeEnabled();
    }
  });

  test('should clear all filters', async ({ page }) => {
    // Navigate to wines page with filters
    await page.goto('/wines?category=red&minPrice=1000&search=wine');
    
    // Click clear filters button
    const clearFiltersButton = page.locator('button:has-text("Clear All Filters")');
    await clearFiltersButton.click();
    
    // Should navigate back to clean wines page
    await expect(page).toHaveURL('/wines');
    
    // All filter inputs should be cleared
    const categorySelect = page.locator('select').first();
    await expect(categorySelect).toHaveValue('');
  });

  test('should display loading states', async ({ page }) => {
    // Intercept API calls to add delay
    await page.route('**/api/wines/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    // Navigate to wines page
    await page.goto('/wines');
    
    // Should show loading spinner
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    await expect(loadingSpinner).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Intercept API calls to return error
    await page.route('**/api/wines/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    // Navigate to wines page
    await page.goto('/wines');
    
    // Should show error message
    const errorMessage = page.locator('text=Failed to load wines');
    await expect(errorMessage).toBeVisible();
    
    // Should show retry button
    const retryButton = page.locator('button:has-text("Try Again")');
    await expect(retryButton).toBeVisible();
  });

  test('should maintain filter state in URL', async ({ page }) => {
    // Navigate to wines page
    await page.goto('/wines');
    
    // Apply multiple filters
    await page.selectOption('select >> nth=0', 'red'); // Category
    await page.selectOption('select >> nth=1', 'Bordeaux'); // Region
    await page.fill('input[placeholder="Min"]', '2000');
    
    // Wait for URL to update
    await page.waitForTimeout(1000);
    
    // Refresh page
    await page.reload();
    
    // Filters should be maintained
    await expect(page.locator('select >> nth=0')).toHaveValue('red');
    await expect(page.locator('input[placeholder="Min"]')).toHaveValue('2000');
  });

  test('should show wine recommendations for logged-in users', async ({ page }) => {
    // Mock login state
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer'
      }));
    });
    
    // Navigate to homepage
    await page.goto('/');
    
    // Should show personalized recommendations
    const recommendationsSection = page.locator('h2:has-text("Recommended for You")');
    await expect(recommendationsSection).toBeVisible();
  });
});

test.describe('Responsive Design Tests', () => {
  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check if layout adapts to tablet size
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="wine-carousel"]')).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if layout adapts to mobile size
    await expect(page.locator('h1')).toBeVisible();
    
    // Mobile-specific elements should be visible
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(mobileMenuButton).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Check if layout uses full desktop space
    await expect(page.locator('h1')).toBeVisible();
    
    // Desktop navigation should be visible
    const desktopNav = page.locator('nav >> text=Browse Wines');
    await expect(desktopNav).toBeVisible();
  });
});