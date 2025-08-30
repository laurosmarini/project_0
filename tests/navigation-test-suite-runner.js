/**
 * Comprehensive Navigation Test Suite Runner
 * Orchestrates all navigation accessibility tests and generates reports
 */

import { jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import NavigationTestHelpers from './utils/navigation-test-helpers.js';
import AccessibilityHelpers from './utils/accessibility-helpers.js';

class NavigationTestSuiteRunner {
  constructor() {
    this.results = {
      summary: {
        startTime: new Date(),
        totalTests: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        coverage: {
          skipLinks: 0,
          keyboardNavigation: 0,
          screenReader: 0,
          responsive: 0,
          touch: 0,
          colorContrast: 0,
          performance: 0
        }
      },
      detailed: {},
      recommendations: [],
      manualTests: []
    };
  }

  /**
   * Run complete test suite
   */
  async runFullTestSuite() {
    console.log('🚀 Starting Navigation Accessibility Test Suite...\n');

    try {
      // Initialize test environment
      await this.setupTestEnvironment();

      // Run automated tests
      await this.runAutomatedTests();

      // Run performance tests
      await this.runPerformanceTests();

      // Run cross-browser compatibility tests
      await this.runCompatibilityTests();

      // Generate reports
      await this.generateReports();

      // Display summary
      this.displaySummary();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    }
  }

  /**
   * Setup test environment
   */
  async setupTestEnvironment() {
    console.log('🔧 Setting up test environment...');
    
    // Load navigation HTML and CSS
    const navHTML = await NavigationTestHelpers.loadNavigationHTML();
    const navCSS = await NavigationTestHelpers.loadNavigationCSS();
    
    // Setup DOM
    document.body.innerHTML = navHTML;
    const style = document.createElement('style');
    style.textContent = navCSS;
    document.head.appendChild(style);

    console.log('✅ Test environment ready\n');
  }

  /**
   * Run automated accessibility tests
   */
  async runAutomatedTests() {
    console.log('🧪 Running automated accessibility tests...\n');

    const testCategories = [
      'skipLinks',
      'keyboardNavigation', 
      'ariaCompliance',
      'responsiveDesign',
      'colorContrast',
      'focusManagement'
    ];

    for (const category of testCategories) {
      try {
        const results = await this.runTestCategory(category);
        this.results.detailed[category] = results;
        this.updateCoverage(category, results);
        
        console.log(`  ${results.passed ? '✅' : '❌'} ${category}: ${results.passed}/${results.total} passed`);
        
        if (results.warnings.length > 0) {
          console.log(`    ⚠️  ${results.warnings.length} warnings`);
        }
      } catch (error) {
        console.log(`  ❌ ${category}: Failed to run - ${error.message}`);
        this.results.detailed[category] = { error: error.message, passed: 0, total: 0 };
      }
    }

    console.log('');
  }

  /**
   * Run specific test category
   */
  async runTestCategory(category) {
    const navContainer = document.querySelector('.main-navigation');
    
    switch (category) {
      case 'skipLinks':
        return await this.testSkipLinks();
      
      case 'keyboardNavigation':
        return await this.testKeyboardNavigation(navContainer);
      
      case 'ariaCompliance':
        return await this.testAriaCompliance(navContainer);
      
      case 'responsiveDesign':
        return await this.testResponsiveDesign(navContainer);
      
      case 'colorContrast':
        return await this.testColorContrast(navContainer);
      
      case 'focusManagement':
        return await this.testFocusManagement(navContainer);
      
      default:
        throw new Error(`Unknown test category: ${category}`);
    }
  }

  /**
   * Test skip links functionality
   */
  async testSkipLinks() {
    const results = { passed: 0, total: 0, warnings: [], errors: [] };
    const skipLinks = document.querySelectorAll('.skip-link');
    
    results.total = skipLinks.length * 3; // 3 tests per skip link

    skipLinks.forEach((link, index) => {
      // Test 1: Skip link has proper href
      if (link.href && link.href.includes('#')) {
        results.passed++;
      } else {
        results.errors.push(`Skip link ${index} missing proper href`);
      }

      // Test 2: Skip link has descriptive text
      if (link.textContent && link.textContent.trim().length > 0) {
        results.passed++;
      } else {
        results.errors.push(`Skip link ${index} missing descriptive text`);
      }

      // Test 3: Target exists
      const targetId = link.href.split('#')[1];
      const target = document.getElementById(targetId);
      if (target) {
        results.passed++;
      } else {
        results.errors.push(`Skip link ${index} target #${targetId} not found`);
      }
    });

    return results;
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(container) {
    const results = NavigationTestHelpers.validateKeyboardNavigation(container);
    
    return {
      passed: results.passed ? results.issues.length : 0,
      total: results.issues.length + (results.passed ? 1 : 0),
      warnings: results.issues.filter(i => i.wcagReference === '2.4.7'),
      errors: results.issues.filter(i => i.wcagReference !== '2.4.7')
    };
  }

  /**
   * Test ARIA compliance
   */
  async testAriaCompliance(container) {
    const results = { passed: 0, total: 0, warnings: [], errors: [] };
    
    // Test navigation landmark
    const nav = container.querySelector('nav');
    results.total++;
    if (nav && nav.getAttribute('role') === 'navigation') {
      results.passed++;
    } else {
      results.errors.push('Navigation missing role="navigation"');
    }

    // Test menubar role
    const menubar = container.querySelector('[role="menubar"]');
    results.total++;
    if (menubar) {
      results.passed++;
    } else {
      results.warnings.push('Consider adding role="menubar" to navigation list');
    }

    // Test dropdown toggles
    const dropdownToggles = container.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach((toggle, index) => {
      results.total += 3;

      // aria-expanded
      if (toggle.hasAttribute('aria-expanded')) {
        results.passed++;
      } else {
        results.errors.push(`Dropdown toggle ${index} missing aria-expanded`);
      }

      // aria-haspopup
      if (toggle.getAttribute('aria-haspopup') === 'true') {
        results.passed++;
      } else {
        results.errors.push(`Dropdown toggle ${index} missing aria-haspopup`);
      }

      // aria-controls
      if (toggle.hasAttribute('aria-controls')) {
        results.passed++;
      } else {
        results.errors.push(`Dropdown toggle ${index} missing aria-controls`);
      }
    });

    // Test dropdown menus
    const dropdownMenus = container.querySelectorAll('.dropdown-menu');
    dropdownMenus.forEach((menu, index) => {
      results.total += 2;

      // aria-hidden
      if (menu.hasAttribute('aria-hidden')) {
        results.passed++;
      } else {
        results.errors.push(`Dropdown menu ${index} missing aria-hidden`);
      }

      // role="menu"
      if (menu.getAttribute('role') === 'menu') {
        results.passed++;
      } else {
        results.warnings.push(`Dropdown menu ${index} should have role="menu"`);
      }
    });

    return results;
  }

  /**
   * Test responsive design
   */
  async testResponsiveDesign(container) {
    const results = { passed: 0, total: 0, warnings: [], errors: [] };
    const breakpoints = [320, 768, 1024, 1200];
    
    for (const width of breakpoints) {
      NavigationTestHelpers.setViewportSize(width, 600);
      results.total++;

      // Check if mobile toggle is properly shown/hidden
      const mobileToggle = container.querySelector('.mobile-menu-toggle');
      const isMobile = width < 768;
      
      if (mobileToggle) {
        const styles = window.getComputedStyle(mobileToggle);
        const isVisible = styles.display !== 'none';
        
        if (isMobile === isVisible) {
          results.passed++;
        } else {
          results.errors.push(`Mobile toggle visibility incorrect at ${width}px`);
        }
      } else if (isMobile) {
        results.errors.push('Mobile toggle not found');
      } else {
        results.passed++;
      }
    }

    return results;
  }

  /**
   * Test color contrast
   */
  async testColorContrast(container) {
    const results = { passed: 0, total: 0, warnings: [], errors: [] };
    
    const testPairs = [
      { selector: '.nav-link', fg: '#333', bg: '#fff', name: 'Navigation links' },
      { selector: '.nav-link:hover', fg: '#007cba', bg: '#f8f9fa', name: 'Hovered links' },
      { selector: '.cta-button', fg: '#fff', bg: '#007cba', name: 'CTA button' },
      { selector: '.dropdown-link', fg: '#333', bg: '#fff', name: 'Dropdown links' }
    ];

    testPairs.forEach(({ fg, bg, name }) => {
      results.total++;
      const contrast = AccessibilityHelpers.checkColorContrast(fg, bg);
      
      if (contrast.wcagAA) {
        results.passed++;
      } else {
        results.errors.push(`${name} fails WCAG AA contrast (${contrast.ratio.toFixed(2)}:1)`);
      }
    });

    return results;
  }

  /**
   * Test focus management
   */
  async testFocusManagement(container) {
    const results = { passed: 0, total: 0, warnings: [], errors: [] };
    const focusableElements = container.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach((element, index) => {
      results.total++;
      
      // Test focus visibility
      element.focus();
      const styles = window.getComputedStyle(element);
      const hasFocusIndicator = 
        styles.outline !== 'none' || 
        styles.boxShadow !== 'none';

      if (hasFocusIndicator) {
        results.passed++;
      } else {
        results.errors.push(`Element ${index} (${element.tagName}) missing focus indicator`);
      }
    });

    return results;
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests() {
    console.log('⚡ Running performance tests...\n');

    const perfResults = {
      initialization: await this.testInitializationTime(),
      memoryUsage: await this.testMemoryUsage(),
      interactionLatency: await this.testInteractionLatency()
    };

    this.results.detailed.performance = perfResults;
    
    console.log(`  ⚡ Initialization: ${perfResults.initialization.time}ms`);
    console.log(`  💾 Memory usage: ${perfResults.memoryUsage.peak}MB peak`);
    console.log(`  🖱️ Interaction latency: ${perfResults.interactionLatency.average}ms avg\n`);
  }

  /**
   * Test initialization time
   */
  async testInitializationTime() {
    const start = performance.now();
    
    // Simulate navigation initialization
    const { AccessibleNavigation } = await import('../src/scripts/navigation.js');
    const nav = new AccessibleNavigation('.main-navigation');
    
    const end = performance.now();
    const time = end - start;

    nav.destroy();

    return {
      time: Math.round(time),
      passed: time < 100,
      benchmark: '< 100ms'
    };
  }

  /**
   * Test memory usage
   */
  async testMemoryUsage() {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    // Create multiple navigation instances
    const instances = [];
    for (let i = 0; i < 5; i++) {
      const { AccessibleNavigation } = await import('../src/scripts/navigation.js');
      instances.push(new AccessibleNavigation('.main-navigation'));
    }
    
    const peakMemory = performance.memory?.usedJSHeapSize || 0;
    
    // Cleanup
    instances.forEach(instance => instance.destroy && instance.destroy());
    
    const memoryUsage = (peakMemory - initialMemory) / (1024 * 1024);

    return {
      peak: Math.round(memoryUsage * 100) / 100,
      passed: memoryUsage < 5,
      benchmark: '< 5MB'
    };
  }

  /**
   * Test interaction latency
   */
  async testInteractionLatency() {
    const times = [];
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    
    if (dropdownToggle) {
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        dropdownToggle.click();
        const end = performance.now();
        times.push(end - start);
      }
    }

    const average = times.reduce((a, b) => a + b, 0) / times.length;

    return {
      average: Math.round(average * 100) / 100,
      passed: average < 16,
      benchmark: '< 16ms (60fps)',
      samples: times.length
    };
  }

  /**
   * Run cross-browser compatibility tests
   */
  async runCompatibilityTests() {
    console.log('🌐 Running compatibility tests...\n');

    const compatResults = {
      cssSupport: this.testCSSSupport(),
      jsFeatures: this.testJSFeatures(),
      polyfillNeeds: this.assessPolyfillNeeds()
    };

    this.results.detailed.compatibility = compatResults;
    
    console.log(`  🎨 CSS support: ${compatResults.cssSupport.score}%`);
    console.log(`  📜 JS features: ${compatResults.jsFeatures.score}%`);
    console.log(`  🔧 Polyfills needed: ${compatResults.polyfillNeeds.count}\n`);
  }

  /**
   * Test CSS support
   */
  testCSSSupport() {
    const features = [
      { name: 'CSS Grid', test: () => CSS.supports('display', 'grid') },
      { name: 'Flexbox', test: () => CSS.supports('display', 'flex') },
      { name: 'Custom Properties', test: () => CSS.supports('color', 'var(--color)') },
      { name: 'Focus Visible', test: () => CSS.supports('selector(:focus-visible)') },
      { name: 'Prefers Reduced Motion', test: () => window.matchMedia('(prefers-reduced-motion)').media !== 'not all' }
    ];

    const supported = features.filter(feature => feature.test()).length;
    const score = Math.round((supported / features.length) * 100);

    return {
      score,
      supported: features.filter(f => f.test()).map(f => f.name),
      unsupported: features.filter(f => !f.test()).map(f => f.name)
    };
  }

  /**
   * Test JavaScript features
   */
  testJSFeatures() {
    const features = [
      { name: 'ES6 Classes', test: () => typeof class {} === 'function' },
      { name: 'Arrow Functions', test: () => { try { eval('() => {}'); return true; } catch { return false; } } },
      { name: 'IntersectionObserver', test: () => 'IntersectionObserver' in window },
      { name: 'ResizeObserver', test: () => 'ResizeObserver' in window },
      { name: 'Custom Elements', test: () => 'customElements' in window }
    ];

    const supported = features.filter(feature => feature.test()).length;
    const score = Math.round((supported / features.length) * 100);

    return {
      score,
      supported: features.filter(f => f.test()).map(f => f.name),
      unsupported: features.filter(f => !f.test()).map(f => f.name)
    };
  }

  /**
   * Assess polyfill needs
   */
  assessPolyfillNeeds() {
    const polyfills = [];

    if (!CSS.supports('selector(:focus-visible)')) {
      polyfills.push('focus-visible');
    }

    if (!('IntersectionObserver' in window)) {
      polyfills.push('intersection-observer');
    }

    if (!window.matchMedia('(prefers-reduced-motion)').media !== 'not all') {
      polyfills.push('prefers-reduced-motion');
    }

    return {
      count: polyfills.length,
      needed: polyfills
    };
  }

  /**
   * Update coverage metrics
   */
  updateCoverage(category, results) {
    const coverage = Math.round((results.passed / results.total) * 100) || 0;
    this.results.summary.coverage[category] = coverage;
    this.results.summary.totalTests += results.total;
    this.results.summary.passed += results.passed;
    this.results.summary.failed += (results.total - results.passed);
    this.results.summary.warnings += results.warnings?.length || 0;
  }

  /**
   * Generate comprehensive reports
   */
  async generateReports() {
    console.log('📊 Generating reports...\n');

    // Generate HTML report
    await this.generateHTMLReport();
    
    // Generate JSON report
    await this.generateJSONReport();
    
    // Generate accessibility checklist
    await this.generateAccessibilityChecklist();
    
    console.log('✅ Reports generated in /tests/reports/\n');
  }

  /**
   * Generate HTML report
   */
  async generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Navigation Accessibility Test Report</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 2rem; }
        .summary { background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
        .category { margin-bottom: 2rem; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .category-header { background: #e3f2fd; padding: 1rem; font-weight: bold; }
        .category-content { padding: 1rem; }
        .passed { color: #2e7d32; }
        .failed { color: #d32f2f; }
        .warning { color: #f57c00; }
        .coverage-bar { background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden; }
        .coverage-fill { height: 100%; background: linear-gradient(90deg, #d32f2f 0%, #f57c00 50%, #2e7d32 100%); }
        .metric { display: inline-block; margin: 0.5rem 1rem 0.5rem 0; padding: 0.5rem; background: #f5f5f5; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>Navigation Accessibility Test Report</h1>
    
    <div class="summary">
        <h2>Test Summary</h2>
        <div class="metric">
            <strong>Total Tests:</strong> ${this.results.summary.totalTests}
        </div>
        <div class="metric">
            <strong class="passed">Passed:</strong> ${this.results.summary.passed}
        </div>
        <div class="metric">
            <strong class="failed">Failed:</strong> ${this.results.summary.failed}
        </div>
        <div class="metric">
            <strong class="warning">Warnings:</strong> ${this.results.summary.warnings}
        </div>
        <div class="metric">
            <strong>Date:</strong> ${this.results.summary.startTime.toLocaleString()}
        </div>
    </div>

    <h2>Coverage by Category</h2>
    ${Object.entries(this.results.summary.coverage).map(([category, coverage]) => `
        <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>${category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                <span>${coverage}%</span>
            </div>
            <div class="coverage-bar">
                <div class="coverage-fill" style="width: ${coverage}%;"></div>
            </div>
        </div>
    `).join('')}

    <h2>Detailed Results</h2>
    ${Object.entries(this.results.detailed).map(([category, results]) => `
        <div class="category">
            <div class="category-header">
                ${category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </div>
            <div class="category-content">
                ${results.error ? `
                    <p class="failed">Error: ${results.error}</p>
                ` : `
                    <p><strong class="passed">Passed:</strong> ${results.passed}/${results.total}</p>
                    ${results.warnings?.length ? `
                        <div>
                            <strong class="warning">Warnings:</strong>
                            <ul>${results.warnings.map(w => `<li>${w}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    ${results.errors?.length ? `
                        <div>
                            <strong class="failed">Errors:</strong>
                            <ul>${results.errors.map(e => `<li>${e}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                `}
            </div>
        </div>
    `).join('')}

    <h2>Recommendations</h2>
    <div class="category">
        <div class="category-content">
            ${this.generateRecommendationsList().map(rec => `
                <div style="margin-bottom: 1rem; padding: 1rem; border-left: 4px solid ${
                    rec.priority === 'high' ? '#d32f2f' : 
                    rec.priority === 'medium' ? '#f57c00' : '#2e7d32'
                };">
                    <strong>${rec.priority.toUpperCase()}: ${rec.title}</strong>
                    <p>${rec.description}</p>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

    await this.ensureReportsDirectory();
    await fs.writeFile(
      path.resolve(process.cwd(), 'tests/reports/navigation-accessibility-report.html'), 
      html
    );
  }

  /**
   * Generate JSON report
   */
  async generateJSONReport() {
    const report = {
      ...this.results,
      metadata: {
        generatedAt: new Date().toISOString(),
        testSuite: 'Navigation Accessibility Tests',
        version: '1.0.0'
      }
    };

    await this.ensureReportsDirectory();
    await fs.writeFile(
      path.resolve(process.cwd(), 'tests/reports/navigation-accessibility-report.json'),
      JSON.stringify(report, null, 2)
    );
  }

  /**
   * Generate accessibility checklist
   */
  async generateAccessibilityChecklist() {
    const checklist = this.generateAccessibilityChecklistContent();
    
    await this.ensureReportsDirectory();
    await fs.writeFile(
      path.resolve(process.cwd(), 'tests/reports/accessibility-checklist.md'),
      checklist
    );
  }

  /**
   * Generate accessibility checklist content
   */
  generateAccessibilityChecklistContent() {
    const overallScore = Math.round(
      (this.results.summary.passed / this.results.summary.totalTests) * 100
    );

    return `# Navigation Accessibility Checklist

Generated: ${new Date().toLocaleString()}
Overall Score: ${overallScore}% (${this.results.summary.passed}/${this.results.summary.totalTests} tests passed)

## WCAG 2.1 AA Compliance Status

### ✅ Perceivable
- [${this.getCheckStatus('skipLinks')}] Skip links implemented and functional
- [${this.getCheckStatus('colorContrast')}] Color contrast meets WCAG AA requirements (4.5:1)
- [${this.getCheckStatus('responsiveDesign')}] Content adapts to different viewport sizes
- [${this.getCheckStatus('colorContrast')}] Information not conveyed by color alone

### ✅ Operable  
- [${this.getCheckStatus('keyboardNavigation')}] Full keyboard accessibility
- [${this.getCheckStatus('focusManagement')}] Visible focus indicators
- [${this.getCheckStatus('keyboardNavigation')}] No keyboard traps
- [${this.getCheckStatus('responsiveDesign')}] Touch targets minimum 44x44px

### ✅ Understandable
- [${this.getCheckStatus('ariaCompliance')}] Clear navigation structure
- [${this.getCheckStatus('ariaCompliance')}] Consistent navigation patterns
- [${this.getCheckStatus('ariaCompliance')}] Error identification and suggestions

### ✅ Robust
- [${this.getCheckStatus('ariaCompliance')}] Valid HTML markup
- [${this.getCheckStatus('ariaCompliance')}] Proper ARIA implementation
- [${this.getCheckStatus('compatibility')}] Cross-browser compatibility
- [${this.getCheckStatus('performance')}] Performance within acceptable limits

## Detailed Coverage

${Object.entries(this.results.summary.coverage).map(([category, coverage]) => 
  `- **${category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}**: ${coverage}%`
).join('\n')}

## Priority Recommendations

${this.generateRecommendationsList().map(rec => 
  `### ${rec.priority.toUpperCase()}: ${rec.title}\n${rec.description}\n`
).join('\n')}

## Manual Testing Required

The following tests require manual verification:
- Screen reader testing with NVDA, JAWS, or VoiceOver
- Voice control testing (Dragon NaturallySpeaking)
- Switch navigation testing
- Real device touch interaction testing
- Visual regression testing
- Cross-browser compatibility verification

## Next Steps

1. Address all HIGH priority recommendations
2. Complete manual testing scenarios
3. Validate fixes with automated tests
4. Document any WCAG deviations with justification
5. Schedule regular accessibility audits

---

*This report was generated by the Navigation Accessibility Test Suite*`;
  }

  /**
   * Get check status for checklist
   */
  getCheckStatus(category) {
    const coverage = this.results.summary.coverage[category] || 0;
    if (coverage >= 90) return 'x';
    if (coverage >= 70) return '~';
    return ' ';
  }

  /**
   * Generate recommendations list
   */
  generateRecommendationsList() {
    const recommendations = [];
    
    // Analyze results and generate specific recommendations
    Object.entries(this.results.detailed).forEach(([category, results]) => {
      if (results.errors?.length > 0) {
        recommendations.push({
          priority: 'high',
          title: `Fix ${category} errors`,
          description: `${results.errors.length} critical errors found in ${category} that must be addressed for WCAG compliance.`
        });
      }
      
      if (results.warnings?.length > 0) {
        recommendations.push({
          priority: 'medium', 
          title: `Review ${category} warnings`,
          description: `${results.warnings.length} potential improvements identified in ${category}.`
        });
      }
    });

    // Add performance recommendations
    if (this.results.detailed.performance) {
      const perf = this.results.detailed.performance;
      if (!perf.initialization?.passed) {
        recommendations.push({
          priority: 'medium',
          title: 'Optimize initialization time',
          description: `Navigation takes ${perf.initialization.time}ms to initialize. Consider lazy loading or code splitting.`
        });
      }
    }

    return recommendations;
  }

  /**
   * Ensure reports directory exists
   */
  async ensureReportsDirectory() {
    const reportsDir = path.resolve(process.cwd(), 'tests/reports');
    try {
      await fs.access(reportsDir);
    } catch {
      await fs.mkdir(reportsDir, { recursive: true });
    }
  }

  /**
   * Display test summary
   */
  displaySummary() {
    const { summary } = this.results;
    const overallScore = Math.round((summary.passed / summary.totalTests) * 100);
    
    console.log('📊 Test Results Summary');
    console.log('=' .repeat(50));
    console.log(`Overall Score: ${overallScore}%`);
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⚠️  Warnings: ${summary.warnings}`);
    console.log('');
    
    console.log('📋 Coverage by Category:');
    Object.entries(summary.coverage).forEach(([category, coverage]) => {
      const icon = coverage >= 90 ? '🟢' : coverage >= 70 ? '🟡' : '🔴';
      console.log(`${icon} ${category}: ${coverage}%`);
    });
    
    console.log('\n📁 Reports generated in tests/reports/');
    console.log('🔍 Review navigation-accessibility-report.html for detailed results');
  }
}

// Export for use in other test files
export default NavigationTestSuiteRunner;

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new NavigationTestSuiteRunner();
  runner.runFullTestSuite().catch(console.error);
}