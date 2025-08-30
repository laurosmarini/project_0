/**
 * Browser Compatibility Testing Matrix
 * Tests theme functionality across different browsers and versions
 */

class BrowserCompatibilityMatrix {
  constructor() {
    this.browserData = {
      chrome: { name: 'Chrome', engine: 'Blink' },
      firefox: { name: 'Firefox', engine: 'Gecko' },
      safari: { name: 'Safari', engine: 'WebKit' },
      edge: { name: 'Edge', engine: 'Blink' }
    };

    this.features = {
      customProperties: 'CSS Custom Properties (CSS Variables)',
      hasSelector: ':has() Selector',
      colorScheme: 'color-scheme Property',
      prefersColorScheme: '@media (prefers-color-scheme)',
      prefersReducedMotion: '@media (prefers-reduced-motion)', 
      prefersContrast: '@media (prefers-contrast)',
      localStorage: 'localStorage API',
      matchMedia: 'matchMedia API',
      transitionEvents: 'CSS Transition Events',
      focusVisible: ':focus-visible Pseudo-class'
    };

    this.testResults = {};
  }

  async runCompatibilityTests() {
    console.log('🌐 Running Browser Compatibility Tests...');

    const currentBrowser = this.detectBrowser();
    console.log(`Testing in: ${currentBrowser.name} ${currentBrowser.version}`);

    // Test core features
    await this.testCSSFeatures();
    await this.testJavaScriptAPIs();
    await this.testThemeImplementation();
    await this.testFallbacks();

    return this.generateCompatibilityReport();
  }

  detectBrowser() {
    const userAgent = navigator.userAgent;
    let browser = { name: 'Unknown', version: 'Unknown', engine: 'Unknown' };

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      const version = userAgent.match(/Chrome\/(\d+)/);
      browser = { 
        name: 'Chrome', 
        version: version ? version[1] : 'Unknown',
        engine: 'Blink'
      };
    } else if (userAgent.includes('Firefox')) {
      const version = userAgent.match(/Firefox\/(\d+)/);
      browser = { 
        name: 'Firefox', 
        version: version ? version[1] : 'Unknown',
        engine: 'Gecko'
      };
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      const version = userAgent.match(/Version\/(\d+)/);
      browser = { 
        name: 'Safari', 
        version: version ? version[1] : 'Unknown',
        engine: 'WebKit'
      };
    } else if (userAgent.includes('Edg')) {
      const version = userAgent.match(/Edg\/(\d+)/);
      browser = { 
        name: 'Edge', 
        version: version ? version[1] : 'Unknown',
        engine: 'Blink'
      };
    }

