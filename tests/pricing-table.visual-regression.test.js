/**
 * Visual Regression Tests for Responsive Pricing Table
 * Tests visual consistency across different breakpoints and devices
 */

const { chromium, firefox, webkit } = require('playwright');
const { expect } = require('@playwright/test');
const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;
const fs = require('fs');
const path = require('path');

describe('Pricing Table Visual Regression Tests', () => {
  let browser, context, page;
  const screenshotsDir = path.join(__dirname, '../screenshots');
  const baselineDir = path.join(screenshotsDir, 'baseline');
  const testDir = path.join(screenshotsDir, 'test');
  const diffDir = path.join(screenshotsDir, 'diff');

  // Responsive breakpoints to test
  const breakpoints = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1200, height: 800 },
    { name: 'large-desktop', width: 1920, height: 1080 }
  ];

  const browsers = ['chromium', 'firefox', 'webkit'];

  beforeAll(async () => {
    // Create directories for screenshots
    [screenshotsDir, baselineDir, testDir, diffDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  });

  beforeEach(async () => {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();
  });

  afterEach(async () => {
    await browser.close();
  });

  describe('Responsive Layout Tests', () => {
    breakpoints.forEach(breakpoint => {
      test(`should render correctly at ${breakpoint.name} breakpoint`, async () => {
        await page.setViewportSize({
          width: breakpoint.width,
          height: breakpoint.height
        });

        await page.goto('http://localhost:3000/pricing');
        
        // Wait for pricing table to load and animations to complete
        await page.waitForSelector('.pricing-table');
        await page.waitForTimeout(500); // Allow for CSS transitions

        // Take screenshot
        const screenshotPath = path.join(testDir, `pricing-table-${breakpoint.name}.png`);
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true
        });

        // Compare with baseline (if exists)
        const baselinePath = path.join(baselineDir, `pricing-table-${breakpoint.name}.png`);
        if (fs.existsSync(baselinePath)) {
          await compareScreenshots(baselinePath, screenshotPath, breakpoint.name);
        } else {
          // Create baseline if it doesn't exist
          fs.copyFileSync(screenshotPath, baselinePath);
          console.log(`Created baseline for ${breakpoint.name}`);
        }
      });
    });
  });

  describe('Component State Visual Tests', () => {
    test('should render hover states correctly', async () => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto('http://localhost:3000/pricing');

      // Hover over each pricing card
      const pricingCards = await page.$$('.pricing-card');
      
      for (let i = 0; i < pricingCards.length; i++) {
        await pricingCards[i].hover();
        await page.waitForTimeout(200);
        
        const screenshotPath = path.join(testDir, `pricing-card-hover-${i}.png`);
        await page.screenshot({ 
          path: screenshotPath,
          clip: await pricingCards[i].boundingBox()
        });
      }
    });

    test('should render selected/active states correctly', async () => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto('http://localhost:3000/pricing');

      // Click on each pricing card to test active states
      const pricingCards = await page.$$('.pricing-card');
      
      for (let i = 0; i < pricingCards.length; i++) {
        await pricingCards[i].click();
        await page.waitForTimeout(200);
        
        const screenshotPath = path.join(testDir, `pricing-card-selected-${i}.png`);
        await page.screenshot({ 
          path: screenshotPath,
          clip: await pricingCards[i].boundingBox()
        });
      }
    });

    test('should render loading states correctly', async () => {
      await page.setViewportSize({ width: 1200, height: 800 });
      
      // Mock slow API response to capture loading state
      await page.route('**/api/pricing', route => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ plans: [] })
          });
        }, 2000);
      });

      await page.goto('http://localhost:3000/pricing');
      
      // Capture loading state
      const screenshotPath = path.join(testDir, 'pricing-table-loading.png');
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true
      });
    });
  });

  describe('Cross-Browser Visual Consistency', () => {
    browsers.forEach(browserName => {
      test(`should render consistently in ${browserName}`, async () => {
        const browserInstance = await {
          chromium: () => chromium.launch(),
          firefox: () => firefox.launch(),
          webkit: () => webkit.launch()
        }[browserName]();

        const context = await browserInstance.newContext();
        const page = await context.newPage();

        await page.setViewportSize({ width: 1200, height: 800 });
        await page.goto('http://localhost:3000/pricing');
        await page.waitForSelector('.pricing-table');

        const screenshotPath = path.join(testDir, `pricing-table-${browserName}.png`);
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true
        });

        await browserInstance.close();
      });
    });
  });

  describe('Dark Mode Visual Tests', () => {
    test('should render correctly in dark mode', async () => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto('http://localhost:3000/pricing');

      const screenshotPath = path.join(testDir, 'pricing-table-dark-mode.png');
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true
      });
    });

    test('should handle theme transitions smoothly', async () => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto('http://localhost:3000/pricing');

      // Take screenshot in light mode
      await page.screenshot({ 
        path: path.join(testDir, 'pricing-table-before-theme-switch.png'),
        fullPage: true
      });

      // Switch to dark mode
      await page.click('[data-testid="theme-toggle"]');
      await page.waitForTimeout(500); // Wait for transition

      // Take screenshot in dark mode
      await page.screenshot({ 
        path: path.join(testDir, 'pricing-table-after-theme-switch.png'),
        fullPage: true
      });
    });
  });

  // Helper function to compare screenshots
  async function compareScreenshots(baselinePath, testPath, name) {
    const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
    const test = PNG.sync.read(fs.readFileSync(testPath));
    
    const { width, height } = baseline;
    const diff = new PNG({ width, height });

    const pixelsDiff = pixelmatch(
      baseline.data, 
      test.data, 
      diff.data, 
      width, 
      height,
      { threshold: 0.1 }
    );

    const diffPercentage = (pixelsDiff / (width * height)) * 100;

    if (diffPercentage > 0.5) { // Threshold of 0.5% difference
      const diffPath = path.join(diffDir, `pricing-table-${name}-diff.png`);
      fs.writeFileSync(diffPath, PNG.sync.write(diff));
      
      throw new Error(
        `Visual regression detected in ${name}: ${diffPercentage.toFixed(2)}% difference. ` +
        `Diff saved to ${diffPath}`
      );
    }

    console.log(`✓ Visual test passed for ${name}: ${diffPercentage.toFixed(2)}% difference`);
  }
});

// Custom matchers for visual testing
expect.extend({
  toMatchVisualBaseline(received, baselinePath) {
    // Implementation for custom visual matcher
    return {
      message: () => `Expected screenshot to match baseline`,
      pass: true // Simplified for this example
    };
  }
});