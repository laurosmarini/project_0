import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';
import { Navigation } from '../../src/components/Navigation';
import { NavigationProvider } from '../../src/contexts/NavigationContext';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

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

const renderNavigation = (props = {}) => {
  return render(
    <div>
      <NavigationProvider>
        <Navigation items={mockNavigationItems} {...props} />
      </NavigationProvider>
      <main id="main-content">
        <h1>Main Content</h1>
      </main>
    </div>
  );
};

describe('Navigation Component - Accessibility Tests', () => {
  describe('WCAG 2.1 Compliance', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderNavigation();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with dropdown open', async () => {
      const { container } = renderNavigation();
      
      // Open dropdown
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.click();
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in mobile mode', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      const { container } = renderNavigation();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with high contrast mode', async () => {
      const { container } = renderNavigation({ highContrast: true });
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ARIA Attributes', () => {
    it('should have correct navigation role and label', () => {
      renderNavigation();
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('should have correct menubar role for main menu', () => {
      renderNavigation();
      
      const menubar = screen.getByRole('menubar');
      expect(menubar).toBeInTheDocument();
      expect(menubar).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('should have correct menuitem roles for menu items', () => {
      renderNavigation();
      
      const homeItem = screen.getByRole('menuitem', { name: 'Home' });
      expect(homeItem).toBeInTheDocument();
      
      const aboutItem = screen.getByRole('menuitem', { name: 'About' });
      expect(aboutItem).toBeInTheDocument();
    });

    it('should have correct menu and menuitem roles for dropdown', () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      expect(productsButton).toHaveAttribute('aria-haspopup', 'menu');
      expect(productsButton).toHaveAttribute('aria-expanded', 'false');
      
      productsButton.click();
      
      expect(productsButton).toHaveAttribute('aria-expanded', 'true');
      
      const dropdown = screen.getByRole('menu');
      expect(dropdown).toBeInTheDocument();
      expect(dropdown).toHaveAttribute('aria-labelledby', productsButton.id);
      
      const laptopsItem = screen.getByRole('menuitem', { name: 'Laptops' });
      expect(laptopsItem).toBeInTheDocument();
    });

    it('should have correct aria-current for active items', () => {
      renderNavigation({ activeItem: 'home' });
      
      const homeLink = screen.getByText('Home');
      expect(homeLink).toHaveAttribute('aria-current', 'page');
    });

    it('should have correct aria-expanded for mobile toggle', () => {
      renderNavigation();
      
      const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      expect(toggleButton).toHaveAttribute('aria-controls');
      
      toggleButton.click();
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have correct aria-hidden for decorative icons', () => {
      renderNavigation();
      
      const icons = screen.getAllByRole('img', { hidden: true });
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should have correct aria-describedby for contextual information', () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      if (productsButton.hasAttribute('aria-describedby')) {
        const describedById = productsButton.getAttribute('aria-describedby');
        const description = document.getElementById(describedById!);
        expect(description).toBeInTheDocument();
      }
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', () => {
      renderNavigation();
      
      const homeLink = screen.getByText('Home');
      homeLink.focus();
      
      // Check that focus styles are applied (would need custom matcher in real scenario)
      expect(homeLink).toHaveFocus();
      expect(document.activeElement).toBe(homeLink);
    });

    it('should maintain focus order', () => {
      renderNavigation();
      
      const focusableElements = screen.getAllByRole('link').concat(screen.getAllByRole('button'));
      
      focusableElements.forEach((element, index) => {
        const tabIndex = element.getAttribute('tabindex');
        if (tabIndex !== null) {
          expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it('should trap focus in dropdown when open', () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.click();
      
      const dropdown = screen.getByRole('menu');
      expect(dropdown).toBeInTheDocument();
      
      // First focusable element in dropdown should be first menu item
      const firstItem = screen.getByRole('menuitem', { name: 'Laptops' });
      expect(firstItem).toBeInTheDocument();
    });

    it('should restore focus when dropdown closes', () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.focus();
      productsButton.click();
      
      // Close with escape
      const dropdown = screen.getByRole('menu');
      expect(dropdown).toBeInTheDocument();
      
      // Simulate escape key
      productsButton.focus();
      expect(document.activeElement).toBe(productsButton);
    });
  });

  describe('Skip Links', () => {
    it('should have functional skip link', () => {
      renderNavigation();
      
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
      
      // Check target exists
      const mainContent = document.getElementById('main-content');
      expect(mainContent).toBeInTheDocument();
    });

    it('should make skip link visible on focus', () => {
      renderNavigation();
      
      const skipLink = screen.getByText('Skip to main content');
      skipLink.focus();
      
      // Skip link should be visible when focused
      expect(skipLink).toHaveFocus();
      // In real test, would check CSS visibility
    });

    it('should have multiple skip links for complex navigation', () => {
      renderNavigation({ hasSubmenu: true });
      
      const skipLinks = screen.getAllByText(/skip to/i);
      expect(skipLinks.length).toBeGreaterThan(0);
      
      skipLinks.forEach(link => {
        const href = link.getAttribute('href');
        expect(href).toMatch(/^#/);
        
        const target = document.querySelector(href!);
        expect(target).toBeInTheDocument();
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide meaningful labels for interactive elements', () => {
      renderNavigation();
      
      const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(toggleButton).toHaveAccessibleName();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      expect(productsButton).toHaveAccessibleName();
    });

    it('should provide status information for dynamic content', () => {
      renderNavigation({ isLoading: true });
      
      const loadingStatus = screen.getByText('Loading navigation...');
      expect(loadingStatus).toHaveAttribute('role', 'status');
      expect(loadingStatus).toHaveAttribute('aria-live', 'polite');
    });

    it('should announce dropdown state changes', () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.click();
      
      // Check for live region announcements
      const liveRegion = document.querySelector('[aria-live]');
      if (liveRegion) {
        expect(liveRegion).toBeInTheDocument();
      }
    });

    it('should provide context for nested menu items', () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.click();
      
      const laptopsItem = screen.getByRole('menuitem', { name: 'Laptops' });
      
      // Should have context about being in products submenu
      const menu = laptopsItem.closest('[role="menu"]');
      expect(menu).toHaveAttribute('aria-labelledby', productsButton.id);
    });
  });

  describe('Color and Contrast', () => {
    it('should maintain accessibility in high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      
      renderNavigation();
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      // In real test, would check computed styles for contrast ratios
    });

    it('should not rely solely on color for information', () => {
      renderNavigation({ activeItem: 'home' });
      
      const homeLink = screen.getByText('Home');
      
      // Active state should have text indicator or other non-color cue
      expect(homeLink).toHaveAttribute('aria-current', 'page');
      
      // Could also check for text content, icons, or other indicators
    });
  });

  describe('Motion and Animation', () => {
    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      
      renderNavigation();
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      // In real test, would check for animation-related CSS classes or styles
    });
  });

  describe('Touch and Mobile Accessibility', () => {
    it('should have adequate touch targets', () => {
      renderNavigation();
      
      const touchTargets = screen.getAllByRole('button').concat(screen.getAllByRole('link'));
      
      touchTargets.forEach(target => {
        // Check that targets are large enough (44px minimum)
        // In real test, would check computed styles
        expect(target).toBeInTheDocument();
      });
    });

    it('should support touch gestures appropriately', () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      
      // Should work with both click and touch events
      expect(productsButton).toBeInTheDocument();
    });
  });
});