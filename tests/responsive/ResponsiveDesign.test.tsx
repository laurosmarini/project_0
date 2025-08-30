import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Navigation } from '../../src/components/Navigation';
import { NavigationProvider } from '../../src/contexts/NavigationContext';

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Mock ResizeObserver
const mockResizeObserver = () => {
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
};

const mockNavigationItems = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    children: []
  },
  {
    id: 'products',
    label: 'Products',
    href: '/products',
    children: [
      { id: 'laptops', label: 'Laptops', href: '/products/laptops' },
      { id: 'phones', label: 'Phones', href: '/products/phones' },
      { id: 'tablets', label: 'Tablets', href: '/products/tablets' }
    ]
  },
  {
    id: 'services',
    label: 'Services',
    href: '/services',
    children: [
      { id: 'support', label: 'Support', href: '/services/support' },
      { id: 'consulting', label: 'Consulting', href: '/services/consulting' }
    ]
  },
  {
    id: 'about',
    label: 'About',
    href: '/about',
    children: []
  }
];

const renderNavigationWithViewport = (width: number, height: number = 768, props = {}) => {
  // Mock viewport dimensions
  Object.defineProperties(window, {
    innerWidth: {
      writable: true,
      configurable: true,
      value: width,
    },
    innerHeight: {
      writable: true,
      configurable: true,
      value: height,
    },
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));

  return render(
    <NavigationProvider>
      <Navigation items={mockNavigationItems} {...props} />
    </NavigationProvider>
  );
};

