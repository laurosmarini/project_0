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
    <NavigationProvider>
      <Navigation items={mockNavigationItems} {...props} />
    </NavigationProvider>
  );
};

describe('Navigation Component - Keyboard Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
  });

  describe('Tab Navigation', () => {
    it('should navigate through all focusable elements with Tab', async () => {
      renderNavigation();
      
      // Start with skip link
      await user.tab();
      expect(screen.getByText('Skip to main content')).toHaveFocus();
      
      // Navigate to first menu item
      await user.tab();
      expect(screen.getByText('Home')).toHaveFocus();
      
      // Navigate to dropdown button
      await user.tab();
      expect(screen.getByRole('button', { name: /products/i })).toHaveFocus();
      
      // Navigate to next dropdown button
      await user.tab();
      expect(screen.getByRole('button', { name: /services/i })).toHaveFocus();
      
      // Navigate to final menu item
      await user.tab();
      expect(screen.getByText('About')).toHaveFocus();
    });

    it('should navigate backwards with Shift+Tab', async () => {
      renderNavigation();
      
      // Start at the end
      const aboutLink = screen.getByText('About');
      aboutLink.focus();
      expect(aboutLink).toHaveFocus();
      
      // Navigate backwards
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(screen.getByRole('button', { name: /services/i })).toHaveFocus();
      
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(screen.getByRole('button', { name: /products/i })).toHaveFocus();
      
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(screen.getByText('Home')).toHaveFocus();
    });

    it('should skip invisible elements when tabbing', async () => {
      renderNavigation();
      
      // Navigate to products dropdown
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.focus();
      
      // Dropdown should be closed, so tab should skip to services
      await user.tab();
      expect(screen.getByRole('button', { name: /services/i })).toHaveFocus();
    });
  });

  describe('Arrow Key Navigation', () => {
    it('should navigate horizontally with arrow keys', async () => {
      renderNavigation();
      
      const homeLink = screen.getByText('Home');
      homeLink.focus();
      
      // Right arrow to products
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', { name: /products/i })).toHaveFocus();
      
      // Right arrow to services
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', { name: /services/i })).toHaveFocus();
      
      // Right arrow to about
      await user.keyboard('{ArrowRight}');
      expect(screen.getByText('About')).toHaveFocus();
      
      // Right arrow should wrap to home
      await user.keyboard('{ArrowRight}');
      expect(screen.getByText('Home')).toHaveFocus();
    });

    it('should navigate backwards with left arrow keys', async () => {
      renderNavigation();
      
      const homeLink = screen.getByText('Home');
      homeLink.focus();
      
      // Left arrow should wrap to about
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByText('About')).toHaveFocus();
      
      // Left arrow to services
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('button', { name: /services/i })).toHaveFocus();
      
      // Left arrow to products
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('button', { name: /products/i })).toHaveFocus();
      
      // Left arrow to home
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByText('Home')).toHaveFocus();
    });

    it('should navigate vertically in dropdown with arrow keys', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.focus();
      
      // Open dropdown with Enter
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      // Down arrow should focus first dropdown item
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Laptops')).toHaveFocus();
      
      // Down arrow to next item
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Phones')).toHaveFocus();
      
      // Down arrow to last item
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Tablets')).toHaveFocus();
      
      // Down arrow should wrap to first item
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Laptops')).toHaveFocus();
    });

    it('should navigate up in dropdown with up arrow keys', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.focus();
      
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      // Focus first item
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Laptops')).toHaveFocus();
      
      // Up arrow should wrap to last item
      await user.keyboard('{ArrowUp}');
      expect(screen.getByText('Tablets')).toHaveFocus();
      
      // Up arrow to previous item
      await user.keyboard('{ArrowUp}');
      expect(screen.getByText('Phones')).toHaveFocus();
    });
  });

  describe('Enter and Space Key Navigation', () => {
    it('should activate links with Enter key', async () => {
      const onItemClick = jest.fn();
      renderNavigation({ onItemClick });
      
      const homeLink = screen.getByText('Home');
      homeLink.focus();
      
      await user.keyboard('{Enter}');
      expect(onItemClick).toHaveBeenCalledWith('home', '/');
    });

    it('should activate links with Space key', async () => {
      const onItemClick = jest.fn();
      renderNavigation({ onItemClick });
      
      const homeLink = screen.getByText('Home');
      homeLink.focus();
      
      await user.keyboard(' ');
      expect(onItemClick).toHaveBeenCalledWith('home', '/');
    });

    it('should open dropdown with Enter key', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.focus();
      
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
    });

    it('should open dropdown with Space key', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.focus();
      
      await user.keyboard(' ');
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
    });

    it('should activate dropdown items with Enter', async () => {
      const onItemClick = jest.fn();
      renderNavigation({ onItemClick });
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.focus();
      
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Laptops')).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(onItemClick).toHaveBeenCalledWith('laptops', '/products/laptops');
    });
  });

  describe('Escape Key Navigation', () => {
    it('should close dropdown with Escape key', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.focus();
      
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByText('Laptops')).not.toBeVisible();
      });
      
      // Focus should return to dropdown trigger
      expect(productsButton).toHaveFocus();
    });

    it('should close mobile menu with Escape key', async () => {
      renderNavigation();
      
      const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
      
      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      
      await user.keyboard('{Escape}');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Home and End Key Navigation', () => {
    it('should navigate to first item with Home key', async () => {
      renderNavigation();
      
      const aboutLink = screen.getByText('About');
      aboutLink.focus();
      
      await user.keyboard('{Home}');
      expect(screen.getByText('Home')).toHaveFocus();
    });

    it('should navigate to last item with End key', async () => {
      renderNavigation();
      
      const homeLink = screen.getByText('Home');
      homeLink.focus();
      
      await user.keyboard('{End}');
      expect(screen.getByText('About')).toHaveFocus();
    });

    it('should navigate to first dropdown item with Home key', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.focus();
      
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      // Navigate to last item
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Tablets')).toHaveFocus();
      
      // Home should go to first dropdown item
      await user.keyboard('{Home}');
      expect(screen.getByText('Laptops')).toHaveFocus();
    });

    it('should navigate to last dropdown item with End key', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.focus();
      
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Laptops')).toHaveFocus();
      
      await user.keyboard('{End}');
      expect(screen.getByText('Tablets')).toHaveFocus();
    });
  });

  describe('Focus Management', () => {
    it('should maintain focus within dropdown when open', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.focus();
      
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      // Tab should stay within dropdown
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Laptops')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByText('Phones')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByText('Tablets')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByText('Laptops')).toHaveFocus(); // Should wrap
    });

    it('should restore focus to trigger when dropdown closes', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      productsButton.focus();
      
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Laptops')).toHaveFocus();
      
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByText('Laptops')).not.toBeVisible();
        expect(productsButton).toHaveFocus();
      });
    });
  });
});