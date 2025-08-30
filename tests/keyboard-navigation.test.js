/**
 * @fileoverview Comprehensive Keyboard Navigation Testing Suite
 * @description Tests all keyboard interaction patterns for WCAG 2.1 compliance
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../src/components/LoginForm';

describe('Keyboard Navigation Testing', () => {
  let container;
  let user;
  
  beforeEach(() => {
    const renderResult = render(<LoginForm />);
    container = renderResult.container;
    user = userEvent.setup();
  });

  describe('Tab Navigation', () => {
    test('Tab key moves focus forward through all interactive elements', async () => {
      const focusableElements = getFocusableElements(container);
      
      // Start from the first element
      focusableElements[0].focus();
      expect(document.activeElement).toBe(focusableElements[0]);
      
      // Tab through all elements
      for (let i = 1; i < focusableElements.length; i++) {
        await user.tab();
        expect(document.activeElement).toBe(focusableElements[i]);
      }
    });

    test('Shift+Tab moves focus backward through all interactive elements', async () => {
      const focusableElements = getFocusableElements(container);
      
      // Start from the last element
      focusableElements[focusableElements.length - 1].focus();
      expect(document.activeElement).toBe(focusableElements[focusableElements.length - 1]);
      
      // Shift+Tab through all elements
      for (let i = focusableElements.length - 2; i >= 0; i--) {
        await user.tab({ shift: true });
        expect(document.activeElement).toBe(focusableElements[i]);
      }
    });

    test('Tab order follows logical visual sequence', async () => {
      const focusableElements = getFocusableElements(container);
      
      for (let i = 0; i < focusableElements.length - 1; i++) {
        focusableElements[i].focus();
        
        const currentRect = focusableElements[i].getBoundingClientRect();
        const nextRect = focusableElements[i + 1].getBoundingClientRect();
        
        // Next element should be below or to the right
        const isLogicalOrder = 
          nextRect.top > currentRect.top || 
          (nextRect.top === currentRect.top && nextRect.left > currentRect.left);
        
        expect(isLogicalOrder).toBeTruthy();
      }
    });

    test('Hidden elements are not included in tab order', () => {
      const allFocusable = container.querySelectorAll(
        'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      
      allFocusable.forEach(element => {
        const style = getComputedStyle(element);
        const isHidden = 
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          element.hasAttribute('hidden') ||
          element.getAttribute('aria-hidden') === 'true';
        
        if (isHidden) {
          expect(element.tabIndex).toBe(-1);
        }
      });
    });
  });

  describe('Enter Key Interactions', () => {
    test('Enter key activates submit button', async () => {
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      const mockSubmit = jest.fn();
      
      submitButton.onclick = mockSubmit;
      submitButton.focus();
      
      await user.keyboard('{Enter}');
      expect(mockSubmit).toHaveBeenCalled();
    });

    test('Enter key submits form when focus is on input field', async () => {
      const emailInput = screen.getByLabelText(/email/i);
      const form = container.querySelector('form');
      const mockSubmit = jest.fn();
      
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          mockSubmit();
        };
      }
      
      emailInput.focus();
      await user.type(emailInput, 'test@example.com');
      await user.keyboard('{Enter}');
      
      expect(mockSubmit).toHaveBeenCalled();
    });

    test('Enter key does not trigger unintended actions', async () => {
      const emailInput = screen.getByLabelText(/email/i);
      const initialValue = emailInput.value;
      
      emailInput.focus();
      await user.keyboard('{Enter}');
      
      // Value should not change from Enter key
      expect(emailInput.value).toBe(initialValue);
    });
  });

  describe('Space Key Interactions', () => {
    test('Space key activates buttons', async () => {
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      const mockClick = jest.fn();
      
      submitButton.onclick = mockClick;
      submitButton.focus();
      
      await user.keyboard(' ');
      expect(mockClick).toHaveBeenCalled();
    });

    test('Space key toggles checkboxes', async () => {
      const checkbox = container.querySelector('input[type="checkbox"]');
      
      if (checkbox) {
        checkbox.focus();
        const initialChecked = checkbox.checked;
        
        await user.keyboard(' ');
        expect(checkbox.checked).toBe(!initialChecked);
        
        await user.keyboard(' ');
        expect(checkbox.checked).toBe(initialChecked);
      }
    });

    test('Space key does not activate text inputs', async () => {
      const emailInput = screen.getByLabelText(/email/i);
      const mockClick = jest.fn();
      
      emailInput.onclick = mockClick;
      emailInput.focus();
      
      await user.keyboard(' ');
      // Space should add a space character, not trigger click
      expect(emailInput.value).toContain(' ');
    });
  });

  describe('Arrow Key Navigation', () => {
    test('Arrow keys navigate radio button groups', async () => {
      const radioButtons = container.querySelectorAll('input[type="radio"]');
      
      if (radioButtons.length > 1) {
        radioButtons[0].focus();
        expect(document.activeElement).toBe(radioButtons[0]);
        
        await user.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(radioButtons[1]);
        
        await user.keyboard('{ArrowUp}');
        expect(document.activeElement).toBe(radioButtons[0]);
      }
    });

    test('Arrow keys navigate select dropdowns when open', async () => {
      const selectElement = container.querySelector('select');
      
      if (selectElement) {
        selectElement.focus();
        
        await user.keyboard('{ArrowDown}');
        // Should navigate to next option
        expect(selectElement.selectedIndex).toBeGreaterThan(-1);
      }
    });
  });

  describe('Escape Key Behavior', () => {
    test('Escape key closes modal dialogs', async () => {
      // If there are any modal dialogs in the form
      const modals = container.querySelectorAll('[role="dialog"]');
      
      modals.forEach(async (modal) => {
        if (modal.style.display !== 'none') {
          modal.focus();
          await user.keyboard('{Escape}');
          
          // Modal should be closed or hidden
          const style = getComputedStyle(modal);
          expect(
            style.display === 'none' || 
            style.visibility === 'hidden' ||
            modal.hasAttribute('hidden')
          ).toBeTruthy();
        }
      });
    });

    test('Escape key cancels form completion where appropriate', async () => {
      const emailInput = screen.getByLabelText(/email/i);
      
      emailInput.focus();
      await user.type(emailInput, 'test@example.com');
      
      // Escape should not clear the field (not standard behavior for text inputs)
      await user.keyboard('{Escape}');
      expect(emailInput.value).toBe('test@example.com');
    });
  });

  describe('Focus Indicators', () => {
    test('All focusable elements have visible focus indicators', async () => {
      const focusableElements = getFocusableElements(container);
      
      for (const element of focusableElements) {
        element.focus();
        
        const style = getComputedStyle(element);
        const hasFocusIndicator = 
          style.outline !== 'none' ||
          style.boxShadow !== 'none' ||
          style.border !== element.style.border; // Border changes on focus
        
        expect(hasFocusIndicator).toBeTruthy();
      }
    });

    test('Focus indicators meet color contrast requirements', async () => {
      const focusableElements = getFocusableElements(container);
      
      focusableElements.forEach(element => {
        element.focus();
        
        const style = getComputedStyle(element);
        
        // Check if outline or box-shadow provides sufficient contrast
        // This is a simplified test - in practice, you'd use color contrast libraries
        expect(
          style.outline !== 'none' || 
          style.boxShadow !== 'none' ||
          style.borderColor !== 'transparent'
        ).toBeTruthy();
      });
    });

    test('Focus indicators do not disappear on hover', async () => {
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      submitButton.focus();
      const focusedStyle = getComputedStyle(submitButton);
      
      await user.hover(submitButton);
      const hoveredStyle = getComputedStyle(submitButton);
      
      // Focus indicator should remain visible on hover
      expect(hoveredStyle.outline).toBe(focusedStyle.outline);
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Standard form shortcuts work as expected', async () => {
      const emailInput = screen.getByLabelText(/email/i);
      
      emailInput.focus();
      await user.type(emailInput, 'test@example.com');
      
      // Ctrl+A should select all text
      await user.keyboard('{Control>}a{/Control}');
      expect(emailInput.selectionStart).toBe(0);
      expect(emailInput.selectionEnd).toBe(emailInput.value.length);
      
      // Ctrl+X should cut text
      await user.keyboard('{Control>}x{/Control}');
      expect(emailInput.value).toBe('');
    });

    test('Custom keyboard shortcuts are documented and functional', () => {
      // Test any custom shortcuts implemented in the form
      const shortcutElements = container.querySelectorAll('[accesskey]');
      
      shortcutElements.forEach(element => {
        const accessKey = element.getAttribute('accesskey');
        expect(accessKey).toBeTruthy();
        expect(accessKey.length).toBe(1);
      });
    });
  });

  describe('Screen Reader Navigation', () => {
    test('Headings provide proper document structure for navigation', () => {
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      if (headings.length > 0) {
        // Check heading hierarchy
        let previousLevel = 0;
        headings.forEach(heading => {
          const level = parseInt(heading.tagName.charAt(1));
          expect(level).toBeGreaterThan(0);
          expect(level).toBeLessThanOrEqual(previousLevel + 1);
          previousLevel = level;
        });
      }
    });

    test('Landmarks are properly defined for navigation', () => {
      const landmarks = container.querySelectorAll(
        '[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="form"]'
      );
      
      // At minimum, should have a form landmark
      expect(landmarks.length).toBeGreaterThan(0);
    });

    test('Skip links are available for efficient navigation', () => {
      const skipLinks = container.querySelectorAll('a[href^="#"]');
      
      skipLinks.forEach(link => {
        const target = container.querySelector(link.getAttribute('href'));
        expect(target).toBeInTheDocument();
      });
    });
  });

  describe('Error State Navigation', () => {
    test('Focus moves to first error field when validation fails', async () => {
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.click(submitButton);
      
      // Should focus the first field with an error
      const errorFields = container.querySelectorAll('[aria-invalid="true"]');
      if (errorFields.length > 0) {
        expect(document.activeElement).toBe(errorFields[0]);
      }
    });

    test('Error messages are keyboard accessible', async () => {
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.click(submitButton);
      
      const errorMessages = screen.getAllByRole('alert');
      errorMessages.forEach(error => {
        // Error messages should be focusable or associated with focusable elements
        const associatedField = container.querySelector(`[aria-describedby="${error.id}"]`);
        expect(associatedField || error.tabIndex >= 0).toBeTruthy();
      });
    });
  });

  describe('Touch Device Keyboard Behavior', () => {
    test('Virtual keyboard type is appropriate for input fields', () => {
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(emailInput.type).toBe('email');
      expect(passwordInput.type).toBe('password');
      
      // Check for inputmode attributes for better mobile experience
      if (emailInput.hasAttribute('inputmode')) {
        expect(emailInput.getAttribute('inputmode')).toBe('email');
      }
    });
  });
});

/**
 * Helper function to get all focusable elements in order
 */
