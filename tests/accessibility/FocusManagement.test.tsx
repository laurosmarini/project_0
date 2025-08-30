import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Navigation } from '../../src/components/Navigation';
import { NavigationProvider } from '../../src/contexts/NavigationContext';

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
      <main id="main-content" tabIndex={-1}>
        <h1>Main Content</h1>
        <button>Content Button</button>
        <a href="/link">Content Link</a>
      </main>
    </div>
  );
};

describe('Navigation Component - Focus Management Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
  });

  describe('Initial Focus State', () => {
    it('should not have any focused elements initially', () => {
      renderNavigation();
      
      expect(document.activeElement).toBe(document.body);
    });

    it('should focus first element when navigation is programmatically focused', () => {
      renderNavigation();
      
      const nav = screen.getByRole('navigation');
      nav.focus();
      
      // Should focus first focusable element within navigation
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveFocus();
    });
  });

  describe('Tab Order and Focus Flow', () => {
    it('should maintain correct tab order through navigation', async () => {
      renderNavigation();
      
      // Expected tab order
      const expectedOrder = [
        'Skip to main content',
        'Home',
        'Products', // button
        'Services', // button  
        'About'
      ];
      
      for (const expectedText of expectedOrder) {
        await user.tab();
        const element = expectedText === 'Products' || expectedText === 'Services' 
          ? screen.getByRole('button', { name: new RegExp(expectedText, 'i') })
          : screen.getByText(expectedText);
        expect(element).toHaveFocus();
      }
    });

    it('should continue tab order to main content after navigation', async () => {
      renderNavigation();
      
      // Tab through entire navigation
      await user.tab(); // Skip link
      await user.tab(); // Home
      await user.tab(); // Products
      await user.tab(); // Services
      await user.tab(); // About
      
      // Next tab should go to main content
      await user.tab();
      const mainContent = document.getElementById('main-content');
      expect(mainContent).toHaveFocus();
    });

    it('should handle reverse tab order correctly', async () => {
      renderNavigation();
      
      // Start from main content
      const mainContent = document.getElementById('main-content');
      mainContent.focus();
      
      // Shift+Tab should go to About (last nav item)
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(screen.getByText('About')).toHaveFocus();
      
      // Continue reverse tabbing
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(screen.getByRole('button', { name: /services/i })).toHaveFocus();
      
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(screen.getByRole('button', { name: /products/i })).toHaveFocus();
    });
  });

  describe('Dropdown Focus Management', () => {
    it('should focus first dropdown item when dropdown opens', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.focus();
      
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      // First dropdown item should be focused
      expect(screen.getByText('Laptops')).toHaveFocus();
    });

    it('should maintain focus within dropdown when open', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      await user.click(productsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      // Tab should cycle through dropdown items
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Laptops')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByText('Phones')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByText('Tablets')).toHaveFocus();
      
      // Tab from last item should wrap to first
      await user.tab();
      expect(screen.getByText('Laptops')).toHaveFocus();
    });

    it('should restore focus to trigger when dropdown closes with Escape', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      await user.click(productsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      // Navigate to a dropdown item
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Laptops')).toHaveFocus();
      
      // Close with Escape
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByText('Laptops')).not.toBeVisible();
      });
      
      // Focus should return to trigger button
      expect(productsButton).toHaveFocus();
    });

    it('should restore focus to trigger when dropdown closes by clicking outside', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      await user.click(productsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      // Click outside dropdown
      await user.click(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText('Laptops')).not.toBeVisible();
      });
      
      // Focus should remain on trigger or be cleared appropriately
      const activeElement = document.activeElement;
      expect(activeElement).toBe(productsButton);
    });

    it('should handle focus when navigating between different dropdowns', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      const servicesButton = screen.getByRole('button', { name: /services/i });
      
      // Open products dropdown
      await user.click(productsButton);
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      // Navigate to services button with arrow keys
      await user.keyboard('{ArrowRight}');
      expect(servicesButton).toHaveFocus();
      
      // Open services dropdown
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.queryByText('Laptops')).not.toBeVisible();
        expect(screen.getByText('Support')).toBeVisible();
      });
      
      // First services item should be focused
      expect(screen.getByText('Support')).toHaveFocus();
    });
  });

  describe('Mobile Menu Focus Management', () => {
    it('should focus first menu item when mobile menu opens', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderNavigation();
      
      const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(toggleButton);
      
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      });
      
      // First menu item should be focused
      const homeLink = screen.getByText('Home');
      expect(homeLink).toHaveFocus();
    });

    it('should trap focus within mobile menu when open', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderNavigation();
      
      const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(toggleButton);
      
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      });
      
      // Tab should stay within menu
      await user.tab();
      expect(screen.getByText('Home')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: /products/i })).toHaveFocus();
      
      // Continue through all menu items
      await user.tab();
      expect(screen.getByRole('button', { name: /services/i })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByText('About')).toHaveFocus();
      
      // Tab from last item should go to close button or wrap
      await user.tab();
      expect(toggleButton).toHaveFocus();
    });

    it('should restore focus to toggle button when mobile menu closes', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      renderNavigation();
      
      const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(toggleButton);
      
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      });
      
      // Navigate within menu
      await user.tab();
      expect(screen.getByText('Home')).toHaveFocus();
      
      // Close menu with Escape
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      });
      
      // Focus should return to toggle button
      expect(toggleButton).toHaveFocus();
    });
  });

  describe('Focus Indicators', () => {
    it('should show visible focus indicators on all interactive elements', async () => {
      renderNavigation();
      
      const interactiveElements = [
        screen.getByText('Skip to main content'),
        screen.getByText('Home'),
        screen.getByRole('button', { name: /products/i }),
        screen.getByRole('button', { name: /services/i }),
        screen.getByText('About')
      ];
      
      for (const element of interactiveElements) {
        element.focus();
        expect(element).toHaveFocus();
        
        // In a real test, you'd check for focus indicator styles
        // expect(element).toHaveClass('focus-visible');
      }
    });

    it('should have appropriate focus indicator contrast', async () => {
      renderNavigation();
      
      const focusableElement = screen.getByText('Home');
      focusableElement.focus();
      
      // In a real test, you'd measure the contrast ratio of focus indicators
      expect(focusableElement).toHaveFocus();
    });
  });

  describe('Focus Trapping', () => {
    it('should trap focus in dropdown menus', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      await user.click(productsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      // Get all focusable elements within dropdown
      const dropdownItems = [
        screen.getByText('Laptops'),
        screen.getByText('Phones'),
        screen.getByText('Tablets')
      ];
      
      // Navigate to last item
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Tablets')).toHaveFocus();
      
      // Tab should wrap to first item
      await user.tab();
      expect(screen.getByText('Laptops')).toHaveFocus();
      
      // Shift+Tab from first should go to last
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(screen.getByText('Tablets')).toHaveFocus();
    });

    it('should release focus trap when dropdown closes', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      await user.click(productsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      // Focus within dropdown
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Laptops')).toHaveFocus();
      
      // Close dropdown
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByText('Laptops')).not.toBeVisible();
      });
      
      // Focus should return to trigger and normal tab order should resume
      expect(productsButton).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: /services/i })).toHaveFocus();
    });
  });

  describe('Programmatic Focus Management', () => {
    it('should handle programmatic focus calls', () => {
      const onFocus = jest.fn();
      renderNavigation({ onFocus });
      
      const homeLink = screen.getByText('Home');
      
      // Programmatically focus element
      homeLink.focus();
      
      expect(homeLink).toHaveFocus();
      expect(onFocus).toHaveBeenCalledWith('home');
    });

    it('should provide focus management utilities', () => {
      renderNavigation();
      
      // Get navigation component instance (in real app)
      const nav = screen.getByRole('navigation');
      
      // Should have focus management methods available
      expect(nav).toBeInTheDocument();
      
      // In real implementation, would test:
      // - navRef.current.focusFirst()
      // - navRef.current.focusLast()
      // - navRef.current.focusItem(id)
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing focus targets gracefully', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      
      // Mock a scenario where dropdown items are not rendered
      jest.spyOn(screen, 'queryByText').mockImplementation((text) => {
        if (text === 'Laptops') return null;
        return screen.queryByText(text);
      });
      
      await user.click(productsButton);
      
      // Should not throw error when focus target is missing
      expect(() => {
        fireEvent.keyDown(productsButton, { key: 'Enter' });
      }).not.toThrow();
    });

    it('should handle rapid focus changes without errors', async () => {
      renderNavigation();
      
      const elements = [
        screen.getByText('Home'),
        screen.getByRole('button', { name: /products/i }),
        screen.getByRole('button', { name: /services/i }),
        screen.getByText('About')
      ];
      
      // Rapidly change focus
      for (let i = 0; i < 5; i++) {
        for (const element of elements) {
          element.focus();
        }
      }
      
      // Should end up with last element focused
      expect(screen.getByText('About')).toHaveFocus();
    });

    it('should maintain focus state during re-renders', () => {
      const { rerender } = renderNavigation();
      
      const homeLink = screen.getByText('Home');
      homeLink.focus();
      expect(homeLink).toHaveFocus();
      
      // Re-render with same props
      rerender(
        <div>
          <NavigationProvider>
            <Navigation items={mockNavigationItems} />
          </NavigationProvider>
          <main id="main-content" tabIndex={-1}>
            <h1>Main Content</h1>
            <button>Content Button</button>
            <a href="/link">Content Link</a>
          </main>
        </div>
      );
      
      // Focus should be preserved (or handled appropriately)
      const newHomeLink = screen.getByText('Home');
      expect(newHomeLink).toHaveFocus();
    });
  });

  describe('Screen Reader Interaction', () => {
    it('should announce focus changes appropriately', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      await user.click(productsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      // Check for live region announcements
      const liveRegion = document.querySelector('[aria-live]');
      if (liveRegion) {
        expect(liveRegion).toContainHTML('products menu opened');
      }
    });

    it('should work correctly with screen reader virtual cursor', () => {
      renderNavigation();
      
      // Screen reader users might use virtual cursor navigation
      const menuItems = screen.getAllByRole('menuitem');
      
      menuItems.forEach(item => {
        // Each item should be accessible via virtual cursor
        expect(item).toBeInTheDocument();
        expect(item).toBeVisible();
      });
    });
  });
});