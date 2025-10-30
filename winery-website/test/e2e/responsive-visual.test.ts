// Visual regression tests for responsive design using Playwright

import { test, expect, devices } from '@playwright/test';

// Device configurations for testing
const DEVICES = [
  { name: 'iPhone 12', ...devices['iPhone 12'] },
  { name: 'iPad', ...devices['iPad'] },
  { name: 'Desktop Chrome', ...devices['Desktop Chrome'] },
  { name: 'Desktop Safari', ...devices['Desktop Safari'] },
];

// Test pages and their expected elements
const TEST_PAGES = [
  {
    path: '/',
    name: 'Homepage',
    elements: ['header', 'hero-section', 'featured-wines', 'footer'],
  },
  {
    path: '/wines',
    name: 'Wine Catalog',
    elements: ['header', 'wine-grid', 'filters', 'footer'],
  },
  {
    path: '/cart',
    name: 'Shopping Cart',
    elements: ['header', 'cart-items', 'cart-summary', 'footer'],
  },
];

DEVICES.forEach(device => {
  test.describe(`Responsive Design - ${device.name}`, () => {
    test.use({ ...device });

    TEST_PAGES.forEach(page => {
      test(`${page.name} should render correctly on ${device.name}`, async ({ page: browserPage }) => {
        // Navigate to the page
        await browserPage.goto(page.path);

        // Wait for the page to load completely
        await browserPage.waitForLoadState('networkidle');

        // Take a full page screenshot
        await expect(browserPage).toHaveScreenshot(`${page.name.toLowerCase().replace(' ', '-')}-${device.name.toLowerCase().replace(' ', '-')}.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });

      test(`${page.name} interactive elements should be accessible on ${device.name}`, async ({ page: browserPage }) => {
        await browserPage.goto(page.path);
        await browserPage.waitForLoadState('networkidle');

        // Test header navigation
        const header = browserPage.locator('header');
        await expect(header).toBeVisible();

        // Test mobile menu if on mobile device
        if (device.name.includes('iPhone') || device.name.includes('iPad')) {
          const mobileMenuButton = browserPage.getByTestId('mobile-menu-button');
          if (await mobileMenuButton.isVisible()) {
            await mobileMenuButton.click();
            const mobileMenu = browserPage.getByTestId('mobile-menu');
            await expect(mobileMenu).toBeVisible();
            
            // Test mobile menu links
            const mobileLinks = mobileMenu.locator('a');
            const linkCount = await mobileLinks.count();
            expect(linkCount).toBeGreaterThan(0);
          }
        }

        // Test cart icon
        const cartIcon = browserPage.getByTestId('cart-icon');
        await expect(cartIcon).toBeVisible();
        
        // Ensure cart icon is clickable
        const cartBoundingBox = await cartIcon.boundingBox();
        expect(cartBoundingBox).toBeTruthy();
        if (cartBoundingBox) {
          expect(cartBoundingBox.width).toBeGreaterThanOrEqual(44); // Minimum touch target
          expect(cartBoundingBox.height).toBeGreaterThanOrEqual(44);
        }
      });
    });

    test(`Touch interactions should work properly on ${device.name}`, async ({ page: browserPage }) => {
      // Only test touch interactions on mobile devices
      if (!device.name.includes('iPhone') && !device.name.includes('iPad')) {
        test.skip();
      }

      await browserPage.goto('/wines');
      await browserPage.waitForLoadState('networkidle');

      // Test wine card touch interactions
      const wineCards = browserPage.locator('[data-testid="wine-card"]');
      const firstCard = wineCards.first();
      
      if (await firstCard.isVisible()) {
        // Test tap to view details
        await firstCard.tap();
        
        // Should navigate or show details
        await browserPage.waitForTimeout(500);
        
        // Test add to cart button
        const addToCartButton = firstCard.locator('button', { hasText: /add/i });
        if (await addToCartButton.isVisible()) {
          const buttonBox = await addToCartButton.boundingBox();
          expect(buttonBox).toBeTruthy();
          if (buttonBox) {
            expect(buttonBox.width).toBeGreaterThanOrEqual(44);
            expect(buttonBox.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });

    test(`Layout should adapt correctly on ${device.name}`, async ({ page: browserPage }) => {
      await browserPage.goto('/');
      await browserPage.waitForLoadState('networkidle');

      // Test responsive grid layouts
      const wineGrid = browserPage.locator('.grid');
      if (await wineGrid.isVisible()) {
        const gridStyles = await wineGrid.getAttribute('class');
        expect(gridStyles).toBeTruthy();
        
        // Should have responsive grid classes
        expect(gridStyles).toMatch(/grid-cols-\d+/);
      }

      // Test responsive text sizes
      const headings = browserPage.locator('h1, h2, h3');
      const headingCount = await headings.count();
      
      for (let i = 0; i < headingCount; i++) {
        const heading = headings.nth(i);
        const headingStyles = await heading.getAttribute('class');
        if (headingStyles) {
          // Should have responsive text classes
          expect(headingStyles).toMatch(/(text-\w+|sm:text-\w+|md:text-\w+|lg:text-\w+)/);
        }
      }
    });

    test(`Images should load and display correctly on ${device.name}`, async ({ page: browserPage }) => {
      await browserPage.goto('/wines');
      await browserPage.waitForLoadState('networkidle');

      // Test wine card images
      const images = browserPage.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        // Test first few images
        const testCount = Math.min(imageCount, 5);
        
        for (let i = 0; i < testCount; i++) {
          const image = images.nth(i);
          
          // Wait for image to load
          await expect(image).toBeVisible();
          
          // Check if image has loaded successfully
          const naturalWidth = await image.evaluate((img: HTMLImageElement) => img.naturalWidth);
          expect(naturalWidth).toBeGreaterThan(0);
          
          // Check responsive image attributes
          const sizes = await image.getAttribute('sizes');
          if (sizes) {
            expect(sizes).toContain('max-width');
          }
        }
      }
    });

    test(`Performance should be acceptable on ${device.name}`, async ({ page: browserPage }) => {
      // Start performance monitoring
      await browserPage.goto('/');
      
      // Measure page load performance
      const performanceMetrics = await browserPage.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        };
      });

      // Performance thresholds (adjust based on requirements)
      expect(performanceMetrics.domContentLoaded).toBeLessThan(3000); // 3 seconds
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2000); // 2 seconds
      
      console.log(`Performance metrics for ${device.name}:`, performanceMetrics);
    });
  });
});

test.describe('Cross-Device Consistency', () => {
  test('Header should maintain consistent branding across devices', async ({ browser }) => {
    const contexts = await Promise.all(
      DEVICES.map(device => browser.newContext({ ...device }))
    );
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );

    // Navigate all pages to homepage
    await Promise.all(
      pages.map(page => page.goto('/'))
    );

    // Wait for all pages to load
    await Promise.all(
      pages.map(page => page.waitForLoadState('networkidle'))
    );

    // Check that logo is visible on all devices
    const logoChecks = await Promise.all(
      pages.map(async (page, index) => {
        const logo = page.locator('h1', { hasText: 'Vintage Cellar' });
        const isVisible = await logo.isVisible();
        return { device: DEVICES[index].name, logoVisible: isVisible };
      })
    );

    logoChecks.forEach(check => {
      expect(check.logoVisible).toBe(true);
    });

    // Clean up
    await Promise.all(contexts.map(context => context.close()));
  });

  test('Wine cards should maintain consistent information across devices', async ({ browser }) => {
    const contexts = await Promise.all(
      DEVICES.map(device => browser.newContext({ ...device }))
    );
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );

    // Navigate all pages to wine catalog
    await Promise.all(
      pages.map(page => page.goto('/wines'))
    );

    // Wait for all pages to load
    await Promise.all(
      pages.map(page => page.waitForLoadState('networkidle'))
    );

    // Check wine card content consistency
    const wineCardChecks = await Promise.all(
      pages.map(async (page, index) => {
        const wineCards = page.locator('[data-testid="wine-card"]');
        const cardCount = await wineCards.count();
        
        let hasPrice = false;
        let hasName = false;
        
        if (cardCount > 0) {
          const firstCard = wineCards.first();
          hasPrice = await firstCard.locator('text=/KSh/').isVisible();
          hasName = await firstCard.locator('h3').isVisible();
        }
        
        return { 
          device: DEVICES[index].name, 
          cardCount, 
          hasPrice, 
          hasName 
        };
      })
    );

    // All devices should show wine cards with consistent information
    wineCardChecks.forEach(check => {
      if (check.cardCount > 0) {
        expect(check.hasPrice).toBe(true);
        expect(check.hasName).toBe(true);
      }
    });

    // Clean up
    await Promise.all(contexts.map(context => context.close()));
  });
});

test.describe('Accessibility Across Devices', () => {
  DEVICES.forEach(device => {
    test(`Accessibility standards should be met on ${device.name}`, async ({ page }) => {
      test.use({ ...device });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Test keyboard navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.locator(':focus').first();
      await expect(focusedElement).toBeVisible();

      // Test skip links (if implemented)
      const skipLink = page.locator('a[href="#main-content"]');
      if (await skipLink.isVisible()) {
        await skipLink.click();
        const mainContent = page.locator('#main-content');
        await expect(mainContent).toBeFocused();
      }

      // Test ARIA labels on interactive elements
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        // Button should have either aria-label or visible text
        expect(ariaLabel || buttonText).toBeTruthy();
      }
    });
  });
});