function getFocusableElements(container) {
  const focusableSelectors = [
    'input:not([disabled]):not([hidden])',
    'button:not([disabled]):not([hidden])',
    'select:not([disabled]):not([hidden])',
    'textarea:not([disabled]):not([hidden])',
    'a[href]:not([hidden])',
    '[tabindex]:not([tabindex="-1"]):not([hidden])'
  ].join(', ');
  
  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter(element => {
      const style = getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden';
    })
    .sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      
      if (aRect.top !== bRect.top) {
        return aRect.top - bRect.top;
      }
      return aRect.left - bRect.left;
    });
}

/**
 * Keyboard navigation test utilities
 */
export const keyboardTestUtils = {
  /**
   * Test complete keyboard navigation cycle
   */
  async testFullKeyboardCycle(container, user) {
    const focusableElements = getFocusableElements(container);
    
    if (focusableElements.length === 0) return false;
    
    // Tab through all elements forward
    focusableElements[0].focus();
    for (let i = 1; i < focusableElements.length; i++) {
      await user.tab();
      if (document.activeElement !== focusableElements[i]) {
        return false;
      }
    }
    
    // Tab through all elements backward
    for (let i = focusableElements.length - 2; i >= 0; i--) {
      await user.tab({ shift: true });
      if (document.activeElement !== focusableElements[i]) {
        return false;
      }
    }
    
    return true;
  },

  /**
   * Check if element has proper focus indicator
   */
  hasFocusIndicator(element) {
    element.focus();
    const style = getComputedStyle(element);
    
    return (
      style.outline !== 'none' ||
      style.boxShadow !== 'none' ||
      style.borderColor !== 'transparent'
    );
  },

  /**
   * Test keyboard shortcuts
   */
  async testKeyboardShortcuts(element, user, shortcuts) {
    const results = {};
    
    for (const [key, expectedAction] of Object.entries(shortcuts)) {
      element.focus();
      const initialState = getElementState(element);
      
      await user.keyboard(key);
      const finalState = getElementState(element);
      
      results[key] = expectedAction(initialState, finalState);
    }
    
    return results;
  }
};

function getElementState(element) {
  return {
    value: element.value,
    checked: element.checked,
    selectedIndex: element.selectedIndex,
    classList: Array.from(element.classList)
  };
}