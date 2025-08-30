/**
 * Accessibility testing utilities for WCAG 2.1 compliance
 */

export class AccessibilityHelpers {
  /**
   * Check for WCAG 2.1 AA color contrast compliance
   * @param {string} foregroundColor - Foreground color (hex, rgb, etc.)
   * @param {string} backgroundColor - Background color (hex, rgb, etc.)
   * @returns {Object} Contrast ratio and compliance status
   */
  static checkColorContrast(foregroundColor, backgroundColor) {
    // Convert colors to RGB values
    const fg = this.parseColor(foregroundColor);
    const bg = this.parseColor(backgroundColor);
    
    // Calculate relative luminance
    const fgLuminance = this.getRelativeLuminance(fg);
    const bgLuminance = this.getRelativeLuminance(bg);
    
    // Calculate contrast ratio
    const contrastRatio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                         (Math.min(fgLuminance, bgLuminance) + 0.05);
    
    return {
      ratio: parseFloat(contrastRatio.toFixed(2)),
      wcagAA: contrastRatio >= 4.5,
      wcagAAA: contrastRatio >= 7,
      wcagAALarge: contrastRatio >= 3,
      wcagAAALarge: contrastRatio >= 4.5
    };
  }

  /**
   * Get relative luminance of a color
   */
  static getRelativeLuminance({ r, g, b }) {
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  /**
   * Parse color string to RGB values
   */
  static parseColor(color) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    
    const computedColor = ctx.fillStyle;
    
    if (computedColor.startsWith('#')) {
      // Hex color
      const hex = computedColor.slice(1);
      return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16)
      };
    } else if (computedColor.startsWith('rgb')) {
      // RGB color
      const matches = computedColor.match(/\d+/g);
      return {
        r: parseInt(matches[0]),
        g: parseInt(matches[1]),
        b: parseInt(matches[2])
      };
    }
    
    return { r: 0, g: 0, b: 0 };
  }

  /**
   * Check if element has proper focus management
   */
  static async checkFocusManagement(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const results = {
      focusableCount: focusableElements.length,
      hasTabIndex: [],
      hasAriaLabels: [],
      hasProperFocusOrder: true,
      issues: []
    };

    focusableElements.forEach((el, index) => {
      // Check tabindex
      const tabIndex = el.getAttribute('tabindex');
      results.hasTabIndex.push({ element: el, tabIndex });

      // Check aria labels
      const ariaLabel = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
      results.hasAriaLabels.push({ element: el, hasLabel: !!ariaLabel });

      // Check for proper focus order (simplified)
      if (tabIndex && parseInt(tabIndex) > 0 && index > 0) {
        results.hasProperFocusOrder = false;
        results.issues.push(`Element at index ${index} has positive tabindex`);
      }
    });

    return results;
  }

  /**
   * Check for proper ARIA attributes
   */
  static checkAriaCompliance(element) {
    const issues = [];
    const warnings = [];

    // Check for required ARIA attributes on form elements
    const formElements = element.querySelectorAll('input, select, textarea');
    formElements.forEach(el => {
      if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) {
        if (!el.closest('label')) {
          issues.push(`Form element without proper labeling: ${el.tagName.toLowerCase()}`);
        }
      }

      // Check for aria-describedby on elements with validation
      if (el.hasAttribute('required') && !el.getAttribute('aria-describedby')) {
        warnings.push(`Required field should have aria-describedby: ${el.name || el.id}`);
      }
    });

    // Check for proper heading structure
    const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (index === 0 && level !== 1) {
        warnings.push('First heading should be h1');
      }
      if (level > previousLevel + 1) {
        issues.push(`Heading level skip detected: ${heading.tagName} after h${previousLevel}`);
      }
      previousLevel = level;
    });

    return { issues, warnings };
  }

  /**
   * Test keyboard navigation
   */
  static async testKeyboardNavigation(page, selector) {
    const results = {
      canReachAllElements: true,
      focusOrder: [],
      trapsFocus: false,
      hasEscapeHandler: false,
      issues: []
    };

    try {
      // Get all focusable elements
      const focusableElements = await page.$$eval(
        `${selector} button, ${selector} [href], ${selector} input, ${selector} select, ${selector} textarea, ${selector} [tabindex]:not([tabindex="-1"])`,
        elements => elements.map(el => ({ tagName: el.tagName, id: el.id, name: el.name }))
      );

      results.focusOrder = focusableElements;

      // Test tab navigation
      for (let i = 0; i < focusableElements.length; i++) {
        await page.keyboard.press('Tab');
        const activeElement = await page.evaluate(() => document.activeElement.tagName);
        
        if (!activeElement) {
          results.canReachAllElements = false;
          results.issues.push(`Cannot reach element at index ${i}`);
        }
      }

      // Test escape key
      await page.keyboard.press('Escape');
      const afterEscape = await page.evaluate(() => document.activeElement.tagName);
      results.hasEscapeHandler = afterEscape !== 'BODY';

    } catch (error) {
      results.issues.push(`Keyboard navigation test failed: ${error.message}`);
    }

    return results;
  }
}

export default AccessibilityHelpers;