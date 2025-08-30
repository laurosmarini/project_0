/**
 * Unit tests for login form validation functionality
 */

import { jest } from '@jest/globals';
import TestHelpers from '../utils/test-helpers.js';

describe('Login Form Validation', () => {
  let form, emailInput, passwordInput, emailError, passwordError;

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = '';
    form = TestHelpers.createMockLoginForm();
    document.body.appendChild(form);

    emailInput = form.querySelector('#email');
    passwordInput = form.querySelector('#password');
    emailError = form.querySelector('#email-error');
    passwordError = form.querySelector('#password-error');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Email Validation', () => {
    test('should validate required email field', () => {
      emailInput.value = '';
      const result = TestHelpers.simulateFormValidation(form);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Email is required');
      expect(emailInput.getAttribute('aria-invalid')).toBe('true');
    });

    test('should validate email format', () => {
      const invalidEmails = [
        'invalid-email',
        'invalid@',
        '@invalid.com',
        'invalid@invalid',
        'invalid.email@',
        'invalid email@test.com'
      ];

      invalidEmails.forEach(email => {
        emailInput.value = email;
        const result = TestHelpers.simulateFormValidation(form);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.email).toBe('Please enter a valid email address');
        expect(emailInput.getAttribute('aria-invalid')).toBe('true');
      });
    });

    test('should accept valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@example-site.org'
      ];

      validEmails.forEach(email => {
        emailInput.value = email;
        passwordInput.value = 'validpassword123';
        const result = TestHelpers.simulateFormValidation(form);
        
        expect(result.errors.email).toBe('');
        expect(emailInput.getAttribute('aria-invalid')).toBe('false');
      });
    });

    test('should have proper accessibility attributes', () => {
      expect(emailInput.getAttribute('type')).toBe('email');
      expect(emailInput.getAttribute('required')).toBe('');
      expect(emailInput.getAttribute('aria-describedby')).toBe('email-error');
      expect(emailInput.getAttribute('autocomplete')).toBe('email');
    });
  });

  describe('Password Validation', () => {
    test('should validate required password field', () => {
      passwordInput.value = '';
      const result = TestHelpers.simulateFormValidation(form);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Password is required');
      expect(passwordInput.getAttribute('aria-invalid')).toBe('true');
    });

    test('should validate minimum password length', () => {
      const shortPasswords = ['1', '12', '1234567']; // Less than 8 characters

      shortPasswords.forEach(password => {
        passwordInput.value = password;
        const result = TestHelpers.simulateFormValidation(form);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.password).toBe('Password must be at least 8 characters');
        expect(passwordInput.getAttribute('aria-invalid')).toBe('true');
      });
    });

    test('should accept valid passwords', () => {
      const validPasswords = [
        'password123',
        'MySecurePassword!',
        'alongpasswordwithnospecialchars'
      ];

      validPasswords.forEach(password => {
        emailInput.value = 'user@example.com';
        passwordInput.value = password;
        const result = TestHelpers.simulateFormValidation(form);
        
        expect(result.errors.password).toBe('');
        expect(passwordInput.getAttribute('aria-invalid')).toBe('false');
      });
    });

    test('should have proper accessibility attributes', () => {
      expect(passwordInput.getAttribute('type')).toBe('password');
      expect(passwordInput.getAttribute('required')).toBe('');
      expect(passwordInput.getAttribute('aria-describedby')).toBe('password-error');
      expect(passwordInput.getAttribute('autocomplete')).toBe('current-password');
    });
  });

  describe('Error Messages', () => {
    test('should have proper ARIA attributes for error messages', () => {
      expect(emailError.getAttribute('role')).toBe('alert');
      expect(emailError.getAttribute('aria-live')).toBe('polite');
      expect(passwordError.getAttribute('role')).toBe('alert');
      expect(passwordError.getAttribute('aria-live')).toBe('polite');
    });

    test('should clear errors when validation passes', () => {
      // Set invalid state
      emailInput.value = '';
      passwordInput.value = '';
      TestHelpers.simulateFormValidation(form);
      
      expect(emailError.textContent).toBe('Email is required');
      expect(passwordError.textContent).toBe('Password is required');

      // Set valid state
      emailInput.value = 'user@example.com';
      passwordInput.value = 'validpassword123';
      const result = TestHelpers.simulateFormValidation(form);

      expect(result.isValid).toBe(true);
      expect(emailError.textContent).toBe('');
      expect(passwordError.textContent).toBe('');
      expect(emailInput.getAttribute('aria-invalid')).toBe('false');
      expect(passwordInput.getAttribute('aria-invalid')).toBe('false');
    });
  });

  describe('Form Submission', () => {
    test('should prevent submission with invalid data', () => {
      const submitButton = form.querySelector('button[type="submit"]');
      let submitPrevented = false;

      form.addEventListener('submit', (e) => {
        const result = TestHelpers.simulateFormValidation(form);
        if (!result.isValid) {
          e.preventDefault();
          submitPrevented = true;
        }
      });

      emailInput.value = 'invalid-email';
      passwordInput.value = '123';

      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);

      expect(submitPrevented).toBe(true);
    });

    test('should allow submission with valid data', () => {
      let submitPrevented = false;

      form.addEventListener('submit', (e) => {
        const result = TestHelpers.simulateFormValidation(form);
        if (!result.isValid) {
          e.preventDefault();
          submitPrevented = true;
        }
      });

      emailInput.value = 'user@example.com';
      passwordInput.value = 'validpassword123';

      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);

      expect(submitPrevented).toBe(false);
    });
  });

  describe('Accessibility Compliance', () => {
    test('should have proper labels associated with inputs', () => {
      const emailLabel = form.querySelector('label[for="email"]');
      const passwordLabel = form.querySelector('label[for="password"]');

      expect(emailLabel).toBeTruthy();
      expect(passwordLabel).toBeTruthy();
      expect(emailLabel.textContent.trim()).toBe('Email Address');
      expect(passwordLabel.textContent.trim()).toBe('Password');
    });

    test('should have proper form structure', () => {
      expect(form.tagName).toBe('FORM');
      expect(form.querySelectorAll('.form-group')).toHaveLength(2);
      expect(form.querySelector('.form-actions')).toBeTruthy();
    });

    test('should have proper button accessibility', () => {
      const submitButton = form.querySelector('button[type="submit"]');
      const forgotPasswordLink = form.querySelector('a[href="/forgot-password"]');

      expect(submitButton.textContent.trim()).toBe('Sign In');
      expect(submitButton.getAttribute('type')).toBe('submit');
      expect(forgotPasswordLink.textContent.trim()).toBe('Forgot Password?');
    });
  });

  describe('Input Field Properties', () => {
    test('should have proper input types and attributes', () => {
      expect(emailInput.id).toBe('email');
      expect(emailInput.name).toBe('email');
      expect(passwordInput.id).toBe('password');
      expect(passwordInput.name).toBe('password');
    });

    test('should support keyboard navigation', () => {
      const focusableElements = form.querySelectorAll(
        'input, button, a, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);
      
      // Test tab order
      focusableElements.forEach((element, index) => {
        const tabIndex = element.getAttribute('tabindex');
        if (tabIndex) {
          expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });
});