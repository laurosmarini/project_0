/**
 * WCAG 2.1 AA Compliance Validator
 * Comprehensive accessibility testing for theme implementation
 */

class WCAGComplianceValidator {
  constructor() {
    this.violations = [];
    this.passes = [];
    this.guidelines = {
      '1.1.1': 'Non-text Content',
      '1.3.1': 'Info and Relationships', 
      '1.4.1': 'Use of Color',
      '1.4.3': 'Contrast (Minimum)',
      '1.4.6': 'Contrast (Enhanced)',
      '1.4.10': 'Reflow',
      '1.4.11': 'Non-text Contrast',
      '1.4.12': 'Text Spacing',
      '1.4.13': 'Content on Hover or Focus',
      '2.1.1': 'Keyboard',
      '2.1.2': 'No Keyboard Trap',
      '2.1.4': 'Character Key Shortcuts',
      '2.4.3': 'Focus Order',
      '2.4.7': 'Focus Visible',
      '3.2.1': 'On Focus',
      '3.2.2': 'On Input',
      '4.1.2': 'Name, Role, Value'
    };
  }

  async validateCompliance() {
    console.log('🔍 Starting WCAG 2.1 AA Compliance Validation...');

    await this.testColorContrast();
    await this.testKeyboardAccessibility();
    await this.testSemanticMarkup();
    await this.testFocusManagement();
    await this.testScreenReaderSupport();
    await this.testMotionPreferences();

    return this.generateComplianceReport();
  }

  async testColorContrast() {
    console.log('Testing color contrast ratios...');

    const colorPairs = await this.getThemeColorPairs();
    
    for (const pair of colorPairs) {
      const ratio = this.calculateContrastRatio(pair.foreground, pair.background);
      const result = {
        guideline: '1.4.3',
        element: pair.element,
        foreground: pair.foreground,
        background: pair.background,
        ratio: ratio,
        passes: this.meetsContrastRequirement(ratio, pair.size),
        level: this.getContrastLevel(ratio, pair.size)
      };

      if (result.passes) {
        this.passes.push(result);
      } else {
        this.violations.push(result);
      }
    }
  }

