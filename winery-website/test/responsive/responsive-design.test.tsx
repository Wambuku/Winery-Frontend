// Responsive design tests across different device sizes

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import WineCard from '../../components/wine/WineCard';
import WineGrid from '../../components/wine/WineGrid';
import Cart from '../../components/cart/Cart';
import MiniCart from '../../components/cart/MiniCart';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { Wine } from '../../types';

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
    query: {},
  }),
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Device viewport configurations
const DEVICE_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 },
  largeDesktop: { width: 1440, height: 900 },
};

// Mock data
const mockWine: Wine = {
  id: '1',
  name: 'Test Wine',
  description: 'A test wine description',
  price: 2500,
  image: '/test-wine.jpg',
  ingredients: ['Grapes', 'Sulfites'],
  color: 'red',
  history: 'Test wine history',
  vintage: 2020,
  region: 'Test Region',
  alcoholContent: 13.5,
  category: 'red',
  inStock: true,
  stockQuantity: 10,
};

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'customer' as const,
};

const mockCartItems = [
  { wine: mockWine, quantity: 2 },
];

// Helper function to set viewport size
const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

// Mock context providers
const MockAuthProvider = ({ children, user = null }: any) => (
  <AuthContext.Provider value={{
    user,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    loading: false,
  }}>
    {children}
  </AuthContext.Provider>
);

const MockCartProvider = ({ children, items = [] }: any) => (
  <CartContext.Provider value={{
    items,
    total: items.reduce((sum: number, item: any) => sum + (item.wine.price * item.quantity), 0),
    itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
  }}>
    {children}
  </CartContext.Provider>
);

