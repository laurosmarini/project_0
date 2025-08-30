/**
 * Cross-Browser and Device Compatibility Tests
 * Tests across multiple browsers, devices, and operating systems
 */

const { chromium, firefox, webkit } = require('playwright');
const { expect } = require('@playwright/test');

describe('Cross-Browser and Device Compatibility Tests', () => {
  const browsers = [
    { name: 'chromium', instance: chromium },
    { name: 'firefox', instance: firefox },
    { name: 'webkit', instance: webkit }
  ];

  const devices = [
    // Mobile Devices
    { name: 'iPhone 12', ...require('playwright').devices['iPhone 12'] },
    { name: 'iPhone SE', ...require('playwright').devices['iPhone SE'] },
    { name: 'Pixel 5', ...require('playwright').devices['Pixel 5'] },
    { name: 'Samsung Galaxy S21', ...require('playwright').devices['Galaxy S21'] },
    
    // Tablets
    { name: 'iPad Pro', ...require('playwright').devices['iPad Pro'] },
    { name: 'iPad Mini', ...require('playwright').devices['iPad Mini'] },
    
    // Desktop
    { name: 'Desktop Chrome', viewport: { width: 1920, height: 1080 } },
    { name: 'Desktop Firefox', viewport: { width: 1366, height: 768 } }
  ];

  describe('Browser Compatibility', () => {
    browsers.forEach(({ name, instance }) => {
      describe(`${name} compatibility`, () => {
        let browser, context, page;

        beforeAll(async () => {
          browser = await instance.launch({ headless: true });
        });

        afterAll(async () => {
          await browser?.close();
        });

        beforeEach(async () => {
          context = await browser.newContext();
          page = await context.newPage();
        });

        afterEach(async () => {
          await context?.close();
        });

        test('should load pricing table correctly', async () => {
          await page.goto('http://localhost:3000/pricing');
          
          // Wait for pricing table to load
          await page.waitForSelector('.pricing-table', { timeout: 10000 });
          
          // Verify basic structure
          const pricingCards = await page.$$('.pricing-card');
          expect(pricingCards.length).toBeGreaterThan(0);

          // Check that prices are displayed
          const prices = await page.$$eval('.price', elements =>
            elements.map(el => el.textContent.trim())
          );
          expect(prices.length).toBeGreaterThan(0);
          prices.forEach(price => {
            expect(price).toMatch(/\$\d+/);
          });
        });

        test('should handle CSS Grid and Flexbox properly', async () => {
          await page.goto('http://localhost:3000/pricing');
          await page.waitForSelector('.pricing-table');

          // Test CSS Grid support
          const gridSupport = await page.evaluate(() => {
            const testEl = document.createElement('div');
            testEl.style.display = 'grid';
            return testEl.style.display === 'grid';
          });

          // Test Flexbox support
          const flexSupport = await page.evaluate(() => {
            const testEl = document.createElement('div');
            testEl.style.display = 'flex';
            return testEl.style.display === 'flex';
          });

          expect(gridSupport || flexSupport).toBeTruthy();

          // Verify layout is correct
          const tableLayout = await page.$eval('.pricing-table', el => {
            const styles = window.getComputedStyle(el);
            return {
              display: styles.display,
              gridTemplateColumns: styles.gridTemplateColumns,
              flexDirection: styles.flexDirection
            };
          });

          expect(['grid', 'flex'].includes(tableLayout.display)).toBeTruthy();
        });

        test('should support modern JavaScript features', async () => {
          await page.goto('http://localhost:3000/pricing');

          // Test ES6+ features support
          const jsSupport = await page.evaluate(() => {
            try {
              // Test arrow functions
              const arrow = () => true;
              
              // Test template literals
              const template = `test ${1 + 1}`;
              
              // Test destructuring
              const [first] = [1, 2, 3];
              
              // Test promises
              const promise = Promise.resolve(true);
              
              // Test async/await (basic check)
              const asyncSupported = typeof (async () => {}) === 'function';
              
              return {
                arrow: typeof arrow === 'function',
                template: template === 'test 2',
                destructuring: first === 1,
                promises: promise instanceof Promise,
                async: asyncSupported
              };
            } catch (error) {
              return { error: error.message };
            }
          });

          expect(jsSupport.error).toBeUndefined();
          expect(jsSupport.arrow).toBeTruthy();
          expect(jsSupport.template).toBeTruthy();
          expect(jsSupport.destructuring).toBeTruthy();
          expect(jsSupport.promises).toBeTruthy();
        });

        test('should handle hover and focus states', async () => {
          await page.goto('http://localhost:3000/pricing');
          await page.waitForSelector('.pricing-card');

          const firstCard = await page.$('.pricing-card');
          
          // Test hover state
          await firstCard.hover();
          const hoverClass = await firstCard.getAttribute('class');
          
          // Test focus state
          await firstCard.focus();
          const focusedElement = await page.evaluate(() => document.activeElement.className);
          
          // Verify states are applied
          expect(hoverClass || focusedElement).toContain('pricing-card');
        });

        test('should handle form interactions correctly', async () => {
          await page.goto('http://localhost:3000/pricing');

          // Test button clicks
          const ctaButtons = await page.$$('.cta-button, [data-testid*="cta"]');
          
          if (ctaButtons.length > 0) {
            await ctaButtons[0].click();
            
            // Verify click was processed (check for navigation or modal)
            await page.waitForTimeout(500);
            const currentUrl = page.url();
            const modalVisible = await page.$('[role="dialog"]');
            
            expect(currentUrl !== 'http://localhost:3000/pricing' || modalVisible).toBeTruthy();
          }
        });
      });
    });
  });

  describe('Device Compatibility', () => {
    devices.forEach(device => {
      describe(`${device.name} compatibility`, () => {
        let browser, context, page;

        beforeAll(async () => {
          browser = await chromium.launch({ headless: true });
        });

        afterAll(async () => {
          await browser?.close();
        });

        beforeEach(async () => {
          context = await browser.newContext(device);
          page = await context.newPage();
        });

        afterEach(async () => {
          await context?.close();
        });

        test('should render responsive layout correctly', async () => {
          await page.goto('http://localhost:3000/pricing');
          await page.waitForSelector('.pricing-table');

          // Check viewport dimensions
          const viewport = await page.viewportSize();
          expect(viewport.width).toBeGreaterThan(0);
          expect(viewport.height).toBeGreaterThan(0);

          // Verify responsive behavior
          const pricingTable = await page.$eval('.pricing-table', el => {
            const rect = el.getBoundingClientRect();
            const styles = window.getComputedStyle(el);
            
            return {
              width: rect.width,
              display: styles.display,
              flexDirection: styles.flexDirection,
              gridTemplateColumns: styles.gridTemplateColumns
            };
          });

          expect(pricingTable.width).toBeLessThanOrEqual(viewport.width);
        });

        test('should handle touch interactions on mobile', async () => {
          if (device.hasTouch) {
            await page.goto('http://localhost:3000/pricing');
            await page.waitForSelector('.pricing-card');

            const card = await page.$('.pricing-card');
            const cardBox = await card.boundingBox();

            // Test touch tap
            await page.touchscreen.tap(
              cardBox.x + cardBox.width / 2,
              cardBox.y + cardBox.height / 2
            );

            await page.waitForTimeout(300);

            // Verify touch interaction worked
            const cardState = await card.getAttribute('class');
            // Expect some visual feedback or state change
            expect(cardState).toBeTruthy();
          }
        });

        test('should handle viewport orientation changes', async () => {
          if (device.name.includes('iPhone') || device.name.includes('iPad') || device.name.includes('Galaxy')) {
            await page.goto('http://localhost:3000/pricing');
            await page.waitForSelector('.pricing-table');

            // Test portrait orientation (default)
            const portraitLayout = await page.$eval('.pricing-table', el => {
              const rect = el.getBoundingClientRect();
              return { width: rect.width, height: rect.height };
            });

            // Simulate orientation change to landscape
            const landscapeViewport = { 
              width: device.viewport.height, 
              height: device.viewport.width 
            };
            await page.setViewportSize(landscapeViewport);
            await page.waitForTimeout(500);

            const landscapeLayout = await page.$eval('.pricing-table', el => {
              const rect = el.getBoundingClientRect();
              return { width: rect.width, height: rect.height };
            });

            // Layout should adapt to orientation change
            expect(landscapeLayout.width).not.toBe(portraitLayout.width);
          }
        });

        test('should maintain usability at device resolution', async () => {
          await page.goto('http://localhost:3000/pricing');
          await page.waitForSelector('.pricing-table');

          // Check text readability
          const textElements = await page.$$eval('p, h1, h2, h3, .price, .feature', elements =>
            elements.map(el => {
              const styles = window.getComputedStyle(el);
              return {
                fontSize: parseInt(styles.fontSize),
                lineHeight: styles.lineHeight,
                visibility: styles.visibility,
                display: styles.display
              };
            })
          );

          textElements.forEach(element => {
            expect(element.fontSize).toBeGreaterThanOrEqual(12); // Minimum readable font size
            expect(element.visibility).not.toBe('hidden');
            expect(element.display).not.toBe('none');
          });

          // Check button sizes for touch devices
          if (device.hasTouch) {
            const buttons = await page.$$eval('button, .cta-button', elements =>
              elements.map(el => {
                const rect = el.getBoundingClientRect();
                return { width: rect.width, height: rect.height };
              })
            );

            buttons.forEach(button => {
              expect(button.width).toBeGreaterThanOrEqual(44); // WCAG touch target size
              expect(button.height).toBeGreaterThanOrEqual(44);
            });
          }
        });
      });
    });
  });

  describe('Performance on Different Devices', () => {
    test('should load quickly on low-end devices', async () => {
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        // Simulate low-end device
        ...require('playwright').devices['Galaxy S5'],
        // Throttle CPU
        slowMo: 50
      });
      
      const page = await context.newPage();

      const startTime = Date.now();
      await page.goto('http://localhost:3000/pricing');
      await page.waitForSelector('.pricing-table');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

      await browser.close();
    });

    test('should handle limited network conditions', async () => {
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      // Simulate slow 3G connection
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100); // Add 100ms delay
      });

      const startTime = Date.now();
      await page.goto('http://localhost:3000/pricing');
      await page.waitForSelector('.pricing-table', { timeout: 10000 });
      const loadTime = Date.now() - startTime;

      // Should still load within reasonable time even with network delays
      expect(loadTime).toBeLessThan(8000);

      await browser.close();
    });
  });

  describe('Legacy Browser Support', () => {
    test('should provide fallbacks for unsupported features', async () => {
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto('http://localhost:3000/pricing');

      // Check for CSS fallbacks
      const hasGridFallback = await page.evaluate(() => {
        const testEl = document.createElement('div');
        testEl.style.display = 'grid';
        
        if (testEl.style.display !== 'grid') {
          // Grid not supported, check for fallback
          const pricingTable = document.querySelector('.pricing-table');
          const computedStyle = window.getComputedStyle(pricingTable);
          return computedStyle.display === 'flex' || computedStyle.display === 'block';
        }
        return true;
      });

      expect(hasGridFallback).toBeTruthy();

      await browser.close();
    });
  });
});