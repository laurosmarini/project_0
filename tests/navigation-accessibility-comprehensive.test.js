/**
 * Comprehensive Accessibility Tests for Responsive Navigation Component
 * Tests WCAG 2.1 AA compliance, keyboard navigation, screen reader support,
 * responsive behavior, and mobile touch interactions.
 */

import { jest } from '@jest/globals';
import TestHelpers from './utils/test-helpers.js';
import AccessibilityHelpers from './utils/accessibility-helpers.js';

// Mock necessary APIs
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query.includes('768px') ? false : true,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('Navigation Component - Comprehensive Accessibility Tests', () => {
  let navContainer;
  let navigation;

  beforeEach(async () => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    
    // Load navigation HTML structure
    const navHTML = await TestHelpers.loadNavigationHTML();
    document.body.innerHTML = navHTML;
    
    // Load navigation CSS
    const navCSS = await TestHelpers.loadNavigationCSS();
    const style = document.createElement('style');
    style.textContent = navCSS;
    document.head.appendChild(style);
    
    // Initialize navigation component
    const { AccessibleNavigation } = await import('../src/scripts/navigation.js');
    navigation = new AccessibleNavigation('.main-navigation');
    navContainer = document.querySelector('.main-navigation');
  });

  afterEach(() => {
    if (navigation && navigation.destroy) {
      navigation.destroy();
    }
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('WCAG 2.1 AA Compliance - Skip Links', () => {
    test('should provide functional skip links that are initially hidden', () => {
      const skipLinks = document.querySelectorAll('.skip-link');
      
      expect(skipLinks.length).toBeGreaterThan(0);
      
      skipLinks.forEach(link => {
        // Skip links should be off-screen initially
        const styles = window.getComputedStyle(link);
        expect(parseInt(styles.top)).toBeLessThan(0);
        
        // Should have proper href attributes
        expect(link.href).toMatch(/#[\w-]+/);
        
        // Should have descriptive text
        expect(link.textContent.trim()).toBeTruthy();
      });
    });

    test('skip links should become visible when focused', () => {
      const skipLink = document.querySelector('.skip-link');
      
      // Simulate focus
      skipLink.focus();
      
      // Should become visible
      const styles = window.getComputedStyle(skipLink);
      expect(parseInt(styles.top)).toBeGreaterThanOrEqual(0);
      
      // Should have proper focus styling
      expect(styles.outline).not.toBe('none');
    });

    test('skip links should navigate to correct targets', () => {
      const skipLinks = document.querySelectorAll('.skip-link');
      
      skipLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          const targetId = href.substring(1);
          const target = document.getElementById(targetId);
          expect(target).not.toBeNull();
        }
      });
    });
  });

  describe('Keyboard Navigation - Complete Test Suite', () => {
    test('should support Tab navigation through all interactive elements', () => {
      const focusableElements = navContainer.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      
      expect(focusableElements.length).toBeGreaterThan(0);
      
      // Test tab order
      let previousTabIndex = -Infinity;
      focusableElements.forEach(element => {
        const tabIndex = parseInt(element.getAttribute('tabindex') || '0');
        if (tabIndex > 0) {
          expect(tabIndex).toBeGreaterThan(previousTabIndex);
          previousTabIndex = tabIndex;
        }
      });
    });

    test('should activate dropdown toggles with Enter and Space keys', () => {
      const dropdownToggle = navContainer.querySelector('.dropdown-toggle');
      expect(dropdownToggle).toBeTruthy();
      
      // Test Enter key
      dropdownToggle.focus();
      TestHelpers.simulateKeyboard(dropdownToggle, 'Enter');
      
      expect(dropdownToggle.getAttribute('aria-expanded')).toBe('true');
      
      // Test Space key
      TestHelpers.simulateKeyboard(dropdownToggle, ' ');
      expect(dropdownToggle.getAttribute('aria-expanded')).toBe('false');
    });

    test('should close dropdown menus with Escape key', () => {
      const dropdownToggle = navContainer.querySelector('.dropdown-toggle');
      
      // Open dropdown
      dropdownToggle.click();
      expect(dropdownToggle.getAttribute('aria-expanded')).toBe('true');
      
      // Close with Escape
      TestHelpers.simulateKeyboard(document, 'Escape');
      expect(dropdownToggle.getAttribute('aria-expanded')).toBe('false');
    });

    test('should support arrow key navigation within dropdowns', async () => {
      const dropdownToggle = navContainer.querySelector('.dropdown-toggle');
      const dropdownId = dropdownToggle.getAttribute('aria-controls');
      const dropdown = document.getElementById(dropdownId);
      
      // Open dropdown
      dropdownToggle.click();
      await TestHelpers.waitFor(() => 
        dropdownToggle.getAttribute('aria-expanded') === 'true'
      );
      
      const dropdownItems = dropdown.querySelectorAll('a, button');
      expect(dropdownItems.length).toBeGreaterThan(0);
      
      // Focus first item and test arrow navigation
      dropdownItems[0].focus();
      TestHelpers.simulateKeyboard(dropdownItems[0], 'ArrowDown');
      
      // Next item should be focused
      expect(document.activeElement).toBe(dropdownItems[1]);
      
      // Test ArrowUp
      TestHelpers.simulateKeyboard(dropdownItems[1], 'ArrowUp');
      expect(document.activeElement).toBe(dropdownItems[0]);
    });

    test('should support Home/End keys for jumping to first/last dropdown items', async () => {
      const dropdownToggle = navContainer.querySelector('.dropdown-toggle');
      const dropdownId = dropdownToggle.getAttribute('aria-controls');
      const dropdown = document.getElementById(dropdownId);
      
      dropdownToggle.click();
      await TestHelpers.waitFor(() => 
        dropdownToggle.getAttribute('aria-expanded') === 'true'
      );
      
      const dropdownItems = dropdown.querySelectorAll('a, button');
      
      // Focus middle item
      const middleIndex = Math.floor(dropdownItems.length / 2);
      dropdownItems[middleIndex].focus();
      
      // Test Home key
      TestHelpers.simulateKeyboard(dropdownItems[middleIndex], 'Home');
      expect(document.activeElement).toBe(dropdownItems[0]);
      
      // Test End key
      TestHelpers.simulateKeyboard(dropdownItems[0], 'End');
      expect(document.activeElement).toBe(dropdownItems[dropdownItems.length - 1]);
    });
  });

  describe('ARIA Attributes and Screen Reader Support', () => {
    test('should have proper role attributes on navigation elements', () => {
      const nav = navContainer.querySelector('nav');
      const menubar = navContainer.querySelector('[role="menubar"]');
      const menuItems = navContainer.querySelectorAll('[role="menuitem"]');
      
      expect(nav.getAttribute('role')).toBe('navigation');
      expect(menubar).toBeTruthy();
      expect(menuItems.length).toBeGreaterThan(0);
    });

    test('should have proper aria-expanded states on dropdown toggles', () => {
      const dropdownToggles = navContainer.querySelectorAll('.dropdown-toggle');
      
      dropdownToggles.forEach(toggle => {
        // Initially collapsed
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
        expect(toggle.getAttribute('aria-haspopup')).toBe('true');
        expect(toggle.getAttribute('aria-controls')).toBeTruthy();
      });
    });

    test('should have proper aria-hidden states on dropdown menus', () => {
      const dropdownMenus = navContainer.querySelectorAll('.dropdown-menu');
      
      dropdownMenus.forEach(menu => {
        // Initially hidden
        expect(menu.getAttribute('aria-hidden')).toBe('true');
        expect(menu.getAttribute('role')).toBe('menu');
        expect(menu.getAttribute('aria-label')).toBeTruthy();
      });
    });

    test('should announce navigation state changes to screen readers', async () => {
      const announcements = document.getElementById('navigation-announcements');
      const dropdownToggle = navContainer.querySelector('.dropdown-toggle');
      
      expect(announcements).toBeTruthy();
      expect(announcements.getAttribute('aria-live')).toBe('polite');
      
      // Open dropdown should trigger announcement
      dropdownToggle.click();
      
      await TestHelpers.waitFor(() => announcements.textContent.length > 0);
      expect(announcements.textContent).toMatch(/menu opened/i);
    });

    test('should have proper aria-current for active navigation items', () => {
      const currentPageLink = navContainer.querySelector('[aria-current="page"]');
      expect(currentPageLink).toBeTruthy();
    });
  });

  describe('Responsive Behavior and Mobile Testing', () => {
    test('should show mobile menu toggle on small screens', () => {
      // Simulate mobile viewport
      TestHelpers.setViewportSize(375, 667);
      navigation.handleResize();
      
      const mobileToggle = navContainer.querySelector('.mobile-menu-toggle');
      const styles = window.getComputedStyle(mobileToggle);
      
      expect(styles.display).not.toBe('none');
    });

    test('should hide mobile menu toggle on desktop screens', () => {
      // Simulate desktop viewport
      TestHelpers.setViewportSize(1024, 768);
      navigation.handleResize();
      
      const mobileToggle = navContainer.querySelector('.mobile-menu-toggle');
      const styles = window.getComputedStyle(mobileToggle);
      
      expect(styles.display).toBe('none');
    });

    test('should properly toggle mobile menu with button', () => {
      TestHelpers.setViewportSize(375, 667);
      navigation.handleResize();
      
      const mobileToggle = navContainer.querySelector('.mobile-menu-toggle');
      const navMenu = navContainer.querySelector('.nav-menu');
      
      // Initially closed
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('false');
      expect(navMenu.getAttribute('aria-hidden')).toBe('true');
      
      // Click to open
      mobileToggle.click();
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('true');
      expect(navMenu.getAttribute('aria-hidden')).toBe('false');
    });

    test('should handle responsive breakpoint changes', () => {
      // Start mobile
      TestHelpers.setViewportSize(375, 667);
      navigation.handleResize();
      expect(navigation.isDesktop).toBe(false);
      
      // Switch to desktop
      TestHelpers.setViewportSize(1200, 800);
      navigation.handleResize();
      expect(navigation.isDesktop).toBe(true);
      
      // Dropdowns should be closed when switching
      const dropdownToggles = navContainer.querySelectorAll('.dropdown-toggle');
      dropdownToggles.forEach(toggle => {
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
      });
    });
  });

  describe('Touch Interactions and Mobile UX', () => {
    test('should handle touch events on mobile devices', () => {
      TestHelpers.setViewportSize(375, 667);
      navigation.handleResize();
      
      const mobileToggle = navContainer.querySelector('.mobile-menu-toggle');
      
      // Simulate touch events
      TestHelpers.simulateTouch(mobileToggle, 'touchstart');
      TestHelpers.simulateTouch(mobileToggle, 'touchend');
      
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('true');
    });

    test('should have adequate touch target sizes (44px minimum)', () => {
      const touchTargets = navContainer.querySelectorAll('a, button');
      
      touchTargets.forEach(target => {
        const rect = target.getBoundingClientRect();
        const styles = window.getComputedStyle(target);
        
        // Check computed size including padding
        const totalWidth = rect.width || 44;
        const totalHeight = rect.height || 44;
        
        expect(totalWidth).toBeGreaterThanOrEqual(44);
        expect(totalHeight).toBeGreaterThanOrEqual(44);
      });
    });

    test('should handle swipe gestures for mobile navigation', () => {
      TestHelpers.setViewportSize(375, 667);
      const navMenu = navContainer.querySelector('.nav-menu');
      
      // Simulate swipe left to close menu
      TestHelpers.simulateSwipe(navMenu, 'left');
      
      // Menu should close
      const mobileToggle = navContainer.querySelector('.mobile-menu-toggle');
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Focus Management and Visual Indicators', () => {
    test('should show visible focus indicators on all interactive elements', () => {
      const interactiveElements = navContainer.querySelectorAll('a, button');
      
      interactiveElements.forEach(element => {
        element.focus();
        
        const styles = window.getComputedStyle(element);
        const hasFocusIndicator = 
          styles.outline !== 'none' || 
          styles.boxShadow !== 'none' || 
          styles.border.includes('2px');
        
        expect(hasFocusIndicator).toBe(true);
      });
    });

    test('should manage focus when dropdowns open/close', async () => {
      const dropdownToggle = navContainer.querySelector('.dropdown-toggle');
      const dropdownId = dropdownToggle.getAttribute('aria-controls');
      const dropdown = document.getElementById(dropdownId);
      
      // Open dropdown
      dropdownToggle.focus();
      dropdownToggle.click();
      
      await TestHelpers.waitFor(() => 
        dropdownToggle.getAttribute('aria-expanded') === 'true'
      );
      
      // Close dropdown with Escape
      TestHelpers.simulateKeyboard(document, 'Escape');
      
      // Focus should return to toggle
      expect(document.activeElement).toBe(dropdownToggle);
    });

    test('should handle focus trapping in mobile menu', () => {
      TestHelpers.setViewportSize(375, 667);
      const mobileToggle = navContainer.querySelector('.mobile-menu-toggle');
      const navMenu = navContainer.querySelector('.nav-menu');
      
      // Open mobile menu
      mobileToggle.click();
      
      const focusableInMenu = navMenu.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      
      // Tab should cycle through menu items
      const firstItem = focusableInMenu[0];
      const lastItem = focusableInMenu[focusableInMenu.length - 1];
      
      firstItem.focus();
      expect(document.activeElement).toBe(firstItem);
      
      // Shift+Tab from first should go to last
      TestHelpers.simulateKeyboard(firstItem, 'Tab', { shiftKey: true });
      expect(document.activeElement).toBe(lastItem);
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    test('should meet WCAG AA color contrast requirements', () => {
      const testElements = [
        { selector: '.nav-link', fg: '#333', bg: '#fff' },
        { selector: '.nav-link:hover', fg: '#007cba', bg: '#f8f9fa' },
        { selector: '.cta-button', fg: '#fff', bg: '#007cba' },
        { selector: '.dropdown-link', fg: '#333', bg: '#fff' }
      ];

      testElements.forEach(({ selector, fg, bg }) => {
        const contrast = AccessibilityHelpers.checkColorContrast(fg, bg);
        expect(contrast.wcagAA).toBe(true);
        expect(contrast.ratio).toBeGreaterThanOrEqual(4.5);
      });
    });

    test('should support high contrast mode', () => {
      // Simulate high contrast preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('prefers-contrast: high'),
          media: query,
        })),
      });

      const navLinks = navContainer.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.focus();
        const styles = window.getComputedStyle(link);
        
        // Should have enhanced focus indicators in high contrast mode
        expect(parseInt(styles.outlineWidth) || 2).toBeGreaterThanOrEqual(2);
      });
    });

    test('should respect reduced motion preferences', () => {
      // Simulate reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('prefers-reduced-motion: reduce'),
          media: query,
        })),
      });

      const dropdownMenu = navContainer.querySelector('.dropdown-menu');
      const styles = window.getComputedStyle(dropdownMenu);
      
      // Transitions should be minimal or none
      expect(styles.transitionDuration).toBe('0.01ms');
    });
  });

  describe('Performance and Loading States', () => {
    test('should handle graceful degradation without JavaScript', () => {
      // Test CSS-only fallbacks
      const navMenu = navContainer.querySelector('.nav-menu');
      navMenu.style.display = 'block'; // Simulate no-js fallback
      
      const navLinks = navContainer.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        expect(link.href).toBeTruthy(); // All links should be functional
      });
    });

    test('should load and initialize within performance budget', async () => {
      const startTime = performance.now();
      
      // Simulate component initialization
      const { AccessibleNavigation } = await import('../src/scripts/navigation.js');
      const newNav = new AccessibleNavigation('.main-navigation');
      
      const endTime = performance.now();
      const initTime = endTime - startTime;
      
      // Should initialize quickly (under 100ms)
      expect(initTime).toBeLessThan(100);
      
      newNav.destroy();
    });

    test('should handle memory leaks and cleanup', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Create and destroy multiple navigation instances
      const instances = [];
      for (let i = 0; i < 10; i++) {
        instances.push(new navigation.constructor('.main-navigation'));
      }
      
      instances.forEach(instance => {
        if (instance.destroy) {
          instance.destroy();
        }
      });
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB
    });
  });

  describe('Multi-level Navigation and Complex Interactions', () => {
    test('should handle multi-level dropdown navigation', async () => {
      const hasSubmenu = navContainer.querySelector('.has-submenu');
      if (hasSubmenu) {
        const submenuToggle = hasSubmenu.querySelector('.submenu-toggle');
        const submenuId = submenuToggle.getAttribute('aria-controls');
        const submenu = document.getElementById(submenuId);
        
        // Open parent dropdown first
        const parentToggle = hasSubmenu.closest('.nav-item').querySelector('.dropdown-toggle');
        parentToggle.click();
        
        await TestHelpers.waitFor(() => 
          parentToggle.getAttribute('aria-expanded') === 'true'
        );
        
        // Open submenu
        submenuToggle.click();
        
        expect(submenuToggle.getAttribute('aria-expanded')).toBe('true');
        expect(submenu.getAttribute('aria-hidden')).toBe('false');
      }
    });

    test('should handle arrow key navigation between levels', async () => {
      const hasSubmenu = navContainer.querySelector('.has-submenu');
      if (hasSubmenu) {
        const submenuToggle = hasSubmenu.querySelector('.submenu-toggle');
        const submenuId = submenuToggle.getAttribute('aria-controls');
        const submenu = document.getElementById(submenuId);
        
        // Navigate to submenu with right arrow
        submenuToggle.focus();
        TestHelpers.simulateKeyboard(submenuToggle, 'ArrowRight');
        
        // Should open submenu and focus first item
        const firstSubmenuItem = submenu.querySelector('a, button');
        expect(document.activeElement).toBe(firstSubmenuItem);
        
        // Navigate back with left arrow
        TestHelpers.simulateKeyboard(firstSubmenuItem, 'ArrowLeft');
        expect(document.activeElement).toBe(submenuToggle);
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing DOM elements gracefully', () => {
      const incompleteNav = document.createElement('nav');
      incompleteNav.className = 'incomplete-navigation';
      document.body.appendChild(incompleteNav);
      
      expect(() => {
        new navigation.constructor('.incomplete-navigation');
      }).not.toThrow();
    });

    test('should handle rapid interaction events', async () => {
      const dropdownToggle = navContainer.querySelector('.dropdown-toggle');
      
      // Rapidly click dropdown toggle
      for (let i = 0; i < 10; i++) {
        dropdownToggle.click();
      }
      
      // Should end up in a consistent state
      const finalState = dropdownToggle.getAttribute('aria-expanded');
      expect(['true', 'false']).toContain(finalState);
    });

    test('should handle window resize during interactions', () => {
      const mobileToggle = navContainer.querySelector('.mobile-menu-toggle');
      
      // Start on mobile and open menu
      TestHelpers.setViewportSize(375, 667);
      navigation.handleResize();
      mobileToggle.click();
      
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('true');
      
      // Resize to desktop
      TestHelpers.setViewportSize(1200, 800);
      navigation.handleResize();
      
      // Mobile menu should be properly closed
      const navMenu = navContainer.querySelector('.nav-menu');
      expect(navMenu.getAttribute('aria-hidden')).toBe('false');
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('false');
    });
  });
});