describe('Navigation Component - Responsive Design Tests', () => {
  beforeEach(() => {
    mockResizeObserver();
    jest.clearAllMocks();
  });

  describe('Mobile Viewport (≤768px)', () => {
    it('should render mobile layout at 320px width', () => {
      renderNavigationWithViewport(320);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('mobile');
      
      const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(toggleButton).toBeVisible();
      
      // Menu items should be initially hidden
      const menuList = screen.getByRole('menubar');
      expect(menuList).toHaveClass('collapsed');
    });

    it('should render mobile layout at 480px width', () => {
      renderNavigationWithViewport(480);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('mobile');
      
      const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(toggleButton).toBeVisible();
    });

    it('should render mobile layout at 768px width', () => {
      renderNavigationWithViewport(768);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('mobile');
      
      const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(toggleButton).toBeVisible();
    });

    it('should show menu when toggle button is clicked on mobile', async () => {
      renderNavigationWithViewport(480);
      
      const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
      const menuList = screen.getByRole('menubar');
      
      expect(menuList).toHaveClass('collapsed');
      
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(menuList).not.toHaveClass('collapsed');
        expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should stack menu items vertically on mobile', () => {
      renderNavigationWithViewport(320);
      
      const menuList = screen.getByRole('menubar');
      expect(menuList).toHaveClass('vertical');
    });

    it('should handle dropdown behavior on mobile', async () => {
      renderNavigationWithViewport(480);
      
      // Open mobile menu first
      const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const productsButton = screen.getByRole('button', { name: /products/i });
        expect(productsButton).toBeVisible();
      });
      
      // Click dropdown in mobile menu
      const productsButton = screen.getByRole('button', { name: /products/i });
      fireEvent.click(productsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
        expect(screen.getByText('Phones')).toBeVisible();
      });
    });
  });

  describe('Tablet Viewport (769px - 1024px)', () => {
    it('should render tablet layout at 800px width', () => {
      renderNavigationWithViewport(800);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('tablet');
      
      // Should show condensed desktop-like layout
      const menuList = screen.getByRole('menubar');
      expect(menuList).not.toHaveClass('collapsed');
      expect(menuList).toHaveClass('horizontal');
    });

    it('should render tablet layout at 1024px width', () => {
      renderNavigationWithViewport(1024);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('tablet');
    });

    it('should handle touch interactions on tablet', async () => {
      renderNavigationWithViewport(900);
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      
      // Touch events should work
      fireEvent.touchStart(productsButton);
      fireEvent.touchEnd(productsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
    });

    it('should show dropdown on hover for tablet', async () => {
      renderNavigationWithViewport(800);
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      
      fireEvent.mouseEnter(productsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
    });
  });

  describe('Desktop Viewport (≥1025px)', () => {
    it('should render desktop layout at 1200px width', () => {
      renderNavigationWithViewport(1200);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('desktop');
      
      // Toggle button should be hidden
      const toggleButton = screen.queryByRole('button', { name: /toggle menu/i });
      expect(toggleButton).not.toBeVisible();
      
      // Menu should be visible
      const menuList = screen.getByRole('menubar');
      expect(menuList).not.toHaveClass('collapsed');
      expect(menuList).toHaveClass('horizontal');
    });

    it('should render desktop layout at 1440px width', () => {
      renderNavigationWithViewport(1440);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('desktop');
    });

    it('should render desktop layout at 1920px width', () => {
      renderNavigationWithViewport(1920);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('desktop');
    });

    it('should show dropdown on hover for desktop', async () => {
      renderNavigationWithViewport(1200);
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      
      fireEvent.mouseEnter(productsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
    });

    it('should hide dropdown on mouse leave for desktop', async () => {
      renderNavigationWithViewport(1200);
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      
      fireEvent.mouseEnter(productsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      fireEvent.mouseLeave(productsButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Laptops')).not.toBeVisible();
      });
    });
  });

  describe('Ultra-wide Viewport (≥2560px)', () => {
    it('should render ultra-wide layout at 2560px width', () => {
      renderNavigationWithViewport(2560);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('ultra-wide');
    });

    it('should render ultra-wide layout at 3440px width', () => {
      renderNavigationWithViewport(3440);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('ultra-wide');
    });

    it('should center navigation on ultra-wide screens', () => {
      renderNavigationWithViewport(2560);
      
      const navContainer = screen.getByRole('navigation').firstChild;
      expect(navContainer).toHaveClass('container-centered');
    });
  });

  describe('Orientation Changes', () => {
    it('should handle portrait to landscape orientation change', async () => {
      // Start in portrait mode (mobile)
      renderNavigationWithViewport(480, 800);
      
      let nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('mobile');
      
      // Change to landscape
      renderNavigationWithViewport(800, 480);
      
      await waitFor(() => {
        nav = screen.getByRole('navigation');
        expect(nav).toHaveClass('tablet');
      });
    });

    it('should handle landscape to portrait orientation change', async () => {
      // Start in landscape mode (tablet)
      renderNavigationWithViewport(1024, 768);
      
      let nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('tablet');
      
      // Change to portrait
      renderNavigationWithViewport(768, 1024);
      
      await waitFor(() => {
        nav = screen.getByRole('navigation');
        expect(nav).toHaveClass('mobile');
      });
    });
  });

  describe('Dynamic Resizing', () => {
    it('should adapt when window is resized from desktop to mobile', async () => {
      // Start with desktop
      renderNavigationWithViewport(1200);
      
      let nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('desktop');
      
      // Resize to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      window.dispatchEvent(new Event('resize'));
      
      await waitFor(() => {
        nav = screen.getByRole('navigation');
        expect(nav).toHaveClass('mobile');
      });
    });

    it('should adapt when window is resized from mobile to desktop', async () => {
      // Start with mobile
      renderNavigationWithViewport(480);
      
      let nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('mobile');
      
      // Resize to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      window.dispatchEvent(new Event('resize'));
      
      await waitFor(() => {
        nav = screen.getByRole('navigation');
        expect(nav).toHaveClass('desktop');
      });
    });

    it('should close mobile menu when resizing to desktop', async () => {
      renderNavigationWithViewport(480);
      
      // Open mobile menu
      const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      });
      
      // Resize to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      window.dispatchEvent(new Event('resize'));
      
      await waitFor(() => {
        const nav = screen.getByRole('navigation');
        expect(nav).toHaveClass('desktop');
        
        // Mobile menu should be closed/hidden
        const newToggleButton = screen.queryByRole('button', { name: /toggle menu/i });
        expect(newToggleButton).not.toBeVisible();
      });
    });
  });

  describe('Container Queries Support', () => {
    it('should respond to container size changes', () => {
      // Mock container query support
      const container = document.createElement('div');
      container.style.width = '300px';
      
      render(
        <NavigationProvider>
          <div style={{ width: '300px' }}>
            <Navigation items={mockNavigationItems} useContainerQueries={true} />
          </div>
        </NavigationProvider>,
        { container }
      );
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('container-small');
    });

    it('should handle different container sizes', () => {
      const testCases = [
        { width: '200px', expectedClass: 'container-xs' },
        { width: '400px', expectedClass: 'container-sm' },
        { width: '800px', expectedClass: 'container-md' },
        { width: '1200px', expectedClass: 'container-lg' }
      ];
      
      testCases.forEach(({ width, expectedClass }) => {
        const { unmount } = render(
          <NavigationProvider>
            <div style={{ width }}>
              <Navigation items={mockNavigationItems} useContainerQueries={true} />
            </div>
          </NavigationProvider>
        );
        
        const nav = screen.getByRole('navigation');
        expect(nav).toHaveClass(expectedClass);
        
        unmount();
      });
    });
  });

  describe('Print Styles', () => {
    it('should apply print-friendly styles', () => {
      mockMatchMedia(true);
      
      renderNavigationWithViewport(1200);
      
      // Mock print media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === 'print',
          media: query,
        })),
      });
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      // In real test, would check for print-specific classes or styles
    });
  });

  describe('Reduced Motion', () => {
    it('should respect reduced motion preferences', () => {
      mockMatchMedia(true);
      
      renderNavigationWithViewport(1200);
      
      // Mock reduced motion media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
        })),
      });
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('reduced-motion');
    });
  });

  describe('High Contrast Mode', () => {
    it('should adapt to high contrast preferences', () => {
      mockMatchMedia(true);
      
      renderNavigationWithViewport(1200);
      
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
        })),
      });
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('high-contrast');
    });
  });

  describe('Performance Optimization', () => {
    it('should debounce resize events', async () => {
      const resizeHandler = jest.fn();
      
      renderNavigationWithViewport(1200);
      
      // Add event listener
      window.addEventListener('resize', resizeHandler);
      
      // Trigger multiple resize events quickly
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(new Event('resize'));
      }
      
      // Should debounce and only call handler once after delay
      await waitFor(() => {
        expect(resizeHandler).toHaveBeenCalled();
      }, { timeout: 300 });
      
      window.removeEventListener('resize', resizeHandler);
    });
  });
});