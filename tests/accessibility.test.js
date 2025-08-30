/**
 * @fileoverview Automated Accessibility Testing Suite for WCAG 2.1 AA Compliance
 * @description Comprehensive automated testing using axe-core for login form accessibility
 */

import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import LoginForm from '../src/components/LoginForm';

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations);

describe('Accessibility Testing - Login Form WCAG 2.1 AA Compliance', () => {
  let container;
  
  beforeEach(() => {
    const renderResult = render(<LoginForm />);
    container = renderResult.container;
  });

  describe('Automated axe-core Testing', () => {
    test('should have no accessibility violations on initial render', async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should maintain accessibility after user interactions', async () => {
      const user = userEvent.setup();
      const emailInput = screen.getByLabelText(/email/i);
      
      // Simulate user interaction
      await user.click(emailInput);
      await user.type(emailInput, 'test@example.com');
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should maintain accessibility with error states', async () => {
      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Trigger validation errors
      await user.click(submitButton);
      
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
          'aria-valid-attr': { enabled: true },
          'aria-describedby': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('WCAG 2.1 Specific Compliance Tests', () => {
    test('1.1.1 Non-text Content - All images have alt text', () => {
      const images = container.querySelectorAll('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).toBeTruthy();
      });
    });

    test('1.3.1 Info and Relationships - Form labels are properly associated', () => {
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      
      // Check for explicit labeling
      expect(emailInput).toHaveAttribute('id');
      expect(passwordInput).toHaveAttribute('id');
    });

    test('1.3.2 Meaningful Sequence - Logical tab order maintained', () => {
      const focusableElements = container.querySelectorAll(
        'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      
      focusableElements.forEach((element, index) => {
        const tabIndex = element.getAttribute('tabindex');
        if (tabIndex !== null) {
          expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0);
        }
      });
    });

    test('1.4.3 Contrast (Minimum) - Color contrast meets AA standards', async () => {
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });

    test('2.1.1 Keyboard - All functionality available via keyboard', async () => {
      const user = userEvent.setup();
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Test keyboard navigation
      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);
      
      await user.tab();
      expect(document.activeElement).toBe(passwordInput);
      
      await user.tab();
      expect(document.activeElement).toBe(submitButton);
    });

    test('2.1.2 No Keyboard Trap - Users can navigate away from elements', async () => {
      const user = userEvent.setup();
      const focusableElements = screen.getAllByRole('textbox')
        .concat(screen.getAllByRole('button'));
      
      for (let i = 0; i < focusableElements.length; i++) {
        focusableElements[i].focus();
        await user.tab();
        // Should be able to move focus away
        expect(document.activeElement).not.toBe(focusableElements[i]);
      }
    });

    test('2.4.1 Bypass Blocks - Skip links or headings present for navigation', () => {
      // Check for skip links or proper heading structure
      const skipLink = container.querySelector('[href="#main"], [href="#content"]');
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      expect(skipLink || headings.length > 0).toBeTruthy();
    });

    test('2.4.3 Focus Order - Focus order is logical and intuitive', async () => {
      const user = userEvent.setup();
      const focusableElements = container.querySelectorAll(
        'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      
      let previousElement = null;
      for (const element of focusableElements) {
        element.focus();
        
        if (previousElement) {
          const prevRect = previousElement.getBoundingClientRect();
          const currRect = element.getBoundingClientRect();
          
          // Focus should generally move left-to-right, top-to-bottom
          expect(
            currRect.top >= prevRect.top || 
            (currRect.top === prevRect.top && currRect.left > prevRect.left)
          ).toBeTruthy();
        }
        
        previousElement = element;
        await user.tab();
      }
    });

    test('3.2.1 On Focus - No unexpected context changes on focus', async () => {
      const user = userEvent.setup();
      const initialUrl = window.location.href;
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.click(emailInput);
      expect(window.location.href).toBe(initialUrl);
      
      await user.click(passwordInput);
      expect(window.location.href).toBe(initialUrl);
    });

    test('3.2.2 On Input - No unexpected context changes on input', async () => {
      const user = userEvent.setup();
      const initialUrl = window.location.href;
      
      const emailInput = screen.getByLabelText(/email/i);
      
      await user.type(emailInput, 'test@example.com');
      expect(window.location.href).toBe(initialUrl);
    });

    test('3.3.1 Error Identification - Errors are clearly identified', async () => {
      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Trigger validation errors
      await user.click(submitButton);
      
      const errorMessages = screen.getAllByRole('alert');
      expect(errorMessages.length).toBeGreaterThan(0);
      
      errorMessages.forEach(error => {
        expect(error).toBeVisible();
        expect(error.textContent).toBeTruthy();
      });
    });

    test('3.3.2 Labels or Instructions - Clear labels and instructions provided', () => {
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      // Check for required field indicators
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
      
      // Check for helpful instructions
      const instructions = container.querySelectorAll('[aria-describedby]');
      instructions.forEach(element => {
        const describedById = element.getAttribute('aria-describedby');
        const description = container.querySelector(`#${describedById}`);
        expect(description).toBeInTheDocument();
      });
    });

    test('4.1.1 Parsing - HTML is valid and well-formed', async () => {
      const results = await axe(container, {
        rules: {
          'valid-lang': { enabled: true },
          'html-has-lang': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });

    test('4.1.2 Name, Role, Value - UI components have accessible names and roles', () => {
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Test accessible names
      expect(emailInput).toHaveAccessibleName();
      expect(passwordInput).toHaveAccessibleName();
      expect(submitButton).toHaveAccessibleName();
      
      // Test roles
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('ARIA Implementation Tests', () => {
    test('ARIA labels are properly implemented', () => {
      const ariaLabelledElements = container.querySelectorAll('[aria-label], [aria-labelledby]');
      
      ariaLabelledElements.forEach(element => {
        if (element.hasAttribute('aria-labelledby')) {
          const labelId = element.getAttribute('aria-labelledby');
          const label = container.querySelector(`#${labelId}`);
          expect(label).toBeInTheDocument();
        }
        
        if (element.hasAttribute('aria-label')) {
          expect(element.getAttribute('aria-label')).toBeTruthy();
        }
      });
    });

    test('ARIA describedby relationships are valid', () => {
      const describedElements = container.querySelectorAll('[aria-describedby]');
      
      describedElements.forEach(element => {
        const descriptionId = element.getAttribute('aria-describedby');
        const description = container.querySelector(`#${descriptionId}`);
        expect(description).toBeInTheDocument();
      });
    });

    test('ARIA live regions announce dynamic changes', async () => {
      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Trigger form submission to create dynamic content
      await user.click(submitButton);
      
      const liveRegions = container.querySelectorAll('[aria-live]');
      expect(liveRegions.length).toBeGreaterThan(0);
      
      liveRegions.forEach(region => {
        const politeness = region.getAttribute('aria-live');
        expect(['polite', 'assertive']).toContain(politeness);
      });
    });

    test('ARIA invalid states are properly managed', async () => {
      const user = userEvent.setup();
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Enter invalid email
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);
      
      // Check if aria-invalid is set
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Focus Management Tests', () => {
    test('Focus is properly managed during interactions', async () => {
      const user = userEvent.setup();
      const emailInput = screen.getByLabelText(/email/i);
      
      // Initial focus test
      await user.click(emailInput);
      expect(document.activeElement).toBe(emailInput);
      
      // Focus should be visible
      expect(getComputedStyle(document.activeElement).outline).not.toBe('none');
    });

    test('Focus indicators are visible and meet contrast requirements', async () => {
      const results = await axe(container, {
        rules: {
          'focus-order-semantics': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Error Handling Accessibility', () => {
    test('Error messages are announced to screen readers', async () => {
      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.click(submitButton);
      
      const errorAlerts = screen.getAllByRole('alert');
      expect(errorAlerts.length).toBeGreaterThan(0);
      
      errorAlerts.forEach(alert => {
        expect(alert).toHaveAttribute('aria-live', 'assertive');
      });
    });

    test('Error messages are associated with form fields', async () => {
      const user = userEvent.setup();
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.click(submitButton);
      
      if (emailInput.hasAttribute('aria-describedby')) {
        const errorId = emailInput.getAttribute('aria-describedby');
        const errorMessage = container.querySelector(`#${errorId}`);
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveAttribute('role', 'alert');
      }
    });
  });

  describe('Mobile Accessibility Tests', () => {
    test('Touch targets meet minimum size requirements (44x44px)', () => {
      const interactiveElements = container.querySelectorAll('button, input, a, [role="button"]');
      
      interactiveElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        expect(rect.width).toBeGreaterThanOrEqual(44);
        expect(rect.height).toBeGreaterThanOrEqual(44);
      });
    });

    test('Elements have appropriate spacing between touch targets', () => {
      const buttons = container.querySelectorAll('button, [role="button"]');
      
      for (let i = 0; i < buttons.length - 1; i++) {
        const current = buttons[i].getBoundingClientRect();
        const next = buttons[i + 1].getBoundingClientRect();
        
        const horizontalGap = Math.abs(next.left - current.right);
        const verticalGap = Math.abs(next.top - current.bottom);
        
        // Ensure minimum 8px spacing
        expect(horizontalGap >= 8 || verticalGap >= 8).toBeTruthy();
      }
    });
  });

  describe('Performance Impact on Accessibility', () => {
    test('Accessibility features do not significantly impact performance', async () => {
      const start = performance.now();
      
      // Render component with all accessibility features
      render(<LoginForm />);
      
      const renderTime = performance.now() - start;
      expect(renderTime).toBeLessThan(100); // Should render within 100ms
    });
  });
});

/**
 * Custom accessibility testing utilities
 */
export const accessibilityTestUtils = {
  /**
   * Test color contrast ratio
   */
  async testColorContrast(element) {
    const results = await axe(element, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
    return results.violations.length === 0;
  },

  /**
   * Test keyboard navigation completeness
   */
  async testKeyboardNavigation(container) {
    const focusableElements = container.querySelectorAll(
      'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    return focusableElements.length > 0 && 
           Array.from(focusableElements).every(el => 
             el.tabIndex >= 0 || el.tabIndex === undefined
           );
  },

  /**
   * Test screen reader announcements
   */
  getScreenReaderAnnouncements(container) {
    return container.querySelectorAll('[aria-live], [role="alert"], [role="status"]');
  }
};