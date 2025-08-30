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
  }
];

const renderNavigationWithContent = (props = {}) => {
  return render(
    <div>
      <NavigationProvider>
        <Navigation items={mockNavigationItems} {...props} />
      </NavigationProvider>
      <main id="main-content" tabIndex={-1}>
        <h1>Main Content</h1>
        <p>This is the main content area.</p>
      </main>
      <aside id="sidebar" tabIndex={-1}>
        <h2>Sidebar</h2>
        <p>Additional content.</p>
      </aside>
      <footer id="footer" tabIndex={-1}>
        <p>Footer content</p>
      </footer>
    </div>
  );
};

describe('Navigation Component - Skip Links Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
  });

  describe('Basic Skip Link Functionality', () => {
    it('should render skip to main content link', () => {
      renderNavigationWithContent();
      
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should be the first focusable element', async () => {
      renderNavigationWithContent();
      
      await user.tab();
      
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveFocus();
    });

    it('should navigate to main content when activated', async () => {
      renderNavigationWithContent();
      
      const skipLink = screen.getByText('Skip to main content');
      const mainContent = document.getElementById('main-content');
      
      await user.click(skipLink);
      
      expect(mainContent).toHaveFocus();
    });

    it('should navigate to main content with Enter key', async () => {
      renderNavigationWithContent();
      
      const skipLink = screen.getByText('Skip to main content');
      const mainContent = document.getElementById('main-content');
      
      skipLink.focus();
      await user.keyboard('{Enter}');
      
      expect(mainContent).toHaveFocus();
    });

    it('should navigate to main content with Space key', async () => {
      renderNavigationWithContent();
      
      const skipLink = screen.getByText('Skip to main content');
      const mainContent = document.getElementById('main-content');
      
      skipLink.focus();
      await user.keyboard(' ');
      
      expect(mainContent).toHaveFocus();
    });
  });

  describe('Skip Link Visibility', () => {
    it('should be visually hidden by default', () => {
      renderNavigationWithContent();
      
      const skipLink = screen.getByText('Skip to main content');
      
      // Check for screen reader only class or styles
      expect(skipLink).toHaveClass('sr-only');
    });

    it('should become visible when focused', async () => {
      renderNavigationWithContent();
      
      const skipLink = screen.getByText('Skip to main content');
      
      await user.tab();
      expect(skipLink).toHaveFocus();
      
      // Should have visible class when focused
      expect(skipLink).toHaveClass('skip-link-visible');
    });

    it('should hide again when focus leaves', async () => {
      renderNavigationWithContent();
      
      const skipLink = screen.getByText('Skip to main content');
      
      await user.tab(); // Focus skip link
      expect(skipLink).toHaveFocus();
      expect(skipLink).toHaveClass('skip-link-visible');
      
      await user.tab(); // Move to next element
      expect(skipLink).not.toHaveFocus();
      expect(skipLink).toHaveClass('sr-only');
    });
  });

  describe('Multiple Skip Links', () => {
    it('should render multiple skip links when configured', () => {
      renderNavigationWithContent({ 
        skipLinks: [
          { href: '#main-content', label: 'Skip to main content' },
          { href: '#sidebar', label: 'Skip to sidebar' },
          { href: '#footer', label: 'Skip to footer' }
        ]
      });
      
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
      expect(screen.getByText('Skip to sidebar')).toBeInTheDocument();
      expect(screen.getByText('Skip to footer')).toBeInTheDocument();
    });

    it('should navigate through multiple skip links with Tab', async () => {
      renderNavigationWithContent({ 
        skipLinks: [
          { href: '#main-content', label: 'Skip to main content' },
          { href: '#sidebar', label: 'Skip to sidebar' }
        ]
      });
      
      await user.tab();
      expect(screen.getByText('Skip to main content')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByText('Skip to sidebar')).toHaveFocus();
      
      await user.tab();
      // Should move to first navigation item
      expect(screen.getByText('Home')).toHaveFocus();
    });

    it('should navigate to correct targets for each skip link', async () => {
      renderNavigationWithContent({ 
        skipLinks: [
          { href: '#main-content', label: 'Skip to main content' },
          { href: '#sidebar', label: 'Skip to sidebar' },
          { href: '#footer', label: 'Skip to footer' }
        ]
      });
      
      const mainSkip = screen.getByText('Skip to main content');
      const sidebarSkip = screen.getByText('Skip to sidebar');
      const footerSkip = screen.getByText('Skip to footer');
      
      const mainContent = document.getElementById('main-content');
      const sidebar = document.getElementById('sidebar');
      const footer = document.getElementById('footer');
      
      await user.click(mainSkip);
      expect(mainContent).toHaveFocus();
      
      await user.click(sidebarSkip);
      expect(sidebar).toHaveFocus();
      
      await user.click(footerSkip);
      expect(footer).toHaveFocus();
    });
  });

  describe('Skip Link Container', () => {
    it('should render skip links in a dedicated container', () => {
      renderNavigationWithContent();
      
      const skipLink = screen.getByText('Skip to main content');
      const container = skipLink.closest('[role="banner"], .skip-links');
      
      expect(container).toBeInTheDocument();
    });

    it('should have proper ARIA attributes on container', () => {
      renderNavigationWithContent();
      
      const skipLink = screen.getByText('Skip to main content');
      const container = skipLink.closest('.skip-links');
      
      if (container) {
        expect(container).toHaveAttribute('role', 'banner');
        expect(container).toHaveAttribute('aria-label', 'Skip links');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing target elements gracefully', async () => {
      render(
        <NavigationProvider>
          <Navigation 
            items={mockNavigationItems}
            skipLinks={[
              { href: '#nonexistent', label: 'Skip to nonexistent' }
            ]}
          />
        </NavigationProvider>
      );
      
      const skipLink = screen.getByText('Skip to nonexistent');
      
      // Should not throw error when target doesn't exist
      expect(() => {
        fireEvent.click(skipLink);
      }).not.toThrow();
    });

    it('should log warning for missing target elements', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      render(
        <NavigationProvider>
          <Navigation 
            items={mockNavigationItems}
            skipLinks={[
              { href: '#nonexistent', label: 'Skip to nonexistent' }
            ]}
          />
        </NavigationProvider>
      );
      
      const skipLink = screen.getByText('Skip to nonexistent');
      fireEvent.click(skipLink);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Skip link target not found: #nonexistent'
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle invalid href formats gracefully', () => {
      render(
        <NavigationProvider>
          <Navigation 
            items={mockNavigationItems}
            skipLinks={[
              { href: 'invalid-href', label: 'Invalid skip link' }
            ]}
          />
        </NavigationProvider>
      );
      
      const skipLink = screen.getByText('Invalid skip link');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', 'invalid-href');
    });
  });

  describe('Focus Management', () => {
    it('should set tabindex on target elements if not present', async () => {
      render(
        <div>
          <NavigationProvider>
            <Navigation items={mockNavigationItems} />
          </NavigationProvider>
          <main id="main-content">
            <h1>Main Content</h1>
          </main>
        </div>
      );
      
      const skipLink = screen.getByText('Skip to main content');
      const mainContent = document.getElementById('main-content');
      
      // Initially should not have tabindex
      expect(mainContent).not.toHaveAttribute('tabindex');
      
      await user.click(skipLink);
      
      // Should have tabindex set to make it focusable
      expect(mainContent).toHaveAttribute('tabindex', '-1');
      expect(mainContent).toHaveFocus();
    });

    it('should restore focus properly when skip link is used', async () => {
      renderNavigationWithContent();
      
      const skipLink = screen.getByText('Skip to main content');
      const mainContent = document.getElementById('main-content');
      
      // Focus skip link and activate
      await user.tab();
      expect(skipLink).toHaveFocus();
      
      await user.keyboard('{Enter}');
      
      // Main content should be focused
      expect(mainContent).toHaveFocus();
      
      // Tab should move to next focusable element within main content
      await user.tab();
      const nextFocusable = document.activeElement;
      expect(nextFocusable).not.toBe(skipLink);
      expect(nextFocusable).not.toBe(screen.getByText('Home'));
    });

    it('should handle programmatic focus correctly', () => {
      renderNavigationWithContent();
      
      const skipLink = screen.getByText('Skip to main content');
      const mainContent = document.getElementById('main-content');
      
      // Programmatically trigger skip link
      fireEvent.click(skipLink);
      
      expect(mainContent).toHaveFocus();
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should announce skip link purpose to screen readers', () => {
      renderNavigationWithContent();
      
      const skipLink = screen.getByText('Skip to main content');
      
      // Should have descriptive text
      expect(skipLink).toHaveTextContent('Skip to main content');
      
      // Could also have aria-describedby for additional context
      const describedBy = skipLink.getAttribute('aria-describedby');
      if (describedBy) {
        const description = document.getElementById(describedBy);
        expect(description).toBeInTheDocument();
      }
    });

    it('should provide context about destination', () => {
      renderNavigationWithContent({ 
        skipLinks: [
          { 
            href: '#main-content', 
            label: 'Skip to main content',
            description: 'Jump to the main content area'
          }
        ]
      });
      
      const skipLink = screen.getByText('Skip to main content');
      const describedBy = skipLink.getAttribute('aria-describedby');
      
      if (describedBy) {
        const description = document.getElementById(describedBy);
        expect(description).toHaveTextContent('Jump to the main content area');
      }
    });

    it('should announce destination when activated', async () => {
      renderNavigationWithContent();
      
      const skipLink = screen.getByText('Skip to main content');
      const mainContent = document.getElementById('main-content');
      
      await user.click(skipLink);
      
      // Check for live region announcement
      const announcement = document.querySelector('[aria-live="assertive"]');
      if (announcement) {
        expect(announcement).toHaveTextContent(/main content/i);
      }
      
      expect(mainContent).toHaveFocus();
    });
  });

  describe('Keyboard Navigation Integration', () => {
    it('should not interfere with normal tab order when not activated', async () => {
      renderNavigationWithContent();
      
      await user.tab(); // Skip link
      expect(screen.getByText('Skip to main content')).toHaveFocus();
      
      await user.tab(); // First nav item
      expect(screen.getByText('Home')).toHaveFocus();
      
      await user.tab(); // Second nav item
      expect(screen.getByRole('button', { name: /products/i })).toHaveFocus();
    });

    it('should bypass navigation when skip link is used', async () => {
      renderNavigationWithContent();
      
      const skipLink = screen.getByText('Skip to main content');
      const mainContent = document.getElementById('main-content');
      
      await user.tab();
      expect(skipLink).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mainContent).toHaveFocus();
      
      // Next tab should not go back to navigation
      await user.tab();
      const currentFocus = document.activeElement;
      expect(currentFocus).not.toBe(screen.getByText('Home'));
    });
  });
});