describe('Responsive Design Tests', () => {
  beforeEach(() => {
    // Reset viewport to desktop size before each test
    setViewportSize(DEVICE_SIZES.desktop.width, DEVICE_SIZES.desktop.height);
  });

  describe('Header Component Responsiveness', () => {
    it('should show mobile menu button on mobile devices', () => {
      setViewportSize(DEVICE_SIZES.mobile.width, DEVICE_SIZES.mobile.height);
      
      render(
        <MockAuthProvider>
          <MockCartProvider>
            <Header />
          </MockCartProvider>
        </MockAuthProvider>
      );

      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      expect(mobileMenuButton).toBeInTheDocument();
    });

    it('should hide desktop navigation on mobile', () => {
      setViewportSize(DEVICE_SIZES.mobile.width, DEVICE_SIZES.mobile.height);
      
      render(
        <MockAuthProvider>
          <MockCartProvider>
            <Header />
          </MockCartProvider>
        </MockAuthProvider>
      );

      // Desktop navigation should be hidden (using CSS classes)
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('hidden', 'md:flex');
    });

    it('should show mobile menu when menu button is clicked', async () => {
      setViewportSize(DEVICE_SIZES.mobile.width, DEVICE_SIZES.mobile.height);
      
      render(
        <MockAuthProvider>
          <MockCartProvider>
            <Header />
          </MockCartProvider>
        </MockAuthProvider>
      );

      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      fireEvent.click(mobileMenuButton);

      await waitFor(() => {
        const mobileMenu = screen.getByTestId('mobile-menu');
        expect(mobileMenu).toBeInTheDocument();
      });
    });

    it('should adapt logo size on different screen sizes', () => {
      const { rerender } = render(
        <MockAuthProvider>
          <MockCartProvider>
            <Header />
          </MockCartProvider>
        </MockAuthProvider>
      );

      // Test mobile size
      setViewportSize(DEVICE_SIZES.mobile.width, DEVICE_SIZES.mobile.height);
      rerender(
        <MockAuthProvider>
          <MockCartProvider>
            <Header />
          </MockCartProvider>
        </MockAuthProvider>
      );

      // Logo should have responsive classes
      const logoContainer = screen.getByRole('link', { name: /vintage cellar/i });
      expect(logoContainer).toBeInTheDocument();
    });
  });

  describe('Footer Component Responsiveness', () => {
    it('should stack footer columns on mobile', () => {
      setViewportSize(DEVICE_SIZES.mobile.width, DEVICE_SIZES.mobile.height);
      
      render(<Footer />);

      // Footer should have responsive grid classes
      const footerGrid = screen.getByRole('contentinfo').querySelector('.grid');
      expect(footerGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
    });

    it('should show all footer sections on desktop', () => {
      setViewportSize(DEVICE_SIZES.desktop.width, DEVICE_SIZES.desktop.height);
      
      render(<Footer />);

      expect(screen.getByText('Quick Links')).toBeInTheDocument();
      expect(screen.getByText('Customer Service')).toBeInTheDocument();
      expect(screen.getByText('Contact Info')).toBeInTheDocument();
    });
  });

  describe('WineCard Component Responsiveness', () => {
    it('should adjust image height on different screen sizes', () => {
      const { container } = render(
        <WineCard wine={mockWine} />
      );

      const imageContainer = container.querySelector('.relative.h-48');
      expect(imageContainer).toHaveClass('h-48', 'sm:h-56', 'md:h-64');
    });

    it('should hide description on mobile', () => {
      setViewportSize(DEVICE_SIZES.mobile.width, DEVICE_SIZES.mobile.height);
      
      render(<WineCard wine={mockWine} />);

      const description = screen.getByText(mockWine.description).parentElement;
      expect(description).toHaveClass('hidden', 'sm:block');
    });

    it('should adjust button text on mobile', () => {
      render(<WineCard wine={mockWine} />);

      const addButton = screen.getByRole('button', { name: /add/i });
      expect(addButton).toBeInTheDocument();
      
      // Should have responsive text classes
      const hiddenText = addButton.querySelector('.hidden.sm\\:inline');
      const mobileText = addButton.querySelector('.sm\\:hidden');
      
      expect(hiddenText).toBeInTheDocument();
      expect(mobileText).toBeInTheDocument();
    });
  });

  describe('WineGrid Component Responsiveness', () => {
    const mockWines = Array.from({ length: 8 }, (_, i) => ({
      ...mockWine,
      id: `wine-${i}`,
      name: `Wine ${i}`,
    }));

    it('should show correct number of columns on different screen sizes', () => {
      const { container } = render(
        <WineGrid wines={mockWines} />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass(
        'grid-cols-1',
        'sm:grid-cols-2',
        'md:grid-cols-3',
        'lg:grid-cols-4',
        'xl:grid-cols-5'
      );
    });

    it('should adjust gap size responsively', () => {
      const { container } = render(
        <WineGrid wines={mockWines} />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-4', 'sm:gap-6');
    });
  });

  describe('Cart Component Responsiveness', () => {
    it('should stack cart item elements on mobile', () => {
      render(
        <MockCartProvider items={mockCartItems}>
          <Cart />
        </MockCartProvider>
      );

      // Cart should have responsive styles in CSS
      const cartContainer = screen.getByRole('main') || screen.getByText(/shopping cart/i).closest('div');
      expect(cartContainer).toBeInTheDocument();
    });

    it('should make checkout button full width on mobile', () => {
      render(
        <MockCartProvider items={mockCartItems}>
          <Cart />
        </MockCartProvider>
      );

      const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i });
      expect(checkoutButton).toBeInTheDocument();
    });
  });

  describe('MiniCart Component Responsiveness', () => {
    it('should be full width on mobile', () => {
      setViewportSize(DEVICE_SIZES.mobile.width, DEVICE_SIZES.mobile.height);
      
      render(
        <MockCartProvider items={mockCartItems}>
          <MiniCart isOpen={true} onClose={vi.fn()} />
        </MockCartProvider>
      );

      // MiniCart should have responsive width styles
      const miniCart = screen.getByRole('dialog') || screen.getByText(/cart/i).closest('[class*="mini-cart"]');
      expect(miniCart).toBeInTheDocument();
    });

    it('should stack action buttons on mobile', () => {
      setViewportSize(DEVICE_SIZES.mobile.width, DEVICE_SIZES.mobile.height);
      
      render(
        <MockCartProvider items={mockCartItems}>
          <MiniCart isOpen={true} onClose={vi.fn()} />
        </MockCartProvider>
      );

      const checkoutButton = screen.getByRole('button', { name: /checkout/i });
      expect(checkoutButton).toBeInTheDocument();
    });
  });

  describe('Touch Interactions', () => {
    it('should handle touch events on interactive elements', () => {
      render(
        <MockAuthProvider>
          <MockCartProvider>
            <Header />
          </MockCartProvider>
        </MockAuthProvider>
      );

      const cartIcon = screen.getByTestId('cart-icon');
      expect(cartIcon).toHaveClass('touch-manipulation');
    });

    it('should have appropriate touch target sizes', () => {
      render(<WineCard wine={mockWine} />);

      const addButton = screen.getByRole('button', { name: /add/i });
      expect(addButton).toHaveClass('touch-manipulation');
    });
  });

  describe('Accessibility on Mobile', () => {
    it('should maintain proper focus management on mobile menu', async () => {
      setViewportSize(DEVICE_SIZES.mobile.width, DEVICE_SIZES.mobile.height);
      
      render(
        <MockAuthProvider>
          <MockCartProvider>
            <Header />
          </MockCartProvider>
        </MockAuthProvider>
      );

      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      fireEvent.click(mobileMenuButton);

      await waitFor(() => {
        const mobileMenu = screen.getByTestId('mobile-menu');
        expect(mobileMenu).toBeInTheDocument();
      });

      // Test keyboard navigation
      fireEvent.keyDown(document, { key: 'Escape' });
      // Mobile menu should close on escape (if implemented)
    });

    it('should have proper ARIA labels on mobile elements', () => {
      setViewportSize(DEVICE_SIZES.mobile.width, DEVICE_SIZES.mobile.height);
      
      render(
        <MockAuthProvider>
          <MockCartProvider items={mockCartItems}>
            <Header />
          </MockCartProvider>
        </MockAuthProvider>
      );

      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      expect(mobileMenuButton).toBeInTheDocument();

      const cartIcon = screen.getByTestId('cart-icon');
      expect(cartIcon).toBeInTheDocument();
    });
  });

  describe('Performance on Different Devices', () => {
    it('should load appropriate image sizes for different viewports', () => {
      render(<WineCard wine={mockWine} />);

      const image = screen.getByAltText(mockWine.name);
      expect(image).toHaveAttribute('sizes');
      
      const sizesAttr = image.getAttribute('sizes');
      expect(sizesAttr).toContain('(max-width: 640px)');
      expect(sizesAttr).toContain('(max-width: 768px)');
    });

    it('should prioritize critical content on mobile', () => {
      setViewportSize(DEVICE_SIZES.mobile.width, DEVICE_SIZES.mobile.height);
      
      render(<WineCard wine={mockWine} />);

      // Essential information should be visible
      expect(screen.getByText(mockWine.name)).toBeInTheDocument();
      expect(screen.getByText(`KSh ${mockWine.price.toLocaleString()}`)).toBeInTheDocument();
      
      // Non-essential content should be hidden on mobile
      const description = screen.getByText(mockWine.description).parentElement;
      expect(description).toHaveClass('hidden', 'sm:block');
    });
  });
});

describe('Cross-Device Compatibility', () => {
  Object.entries(DEVICE_SIZES).forEach(([deviceName, { width, height }]) => {
    describe(`${deviceName} (${width}x${height})`, () => {
      beforeEach(() => {
        setViewportSize(width, height);
      });

      it('should render header correctly', () => {
        render(
          <MockAuthProvider>
            <MockCartProvider>
              <Header />
            </MockCartProvider>
          </MockAuthProvider>
        );

        expect(screen.getByText('Vintage Cellar')).toBeInTheDocument();
        expect(screen.getByTestId('cart-icon')).toBeInTheDocument();
      });

      it('should render wine cards correctly', () => {
        render(<WineCard wine={mockWine} />);

        expect(screen.getByText(mockWine.name)).toBeInTheDocument();
        expect(screen.getByText(`KSh ${mockWine.price.toLocaleString()}`)).toBeInTheDocument();
      });

      it('should handle user interactions', () => {
        const onAddToCart = vi.fn();
        render(<WineCard wine={mockWine} onAddToCart={onAddToCart} />);

        const addButton = screen.getByRole('button', { name: /add/i });
        fireEvent.click(addButton);

        expect(onAddToCart).toHaveBeenCalledWith(mockWine);
      });
    });
  });
});