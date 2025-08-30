import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Navigation } from '../../src/components/Navigation';
import { NavigationProvider } from '../../src/contexts/NavigationContext';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

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

describe('Navigation Component - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render navigation with all menu items', () => {
      renderNavigation();
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('should render skip link', () => {
      renderNavigation();
      
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should render mobile menu toggle button', () => {
      renderNavigation();
      
      const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Dropdown Functionality', () => {
    it('should show dropdown on hover for desktop', async () => {
      renderNavigation();
      
      const productsItem = screen.getByText('Products');
      fireEvent.mouseEnter(productsItem);
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
        expect(screen.getByText('Phones')).toBeVisible();
        expect(screen.getByText('Tablets')).toBeVisible();
      });
    });

    it('should hide dropdown on mouse leave', async () => {
      renderNavigation();
      
      const productsItem = screen.getByText('Products');
      fireEvent.mouseEnter(productsItem);
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      fireEvent.mouseLeave(productsItem);
      
      await waitFor(() => {
        expect(screen.queryByText('Laptops')).not.toBeVisible();
      });
    });

    it('should toggle dropdown on click for touch devices', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      fireEvent.click(productsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      fireEvent.click(productsButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Laptops')).not.toBeVisible();
      });
    });

    it('should close dropdown when clicking outside', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      fireEvent.click(productsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      fireEvent.click(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText('Laptops')).not.toBeVisible();
      });
    });

    it('should close dropdown when pressing Escape', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      fireEvent.click(productsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('Laptops')).not.toBeVisible();
      });
    });

    it('should handle multiple dropdowns correctly', async () => {
      renderNavigation();
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      const servicesButton = screen.getByRole('button', { name: /services/i });
      
      // Open products dropdown
      fireEvent.click(productsButton);
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeVisible();
      });
      
      // Open services dropdown - should close products
      fireEvent.click(servicesButton);
      await waitFor(() => {
        expect(screen.queryByText('Laptops')).not.toBeVisible();
        expect(screen.getByText('Support')).toBeVisible();
      });
    });
  });

  describe('State Management', () => {
    it('should manage active menu item state', async () => {
      renderNavigation({ activeItem: 'home' });
      
      const homeLink = screen.getByText('Home');
      expect(homeLink.closest('li')).toHaveClass('active');
    });

    it('should manage mobile menu open/close state', async () => {
      renderNavigation();
      
      const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
      const nav = screen.getByRole('navigation');
      
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      expect(nav).not.toHaveClass('mobile-open');
      
      fireEvent.click(toggleButton);
      
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      expect(nav).toHaveClass('mobile-open');
    });

    it('should handle loading state', () => {
      renderNavigation({ isLoading: true });
      
      expect(screen.getByText('Loading navigation...')).toBeInTheDocument();
    });

    it('should handle error state', () => {
      const errorMessage = 'Failed to load navigation';
      renderNavigation({ error: errorMessage });
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Event Handlers', () => {
    it('should call onItemClick when menu item is clicked', async () => {
      const onItemClick = jest.fn();
      renderNavigation({ onItemClick });
      
      const homeLink = screen.getByText('Home');
      fireEvent.click(homeLink);
      
      expect(onItemClick).toHaveBeenCalledWith('home', '/');
    });

    it('should call onDropdownToggle when dropdown is toggled', async () => {
      const onDropdownToggle = jest.fn();
      renderNavigation({ onDropdownToggle });
      
      const productsButton = screen.getByRole('button', { name: /products/i });
      fireEvent.click(productsButton);
      
      expect(onDropdownToggle).toHaveBeenCalledWith('products', true);
    });

    it('should call onMobileToggle when mobile menu is toggled', async () => {
      const onMobileToggle = jest.fn();
      renderNavigation({ onMobileToggle });
      
      const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
      fireEvent.click(toggleButton);
      
      expect(onMobileToggle).toHaveBeenCalledWith(true);
    });
  });

  describe('Props Validation', () => {
    it('should handle empty items array', () => {
      renderNavigation({ items: [] });
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('should handle custom className', () => {
      renderNavigation({ className: 'custom-nav' });
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('custom-nav');
    });

    it('should handle custom aria-label', () => {
      const customLabel = 'Custom navigation menu';
      renderNavigation({ 'aria-label': customLabel });
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', customLabel);
    });
  });
});