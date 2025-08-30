/**
 * Keyboard Navigation Testing Framework
 * Validates keyboard accessibility and focus management
 */

class KeyboardNavigationTester {
  constructor() {
    this.testResults = [];
    this.focusTraps = [];
    this.tabOrder = [];
  }

  /**
   * Test basic keyboard navigation functionality
   */
  async testBasicKeyboardNavigation(document) {
    console.log('⌨️  Testing Basic Keyboard Navigation...\n');
    
    const focusableElements = this.getFocusableElements(document);
    
    // Test 1: All interactive elements are keyboard accessible
    await this.testInteractiveElementsAccessibility(focusableElements);
    
    // Test 2: Tab order is logical
    await this.testTabOrder(focusableElements);
    
    // Test 3: Focus indicators are visible
    await this.testFocusIndicators(focusableElements);
    
    // Test 4: No keyboard traps
    await this.testKeyboardTraps(focusableElements);
    
    // Test 5: Skip links functionality
    await this.testSkipLinks(document);
    
    return this.generateNavigationReport();
  }

  getFocusableElements(document) {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'audio[controls]',
      'video[controls]',
      '[contenteditable]:not([contenteditable="false"])'
    ].join(', ');

    return Array.from(document.querySelectorAll(selector));
  }

  async testInteractiveElementsAccessibility(elements) {
    const results = {
      passed: 0,
      failed: 0,
      issues: []
    };

    elements.forEach((element, index) => {
      try {
        // Simulate focus
        element.focus();
        
        if (document.activeElement === element) {
          results.passed++;
        } else {
          results.failed++;
          results.issues.push(`Element ${index + 1} (${element.tagName}) not focusable`);
        }
      } catch (error) {
        results.failed++;
        results.issues.push(`Element ${index + 1} threw error on focus: ${error.message}`);
      }
    });

    this.testResults.push({
      test: 'Interactive Elements Accessibility',
      passed: results.passed,
      failed: results.failed,
      issues: results.issues
    });

    console.log(`✅ Interactive Elements: ${results.passed} passed, ${results.failed} failed`);
    if (results.issues.length > 0) {
      results.issues.forEach(issue => console.log(`   ❌ ${issue}`));
    }
  }

  async testTabOrder(elements) {
    console.log('\n⭐ Testing Tab Order Logic...');
    
    const tabOrderIssues = [];
    let previousTabIndex = -1;
    
    elements.forEach((element, index) => {
      const tabIndex = parseInt(element.getAttribute('tabindex')) || 0;
      const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : null;
      
      this.tabOrder.push({
        element: element.tagName.toLowerCase(),
        tabIndex,
        position: rect ? { x: rect.left, y: rect.top } : null,
        visible: this.isElementVisible(element)
      });

      // Check for positive tabindex values (anti-pattern)
      if (tabIndex > 0) {
        tabOrderIssues.push(`Element ${index + 1} uses positive tabindex (${tabIndex}) - consider restructuring HTML`);
      }

      // Check for logical visual order
      if (rect && previousTabIndex >= 0) {
        const previousElement = elements[index - 1];
        const prevRect = previousElement.getBoundingClientRect ? previousElement.getBoundingClientRect() : null;
        
        if (prevRect && rect.top < prevRect.top && rect.left < prevRect.left) {
          tabOrderIssues.push(`Element ${index + 1} appears visually before previous element but comes after in tab order`);
        }
      }
      
      previousTabIndex = tabIndex;
    });

    this.testResults.push({
      test: 'Tab Order Logic',
      passed: tabOrderIssues.length === 0 ? elements.length : 0,
      failed: tabOrderIssues.length,
      issues: tabOrderIssues
    });

    if (tabOrderIssues.length === 0) {
      console.log('✅ Tab order is logical');
    } else {
      console.log(`❌ Tab order issues found: ${tabOrderIssues.length}`);
      tabOrderIssues.forEach(issue => console.log(`   ❌ ${issue}`));
    }
  }

  async testFocusIndicators(elements) {
    console.log('\n👁️  Testing Focus Indicators...');
    
    const indicatorIssues = [];
    
    elements.forEach((element, index) => {
      try {
        element.focus();
        
        // Check if element has focus styles
        const computedStyle = getComputedStyle ? getComputedStyle(element) : {};
        const hasOutline = computedStyle.outline && computedStyle.outline !== 'none' && computedStyle.outline !== '0px';
        const hasBoxShadow = computedStyle.boxShadow && computedStyle.boxShadow !== 'none';
        const hasBorder = computedStyle.border && computedStyle.borderWidth !== '0px';
        const hasCustomFocus = element.classList.contains('focus') || 
                              element.classList.contains('focused') ||
                              element.style.outline !== '';

        if (!hasOutline && !hasBoxShadow && !hasBorder && !hasCustomFocus) {
          indicatorIssues.push(`Element ${index + 1} (${element.tagName}) missing visible focus indicator`);
        }
      } catch (error) {
        indicatorIssues.push(`Element ${index + 1} focus indicator test failed: ${error.message}`);
      }
    });

    this.testResults.push({
      test: 'Focus Indicators',
      passed: elements.length - indicatorIssues.length,
      failed: indicatorIssues.length,
      issues: indicatorIssues
    });

    if (indicatorIssues.length === 0) {
      console.log('✅ All elements have visible focus indicators');
    } else {
      console.log(`❌ Focus indicator issues: ${indicatorIssues.length}`);
      indicatorIssues.forEach(issue => console.log(`   ❌ ${issue}`));
    }
  }

  async testKeyboardTraps(elements) {
    console.log('\n🔒 Testing for Keyboard Traps...');
    
    const trapIssues = [];
    
    // Test common keyboard trap scenarios
    const modals = elements.filter(el => 
      el.getAttribute('role') === 'dialog' || 
      el.classList.contains('modal') ||
      el.classList.contains('popup')
    );

    modals.forEach((modal, index) => {
      const modalFocusables = this.getFocusableElementsInContainer(modal);
      
      if (modalFocusables.length === 0) {
        trapIssues.push(`Modal ${index + 1} has no focusable elements - creates keyboard trap`);
      }
      
      // Check for focus trap implementation
      const firstFocusable = modalFocusables[0];
      const lastFocusable = modalFocusables[modalFocusables.length - 1];
      
      if (modalFocusables.length > 1) {
        // Test if tab cycling works within modal
        const hasTabTrap = this.testFocusTrap(firstFocusable, lastFocusable);
        if (!hasTabTrap) {
          trapIssues.push(`Modal ${index + 1} may not properly trap focus`);
        }
      }
    });

    this.testResults.push({
      test: 'Keyboard Traps',
      passed: modals.length - trapIssues.length,
      failed: trapIssues.length,
      issues: trapIssues
    });

    if (trapIssues.length === 0) {
      console.log('✅ No keyboard traps detected');
    } else {
      console.log(`❌ Keyboard trap issues: ${trapIssues.length}`);
      trapIssues.forEach(issue => console.log(`   ❌ ${issue}`));
    }
  }

  getFocusableElementsInContainer(container) {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    return Array.from(container.querySelectorAll(selector));
  }

  testFocusTrap(firstElement, lastElement) {
    // This is a simplified test - in a real implementation,
    // you'd simulate actual tab key presses
    try {
      firstElement.focus();
      const focusedFirst = document.activeElement === firstElement;
      
      lastElement.focus();
      const focusedLast = document.activeElement === lastElement;
      
      return focusedFirst && focusedLast;
    } catch (error) {
      return false;
    }
  }

  async testSkipLinks(document) {
    console.log('\n⏭️  Testing Skip Links...');
    
    const skipLinks = Array.from(document.querySelectorAll('a[href^="#"]'))
      .filter(link => 
        link.textContent.toLowerCase().includes('skip') ||
        link.textContent.toLowerCase().includes('main') ||
        link.textContent.toLowerCase().includes('content')
      );

    const skipIssues = [];

    if (skipLinks.length === 0) {
      skipIssues.push('No skip links found - users cannot bypass repetitive content');
    } else {
      skipLinks.forEach((link, index) => {
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (!targetElement) {
          skipIssues.push(`Skip link ${index + 1} target "${targetId}" not found`);
        }
        
        // Check if skip link is hidden but becomes visible on focus
        const isHidden = this.isElementHidden(link);
        if (isHidden) {
          // This is often correct behavior - skip links are hidden until focused
          console.log(`   ℹ️  Skip link ${index + 1} is hidden (should become visible on focus)`);
        }
      });
    }

    this.testResults.push({
      test: 'Skip Links',
      passed: skipLinks.length - skipIssues.length,
      failed: skipIssues.length,
      issues: skipIssues
    });

    if (skipIssues.length === 0) {
      console.log(`✅ Skip links working properly (${skipLinks.length} found)`);
    } else {
      console.log(`❌ Skip link issues: ${skipIssues.length}`);
      skipIssues.forEach(issue => console.log(`   ❌ ${issue}`));
    }
  }

  isElementVisible(element) {
    if (!element.getBoundingClientRect) return true;
    
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle ? getComputedStyle(element) : {};
    
    return rect.width > 0 && rect.height > 0 && 
           style.visibility !== 'hidden' && 
           style.display !== 'none' &&
           style.opacity !== '0';
  }

  isElementHidden(element) {
    if (!getComputedStyle) return false;
    
    const style = getComputedStyle(element);
    return style.visibility === 'hidden' || 
           style.display === 'none' ||
           style.opacity === '0' ||
           style.clip === 'rect(0, 0, 0, 0)';
  }

  generateNavigationReport() {
    const totalTests = this.testResults.reduce((sum, result) => sum + result.passed + result.failed, 0);
    const totalPassed = this.testResults.reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = this.testResults.reduce((sum, result) => sum + result.failed, 0);
    
    const report = {
      summary: {
        compliance: totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0,
        totalTests,
        totalPassed,
        totalFailed
      },
      details: this.testResults,
      tabOrder: this.tabOrder
    };

    console.log('\n📊 Keyboard Navigation Test Report');
    console.log('=====================================');
    console.log(`✅ Compliance Score: ${report.summary.compliance}%`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}\n`);

    return report;
  }

  // Simulate key press events for testing
  simulateKeyPress(element, key) {
    const event = new KeyboardEvent('keydown', {
      key: key,
      keyCode: this.getKeyCode(key),
      bubbles: true,
      cancelable: true
    });
    
    return element.dispatchEvent(event);
  }

  getKeyCode(key) {
    const keyCodes = {
      'Tab': 9,
      'Enter': 13,
      'Escape': 27,
      'Space': 32,
      'ArrowLeft': 37,
      'ArrowUp': 38,
      'ArrowRight': 39,
      'ArrowDown': 40
    };
    
    return keyCodes[key] || 0;
  }
}

module.exports = KeyboardNavigationTester;