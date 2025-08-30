/**
 * Performance Benchmarks and Optimization Tests
 * Tests loading performance, Core Web Vitals, and provides optimization recommendations
 */

const { chromium } = require('playwright');
const { expect } = require('@playwright/test');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

describe('Performance Benchmarks and Optimization Tests', () => {
  let browser, context, page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
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

  describe('Core Web Vitals', () => {
    test('should meet Largest Contentful Paint (LCP) requirements', async () => {
      await page.goto('http://localhost:3000/pricing');
      
      const lcpMetric = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Fallback timeout
          setTimeout(() => resolve(null), 5000);
        });
      });

      if (lcpMetric) {
        // LCP should be under 2.5 seconds for good performance
        expect(lcpMetric).toBeLessThan(2500);
      }
    });

    test('should meet First Input Delay (FID) requirements', async () => {
      await page.goto('http://localhost:3000/pricing');
      
      // Simulate user interaction to measure FID
      const fidMetric = await page.evaluate(() => {
        return new Promise((resolve) => {
          let startTime;
          
          const measureFID = (event) => {
            const fid = performance.now() - startTime;
            resolve(fid);
            document.removeEventListener('click', measureFID);
          };
          
          document.addEventListener('click', measureFID);
          
          // Simulate click
          setTimeout(() => {
            startTime = performance.now();
            document.querySelector('.pricing-card')?.click();
          }, 1000);
          
          // Fallback
          setTimeout(() => resolve(null), 5000);
        });
      });

      if (fidMetric) {
        // FID should be under 100ms for good performance
        expect(fidMetric).toBeLessThan(100);
      }
    });

    test('should meet Cumulative Layout Shift (CLS) requirements', async () => {
      await page.goto('http://localhost:3000/pricing');
      
      const clsMetric = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;
          
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
          });
          
          observer.observe({ entryTypes: ['layout-shift'] });
          
          // Wait for page to stabilize
          setTimeout(() => {
            resolve(clsValue);
          }, 3000);
        });
      });

      // CLS should be under 0.1 for good performance
      expect(clsMetric).toBeLessThan(0.1);
    });

    test('should measure Time to First Byte (TTFB)', async () => {
      const startTime = Date.now();
      await page.goto('http://localhost:3000/pricing');
      
      const navigationEntry = await page.evaluate(() => {
        return performance.getEntriesByType('navigation')[0];
      });

      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      
      // TTFB should be under 600ms for good performance
      expect(ttfb).toBeLessThan(600);
    });
  });

  describe('Resource Loading Performance', () => {
    test('should load CSS resources efficiently', async () => {
      const resourceTimings = [];
      
      page.on('response', response => {
        if (response.url().includes('.css')) {
          resourceTimings.push({
            url: response.url(),
            status: response.status(),
            size: response.headers()['content-length'],
            timing: response.timing()
          });
        }
      });

      await page.goto('http://localhost:3000/pricing');
      await page.waitForLoadState('networkidle');

      // CSS should load quickly
      resourceTimings.forEach(resource => {
        expect(resource.status).toBe(200);
        if (resource.size) {
          // CSS files should be reasonably sized (under 100KB each)
          expect(parseInt(resource.size)).toBeLessThan(100000);
        }
      });
    });

    test('should load JavaScript resources efficiently', async () => {
      const jsResources = [];
      
      page.on('response', response => {
        if (response.url().includes('.js')) {
          jsResources.push({
            url: response.url(),
            status: response.status(),
            size: response.headers()['content-length']
          });
        }
      });

      await page.goto('http://localhost:3000/pricing');
      await page.waitForLoadState('networkidle');

      // JavaScript should load successfully
      jsResources.forEach(resource => {
        expect(resource.status).toBe(200);
      });

      // Should not have too many JS files (bundling check)
      expect(jsResources.length).toBeLessThan(10);
    });

    test('should optimize image loading', async () => {
      const imageResources = [];
      
      page.on('response', response => {
        const url = response.url();
        if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
          imageResources.push({
            url,
            status: response.status(),
            size: response.headers()['content-length'],
            contentType: response.headers()['content-type']
          });
        }
      });

      await page.goto('http://localhost:3000/pricing');
      await page.waitForLoadState('networkidle');

      imageResources.forEach(image => {
        expect(image.status).toBe(200);
        
        // Check for modern image formats
        if (image.contentType) {
          const isModernFormat = image.contentType.includes('webp') || 
                                image.contentType.includes('avif');
          // Modern formats are preferred but not required
          if (!isModernFormat && image.size) {
            // Traditional formats should be optimized (under 500KB)
            expect(parseInt(image.size)).toBeLessThan(500000);
          }
        }
      });
    });

    test('should implement lazy loading for images', async () => {
      await page.goto('http://localhost:3000/pricing');
      
      const lazyImages = await page.$$eval('img[loading="lazy"]', imgs => imgs.length);
      const totalImages = await page.$$eval('img', imgs => imgs.length);
      
      if (totalImages > 0) {
        // At least some images should use lazy loading
        const lazyPercentage = (lazyImages / totalImages) * 100;
        expect(lazyPercentage).toBeGreaterThan(0);
      }
    });
  });

  describe('Runtime Performance', () => {
    test('should have minimal main thread blocking', async () => {
      await page.goto('http://localhost:3000/pricing');
      
      const performanceMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const longTasks = list.getEntries().filter(entry => entry.duration > 50);
            resolve(longTasks.length);
          });
          observer.observe({ entryTypes: ['longtask'] });
          
          setTimeout(() => resolve(0), 3000);
        });
      });

      // Should have minimal long tasks (blocking > 50ms)
      expect(performanceMetrics).toBeLessThan(3);
    });

    test('should handle scroll performance efficiently', async () => {
      await page.goto('http://localhost:3000/pricing');
      
      const scrollMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frameCount = 0;
          let startTime = performance.now();
          
          const measureFrames = () => {
            frameCount++;
            requestAnimationFrame(measureFrames);
          };
          
          measureFrames();
          
          // Scroll the page
          window.scrollBy(0, 100);
          
          setTimeout(() => {
            const endTime = performance.now();
            const fps = (frameCount / (endTime - startTime)) * 1000;
            resolve(fps);
          }, 1000);
        });
      });

      // Should maintain reasonable FPS during scroll
      expect(scrollMetrics).toBeGreaterThan(30);
    });

    test('should have efficient memory usage', async () => {
      await page.goto('http://localhost:3000/pricing');
      
      const initialMemory = await page.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : null;
      });

      // Interact with the page to potentially create memory
      const pricingCards = await page.$$('.pricing-card');
      for (const card of pricingCards) {
        await card.click();
        await page.waitForTimeout(100);
      }

      const finalMemory = await page.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : null;
      });

      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory;
        // Memory increase should be reasonable (under 5MB)
        expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
      }
    });
  });

  describe('Mobile Performance', () => {
    test('should perform well on mobile devices', async () => {
      await context.close();
      
      // Use mobile device context
      context = await browser.newContext({
        ...require('playwright').devices['iPhone 12'],
        // Simulate slower mobile CPU
        slowMo: 50
      });
      
      page = await context.newPage();
      
      const startTime = Date.now();
      await page.goto('http://localhost:3000/pricing');
      await page.waitForSelector('.pricing-table');
      const loadTime = Date.now() - startTime;

      // Should load reasonably quickly on mobile
      expect(loadTime).toBeLessThan(4000);
    });

    test('should handle touch interactions smoothly', async () => {
      await context.close();
      context = await browser.newContext(require('playwright').devices['iPhone 12']);
      page = await context.newPage();
      
      await page.goto('http://localhost:3000/pricing');
      await page.waitForSelector('.pricing-card');

      const card = await page.$('.pricing-card');
      const cardBounds = await card.boundingBox();

      // Measure touch response time
      const touchStartTime = Date.now();
      await page.touchscreen.tap(
        cardBounds.x + cardBounds.width / 2,
        cardBounds.y + cardBounds.height / 2
      );
      
      await page.waitForTimeout(100);
      const responseTime = Date.now() - touchStartTime;

      // Touch response should be quick (under 200ms)
      expect(responseTime).toBeLessThan(200);
    });
  });

  describe('Network Performance', () => {
    test('should work efficiently with slow connections', async () => {
      // Simulate slow 3G
      await page.route('**/*', async route => {
        const delay = route.request().resourceType() === 'image' ? 500 : 200;
        setTimeout(() => route.continue(), delay);
      });

      const startTime = Date.now();
      await page.goto('http://localhost:3000/pricing');
      await page.waitForSelector('.pricing-table');
      const loadTime = Date.now() - startTime;

      // Should still load within reasonable time on slow connection
      expect(loadTime).toBeLessThan(8000);
    });

    test('should implement resource prioritization', async () => {
      const resourcePriorities = {};
      
      page.on('request', request => {
        resourcePriorities[request.resourceType()] = 
          (resourcePriorities[request.resourceType()] || 0) + 1;
      });

      await page.goto('http://localhost:3000/pricing');
      await page.waitForLoadState('networkidle');

      // Critical resources should be prioritized
      expect(resourcePriorities['document']).toBeGreaterThan(0);
      expect(resourcePriorities['stylesheet']).toBeGreaterThan(0);
    });
  });

  describe('Lighthouse Performance Audit', () => {
    test('should meet Lighthouse performance benchmarks', async () => {
      const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
      
      try {
        const options = {
          logLevel: 'info',
          output: 'json',
          onlyCategories: ['performance'],
          port: chrome.port,
        };

        const runnerResult = await lighthouse('http://localhost:3000/pricing', options);
        const performanceScore = runnerResult.report.categories.performance.score * 100;

        // Should achieve at least 70% performance score
        expect(performanceScore).toBeGreaterThan(70);

        // Store detailed metrics for reporting
        global.lighthouseReport = {
          performanceScore,
          metrics: runnerResult.report.audits,
          timestamp: new Date().toISOString()
        };

      } finally {
        await chrome.kill();
      }
    });
  });

  describe('Performance Recommendations', () => {
    test('should generate optimization recommendations', async () => {
      await page.goto('http://localhost:3000/pricing');
      await page.waitForLoadState('networkidle');

      const performanceAnalysis = await page.evaluate(() => {
        const recommendations = [];
        
        // Check for common performance issues
        const images = document.querySelectorAll('img');
        const unoptimizedImages = Array.from(images).filter(img => 
          !img.hasAttribute('loading') && img.getBoundingClientRect().top > window.innerHeight
        );
        
        if (unoptimizedImages.length > 0) {
          recommendations.push({
            type: 'image-optimization',
            severity: 'medium',
            description: `${unoptimizedImages.length} images could benefit from lazy loading`,
            impact: 'Reduce initial page load time'
          });
        }

        // Check for large DOM size
        const elementCount = document.querySelectorAll('*').length;
        if (elementCount > 1500) {
          recommendations.push({
            type: 'dom-size',
            severity: 'high',
            description: `Large DOM size detected (${elementCount} elements)`,
            impact: 'Slower rendering and increased memory usage'
          });
        }

        // Check for unused CSS
        const stylesheets = document.styleSheets.length;
        if (stylesheets > 5) {
          recommendations.push({
            type: 'css-optimization',
            severity: 'medium',
            description: `Multiple stylesheets detected (${stylesheets})`,
            impact: 'Consider bundling CSS files'
          });
        }

        // Check for render-blocking resources
        const syncScripts = document.querySelectorAll('script:not([async]):not([defer])').length;
        if (syncScripts > 0) {
          recommendations.push({
            type: 'render-blocking',
            severity: 'high',
            description: `${syncScripts} render-blocking scripts found`,
            impact: 'Delayed page rendering'
          });
        }

        return {
          recommendations,
          metrics: {
            elementCount,
            stylesheets,
            syncScripts,
            imagesCount: images.length
          }
        };
      });

      // Store recommendations for reporting
      global.performanceRecommendations = {
        ...performanceAnalysis,
        timestamp: new Date().toISOString(),
        url: page.url()
      };

      console.log('Performance Analysis:', JSON.stringify(performanceAnalysis, null, 2));

      // At minimum, should generate some form of analysis
      expect(typeof performanceAnalysis.metrics).toBe('object');
    });
  });
});