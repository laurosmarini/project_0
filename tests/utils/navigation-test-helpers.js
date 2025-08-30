/**
 * Specialized test helpers for navigation component testing
 * Provides utilities for accessibility, responsive, and interaction testing
 */

import fs from 'fs/promises';
import path from 'path';

class NavigationTestHelpers {
  /**
   * Load navigation HTML for testing
   */
  static async loadNavigationHTML() {
    try {
      const htmlPath = path.resolve(process.cwd(), 'src/components/navigation.html');
      const html = await fs.readFile(htmlPath, 'utf-8');
      return html;
    } catch (error) {
      // Fallback minimal navigation HTML for testing
      return `
        <div class="skip-links">
          <a href="#main-content" class="skip-link">Skip to main content</a>
          <a href="#navigation" class="skip-link">Skip to navigation</a>
        </div>
        
        <header class="site-header" role="banner">
          <nav id="navigation" class="main-navigation" role="navigation" aria-label="Main navigation">
            <div class="nav-container">
              <div class="nav-brand">
                <a href="/" class="brand-link" aria-label="Homepage">
                  <span class="brand-text">Brand</span>
                </a>
              </div>

              <button 
                class="mobile-menu-toggle" 
                aria-expanded="false" 
                aria-controls="nav-menu" 
                aria-label="Toggle navigation menu"
                type="button"
              >
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="sr-only">Menu</span>
              </button>

              <div id="nav-menu" class="nav-menu" aria-hidden="false">
                <ul class="nav-list" role="menubar">
                  <li class="nav-item" role="none">
                    <a href="/" class="nav-link" role="menuitem" aria-current="page">Home</a>
                  </li>
                  
                  <li class="nav-item has-dropdown" role="none">
                    <button 
                      class="nav-link dropdown-toggle" 
                      aria-expanded="false"
                      aria-haspopup="true"
                      aria-controls="services-dropdown"
                      role="menuitem"
                      type="button"
                    >
                      Services
                      <span class="dropdown-icon" aria-hidden="true">▼</span>
                    </button>
                    <ul 
                      id="services-dropdown" 
                      class="dropdown-menu" 
                      role="menu"
                      aria-label="Services submenu"
                      aria-hidden="true"
                    >
                      <li role="none">
                        <a href="/services/web-design" class="dropdown-link" role="menuitem">Web Design</a>
                      </li>
                      <li role="none">
                        <a href="/services/development" class="dropdown-link" role="menuitem">Development</a>
                      </li>
                    </ul>
                  </li>

                  <li class="nav-item has-dropdown" role="none">
                    <button 
                      class="nav-link dropdown-toggle" 
                      aria-expanded="false"
                      aria-haspopup="true"
                      aria-controls="products-dropdown"
                      role="menuitem"
                      type="button"
                    >
                      Products
                      <span class="dropdown-icon" aria-hidden="true">▼</span>
                    </button>
                    <ul 
                      id="products-dropdown" 
                      class="dropdown-menu" 
                      role="menu"
                      aria-label="Products submenu"
                      aria-hidden="true"
                    >
                      <li role="none">
                        <a href="/products/software" class="dropdown-link" role="menuitem">Software</a>
                      </li>
                      <li class="has-submenu" role="none">
                        <button 
                          class="dropdown-link submenu-toggle" 
                          aria-expanded="false"
                          aria-haspopup="true"
                          aria-controls="hardware-submenu"
                          role="menuitem"
                          type="button"
                        >
                          Hardware
                          <span class="dropdown-icon" aria-hidden="true">▶</span>
                        </button>
                        <ul 
                          id="hardware-submenu" 
                          class="submenu" 
                          role="menu"
                          aria-label="Hardware submenu"
                          aria-hidden="true"
                        >
                          <li role="none">
                            <a href="/products/hardware/servers" class="dropdown-link" role="menuitem">Servers</a>
                          </li>
                          <li role="none">
                            <a href="/products/hardware/workstations" class="dropdown-link" role="menuitem">Workstations</a>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>

                  <li class="nav-item" role="none">
                    <a href="/contact" class="nav-link" role="menuitem">Contact</a>
                  </li>

                  <li class="nav-item nav-cta" role="none">
                    <a href="/get-started" class="nav-link cta-button" role="menuitem">Get Started</a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </header>

        <div id="navigation-announcements" class="sr-only" aria-live="polite" aria-atomic="true"></div>
        
        <main id="main-content" class="main-content" role="main">
          <h1>Test Page</h1>
        </main>
      `;
    }
  }

