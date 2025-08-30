/**
 * Accessibility Compliance Tests for Responsive Pricing Table
 * WCAG 2.1 Level AA Compliance Testing
 */

const { chromium } = require('playwright');
const { injectAxe, checkA11y, getViolations } = require('axe-playwright');
const { expect } = require('@playwright/test');

describe('Pricing Table Accessibility Tests (WCAG 2.1)', () => {
  let browser, context, page;

  beforeEach(async () => {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto('http://localhost:3000/pricing');
    await injectAxe(page);
  });

  afterEach(async () => {
    await browser.close();
  });

  describe('WCAG 2.1 Level AA Compliance', () => {
    test('should pass all axe-core accessibility checks', async () => {
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
        rules: {
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'focus-management': { enabled: true },
          'aria-labels': { enabled: true },
          'heading-order': { enabled: true },
          'landmark-roles': { enabled: true }
        }
      });
    });

    test('should have proper heading hierarchy', async () => {
      const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements =>
        elements.map(el => ({
          tag: el.tagName.toLowerCase(),
          text: el.textContent.trim(),
          level: parseInt(el.tagName.charAt(1))
        }))
      );

      // Check that headings follow proper hierarchy
      for (let i = 1; i < headings.length; i++) {
        const currentLevel = headings[i].level;
        const previousLevel = headings[i - 1].level;
        
        expect(currentLevel).toBeLessThanOrEqual(previousLevel + 1);
      }

      // Ensure main heading exists
      expect(headings.some(h => h.level === 1)).toBeTruthy();
    });

    test('should have sufficient color contrast', async () => {
      const violations = await getViolations(page, null, {
        rules: ['color-contrast']
      });

      expect(violations).toHaveLength(0);
    });

    test('should have proper ARIA labels and roles', async () => {
      // Check pricing cards have proper ARIA labels
      const pricingCards = await page.$$('.pricing-card');
      
      for (const card of pricingCards) {
        const ariaLabel = await card.getAttribute('aria-label');
        const role = await card.getAttribute('role');
        
        expect(ariaLabel || role).toBeTruthy();
      }

      // Check buttons have accessible names
      const buttons = await page.$$('button');
      
      for (const button of buttons) {
        const accessibleName = await button.evaluate(el => {
          return el.getAttribute('aria-label') || 
                 el.getAttribute('aria-labelledby') ||
                 el.textContent.trim() ||
                 el.getAttribute('title');
        });
        
        expect(accessibleName).toBeTruthy();
      }
    });

    test('should support keyboard navigation', async () => {
      // Test Tab navigation through all interactive elements
      const focusableElements = await page.$$eval(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        elements => elements.length
      );

      let focusedElements = 0;
      
      // Navigate through all focusable elements
      for (let i = 0; i < focusableElements; i++) {
        await page.keyboard.press('Tab');
        
        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el.tagName,
            className: el.className,
            textContent: el.textContent?.trim(),
            tabIndex: el.tabIndex
          };
        });

        if (focusedElement.tagName !== 'BODY') {
          focusedElements++;
        }
      }

      expect(focusedElements).toBeGreaterThan(0);
    });

    test('should handle focus management properly', async () => {
      // Test focus trap in modal dialogs (if any)
      const modalTrigger = await page.$('[data-testid="pricing-modal-trigger"]');
      
      if (modalTrigger) {
        await modalTrigger.click();
        await page.waitForSelector('[role="dialog"]');

        // Test focus is trapped within modal
        const firstFocusable = await page.$('[role="dialog"] button:first-of-type');
        const lastFocusable = await page.$('[role="dialog"] button:last-of-type');

        await lastFocusable.focus();
        await page.keyboard.press('Tab');
        
        const focused = await page.evaluate(() => document.activeElement);
        expect(focused).toEqual(firstFocusable);
      }
    });

    test('should provide proper form labels and error messages', async () => {
      // Check if pricing form has proper labels
      const formInputs = await page.$$('input, select, textarea');
      
      for (const input of formInputs) {
        const hasLabel = await input.evaluate(el => {
          const id = el.id;
          const ariaLabel = el.getAttribute('aria-label');
          const ariaLabelledBy = el.getAttribute('aria-labelledby');
          const label = id ? document.querySelector(`label[for="${id}"]`) : null;
          
          return !!(ariaLabel || ariaLabelledBy || label);
        });

        expect(hasLabel).toBeTruthy();
      }
    });

    test('should announce dynamic content changes', async () => {
      // Test screen reader announcements for price changes
      const priceToggle = await page.$('[data-testid="billing-toggle"]');
      
      if (priceToggle) {
        await priceToggle.click();
        
        // Check for aria-live regions
        const liveRegions = await page.$$('[aria-live]');
        expect(liveRegions.length).toBeGreaterThan(0);

        // Verify announcement content
        const announcements = await page.$$eval('[aria-live]', elements =>
          elements.map(el => el.textContent.trim()).filter(text => text.length > 0)
        );
        
        expect(announcements.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Screen Reader Compatibility', () => {
    test('should have proper table structure for pricing comparison', async () => {
      const pricingTable = await page.$('.pricing-comparison-table');
      
      if (pricingTable) {
        // Check for proper table headers
        const headers = await page.$$eval('th', elements =>
          elements.map(th => th.textContent.trim())
        );
        
        expect(headers.length).toBeGreaterThan(0);

        // Check for table caption
        const caption = await page.$('table caption');
        if (caption) {
          const captionText = await caption.textContent();
          expect(captionText.trim().length).toBeGreaterThan(0);
        }

        // Check for scope attributes on headers
        const headersWithScope = await page.$$eval('th[scope]', elements => elements.length);
        expect(headersWithScope).toBeGreaterThan(0);
      }
    });

    test('should provide meaningful alt text for images', async () => {
      const images = await page.$$('img');
      
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');
        
        // Decorative images should have empty alt or role="presentation"
        // Content images should have meaningful alt text
        if (role !== 'presentation' && role !== 'none') {
          expect(alt).toBeTruthy();
          expect(alt.length).toBeGreaterThan(0);
        }
      }
    });

    test('should support high contrast mode', async () => {
      // Enable high contrast mode
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * {
              border: 2px solid !important;
              background: white !important;
              color: black !important;
            }
          }
        `
      });

      await page.emulateMedia({ prefersContrast: 'high' });
      await page.reload();

      // Verify content is still readable
      const violations = await getViolations(page, null, {
        rules: ['color-contrast']
      });

      expect(violations).toHaveLength(0);
    });
  });

  describe('Motion and Animation Accessibility', () => {
    test('should respect prefers-reduced-motion', async () => {
      await page.emulateMedia({ prefersReducedMotion: 'reduce' });
      await page.reload();

      // Check that animations are disabled or reduced
      const animatedElements = await page.$$eval('[class*="animate"], [class*="transition"]', elements =>
        elements.map(el => {
          const computedStyle = window.getComputedStyle(el);
          return {
            animationDuration: computedStyle.animationDuration,
            transitionDuration: computedStyle.transitionDuration
          };
        })
      );

      // Verify animations are reduced or disabled
      animatedElements.forEach(style => {
        expect(['0s', 'none'].includes(style.animationDuration) || 
               ['0s', 'none'].includes(style.transitionDuration)).toBeTruthy();
      });
    });

    test('should provide animation controls', async () => {
      const animationControls = await page.$('[data-testid="animation-controls"]');
      
      if (animationControls) {
        // Test play/pause functionality
        const playButton = await page.$('[data-testid="animation-play"]');
        const pauseButton = await page.$('[data-testid="animation-pause"]');

        expect(playButton || pauseButton).toBeTruthy();
      }
    });
  });

  describe('Touch and Mobile Accessibility', () => {
    test('should have adequate touch targets', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const touchTargets = await page.$$eval('button, a, [role="button"]', elements =>
        elements.map(el => {
          const rect = el.getBoundingClientRect();
          return {
            width: rect.width,
            height: rect.height,
            element: el.tagName
          };
        })
      );

      // WCAG requires minimum 44x44 CSS pixels for touch targets
      touchTargets.forEach(target => {
        expect(target.width).toBeGreaterThanOrEqual(44);
        expect(target.height).toBeGreaterThanOrEqual(44);
      });
    });

    test('should support swipe gestures appropriately', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const carousel = await page.$('.pricing-carousel');
      
      if (carousel) {
        // Test swipe navigation doesn't interfere with other interactions
        const initialCard = await page.$('.pricing-card.active');
        
        await page.touchscreen.swipe(200, 300, 100, 300);
        await page.waitForTimeout(500);
        
        const newActiveCard = await page.$('.pricing-card.active');
        
        // Verify swipe worked but didn't break other functionality
        expect(newActiveCard).not.toEqual(initialCard);
      }
    });
  });

  describe('Accessibility Testing Reports', () => {
    test('should generate detailed accessibility report', async () => {
      const violations = await getViolations(page);
      
      const report = {
        timestamp: new Date().toISOString(),
        url: page.url(),
        violations: violations.map(violation => ({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          nodes: violation.nodes.length,
          tags: violation.tags
        })),
        summary: {
          totalViolations: violations.length,
          criticalIssues: violations.filter(v => v.impact === 'critical').length,
          seriousIssues: violations.filter(v => v.impact === 'serious').length,
          moderateIssues: violations.filter(v => v.impact === 'moderate').length,
          minorIssues: violations.filter(v => v.impact === 'minor').length
        }
      };

      // Store report for coordinator
      global.accessibilityReport = report;
      
      console.log('Accessibility Report:', JSON.stringify(report, null, 2));
      
      // Fail test if critical or serious issues found
      expect(report.summary.criticalIssues).toBe(0);
      expect(report.summary.seriousIssues).toBe(0);
    });
  });
});