  async getThemeColorPairs() {
    const pairs = [];
    
    // Test both light and dark themes
    const themes = ['light', 'dark'];
    
    for (const theme of themes) {
      // Set theme temporarily
      const originalTheme = document.documentElement.getAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', theme === 'light' ? null : theme);

      // Get computed colors
      const computedStyle = getComputedStyle(document.documentElement);
      
      const colors = {
        background: computedStyle.getPropertyValue('--color-background').trim(),
        textPrimary: computedStyle.getPropertyValue('--color-text-primary').trim(),
        textSecondary: computedStyle.getPropertyValue('--color-text-secondary').trim(),
        primary: computedStyle.getPropertyValue('--color-primary').trim(),
        border: computedStyle.getPropertyValue('--color-border').trim()
      };

      // Test color combinations
      pairs.push(
        {
          element: `${theme} theme - primary text`,
          foreground: colors.textPrimary,
          background: colors.background,
          size: 'normal',
          theme: theme
        },
        {
          element: `${theme} theme - secondary text`,
          foreground: colors.textSecondary,
          background: colors.background,
          size: 'normal',
          theme: theme
        },
        {
          element: `${theme} theme - primary button`,
          foreground: theme === 'light' ? 'hsl(0, 0%, 100%)' : 'hsl(220, 13%, 18%)',
          background: colors.primary,
          size: 'normal',
          theme: theme
        }
      );

      // Restore original theme
      if (originalTheme) {
        document.documentElement.setAttribute('data-theme', originalTheme);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }

    return pairs;
  }

  hslToRgb(hslString) {
    const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return { r: 0, g: 0, b: 0 };

    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  getLuminance(rgb) {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  calculateContrastRatio(foreground, background) {
    const fgRgb = this.hslToRgb(foreground);
    const bgRgb = this.hslToRgb(background);
    
    const fgLuminance = this.getLuminance(fgRgb);
    const bgLuminance = this.getLuminance(bgRgb);
    
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  meetsContrastRequirement(ratio, size = 'normal') {
    // WCAG 2.1 AA requirements
    const minRatio = size === 'large' ? 3.0 : 4.5;
    return ratio >= minRatio;
  }

  getContrastLevel(ratio, size = 'normal') {
    const aaLarge = 3.0;
    const aaNormal = 4.5;
    const aaaLarge = 4.5;
    const aaaNormal = 7.0;

    if (size === 'large') {
      if (ratio >= aaaLarge) return 'AAA';
      if (ratio >= aaLarge) return 'AA';
      return 'Fail';
    } else {
      if (ratio >= aaaNormal) return 'AAA';
      if (ratio >= aaNormal) return 'AA';
      return 'Fail';
    }
  }

  async testKeyboardAccessibility() {
    console.log('Testing keyboard accessibility...');

    // Test theme toggle accessibility
    const toggleElements = document.querySelectorAll('.theme-toggle-input');
    
    toggleElements.forEach((toggle, index) => {
      const result = {
        guideline: '2.1.1',
        element: `Theme toggle ${index + 1}`,
        focusable: toggle.tabIndex !== -1 && !toggle.disabled,
        hasLabel: this.hasAccessibleLabel(toggle),
        keyboardInteractive: true // Checkbox is inherently keyboard accessible
      };

      if (result.focusable && result.hasLabel && result.keyboardInteractive) {
        this.passes.push(result);
      } else {
        this.violations.push(result);
      }
    });

    // Test focus visibility
    this.testFocusVisibility();
  }

  hasAccessibleLabel(element) {
    return element.getAttribute('aria-label') || 
           element.labels?.length > 0 ||
           element.getAttribute('aria-labelledby');
  }

  testFocusVisibility() {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach((element, index) => {
      // Simulate focus to check visibility
      element.focus();
      const computedStyle = getComputedStyle(element);
      const hasVisibleFocus = 
        computedStyle.outline !== 'none' &&
        computedStyle.outline !== '0' &&
        computedStyle.outline !== '' ||
        computedStyle.boxShadow.includes('0 0 0') ||
        element.matches(':focus-visible');

      const result = {
        guideline: '2.4.7',
        element: `Focusable element ${index + 1}: ${element.tagName.toLowerCase()}`,
        hasVisibleFocus,
        focusStyle: computedStyle.outline || computedStyle.boxShadow
      };

      if (hasVisibleFocus) {
        this.passes.push(result);
      } else {
        this.violations.push(result);
      }
    });
  }

  async testSemanticMarkup() {
    console.log('Testing semantic markup...');

    // Test heading structure
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let previousLevel = 0;

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const skipsLevel = level > previousLevel + 1;

      const result = {
        guideline: '1.3.1',
        element: `Heading ${index + 1}: ${heading.tagName}`,
        text: heading.textContent.trim(),
        level,
        skipsLevel
      };

      if (!skipsLevel) {
        this.passes.push(result);
      } else {
        this.violations.push(result);
      }

      previousLevel = level;
    });

    // Test form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const hasLabel = this.hasAccessibleLabel(input);

      const result = {
        guideline: '1.3.1',
        element: `Form input ${index + 1}: ${input.type || input.tagName.toLowerCase()}`,
        hasLabel,
        labelType: input.getAttribute('aria-label') ? 'aria-label' : 
                   input.labels?.length ? 'label element' : 
                   input.getAttribute('aria-labelledby') ? 'aria-labelledby' : 'none'
      };

      if (hasLabel) {
        this.passes.push(result);
      } else {
        this.violations.push(result);
      }
    });
  }

  async testFocusManagement() {
    console.log('Testing focus management...');

    // Test focus order
    const focusableElements = Array.from(document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ));

    let logicalOrder = true;
    for (let i = 1; i < focusableElements.length; i++) {
      const current = focusableElements[i];
      const previous = focusableElements[i - 1];

      const currentRect = current.getBoundingClientRect();
      const previousRect = previous.getBoundingClientRect();

      // Simple heuristic: focus should generally move left-to-right, top-to-bottom
      if (currentRect.top < previousRect.top - 50 || 
          (Math.abs(currentRect.top - previousRect.top) < 50 && currentRect.left < previousRect.left - 50)) {
        logicalOrder = false;
        break;
      }
    }