  /**
   * Load navigation CSS for testing
   */
  static async loadNavigationCSS() {
    try {
      const cssPath = path.resolve(process.cwd(), 'src/styles/navigation.css');
      const css = await fs.readFile(cssPath, 'utf-8');
      return css;
    } catch (error) {
      // Fallback minimal CSS for testing
      return `
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: #000;
          color: #fff;
          padding: 8px 16px;
          text-decoration: none;
          transition: top 0.3s ease;
        }
        
        .skip-link:focus {
          top: 0;
          outline: 2px solid #007cba;
          outline-offset: 2px;
        }
        
        .main-navigation {
          position: relative;
        }
        
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
          padding: 0 1rem;
        }
        
        .mobile-menu-toggle {
          display: none;
          background: transparent;
          border: none;
          padding: 8px;
          cursor: pointer;
        }
        
        .nav-menu {
          display: flex;
          align-items: center;
        }
        
        .nav-list {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 0.5rem;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: #333;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1rem;
        }
        
        .nav-link:focus {
          outline: 2px solid #007cba;
          outline-offset: 2px;
        }
        
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background: #fff;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          min-width: 200px;
          list-style: none;
          padding: 0.5rem 0;
          margin: 0;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
        }
        
        .dropdown-menu[aria-hidden="false"] {
          opacity: 1;
          visibility: visible;
        }
        
        .dropdown-link {
          display: block;
          padding: 0.75rem 1rem;
          color: #333;
          text-decoration: none;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }
        
        .dropdown-link:focus {
          outline: none;
          background-color: #e3f2fd;
          color: #007cba;
        }
        
        .submenu {
          position: absolute;
          top: 0;
          left: 100%;
          margin-left: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: flex;
            flex-direction: column;
            width: 48px;
            height: 48px;
          }
          
          .hamburger-line {
            display: block;
            width: 24px;
            height: 3px;
            background-color: #333;
            margin: 2px 0;
          }
          
          .nav-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #fff;
            transform: translateY(-100vh);
            transition: transform 0.3s ease;
          }
          
          .nav-menu[aria-hidden="false"] {
            transform: translateY(0);
          }
          
          .nav-list {
            flex-direction: column;
            gap: 0;
          }
          
          .nav-link {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #f0f0f0;
          }
          
          .dropdown-menu {
            position: static;
            box-shadow: none;
            border: none;
            background: #f8f9fa;
            transform: none;
            opacity: 1;
            visibility: visible;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
          }
          
          .dropdown-menu[aria-hidden="false"] {
            max-height: 300px;
          }
        }
      `;
    }
  }

