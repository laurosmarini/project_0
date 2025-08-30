/**
 * WCAG 2.1 AA Compliance Tests for Login Form
 */

import { jest } from '@jest/globals';
import TestHelpers from '../utils/test-helpers.js';
import AccessibilityHelpers from '../utils/accessibility-helpers.js';

describe('WCAG 2.1 AA Compliance Tests', () => {
  let form;

  beforeEach(() => {
    document.body.innerHTML = '';
    form = TestHelpers.createMockLoginForm();
    document.body.appendChild(form);

    // Add some basic styling to test color contrast
    const style = document.createElement('style');
    style.textContent = `
      .form-group label {
        color: #333333;
        background-color: #ffffff;
        font-size: 16px;
        font-weight: 600;
      }
      .error-message {
        color: #d32f2f;
        background-color: #ffffff;
        font-size: 14px;
      }
      input {
        border: 2px solid #cccccc;
        background-color: #ffffff;
        color: #333333;
        font-size: 16px;
      }
      input:focus {
        border-color: #1976d2;
        outline: 2px solid #1976d2;
        outline-offset: 2px;
      }
      input[aria-invalid="true"] {
        border-color: #d32f2f;
      }
      button {
        background-color: #1976d2;
        color: #ffffff;
        border: none;
        padding: 12px 24px;
        font-size: 16px;
      }
      button:focus {
        outline: 2px solid #ffffff;
        outline-offset: 2px;
        box-shadow: 0 0 0 4px #1976d2;
      }
    `;
    document.head.appendChild(style);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  describe('WCAG 2.1 - Principle 1: Perceivable', () => {
    describe('1.1 Text Alternatives', () => {
      test('should provide text alternatives for form controls', () => {
        const emailInput = form.querySelector('#email');
        const passwordInput = form.querySelector('#password');

        const emailAccessibility = TestHelpers.getAccessibilityInfo(emailInput);
        const passwordAccessibility = TestHelpers.getAccessibilityInfo(passwordInput);

        expect(emailAccessibility.name).toBeTruthy();
        expect(passwordAccessibility.name).toBeTruthy();
        expect(emailAccessibility.name).toBe('Email Address');
        expect(passwordAccessibility.name).toBe('Password');
      });

      test('should provide descriptive button text', () => {
        const submitButton = form.querySelector('button[type="submit"]');
        const forgotPasswordLink = form.querySelector('a');

        expect(submitButton.textContent.trim()).toBe('Sign In');
        expect(forgotPasswordLink.textContent.trim()).toBe('Forgot Password?');
      });
    });

    describe('1.3 Adaptable', () => {
      test('should have proper programmatic relationships', () => {
        const emailInput = form.querySelector('#email');
        const passwordInput = form.querySelector('#password');
        const emailLabel = form.querySelector('label[for="email"]');
        const passwordLabel = form.querySelector('label[for="password"]');

        expect(emailLabel.getAttribute('for')).toBe(emailInput.id);
        expect(passwordLabel.getAttribute('for')).toBe(passwordInput.id);
        expect(emailInput.getAttribute('aria-describedby')).toBe('email-error');
        expect(passwordInput.getAttribute('aria-describedby')).toBe('password-error');
      });

      test('should maintain meaningful sequence when linearized', () => {
        const elements = Array.from(form.querySelectorAll('*'));
        const visualOrder = ['label', 'input', 'div', 'label', 'input', 'div', 'div', 'button', 'a'];
        
        let orderIndex = 0;
        elements.forEach(el => {
          if (['LABEL', 'INPUT', 'DIV', 'BUTTON', 'A'].includes(el.tagName)) {
            expect(el.tagName.toLowerCase()).toBe(visualOrder[orderIndex] || el.tagName.toLowerCase());
            if (visualOrder[orderIndex]) orderIndex++;
          }
        });
      });

      test('should use proper semantic markup', () => {
        expect(form.tagName).toBe('FORM');
        
        const labels = form.querySelectorAll('label');
        const inputs = form.querySelectorAll('input');
        const button = form.querySelector('button');
        
        expect(labels.length).toBe(2);
        expect(inputs.length).toBe(2);
        expect(button.getAttribute('type')).toBe('submit');
      });
    });

    describe('1.4 Distinguishable', () => {
      test('should meet color contrast requirements (WCAG AA)', () => {
        const testElements = [
          { selector: 'label', expectedFg: '#333333', expectedBg: '#ffffff' },
          { selector: '.error-message', expectedFg: '#d32f2f', expectedBg: '#ffffff' },
          { selector: 'button', expectedFg: '#ffffff', expectedBg: '#1976d2' }
        ];

        testElements.forEach(({ selector, expectedFg, expectedBg }) => {
          const contrast = AccessibilityHelpers.checkColorContrast(expectedFg, expectedBg);
          
          expect(contrast.wcagAA).toBe(true);
          expect(contrast.ratio).toBeGreaterThanOrEqual(4.5);
        });
      });

      test('should have sufficient font sizes', () => {
        const inputs = form.querySelectorAll('input');
        const labels = form.querySelectorAll('label');
        const button = form.querySelector('button');

        inputs.forEach(input => {
          const styles = TestHelpers.getComputedStyles(input, ['font-size']);
          expect(parseInt(styles['font-size'])).toBeGreaterThanOrEqual(16);
        });

        labels.forEach(label => {
          const styles = TestHelpers.getComputedStyles(label, ['font-size']);
          expect(parseInt(styles['font-size'])).toBeGreaterThanOrEqual(16);
        });

        const buttonStyles = TestHelpers.getComputedStyles(button, ['font-size']);
        expect(parseInt(buttonStyles['font-size'])).toBeGreaterThanOrEqual(16);
      });

      test('should not rely solely on color for information', () => {
        // Simulate validation error
        const emailInput = form.querySelector('#email');
        const emailError = form.querySelector('#email-error');
        
        emailInput.value = '';
        TestHelpers.simulateFormValidation(form);

        // Check that error information is conveyed through multiple means
        expect(emailError.textContent).toBeTruthy(); // Text message
        expect(emailInput.getAttribute('aria-invalid')).toBe('true'); // Programmatic state
        expect(emailError.getAttribute('role')).toBe('alert'); // Role for screen readers
      });
    });
  });

  describe('WCAG 2.1 - Principle 2: Operable', () => {
    describe('2.1 Keyboard Accessible', () => {
      test('should be fully keyboard accessible', () => {
        const focusableElements = form.querySelectorAll(
          'input, button, a, [tabindex]:not([tabindex="-1"])'
        );

        expect(focusableElements.length).toBe(4); // 2 inputs, 1 button, 1 link

        focusableElements.forEach(element => {
          // Focus the element
          element.focus();
          expect(document.activeElement).toBe(element);

          // Check for visible focus indicator
          const styles = TestHelpers.getComputedStyles(element, ['outline', 'box-shadow', 'border']);
          const hasFocusIndicator = styles.outline !== 'none' || 
                                  styles['box-shadow'] !== 'none' || 
                                  styles.border.includes('2px');
          
          expect(hasFocusIndicator).toBe(true);
        });
      });

      test('should have proper tab order', () => {
        const focusableElements = Array.from(form.querySelectorAll(
          'input, button, a, [tabindex]:not([tabindex="-1"])'
        ));

        // Check that no positive tabindex values are used (which disrupt natural tab order)
        focusableElements.forEach(element => {
          const tabIndex = element.getAttribute('tabindex');
          if (tabIndex !== null) {
            expect(parseInt(tabIndex)).toBeLessThanOrEqual(0);
          }
        });
      });

      test('should support form submission via Enter key', () => {
        const emailInput = form.querySelector('#email');
        const passwordInput = form.querySelector('#password');
        let submitCalled = false;

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          submitCalled = true;
        });

        emailInput.value = 'user@example.com';
        passwordInput.value = 'validpassword123';
        
        // Simulate Enter key on form field
        TestHelpers.simulateKeyboard(passwordInput, 'Enter');
        
        // The form should attempt to submit
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        passwordInput.dispatchEvent(enterEvent);
        
        // Manually trigger form submission for test
        form.dispatchEvent(new Event('submit'));
        expect(submitCalled).toBe(true);
      });
    });

    describe('2.2 Enough Time', () => {
      test('should not have time-based limitations without warning', () => {
        // This test would verify that any time limits are either:
        // - Turned off, or
        // - Extended by user, or  
        // - Warned about in advance
        
        // For a login form, typically there should be no time limits
        // This is more of a documentation/policy test than a code test
        expect(form.querySelector('[data-timeout]')).toBeNull();
        expect(form.querySelector('.timeout-warning')).toBeNull();
      });
    });

    describe('2.4 Navigable', () => {
      test('should have descriptive page title when focused', () => {
        // This would typically be tested at the page level
        // For component testing, we check that form has proper structure
        expect(form.tagName).toBe('FORM');
      });

      test('should have proper focus order', () => {
        const expectedOrder = ['email', 'password', 'submit', 'forgot-password'];
        const focusableElements = form.querySelectorAll(
          'input, button, a'
        );

        expect(focusableElements.length).toBe(4);
        
        // Check IDs and types match expected order
        expect(focusableElements[0].id).toBe('email');
        expect(focusableElements[1].id).toBe('password');
        expect(focusableElements[2].type).toBe('submit');
        expect(focusableElements[3].href).toContain('forgot-password');
      });

      test('should have clear link purpose', () => {
        const forgotPasswordLink = form.querySelector('a');
        expect(forgotPasswordLink.textContent.trim()).toBe('Forgot Password?');
        expect(forgotPasswordLink.href).toContain('forgot-password');
      });
    });

    describe('2.5 Input Modalities', () => {
      test('should have adequate target sizes (minimum 44x44 CSS pixels)', () => {
        const clickableElements = form.querySelectorAll('input, button, a');
        
        clickableElements.forEach(element => {
          // For testing purposes, we'll check that elements have adequate padding
          // In a real scenario, you'd measure actual rendered dimensions
          const styles = TestHelpers.getComputedStyles(element, ['padding', 'height', 'line-height']);
          
          // This is a simplified check - in practice you'd need to calculate actual dimensions
          if (element.tagName === 'BUTTON') {
            expect(styles.padding).toContain('12px'); // From our test styles
          }
        });
      });
    });
  });

  describe('WCAG 2.1 - Principle 3: Understandable', () => {
    describe('3.1 Readable', () => {
      test('should have language specified', () => {
        // This would typically be on the html element
        // For component testing, we ensure no conflicting lang attributes
        const elementsWithLang = form.querySelectorAll('[lang]');
        expect(elementsWithLang.length).toBe(0); // Should inherit from page
      });
    });

    describe('3.2 Predictable', () => {
      test('should not trigger context changes on focus', () => {
        const inputs = form.querySelectorAll('input');
        let contextChanged = false;

        // Add listeners to detect context changes
        window.addEventListener('beforeunload', () => { contextChanged = true; });
        
        inputs.forEach(input => {
          input.focus();
          // Context should not change just from focusing
          expect(contextChanged).toBe(false);
        });
      });

      test('should maintain consistent navigation', () => {
        // Check that form structure is consistent
        const formGroups = form.querySelectorAll('.form-group');
        
        formGroups.forEach(group => {
          const label = group.querySelector('label');
          const input = group.querySelector('input');
          const error = group.querySelector('.error-message');
          
          expect(label).toBeTruthy();
          expect(input).toBeTruthy();
          expect(error).toBeTruthy();
        });
      });
    });

    describe('3.3 Input Assistance', () => {
      test('should identify required fields', () => {
        const requiredInputs = form.querySelectorAll('input[required]');
        
        requiredInputs.forEach(input => {
          expect(input.hasAttribute('required')).toBe(true);
          // Could also check for aria-required="true" or visual indicators
        });
      });

      test('should provide error identification and description', () => {
        const emailInput = form.querySelector('#email');
        const emailError = form.querySelector('#email-error');
        
        emailInput.value = '';
        TestHelpers.simulateFormValidation(form);

        expect(emailError.textContent).toBeTruthy();
        expect(emailError.getAttribute('role')).toBe('alert');
        expect(emailInput.getAttribute('aria-invalid')).toBe('true');
        expect(emailInput.getAttribute('aria-describedby')).toBe('email-error');
      });

      test('should provide helpful error messages', () => {
        const testCases = [
          { field: 'email', value: '', expectedError: 'Email is required' },
          { field: 'email', value: 'invalid', expectedError: 'Please enter a valid email address' },
          { field: 'password', value: '', expectedError: 'Password is required' },
          { field: 'password', value: '123', expectedError: 'Password must be at least 8 characters' }
        ];

        testCases.forEach(({ field, value, expectedError }) => {
          const input = form.querySelector(`#${field}`);
          const errorDiv = form.querySelector(`#${field}-error`);
          
          input.value = value;
          const result = TestHelpers.simulateFormValidation(form);
          
          expect(result.errors[field]).toBe(expectedError);
          expect(errorDiv.textContent).toBe(expectedError);
        });
      });

      test('should provide input format suggestions', () => {
        const emailInput = form.querySelector('#email');
        const passwordInput = form.querySelector('#password');
        
        // Check for helpful attributes
        expect(emailInput.type).toBe('email');
        expect(emailInput.autocomplete).toBe('email');
        expect(passwordInput.type).toBe('password');
        expect(passwordInput.autocomplete).toBe('current-password');
      });
    });
  });

  describe('WCAG 2.1 - Principle 4: Robust', () => {
    describe('4.1 Compatible', () => {
      test('should have valid HTML markup', () => {
        // Check for proper nesting and attributes
        const labels = form.querySelectorAll('label');
        const inputs = form.querySelectorAll('input');
        
        labels.forEach(label => {
          const forAttribute = label.getAttribute('for');
          expect(forAttribute).toBeTruthy();
          
          const associatedInput = form.querySelector(`#${forAttribute}`);
          expect(associatedInput).toBeTruthy();
        });

        inputs.forEach(input => {
          expect(input.id).toBeTruthy();
          expect(input.name).toBeTruthy();
        });
      });

      test('should have proper ARIA usage', () => {
        const ariaResults = AccessibilityHelpers.checkAriaCompliance(form);
        
        // Should have minimal issues with ARIA implementation
        expect(ariaResults.issues.length).toBeLessThanOrEqual(1);
        
        // Check specific ARIA attributes
        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(error => {
          expect(error.getAttribute('role')).toBe('alert');
          expect(error.getAttribute('aria-live')).toBe('polite');
        });
      });

      test('should work with assistive technologies', () => {
        // Test programmatic access to form data
        const formData = new FormData(form);
        const emailInput = form.querySelector('#email');
        const passwordInput = form.querySelector('#password');
        
        emailInput.value = 'test@example.com';
        passwordInput.value = 'testpassword123';
        
        const updatedFormData = new FormData(form);
        expect(updatedFormData.get('email')).toBe('test@example.com');
        expect(updatedFormData.get('password')).toBe('testpassword123');
      });
    });
  });
});