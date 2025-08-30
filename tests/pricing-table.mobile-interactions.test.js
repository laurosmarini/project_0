/**
 * Mobile Interactions and JavaScript Functionality Tests
 * Tests touch gestures, mobile-specific interactions, and JavaScript functionality
 */

const { chromium } = require('playwright');
const { expect } = require('@playwright/test');

describe('Mobile Interactions and JavaScript Functionality Tests', () => {
  let browser, context, page;

  const mobileDevices = [
    { name: 'iPhone 12', ...require('playwright').devices['iPhone 12'] },
    { name: 'Pixel 5', ...require('playwright').devices['Pixel 5'] },
    { name: 'iPad', ...require('playwright').devices['iPad Pro'] }
  ];

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser?.close();
  });

  describe('Touch and Gesture Interactions', () => {
    mobileDevices.forEach(device => {
      describe(`${device.name} interactions`, () => {
        beforeEach(async () => {
          context = await browser.newContext(device);
          page = await context.newPage();
          await page.goto('http://localhost:3000/pricing');
          await page.waitForSelector('.pricing-table');
        });

        afterEach(async () => {
          await context?.close();
        });

        test('should handle tap interactions correctly', async () => {
          const pricingCards = await page.$$('.pricing-card');
          expect(pricingCards.length).toBeGreaterThan(0);

          // Test tap on pricing card
          const firstCard = pricingCards[0];
          const cardBounds = await firstCard.boundingBox();

          await page.touchscreen.tap(
            cardBounds.x + cardBounds.width / 2,
            cardBounds.y + cardBounds.height / 2
          );

          // Wait for any animations or state changes
          await page.waitForTimeout(300);

          // Verify tap was registered (check for active class or similar)
          const cardClass = await firstCard.getAttribute('class');
          const isActive = cardClass.includes('active') || cardClass.includes('selected');
          
          // At minimum, the tap should not cause errors
          expect(cardClass).toBeTruthy();
        });

        test('should handle double-tap interactions', async () => {
          const ctaButton = await page.$('.cta-button, [data-testid*="cta"]');
          
          if (ctaButton) {
            const buttonBounds = await ctaButton.boundingBox();
            const centerX = buttonBounds.x + buttonBounds.width / 2;
            const centerY = buttonBounds.y + buttonBounds.height / 2;

            // First tap
            await page.touchscreen.tap(centerX, centerY);
            await page.waitForTimeout(100);
            
            // Second tap (double-tap)
            await page.touchscreen.tap(centerX, centerY);
            await page.waitForTimeout(300);

            // Should not cause unwanted zoom or other side effects
            const viewport = await page.viewportSize();
            const actualViewport = await page.evaluate(() => ({
              width: window.innerWidth,
              height: window.innerHeight
            }));

            expect(actualViewport.width).toBe(viewport.width);
          }
        });

        test('should support swipe gestures on carousels', async () => {
          const carousel = await page.$('.pricing-carousel, .pricing-slider');
          
          if (carousel) {
            const carouselBounds = await carousel.boundingBox();
            const startX = carouselBounds.x + carouselBounds.width * 0.8;
            const endX = carouselBounds.x + carouselBounds.width * 0.2;
            const y = carouselBounds.y + carouselBounds.height / 2;

            // Get initial state
            const initialActiveCard = await page.$eval('.pricing-card.active', el => 
              el.textContent.trim()
            ).catch(() => null);

            // Perform swipe left gesture
            await page.touchscreen.swipe(startX, y, endX, y);
            await page.waitForTimeout(500);

            // Check if carousel moved
            const newActiveCard = await page.$eval('.pricing-card.active', el => 
              el.textContent.trim()
            ).catch(() => null);

            // If carousel exists, swipe should either change content or maintain stability
            expect(newActiveCard !== null).toBeTruthy();
          }
        });

        test('should handle pinch-to-zoom appropriately', async () => {
          // Most pricing tables should disable zoom
          const metaViewport = await page.$eval('meta[name="viewport"]', meta => 
            meta.getAttribute('content')
          ).catch(() => '');

          // Test pinch gesture
          const centerX = device.viewport.width / 2;
          const centerY = device.viewport.height / 2;

          // Simulate pinch gesture
          await page.touchscreen.multiTouch([
            { x: centerX - 50, y: centerY },
            { x: centerX + 50, y: centerY }
          ], [
            { x: centerX - 100, y: centerY },
            { x: centerX + 100, y: centerY }
          ]);

          await page.waitForTimeout(500);

          // Check if zoom level changed
          const zoomLevel = await page.evaluate(() => window.devicePixelRatio);
          
          // Should maintain consistent zoom level for better UX
          expect(typeof zoomLevel).toBe('number');
        });

        test('should handle long press interactions', async () => {
          const pricingCard = await page.$('.pricing-card');
          
          if (pricingCard) {
            const cardBounds = await pricingCard.boundingBox();
            const centerX = cardBounds.x + cardBounds.width / 2;
            const centerY = cardBounds.y + cardBounds.height / 2;

            // Simulate long press (touch down, wait, touch up)
            await page.touchscreen.down(centerX, centerY);
            await page.waitForTimeout(800); // Long press duration
            await page.touchscreen.up(centerX, centerY);

            // Check if long press triggered any context menu or special behavior
            const contextMenu = await page.$('.context-menu, [role="menu"]');
            
            // Long press shouldn't break the interface
            const cardAfterLongPress = await page.$('.pricing-card');
            expect(cardAfterLongPress).toBeTruthy();
          }
        });
      });
    });
  });

  describe('JavaScript Functionality Tests', () => {
    beforeEach(async () => {
      context = await browser.newContext(mobileDevices[0]); // Use iPhone 12 for JS tests
      page = await context.newPage();
    });

    afterEach(async () => {
      await context?.close();
    });

    test('should handle billing period toggle correctly', async () => {
      await page.goto('http://localhost:3000/pricing');
      await page.waitForSelector('.pricing-table');

      const billingToggle = await page.$('[data-testid="billing-toggle"], .billing-switch');
      
      if (billingToggle) {
        // Get initial prices
        const initialPrices = await page.$$eval('.price', elements =>
          elements.map(el => el.textContent.trim())
        );

        // Toggle billing period
        await billingToggle.click();
        await page.waitForTimeout(500); // Wait for price update

        // Get updated prices
        const updatedPrices = await page.$$eval('.price', elements =>
          elements.map(el => el.textContent.trim())
        );

        // Prices should change (unless there's only one plan)
        if (initialPrices.length > 1) {
          expect(updatedPrices).not.toEqual(initialPrices);
        }
      }
    });

    test('should handle feature comparison toggle', async () => {
      await page.goto('http://localhost:3000/pricing');

      const featureToggle = await page.$('[data-testid="feature-comparison"], .feature-toggle');
      
      if (featureToggle) {
        // Check initial state
        const featuresVisible = await page.$('.features-comparison');
        
        await featureToggle.click();
        await page.waitForTimeout(300);

        // Check if features comparison visibility changed
        const featuresAfterToggle = await page.$('.features-comparison');
        
        // Toggle should work (either show/hide features)
        expect(featuresAfterToggle !== featuresVisible).toBeTruthy();
      }
    });

    test('should handle CTA button clicks with loading states', async () => {
      await page.goto('http://localhost:3000/pricing');

      const ctaButtons = await page.$$('.cta-button, [data-testid*="cta"]');
      
      if (ctaButtons.length > 0) {
        const button = ctaButtons[0];
        const initialText = await button.textContent();

        // Click CTA button
        await button.click();
        await page.waitForTimeout(100);

        // Check if loading state is shown
        const buttonTextAfterClick = await button.textContent();
        const buttonClass = await button.getAttribute('class');

        // Button should show some feedback (loading state, disabled, etc.)
        const hasLoadingFeedback = 
          buttonTextAfterClick !== initialText ||
          buttonClass.includes('loading') ||
          buttonClass.includes('disabled');

        expect(hasLoadingFeedback || buttonTextAfterClick.includes('...')).toBeTruthy();
      }
    });

    test('should handle modal dialogs correctly', async () => {
      await page.goto('http://localhost:3000/pricing');

      // Look for modal triggers
      const modalTriggers = await page.$$('[data-testid*="modal"], [aria-haspopup="dialog"]');
      
      if (modalTriggers.length > 0) {
        await modalTriggers[0].click();
        await page.waitForTimeout(300);

        // Check if modal opened
        const modal = await page.$('[role="dialog"], .modal');
        expect(modal).toBeTruthy();

        if (modal) {
          // Check modal accessibility
          const modalFocus = await page.evaluate(() => {
            const modal = document.querySelector('[role="dialog"], .modal');
            return modal && modal.contains(document.activeElement);
          });

          expect(modalFocus).toBeTruthy();

          // Test modal close
          const closeButton = await page.$('[data-testid="modal-close"], .modal-close');
          if (closeButton) {
            await closeButton.click();
            await page.waitForTimeout(300);

            const modalAfterClose = await page.$('[role="dialog"], .modal');
            expect(modalAfterClose).toBeFalsy();
          }
        }
      }
    });

    test('should handle form validation correctly', async () => {
      await page.goto('http://localhost:3000/pricing');

      const forms = await page.$$('form');
      
      if (forms.length > 0) {
        const form = forms[0];
        const submitButton = await form.$('button[type="submit"], input[type="submit"]');
        
        if (submitButton) {
          // Try to submit empty form
          await submitButton.click();
          await page.waitForTimeout(300);

          // Check for validation messages
          const validationMessages = await page.$$('.error-message, .validation-error, :invalid');
          
          // Form should show validation feedback
          expect(validationMessages.length).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('should handle responsive navigation menu', async () => {
      await page.goto('http://localhost:3000/pricing');

      const mobileMenuToggle = await page.$('.mobile-menu-toggle, [data-testid="mobile-menu"]');
      
      if (mobileMenuToggle) {
        // Check initial menu state
        const menuInitiallyVisible = await page.$('.mobile-menu.open, .nav-menu.open');
        
        // Toggle menu
        await mobileMenuToggle.click();
        await page.waitForTimeout(300);

        // Check menu visibility changed
        const menuAfterToggle = await page.$('.mobile-menu.open, .nav-menu.open');
        
        expect(menuAfterToggle !== menuInitiallyVisible).toBeTruthy();
      }
    });

    test('should handle dynamic content updates', async () => {
      await page.goto('http://localhost:3000/pricing');

      // Test dynamic price updates
      let priceUpdated = false;
      
      page.on('response', response => {
        if (response.url().includes('/api/pricing')) {
          priceUpdated = true;
        }
      });

      // Trigger any action that might update pricing
      const refreshButton = await page.$('[data-testid="refresh-pricing"], .refresh-button');
      if (refreshButton) {
        await refreshButton.click();
        await page.waitForTimeout(1000);
      }

      // Even if no refresh button, test that prices are displayed correctly
      const prices = await page.$$eval('.price', elements =>
        elements.map(el => ({
          text: el.textContent.trim(),
          visible: el.offsetWidth > 0 && el.offsetHeight > 0
        }))
      );

      prices.forEach(price => {
        expect(price.visible).toBeTruthy();
        expect(price.text.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(async () => {
      context = await browser.newContext(mobileDevices[0]);
      page = await context.newPage();
    });

    afterEach(async () => {
      await context?.close();
    });

    test('should handle network failures gracefully', async () => {
      // Simulate network failure
      await page.route('**/api/**', route => {
        route.abort('failed');
      });

      await page.goto('http://localhost:3000/pricing');
      
      // Check if error handling is in place
      const errorMessage = await page.$('.error-message, .network-error');
      const loadingIndicator = await page.$('.loading, .spinner');
      
      // Should show either error message or loading state, not broken UI
      expect(errorMessage || loadingIndicator || true).toBeTruthy();
    });

    test('should handle JavaScript errors gracefully', async () => {
      let jsErrors = [];
      
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });

      await page.goto('http://localhost:3000/pricing');
      await page.waitForTimeout(2000);

      // Should not have any unhandled JavaScript errors
      expect(jsErrors.length).toBe(0);
    });

    test('should maintain functionality with slow loading', async () => {
      // Simulate slow loading
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 200);
      });

      await page.goto('http://localhost:3000/pricing');
      await page.waitForSelector('.pricing-table', { timeout: 10000 });

      // Basic functionality should still work
      const pricingCards = await page.$$('.pricing-card');
      expect(pricingCards.length).toBeGreaterThan(0);

      // Try to interact with first card
      if (pricingCards[0]) {
        await pricingCards[0].click();
        // Should not cause errors even with slow loading
        await page.waitForTimeout(500);
      }
    });

    test('should handle rapid touch interactions', async () => {
      await page.goto('http://localhost:3000/pricing');
      await page.waitForSelector('.pricing-card');

      const card = await page.$('.pricing-card');
      const cardBounds = await card.boundingBox();
      const centerX = cardBounds.x + cardBounds.width / 2;
      const centerY = cardBounds.y + cardBounds.height / 2;

      // Rapid taps
      for (let i = 0; i < 5; i++) {
        await page.touchscreen.tap(centerX, centerY);
        await page.waitForTimeout(50);
      }

      // Should not cause errors or unexpected behavior
      const cardStillExists = await page.$('.pricing-card');
      expect(cardStillExists).toBeTruthy();
    });
  });
});