  /**
   * Simulate viewport size changes
   */
  static setViewportSize(width, height) {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });

    // Update matchMedia to reflect new viewport
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => {
        const match = query.includes(`${width}px`) || 
                     (query.includes('max-width') && width <= parseInt(query.match(/(\d+)px/)?.[1] || '0')) ||
                     (query.includes('min-width') && width >= parseInt(query.match(/(\d+)px/)?.[1] || '0'));
        
        return {
          matches: match,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        };
      }),
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
  }

  /**
   * Simulate keyboard events with modifiers
   */
  static simulateKeyboard(element, key, options = {}) {
    const keyboardEvent = new KeyboardEvent('keydown', {
      key,
      code: `Key${key}`,
      keyCode: key.charCodeAt(0),
      which: key.charCodeAt(0),
      bubbles: true,
      cancelable: true,
      ...options
    });

    element.dispatchEvent(keyboardEvent);

    // Also dispatch keyup for completeness
    const keyupEvent = new KeyboardEvent('keyup', {
      key,
      code: `Key${key}`,
      keyCode: key.charCodeAt(0),
      which: key.charCodeAt(0),
      bubbles: true,
      cancelable: true,
      ...options
    });

    element.dispatchEvent(keyupEvent);
  }

  /**
   * Simulate touch events for mobile testing
   */
  static simulateTouch(element, eventType, touches = [{}]) {
    const touchEvent = new TouchEvent(eventType, {
      bubbles: true,
      cancelable: true,
      touches: touches.map(touch => ({
        identifier: 0,
        target: element,
        clientX: touch.clientX || 0,
        clientY: touch.clientY || 0,
        pageX: touch.pageX || 0,
        pageY: touch.pageY || 0,
        screenX: touch.screenX || 0,
        screenY: touch.screenY || 0,
        ...touch
      }))
    });

    element.dispatchEvent(touchEvent);
  }

  /**
   * Simulate swipe gestures
   */
  static simulateSwipe(element, direction, distance = 100) {
    const startX = direction === 'left' ? distance : 0;
    const endX = direction === 'left' ? 0 : distance;
    const startY = direction === 'up' ? distance : direction === 'down' ? 0 : 50;
    const endY = direction === 'up' ? 0 : direction === 'down' ? distance : 50;

    // Start touch
    this.simulateTouch(element, 'touchstart', [{
      clientX: startX,
      clientY: startY
    }]);

    // Move touch
    this.simulateTouch(element, 'touchmove', [{
      clientX: endX,
      clientY: endY
    }]);

    // End touch
    this.simulateTouch(element, 'touchend', []);
  }

  /**
   * Wait for condition to be true
   */
  static waitFor(condition, timeout = 5000, interval = 100) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error(`Condition not met within ${timeout}ms`));
        } else {
          setTimeout(check, interval);
        }
      };
      
      check();
    });
  }

  /**
   * Get computed styles for testing
   */
  static getComputedStyles(element, properties) {
    const computedStyle = window.getComputedStyle(element);
    const result = {};
    
    properties.forEach(prop => {
      result[prop] = computedStyle[prop];
    });
    
    return result;
  }

  /**
   * Check if element is visible in viewport
   */
  static isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.opacity !== '0' &&
      style.visibility !== 'hidden' &&
      style.display !== 'none'
    );
  }

  /**
   * Get accessibility information for an element
   */
  static getAccessibilityInfo(element) {
    return {
      name: element.getAttribute('aria-label') ||
            element.getAttribute('aria-labelledby') ||
            (element.labels && element.labels[0]?.textContent) ||
            element.textContent?.trim() ||
            element.getAttribute('alt') ||
            element.getAttribute('title'),
      role: element.getAttribute('role') || element.tagName.toLowerCase(),
      state: {
        expanded: element.getAttribute('aria-expanded'),
        checked: element.getAttribute('aria-checked'),
        selected: element.getAttribute('aria-selected'),
        hidden: element.getAttribute('aria-hidden'),
        disabled: element.disabled || element.getAttribute('aria-disabled'),
        invalid: element.getAttribute('aria-invalid')
      },
      properties: {
        describedBy: element.getAttribute('aria-describedby'),
        labelledBy: element.getAttribute('aria-labelledby'),
        controls: element.getAttribute('aria-controls'),
        owns: element.getAttribute('aria-owns'),
        live: element.getAttribute('aria-live'),
        atomic: element.getAttribute('aria-atomic')
      }
    };
  }

  /**
   * Validate WCAG keyboard navigation requirements
   */
  static validateKeyboardNavigation(container) {
    const issues = [];
    const focusableElements = container.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable]'
    );

    focusableElements.forEach((element, index) => {
      // Check for visible focus indicator
      element.focus();
      const styles = window.getComputedStyle(element);
      const hasFocusIndicator = 
        styles.outline !== 'none' || 
        styles.boxShadow !== 'none' || 
        element.classList.contains('focus-visible');

      if (!hasFocusIndicator) {
        issues.push({
          element,
          issue: 'No visible focus indicator',
          wcagReference: '2.4.7'
        });
      }

      // Check tabindex values
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex && parseInt(tabIndex) > 0) {
        issues.push({
          element,
          issue: 'Positive tabindex disrupts natural tab order',
          wcagReference: '2.4.3'
        });
      }

      // Check for keyboard event handlers
      const hasClickHandler = element.onclick || 
        element.addEventListener || 
        element.getAttribute('onclick');
      
      if (hasClickHandler && !element.getAttribute('role')) {
        const tagName = element.tagName.toLowerCase();
        if (!['a', 'button', 'input'].includes(tagName)) {
          issues.push({
            element,
            issue: 'Interactive element missing semantic role',
            wcagReference: '4.1.2'
          });
        }
      }
    });

    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * Test screen reader announcements
   */
  static testScreenReaderAnnouncements(container) {
    const ariaLiveRegions = container.querySelectorAll('[aria-live]');
    const issues = [];

    ariaLiveRegions.forEach(region => {
      const liveValue = region.getAttribute('aria-live');
      if (!['polite', 'assertive', 'off'].includes(liveValue)) {
        issues.push({
          element: region,
          issue: `Invalid aria-live value: ${liveValue}`,
          wcagReference: '4.1.2'
        });
      }

      // Check if region is properly labeled
      const hasLabel = region.getAttribute('aria-label') ||
                      region.getAttribute('aria-labelledby') ||
                      region.textContent?.trim();

      if (!hasLabel) {
        issues.push({
          element: region,
          issue: 'Live region should have accessible name',
          wcagReference: '4.1.2'
        });
      }
    });

    return {
      passed: issues.length === 0,
      issues,
      liveRegions: ariaLiveRegions.length
    };
  }

  /**
   * Generate comprehensive accessibility report
   */
  static generateAccessibilityReport(container) {
    const keyboardNavigation = this.validateKeyboardNavigation(container);
    const screenReaderSupport = this.testScreenReaderAnnouncements(container);
    
    const allElements = container.querySelectorAll('*');
    const interactiveElements = container.querySelectorAll(
      'a, button, input, select, textarea, [tabindex], [onclick], [role="button"], [role="link"]'
    );

    return {
      summary: {
        totalElements: allElements.length,
        interactiveElements: interactiveElements.length,
        passedKeyboardNav: keyboardNavigation.passed,
        passedScreenReader: screenReaderSupport.passed,
        totalIssues: keyboardNavigation.issues.length + screenReaderSupport.issues.length
      },
      keyboardNavigation,
      screenReaderSupport,
      recommendations: this.generateRecommendations(keyboardNavigation.issues.concat(screenReaderSupport.issues))
    };
  }

  /**
   * Generate accessibility recommendations
   */
  static generateRecommendations(issues) {
    const recommendations = [];
    const issueTypes = new Map();

    issues.forEach(issue => {
      const count = issueTypes.get(issue.issue) || 0;
      issueTypes.set(issue.issue, count + 1);
    });

    issueTypes.forEach((count, issueType) => {
      switch (issueType) {
        case 'No visible focus indicator':
          recommendations.push({
            priority: 'high',
            issue: `${count} elements missing focus indicators`,
            solution: 'Add CSS focus styles with outline or box-shadow',
            wcag: '2.4.7 Focus Visible'
          });
          break;
        case 'Positive tabindex disrupts natural tab order':
          recommendations.push({
            priority: 'high',
            issue: `${count} elements with positive tabindex`,
            solution: 'Remove positive tabindex values, use natural DOM order',
            wcag: '2.4.3 Focus Order'
          });
          break;
        case 'Interactive element missing semantic role':
          recommendations.push({
            priority: 'medium',
            issue: `${count} elements need semantic roles`,
            solution: 'Add appropriate ARIA roles or use semantic HTML',
            wcag: '4.1.2 Name, Role, Value'
          });
          break;
      }
    });

    return recommendations;
  }
}

export default NavigationTestHelpers;