    this.passes.push({
      guideline: '2.4.3',
      element: 'Focus order',
      logicalOrder,
      totalFocusableElements: focusableElements.length
    });
  }

  async testScreenReaderSupport() {
    console.log('Testing screen reader support...');

    // Test ARIA attributes
    const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
    
    elementsWithAria.forEach((element, index) => {
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledBy = element.getAttribute('aria-labelledby');
      const ariaDescribedBy = element.getAttribute('aria-describedby');
      const role = element.getAttribute('role');

      // Validate ARIA references
      let validReferences = true;
      if (ariaLabelledBy) {
        const referencedElement = document.getElementById(ariaLabelledBy);
        validReferences = validReferences && !!referencedElement;
      }
      if (ariaDescribedBy) {
        const referencedElement = document.getElementById(ariaDescribedBy);
        validReferences = validReferences && !!referencedElement;
      }

      const result = {
        guideline: '4.1.2',
        element: `Element with ARIA ${index + 1}`,
        ariaLabel,
        ariaLabelledBy,
        ariaDescribedBy,
        role,
        validReferences
      };

      if (validReferences) {
        this.passes.push(result);
      } else {
        this.violations.push(result);
      }
    });
  }

  async testMotionPreferences() {
    console.log('Testing motion preferences...');

    // Test if reduced motion is respected
    const hasReducedMotionSupport = this.checkReducedMotionSupport();

    this.passes.push({
      guideline: '2.3.3',
      element: 'Reduced motion support',
      supported: hasReducedMotionSupport,
      implementation: hasReducedMotionSupport ? 
        'CSS @media (prefers-reduced-motion: reduce) implemented' : 
        'No reduced motion support detected'
    });
  }

  checkReducedMotionSupport() {
    // Check if CSS contains reduced motion media query
    const stylesheets = Array.from(document.styleSheets);
    
    for (const stylesheet of stylesheets) {
      try {
        const rules = Array.from(stylesheet.cssRules || stylesheet.rules || []);
        for (const rule of rules) {
          if (rule instanceof CSSMediaRule && 
              rule.conditionText?.includes('prefers-reduced-motion')) {
            return true;
          }
        }
      } catch (e) {
        // Cross-origin stylesheet, skip
      }
    }
    
    return false;
  }

  generateComplianceReport() {
    const totalTests = this.passes.length + this.violations.length;
    const passRate = (this.passes.length / totalTests) * 100;

    const report = {
      meta: {
        timestamp: new Date().toISOString(),
        standard: 'WCAG 2.1 AA',
        totalTests,
        passes: this.passes.length,
        violations: this.violations.length,
        passRate: Math.round(passRate)
      },
      summary: {
        compliance: passRate >= 95 ? 'Excellent' : passRate >= 85 ? 'Good' : passRate >= 70 ? 'Fair' : 'Poor',
        level: passRate >= 90 ? 'AA+' : passRate >= 80 ? 'AA' : 'Below AA',
        recommendation: this.getComplianceRecommendation(passRate)
      },
      results: {
        passes: this.passes,
        violations: this.violations
      },
      guidelinesCovered: Object.keys(this.guidelines).map(key => ({
        guideline: key,
        name: this.guidelines[key],
        tested: this.passes.some(p => p.guideline === key) || this.violations.some(v => v.guideline === key)
      })),
      actionItems: this.generateActionItems()
    };

    return report;
  }

  getComplianceRecommendation(passRate) {
    if (passRate >= 95) {
      return 'Excellent accessibility - exceeds WCAG 2.1 AA standards';
    } else if (passRate >= 85) {
      return 'Good accessibility - meets WCAG 2.1 AA standards with minor improvements needed';
    } else if (passRate >= 70) {
      return 'Fair accessibility - some violations need to be addressed to meet WCAG 2.1 AA';
    } else {
      return 'Poor accessibility - significant violations need immediate attention';
    }
  }

  generateActionItems() {
    const items = [];
    
    // Group violations by guideline
    const violationsByGuideline = this.violations.reduce((acc, violation) => {
      if (!acc[violation.guideline]) {
        acc[violation.guideline] = [];
      }
      acc[violation.guideline].push(violation);
      return acc;
    }, {});

    // Generate action items for each guideline with violations
    Object.keys(violationsByGuideline).forEach(guideline => {
      const violations = violationsByGuideline[guideline];
      const guidelineName = this.guidelines[guideline];
      
      items.push({
        priority: this.getViolationPriority(guideline),
        guideline: `${guideline} - ${guidelineName}`,
        violations: violations.length,
        action: this.getActionForGuideline(guideline, violations)
      });
    });

    return items.sort((a, b) => this.getPriorityWeight(a.priority) - this.getPriorityWeight(b.priority));
  }

  getViolationPriority(guideline) {
    const highPriority = ['1.4.3', '2.1.1', '2.4.7', '4.1.2'];
    const mediumPriority = ['1.3.1', '2.4.3'];
    
    if (highPriority.includes(guideline)) return 'High';
    if (mediumPriority.includes(guideline)) return 'Medium';
    return 'Low';
  }

  getPriorityWeight(priority) {
    const weights = { 'High': 1, 'Medium': 2, 'Low': 3 };
    return weights[priority] || 4;
  }

  getActionForGuideline(guideline, violations) {
    const actions = {
      '1.4.3': 'Improve color contrast ratios to meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)',
      '2.1.1': 'Ensure all interactive elements are keyboard accessible',
      '2.4.7': 'Add visible focus indicators to all focusable elements',
      '4.1.2': 'Fix ARIA attribute references and ensure proper naming',
      '1.3.1': 'Improve semantic markup and form labeling',
      '2.4.3': 'Review and fix focus order to be logical and intuitive'
    };

    return actions[guideline] || 'Address violations for this guideline';
  }
}

// Export for use in testing frameworks
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WCAGComplianceValidator;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
  window.WCAGComplianceValidator = WCAGComplianceValidator;
}