    return browser;
  }

  async testCSSFeatures() {
    const results = {};

    // Test CSS Custom Properties
    results.customProperties = this.testCustomProperties();
    
    // Test :has() selector
    results.hasSelector = this.testHasSelector();
    
    // Test color-scheme property
    results.colorScheme = this.testColorSchemeProperty();
    
    // Test media queries
    results.prefersColorScheme = this.testPrefersColorScheme();
    results.prefersReducedMotion = this.testPrefersReducedMotion();
    results.prefersContrast = this.testPrefersContrast();
    
    // Test :focus-visible
    results.focusVisible = this.testFocusVisible();

    this.testResults.cssFeatures = results;
    return results;
  }

  testCustomProperties() {
    try {
      // Create test element
      const testElement = document.createElement('div');
      testElement.style.cssText = '--test-var: red; color: var(--test-var);';
      document.body.appendChild(testElement);

      const computedColor = getComputedStyle(testElement).color;
      const supported = computedColor === 'red' || computedColor === 'rgb(255, 0, 0)';

      document.body.removeChild(testElement);

      return {
        supported,
        level: 'full',
        notes: supported ? 'CSS Variables fully supported' : 'CSS Variables not supported'
      };
    } catch (error) {
      return {
        supported: false,
        level: 'none',
        notes: `Error testing CSS Variables: ${error.message}`
      };
    }
  }

  testHasSelector() {
    try {
      // Test :has() support
      const supported = CSS.supports('selector(:has(input))');
      
      return {
        supported,
        level: supported ? 'full' : 'none',
        notes: supported ? ':has() selector supported' : 'Fallback to checkbox hack method',
        fallback: !supported ? 'Adjacent sibling selector with checkbox hack' : null
      };
    } catch (error) {
      return {
        supported: false,
        level: 'none',
        notes: 'CSS.supports not available or :has() not supported',
        fallback: 'Adjacent sibling selector with checkbox hack'
      };
    }
  }

  testColorSchemeProperty() {
    try {
      const supported = CSS.supports('color-scheme', 'light dark');
      
      return {
        supported,
        level: supported ? 'full' : 'partial',
        notes: supported ? 'color-scheme property supported' : 'Manual theme switching only'
      };
    } catch (error) {
      return {
        supported: false,
        level: 'none',
        notes: 'color-scheme property not supported'
      };
    }
  }

  testPrefersColorScheme() {
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const supported = mediaQuery.media !== 'not all';
      
      return {
        supported,
        level: supported ? 'full' : 'none',
        notes: supported ? 'System preference detection works' : 'No system preference detection',
        currentPreference: supported ? (mediaQuery.matches ? 'dark' : 'light') : 'unknown'
      };
    } catch (error) {
      return {
        supported: false,
        level: 'none',
        notes: `Error testing prefers-color-scheme: ${error.message}`
      };
    }
  }

  testPrefersReducedMotion() {
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const supported = mediaQuery.media !== 'not all';
      
      return {
        supported,
        level: supported ? 'full' : 'none',
        notes: supported ? 'Reduced motion preference detected' : 'No reduced motion detection',
        currentPreference: supported ? (mediaQuery.matches ? 'reduce' : 'no-preference') : 'unknown'
      };
    } catch (error) {
      return {
        supported: false,
        level: 'none',
        notes: `Error testing prefers-reduced-motion: ${error.message}`
      };
    }
  }

  testPrefersContrast() {
    try {
      const mediaQuery = window.matchMedia('(prefers-contrast: high)');
      const supported = mediaQuery.media !== 'not all';
      
      return {
        supported,
        level: supported ? 'full' : 'none',
        notes: supported ? 'High contrast preference supported' : 'No contrast preference detection',
        currentPreference: supported ? (mediaQuery.matches ? 'high' : 'normal') : 'unknown'
      };
    } catch (error) {
      return {
        supported: false,
        level: 'none',
        notes: `Error testing prefers-contrast: ${error.message}`
      };
    }
  }

  testFocusVisible() {
    try {
      // Test :focus-visible support
      const testElement = document.createElement('button');
      document.body.appendChild(testElement);
      
      testElement.focus();
      const supported = testElement.matches(':focus-visible');
      
      document.body.removeChild(testElement);
      
      return {
        supported,
        level: supported ? 'full' : 'partial',
        notes: supported ? ':focus-visible supported' : 'Falls back to :focus',
        fallback: !supported ? ':focus pseudo-class' : null
      };
    } catch (error) {
      return {
        supported: false,
        level: 'none',
        notes: ':focus-visible not supported, using :focus fallback'
      };
    }
  }

  async testJavaScriptAPIs() {
    const results = {};

    // Test localStorage
    results.localStorage = this.testLocalStorage();
    
    // Test matchMedia API
    results.matchMedia = this.testMatchMedia();
    
    // Test CSS transition events
    results.transitionEvents = this.testTransitionEvents();

    this.testResults.javascriptAPIs = results;
    return results;
  }

  testLocalStorage() {
    try {
      const testKey = 'browser-compat-test';
      localStorage.setItem(testKey, 'test');
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      return {
        supported: retrieved === 'test',
        level: 'full',
        notes: 'localStorage fully functional'
      };
    } catch (error) {
      return {
        supported: false,
        level: 'none',
        notes: `localStorage not available: ${error.message}`,
        fallback: 'In-memory storage only'
      };
    }
  }

  testMatchMedia() {
    try {
      const supported = typeof window.matchMedia === 'function';
      
      if (supported) {
        const testQuery = window.matchMedia('(min-width: 1px)');
        const fullySupported = testQuery && typeof testQuery.matches === 'boolean';
        
        return {
          supported: fullySupported,
          level: 'full',
          notes: 'matchMedia API fully supported'
        };
      }
      
      return {
        supported: false,
        level: 'none',
        notes: 'matchMedia API not available',
        fallback: 'Static theme detection only'
      };
    } catch (error) {
      return {
        supported: false,
        level: 'none',
        notes: `matchMedia API error: ${error.message}`
      };
    }
  }

  testTransitionEvents() {
    try {
      const testElement = document.createElement('div');
      const supported = 'ontransitionend' in testElement || 
                       'onwebkittransitionend' in testElement ||
                       'onmstransitionend' in testElement ||
                       'onotransitionend' in testElement;
      
      return {
        supported,
        level: supported ? 'full' : 'partial',
        notes: supported ? 'CSS transition events supported' : 'Limited transition event support'
      };
    } catch (error) {
      return {
        supported: false,
        level: 'none',
        notes: `Transition events error: ${error.message}`
      };
    }
  }

  async testThemeImplementation() {
    const results = {};

    // Test theme toggle functionality
    results.themeToggle = await this.testThemeToggleFunctionality();
    
    // Test theme persistence
    results.persistence = this.testThemePersistence();
    
    // Test smooth transitions
    results.transitions = this.testSmoothTransitions();

    this.testResults.themeImplementation = results;
    return results;
  }

  async testThemeToggleFunctionality() {
    try {
      const originalTheme = document.documentElement.getAttribute('data-theme');
      
      // Test programmatic theme switching
      document.documentElement.setAttribute('data-theme', 'dark');
      const darkApplied = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-scheme').trim() === 'dark';
      
      document.documentElement.setAttribute('data-theme', 'light');
      const lightApplied = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-scheme').trim() === 'light';
      
      // Restore original theme
      if (originalTheme) {
        document.documentElement.setAttribute('data-theme', originalTheme);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      
      return {
        supported: darkApplied && lightApplied,
        level: 'full',
        notes: 'Theme switching works correctly',
        darkMode: darkApplied,
        lightMode: lightApplied
      };
    } catch (error) {
      return {
        supported: false,
        level: 'none',
        notes: `Theme toggle error: ${error.message}`
      };
    }
  }

  testThemePersistence() {
    const localStorageSupported = this.testResults.javascriptAPIs?.localStorage?.supported ?? this.testLocalStorage().supported;
    
    return {
      supported: localStorageSupported,
      level: localStorageSupported ? 'full' : 'session-only',
      notes: localStorageSupported ? 
        'Theme persists across browser sessions' : 
        'Theme only persists within current session'
    };
  }

  testSmoothTransitions() {
    try {
      const testElement = document.createElement('div');
      testElement.style.cssText = `
        transition: background-color 0.3s ease;
        background-color: var(--color-background);
      `;
      document.body.appendChild(testElement);
      
      const hasTransition = getComputedStyle(testElement).transition !== 'all 0s ease 0s';
      
      document.body.removeChild(testElement);
      
      return {
        supported: hasTransition,
        level: 'full',
        notes: hasTransition ? 'Smooth theme transitions supported' : 'Instant theme switching only'
      };
    } catch (error) {
      return {
        supported: false,
        level: 'none',
        notes: `Transition test error: ${error.message}`
      };
    }
  }

  async testFallbacks() {
    const results = {};

    // Test checkbox hack fallback
    results.checkboxHack = this.testCheckboxHackFallback();
    
    // Test no-JS fallback
    results.noJavaScript = this.testNoJavaScriptFallback();
    
    // Test old browser support
    results.oldBrowsers = this.testOldBrowserSupport();

    this.testResults.fallbacks = results;
    return results;
  }

  testCheckboxHackFallback() {
    try {
      // Test if checkbox hack works without :has() selector
      const testHTML = `
        <div class="test-toggle">
          <input type="checkbox" id="test-checkbox" class="theme-toggle-input">
          <label for="test-checkbox" class="theme-toggle-btn">
            <span class="icon-sun">☀️</span>
            <span class="icon-moon" style="display: none;">🌙</span>
          </label>
        </div>
      `;
      
      const testContainer = document.createElement('div');
      testContainer.innerHTML = testHTML;
      document.body.appendChild(testContainer);
      
      const checkbox = testContainer.querySelector('#test-checkbox');
      const sunIcon = testContainer.querySelector('.icon-sun');
      const moonIcon = testContainer.querySelector('.icon-moon');
      
      // Test checkbox hack CSS
      const style = document.createElement('style');
      style.textContent = `
        .test-toggle input:checked + label .icon-sun { display: none; }
        .test-toggle input:checked + label .icon-moon { display: inline; }
      `;
      document.head.appendChild(style);
      
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
      
      const sunHidden = getComputedStyle(sunIcon).display === 'none';
      const moonVisible = getComputedStyle(moonIcon).display === 'inline';
      
      // Cleanup
      document.body.removeChild(testContainer);
      document.head.removeChild(style);
      
      return {
        supported: sunHidden && moonVisible,
        level: 'full',
        notes: 'Checkbox hack fallback works correctly'
      };
    } catch (error) {
      return {
        supported: false,
        level: 'none',
        notes: `Checkbox hack test error: ${error.message}`
      };
    }
  }

  testNoJavaScriptFallback() {
    // In a real scenario, this would test with JS disabled
    // For now, we check if CSS-only functionality exists
    
    const hasCheckboxHack = document.querySelector('.theme-toggle-input');
    const hasCSSMediaQueries = this.testResults.cssFeatures?.prefersColorScheme?.supported;
    
    return {
      supported: !!(hasCheckboxHack && hasCSSMediaQueries),
      level: 'partial',
      notes: hasCheckboxHack && hasCSSMediaQueries ? 
        'Basic theme switching works without JavaScript' :
        'JavaScript required for full functionality'
    };
  }

  testOldBrowserSupport() {
    const browser = this.detectBrowser();
    const customPropsSupported = this.testResults.cssFeatures?.customProperties?.supported ?? false;
    
    // Define minimum version requirements
    const minVersions = {
      'Chrome': 49,
      'Firefox': 31,
      'Safari': 9,
      'Edge': 16
    };
    
    const currentVersion = parseInt(browser.version);
    const minVersion = minVersions[browser.name];
    const meetsMinRequirement = minVersion ? currentVersion >= minVersion : false;
    
    return {
      supported: customPropsSupported && meetsMinRequirement,
      level: customPropsSupported ? 'full' : 'limited',
      notes: `${browser.name} ${browser.version}: ${
        meetsMinRequirement ? 'Meets minimum requirements' : 'May need polyfills'
      }`,
      minVersion: minVersion || 'Unknown',
      needsPolyfill: !customPropsSupported
    };
  }

  generateCompatibilityReport() {
    const browser = this.detectBrowser();
    
    const overallCompatibility = this.calculateOverallCompatibility();
    
    const report = {
      meta: {
        timestamp: new Date().toISOString(),
        browser: browser,
        userAgent: navigator.userAgent,
        testVersion: '1.0.0'
      },
      compatibility: overallCompatibility,
      detailedResults: this.testResults,
      browserMatrix: this.generateBrowserMatrix(),
      recommendations: this.generateRecommendations(),
      summary: this.generateSummary()
    };

    return report;
  }

  calculateOverallCompatibility() {
    const weights = {
      cssFeatures: 0.4,
      javascriptAPIs: 0.3,
      themeImplementation: 0.2,
      fallbacks: 0.1
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(this.testResults).forEach(([category, results]) => {
      const categoryScore = this.calculateCategoryScore(results);
      const weight = weights[category] || 0;
      
      totalScore += categoryScore * weight;
      totalWeight += weight;
    });

    const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    
    return {
      score: Math.round(overallScore),
      grade: this.getGradeFromScore(overallScore),
      level: this.getCompatibilityLevel(overallScore)
    };
  }

  calculateCategoryScore(results) {
    const scores = Object.values(results).map(result => {
      if (result.supported) return 100;
      if (result.level === 'partial') return 70;
      if (result.fallback) return 50;
      return 0;
    });

    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  }

  getGradeFromScore(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  }

  getCompatibilityLevel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Limited';
    return 'Poor';
  }

  generateBrowserMatrix() {
    // This would ideally test across multiple browsers
    // For now, return estimated compatibility based on known features
    
    return {
      'Chrome 90+': { score: 100, support: 'Full', notes: 'All features supported' },
      'Firefox 85+': { score: 95, support: 'Full', notes: 'Excellent support with minor differences' },
      'Safari 14+': { score: 90, support: 'Full', notes: 'Good support, may lag on newest features' },
      'Edge 90+': { score: 100, support: 'Full', notes: 'Same as Chrome (Chromium-based)' },
      'Chrome 49-89': { score: 80, support: 'Good', notes: 'Most features work, some may need polyfills' },
      'Firefox 31-84': { score: 75, support: 'Good', notes: 'Core functionality works well' },
      'Safari 9-13': { score: 70, support: 'Fair', notes: 'Basic functionality, limited advanced features' },
      'IE11': { score: 30, support: 'Poor', notes: 'Requires extensive polyfills' }
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Check CSS features
    const cssResults = this.testResults.cssFeatures || {};
    if (!cssResults.hasSelector?.supported) {
      recommendations.push({
        priority: 'Low',
        category: 'CSS',
        issue: ':has() selector not supported',
        solution: 'Checkbox hack fallback is already implemented'
      });
    }

    if (!cssResults.prefersColorScheme?.supported) {
      recommendations.push({
        priority: 'Medium',
        category: 'CSS',
        issue: 'System preference detection not supported',
        solution: 'Consider providing manual theme selection UI'
      });
    }

    // Check JavaScript APIs
    const jsResults = this.testResults.javascriptAPIs || {};
    if (!jsResults.localStorage?.supported) {
      recommendations.push({
        priority: 'High',
        category: 'JavaScript',
        issue: 'localStorage not supported',
        solution: 'Implement session storage fallback or cookie-based persistence'
      });
    }

    // Old browser support
    const fallbackResults = this.testResults.fallbacks || {};
    if (!fallbackResults.oldBrowsers?.supported) {
      recommendations.push({
        priority: 'Medium',
        category: 'Legacy Support',
        issue: 'Limited support for older browsers',
        solution: 'Consider CSS custom property polyfills for IE11 support'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'Info',
        category: 'Status',
        issue: 'No compatibility issues found',
        solution: 'Theme implementation is fully compatible'
      });
    }

    return recommendations;
  }

  generateSummary() {
    const browser = this.detectBrowser();
    const compatibility = this.calculateOverallCompatibility();
    
    return {
      browser: `${browser.name} ${browser.version}`,
      overallScore: compatibility.score,
      level: compatibility.level,
      production: compatibility.score >= 80 ? 'Ready' : 'Needs work',
      keyFindings: [
        `CSS Custom Properties: ${this.testResults.cssFeatures?.customProperties?.supported ? 'Supported' : 'Not supported'}`,
        `System Preferences: ${this.testResults.cssFeatures?.prefersColorScheme?.supported ? 'Supported' : 'Not supported'}`,
        `Theme Persistence: ${this.testResults.javascriptAPIs?.localStorage?.supported ? 'Supported' : 'Limited'}`,
        `Fallback Support: ${this.testResults.fallbacks?.checkboxHack?.supported ? 'Available' : 'Limited'}`
      ]
    };
  }
}

// Export for testing frameworks
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrowserCompatibilityMatrix;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.BrowserCompatibilityMatrix = BrowserCompatibilityMatrix;
}