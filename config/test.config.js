/**
 * Test Configuration for Pricing Table Test Suite
 * Centralizes test settings, environments, and utilities
 */

const { devices } = require('playwright');

module.exports = {
  // Test Environment Configuration
  testEnvironment: {
    baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
    timeout: parseInt(process.env.TEST_TIMEOUT) || 30000,
    retries: parseInt(process.env.TEST_RETRIES) || 2,
    workers: parseInt(process.env.TEST_WORKERS) || 4
  },

  // Browser Configuration
  browsers: {
    chromium: {
      name: 'chromium',
      use: {
        headless: process.env.HEADLESS !== 'false',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
      }
    },
    firefox: {
      name: 'firefox',
      use: {
        headless: process.env.HEADLESS !== 'false',
        screenshot: 'only-on-failure'
      }
    },
    webkit: {
      name: 'webkit',
      use: {
        headless: process.env.HEADLESS !== 'false',
        screenshot: 'only-on-failure'
      }
    }
  },

  // Device Testing Configuration
  devices: {
    mobile: [
      { name: 'iPhone 12', ...devices['iPhone 12'] },
      { name: 'iPhone SE', ...devices['iPhone SE'] },
      { name: 'Pixel 5', ...devices['Pixel 5'] },
      { name: 'Galaxy S21', ...devices['Galaxy S21'] }
    ],
    tablet: [
      { name: 'iPad Pro', ...devices['iPad Pro'] },
      { name: 'iPad Mini', ...devices['iPad Mini'] }
    ],
    desktop: [
      { 
        name: 'Desktop 1080p', 
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1
      },
      { 
        name: 'Desktop 1440p', 
        viewport: { width: 2560, height: 1440 },
        deviceScaleFactor: 1
      }
    ]
  },

  // Responsive Breakpoints
  breakpoints: {
    mobile: { width: 375, height: 667 },
    mobileLarge: { width: 414, height: 896 },
    tablet: { width: 768, height: 1024 },
    tabletLandscape: { width: 1024, height: 768 },
    desktop: { width: 1200, height: 800 },
    desktopLarge: { width: 1920, height: 1080 }
  },

  // Visual Regression Testing
  visualRegression: {
    threshold: 0.1, // 10% difference threshold
    screenshotDir: './tests/screenshots',
    baselineDir: './tests/screenshots/baseline',
    diffDir: './tests/screenshots/diff',
    updateBaseline: process.env.UPDATE_BASELINE === 'true'
  },

  // Accessibility Testing
  accessibility: {
    rules: {
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-management': { enabled: true },
      'aria-labels': { enabled: true },
      'heading-order': { enabled: true },
      'landmark-roles': { enabled: true },
      'image-alt': { enabled: true },
      'form-labels': { enabled: true }
    },
    standards: ['WCAG21AA'],
    reportFormat: 'html'
  },

  // Performance Testing
  performance: {
    thresholds: {
      lcp: 2500, // Largest Contentful Paint (ms)
      fid: 100,  // First Input Delay (ms)
      cls: 0.1,  // Cumulative Layout Shift
      ttfb: 600, // Time to First Byte (ms)
      loadTime: 4000, // Overall load time (ms)
      mobileLoadTime: 6000 // Mobile load time (ms)
    },
    lighthouse: {
      performanceScore: 70, // Minimum Lighthouse performance score
      accessibilityScore: 90,
      bestPracticesScore: 80,
      seoScore: 80
    },
    coreWebVitals: {
      enabled: true,
      collectMetrics: true
    }
  },

  // Network Conditions for Testing
  networkConditions: {
    fast3g: {
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8, // 750 Kbps
      latency: 40 // 40ms
    },
    slow3g: {
      downloadThroughput: 500 * 1024 / 8, // 500 Kbps
      uploadThroughput: 500 * 1024 / 8, // 500 Kbps
      latency: 400 // 400ms
    },
    offline: {
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0
    }
  },

  // Test Data
  testData: {
    pricingPlans: [
      {
        name: 'Basic',
        price: '$9.99',
        features: ['Feature 1', 'Feature 2', 'Feature 3']
      },
      {
        name: 'Pro',
        price: '$19.99',
        features: ['All Basic features', 'Feature 4', 'Feature 5']
      },
      {
        name: 'Enterprise',
        price: '$39.99',
        features: ['All Pro features', 'Feature 6', 'Feature 7']
      }
    ],
    billingPeriods: ['monthly', 'yearly'],
    currencies: ['USD', 'EUR', 'GBP']
  },

  // Test Selectors (Page Object Model)
  selectors: {
    pricingTable: '.pricing-table',
    pricingCard: '.pricing-card',
    price: '.price',
    features: '.feature-list',
    ctaButton: '.cta-button, [data-testid*="cta"]',
    billingToggle: '[data-testid="billing-toggle"], .billing-switch',
    featureComparison: '[data-testid="feature-comparison"], .feature-toggle',
    mobileMenu: '.mobile-menu-toggle, [data-testid="mobile-menu"]',
    modal: '[role="dialog"], .modal',
    modalClose: '[data-testid="modal-close"], .modal-close'
  },

  // Test Utilities
  utilities: {
    // Wait times for different scenarios
    waitTimes: {
      short: 300,
      medium: 500,
      long: 1000,
      veryLong: 2000
    },
    
    // Custom assertions
    customMatchers: {
      toBeVisible: async (element) => {
        const box = await element.boundingBox();
        return box && box.width > 0 && box.height > 0;
      },
      
      toHaveValidPrice: (priceText) => {
        return /^\$\d+(\.\d{2})?/.test(priceText);
      },
      
      toMeetPerformanceThreshold: (metric, threshold) => {
        return metric <= threshold;
      }
    }
  },

  // Reporting Configuration
  reporting: {
    outputDir: './test-results',
    formats: ['html', 'json', 'junit'],
    includeScreenshots: true,
    includeVideos: process.env.CI === 'true',
    generateReport: true,
    
    // Custom report sections
    sections: {
      visualRegression: true,
      accessibility: true,
      performance: true,
      crossBrowser: true,
      mobile: true
    }
  },

  // CI/CD Configuration
  ci: {
    parallel: process.env.CI === 'true',
    retries: process.env.CI === 'true' ? 3 : 1,
    workers: process.env.CI === 'true' ? 2 : 4,
    timeout: process.env.CI === 'true' ? 60000 : 30000,
    
    // Fail fast on CI
    failFast: process.env.CI === 'true',
    
    // Artifact collection
    artifacts: {
      screenshots: true,
      videos: true,
      traces: true,
      reports: true
    }
  },

  // Debug Configuration
  debug: {
    slowMo: process.env.DEBUG === 'true' ? 100 : 0,
    devtools: process.env.DEBUG === 'true',
    verbose: process.env.VERBOSE === 'true',
    
    // Debug specific test types
    visualRegression: process.env.DEBUG_VISUAL === 'true',
    accessibility: process.env.DEBUG_A11Y === 'true',
    performance: process.env.DEBUG_PERF === 'true'
  },

  // Hook Functions
  hooks: {
    beforeAll: async () => {
      console.log('🧪 Starting Pricing Table Test Suite');
      console.log('📊 Environment:', process.env.NODE_ENV || 'test');
    },
    
    afterAll: async () => {
      console.log('✅ Test Suite Completed');
    },
    
    beforeEach: async (testInfo) => {
      console.log(`🔍 Running: ${testInfo.title}`);
    },
    
    afterEach: async (testInfo) => {
      if (testInfo.status === 'failed') {
        console.log(`❌ Failed: ${testInfo.title}`);
      } else {
        console.log(`✅ Passed: ${testInfo.title}`);
      }
    }
  }
};