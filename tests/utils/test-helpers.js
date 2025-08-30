/**
 * Common testing utilities and helpers
 */

export class TestHelpers {
  /**
   * Create a mock login form for testing
   */
  static createMockLoginForm() {
    const form = document.createElement('form');
    form.innerHTML = `
      <div class="form-group">
        <label for="email">Email Address</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          required 
          aria-describedby="email-error"
          autocomplete="email"
        />
        <div id="email-error" class="error-message" role="alert" aria-live="polite"></div>
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          required 
          aria-describedby="password-error"
          autocomplete="current-password"
        />
        <div id="password-error" class="error-message" role="alert" aria-live="polite"></div>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn-primary">Sign In</button>
        <a href="/forgot-password" class="link-secondary">Forgot Password?</a>
      </div>
    `;
    
    return form;
  }

  /**
   * Simulate form validation
   */
  static simulateFormValidation(form) {
    const emailInput = form.querySelector('#email');
    const passwordInput = form.querySelector('#password');
    const emailError = form.querySelector('#email-error');
    const passwordError = form.querySelector('#password-error');

    // Email validation
    if (!emailInput.value) {
      emailError.textContent = 'Email is required';
      emailInput.setAttribute('aria-invalid', 'true');
    } else if (!this.isValidEmail(emailInput.value)) {
      emailError.textContent = 'Please enter a valid email address';
      emailInput.setAttribute('aria-invalid', 'true');
    } else {
      emailError.textContent = '';
      emailInput.setAttribute('aria-invalid', 'false');
    }

    // Password validation
    if (!passwordInput.value) {
      passwordError.textContent = 'Password is required';
      passwordInput.setAttribute('aria-invalid', 'true');
    } else if (passwordInput.value.length < 8) {
      passwordError.textContent = 'Password must be at least 8 characters';
      passwordInput.setAttribute('aria-invalid', 'true');
    } else {
      passwordError.textContent = '';
      passwordInput.setAttribute('aria-invalid', 'false');
    }

    return {
      isValid: !emailError.textContent && !passwordError.textContent,
      errors: {
        email: emailError.textContent,
        password: passwordError.textContent
      }
    };
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Wait for element to be visible
   */
  static async waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Get computed styles for an element
   */
  static getComputedStyles(element, properties) {
    const computedStyle = window.getComputedStyle(element);
    const styles = {};
    
    properties.forEach(prop => {
      styles[prop] = computedStyle.getPropertyValue(prop);
    });
    
    return styles;
  }

  /**
   * Simulate keyboard events
   */
  static simulateKeyboard(element, key, options = {}) {
    const event = new KeyboardEvent('keydown', {
      key,
      code: key,
      ctrlKey: options.ctrlKey || false,
      shiftKey: options.shiftKey || false,
      altKey: options.altKey || false,
      metaKey: options.metaKey || false,
      bubbles: true,
      cancelable: true
    });
    
    element.dispatchEvent(event);
  }

  /**
   * Create performance marker
   */
  static markPerformance(name) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  }

  /**
   * Measure performance between marks
   */
  static measurePerformance(name, startMark, endMark) {
    if (typeof performance !== 'undefined' && performance.measure) {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      return measure.duration;
    }
    return 0;
  }

  /**
   * Check if element is visible
   */
  static isElementVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  /**
   * Get element's accessibility tree information
   */
  static getAccessibilityInfo(element) {
    return {
      role: element.getAttribute('role') || element.tagName.toLowerCase(),
      name: this.getAccessibleName(element),
      description: element.getAttribute('aria-describedby'),
      required: element.hasAttribute('required') || element.getAttribute('aria-required') === 'true',
      invalid: element.getAttribute('aria-invalid') === 'true',
      disabled: element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true'
    };
  }

  /**
   * Calculate accessible name for an element
   */
  static getAccessibleName(element) {
    // Check aria-label first
    if (element.getAttribute('aria-label')) {
      return element.getAttribute('aria-label');
    }

    // Check aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) {
        return labelElement.textContent.trim();
      }
    }

    // Check associated label
    const label = element.closest('label') || document.querySelector(`label[for="${element.id}"]`);
    if (label) {
      return label.textContent.trim();
    }

    // Fallback to placeholder or title
    return element.getAttribute('placeholder') || element.getAttribute('title') || '';
  }
}

export default TestHelpers;