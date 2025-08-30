/**
 * Cross-Browser Compatibility Testing Script
 * Tests carousel functionality across different browser environments
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class BrowserCompatibilityTester {
  constructor() {
    this.browsers = [
      {
        name: 'Chrome Latest',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      },
      {
        name: 'Chrome 49 (Legacy)',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36'
      },
      {
        name: 'Firefox Latest',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0'
      },
      {
        name: 'Firefox 31 (Legacy)',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:31.0) Gecko/20100101 Firefox/31.0'
      },
      {
        name: 'Safari 15.4+',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15'
      },
      {
        name: 'Edge Latest',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0'
      },
      {
        name: 'Mobile Chrome',
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36'
      },
      {
        name: 'Mobile Safari',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1'
      }
    ];
    
    this.viewports = [
      { name: 'Mobile Portrait', width: 375, height: 667 },
      { name: 'Mobile Landscape', width: 667, height: 375 },
      { name: 'Tablet Portrait', width: 768, height: 1024 },
      { name: 'Tablet Landscape', width: 1024, height: 768 },
      { name: 'Desktop', width: 1440, height: 900 },
      { name: 'Large Desktop', width: 1920, height: 1080 }
    ];
    
    this.results = [];
  }
  
  async runTests() {
    console.log('🚀 Starting cross-browser compatibility tests...\n');
    
    for (const browser of this.browsers) {
      await this.testBrowser(browser);
    }
    
    await this.generateReport();
  }
  
  async testBrowser(browser) {
    console.log(`Testing ${browser.name}...`);
    
    const browserInstance = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browserInstance.newPage();
      await page.setUserAgent(browser.userAgent);
      
      // Load carousel HTML
      const htmlPath = path.join(__dirname, '../../src/components/carousel/carousel-integrated.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Test at different viewports
      for (const viewport of this.viewports) {
        const result = await this.testViewport(page, browser, viewport);
        this.results.push(result);
      }
      
    } catch (error) {
      console.error(`Error testing ${browser.name}:`, error.message);
      this.results.push({
        browser: browser.name,
        viewport: 'All',
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      await browserInstance.close();
    }
  }
  
  async testViewport(page, browser, viewport) {
    await page.setViewport(viewport);
    
    const result = {
      browser: browser.name,
      viewport: viewport.name,
      timestamp: Date.now(),
      tests: {}
    };
    
    try {
      // Test 1: Basic structure loads
      result.tests.structureLoads = await page.evaluate(() => {
        const carousel = document.querySelector('.carousel');
        const track = document.querySelector('.carousel__track');
        const slides = document.querySelectorAll('.carousel__slide');
        
        return {
          success: !!(carousel && track && slides.length === 5),
          carousel: !!carousel,
          track: !!track,
          slideCount: slides.length
        };
      });
      
      // Test 2: CSS custom properties support
      result.tests.cssCustomProperties = await page.evaluate(() => {
        try {
          const testElement = document.createElement('div');
          testElement.style.setProperty('--test-var', 'test');
          document.body.appendChild(testElement);
          
          const computed = getComputedStyle(testElement);
          const supportsVars = computed.getPropertyValue('--test-var') === 'test';
          
          document.body.removeChild(testElement);
          
          return {
            success: supportsVars,
            feature: 'css-custom-properties'
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });
      
      // Test 3: Navigation works
      result.tests.navigation = await page.evaluate(() => {
        const indicators = document.querySelectorAll('.carousel__indicator');
        const arrows = document.querySelectorAll('.carousel__arrow');
        
        return {
          success: indicators.length > 0 && arrows.length > 0,
          indicatorCount: indicators.length,
          arrowCount: arrows.length,
          firstIndicatorHref: indicators[0]?.getAttribute('href'),
          hasAriaLabels: Array.from(indicators).every(ind => ind.getAttribute('aria-label'))
        };
      });
      
      // Test 4: Images load and have proper attributes
      result.tests.images = await page.evaluate(() => {
        const images = document.querySelectorAll('.carousel__image');
        
        const imageTests = Array.from(images).map(img => ({
          hasSrc: !!img.src,
          hasAlt: !!img.alt,
          hasLazyLoading: img.loading === 'lazy',
          hasSrcset: !!img.srcset,
          hasSizes: !!img.sizes
        }));
        
        const allHaveSrc = imageTests.every(test => test.hasSrc);
        const allHaveAlt = imageTests.every(test => test.hasAlt);
        const allHaveLazyLoading = imageTests.every(test => test.hasLazyLoading);
        
        return {
          success: allHaveSrc && allHaveAlt,
          imageCount: images.length,
          allHaveSrc,
          allHaveAlt,
          allHaveLazyLoading,
          details: imageTests
        };
      });
      
      // Test 5: Accessibility attributes
      result.tests.accessibility = await page.evaluate(() => {
        const carousel = document.querySelector('.carousel');
        const navigation = document.querySelector('.carousel__navigation');
        const status = document.querySelector('.carousel__status');
        const slides = document.querySelectorAll('.carousel__slide');
        
        return {
          success: !!(
            carousel?.getAttribute('role') === 'region' &&
            navigation?.getAttribute('role') === 'tablist' &&
            status?.getAttribute('aria-live') === 'polite'
          ),
          carouselRole: carousel?.getAttribute('role'),
          navigationRole: navigation?.getAttribute('role'),
          statusAriaLive: status?.getAttribute('aria-live'),
          slidesHaveRoles: Array.from(slides).every(slide => slide.getAttribute('role') === 'img')
        };
      });
      
      // Test 6: Responsive behavior
      result.tests.responsive = await page.evaluate(() => {
        const carousel = document.querySelector('.carousel');
        const slide = document.querySelector('.carousel__slide');
        const navigation = document.querySelector('.carousel__navigation');
        
        const carouselStyles = getComputedStyle(carousel);
        const slideStyles = getComputedStyle(slide);
        
        return {
          success: !!(carousel && slide),
          carouselPadding: carouselStyles.padding,
          slideMinHeight: slideStyles.minHeight,
          navigationVisible: getComputedStyle(navigation).display !== 'none'
        };
      });
      
      // Test 7: Performance metrics
      const performanceMetrics = await page.metrics();
      result.tests.performance = {
        success: performanceMetrics.LayoutCount < 50 && performanceMetrics.RecalcStyleCount < 100,
        layoutCount: performanceMetrics.LayoutCount,
        recalcStyleCount: performanceMetrics.RecalcStyleCount,
        jsHeapUsedSize: Math.round(performanceMetrics.JSHeapUsedSize / 1024 / 1024 * 100) / 100 // MB
      };
      
      // Test 8: JavaScript enhancement (if available)
      result.tests.jsEnhancement = await page.evaluate(() => {
        const hasEnhancedCarousel = typeof window.EnhancedCarousel === 'function';
        const carousel = document.querySelector('.carousel');
        const hasInstance = carousel?._carouselInstance;
        
        return {
          success: hasEnhancedCarousel,
          hasClass: hasEnhancedCarousel,
          hasInstance: !!hasInstance,
          featureClasses: Array.from(document.documentElement.classList)
            .filter(cls => ['css-vars', 'scroll-snap', 'aspect-ratio', 'touch'].includes(cls) || cls.startsWith('no-'))
        };
      });
      
      // Test 9: Touch/mobile specific tests
      if (viewport.width <= 768) {
        result.tests.mobile = await page.evaluate(() => {
          const arrows = document.querySelector('.carousel__arrows');
          const arrowsStyle = getComputedStyle(arrows);
          
          return {
            success: true,
            arrowsHiddenOnTouch: arrowsStyle.display === 'none' || arrowsStyle.visibility === 'hidden'
          };
        });
      }
      
      // Calculate overall success rate
      const testResults = Object.values(result.tests);
      const successfulTests = testResults.filter(test => test.success).length;
      result.successRate = Math.round((successfulTests / testResults.length) * 100);
      
      console.log(`  ✓ ${viewport.name}: ${result.successRate}% success rate`);
      
    } catch (error) {
      result.error = error.message;
      result.successRate = 0;
      console.log(`  ✗ ${viewport.name}: Error - ${error.message}`);
    }
    
    return result;
  }
  
  async generateReport() {
    console.log('\n📊 Generating compatibility report...\n');
    
    const reportData = {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      results: this.results,
      summary: this.generateSummary()
    };
    
    // Save detailed JSON report
    const reportPath = path.join(__dirname, '../reports/browser-compatibility-report.json');
    await this.ensureDirectoryExists(path.dirname(reportPath));
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHTMLReport(reportData);
    const htmlReportPath = path.join(__dirname, '../reports/browser-compatibility-report.html');
    fs.writeFileSync(htmlReportPath, htmlReport);
    
    // Print summary to console
    this.printSummary(reportData.summary);
    
    console.log(`\n📋 Full report saved to: ${reportPath}`);
    console.log(`🌐 HTML report saved to: ${htmlReportPath}`);
  }
  
  generateSummary() {
    const browserSummary = {};
    const viewportSummary = {};
    const testSummary = {};
    
    this.results.forEach(result => {
      // Browser summary
      if (!browserSummary[result.browser]) {
        browserSummary[result.browser] = { total: 0, success: 0, rates: [] };
      }
      browserSummary[result.browser].total++;
      browserSummary[result.browser].rates.push(result.successRate);
      if (result.successRate >= 80) browserSummary[result.browser].success++;
      
      // Viewport summary
      if (!viewportSummary[result.viewport]) {
        viewportSummary[result.viewport] = { total: 0, success: 0, rates: [] };
      }
      viewportSummary[result.viewport].total++;
      viewportSummary[result.viewport].rates.push(result.successRate);
      if (result.successRate >= 80) viewportSummary[result.viewport].success++;
      
      // Test summary
      if (result.tests) {
        Object.keys(result.tests).forEach(testName => {
          if (!testSummary[testName]) {
            testSummary[testName] = { total: 0, success: 0 };
          }
          testSummary[testName].total++;
          if (result.tests[testName].success) {
            testSummary[testName].success++;
          }
        });
      }
    });
    
    // Calculate averages
    Object.keys(browserSummary).forEach(browser => {
      const rates = browserSummary[browser].rates;
      browserSummary[browser].averageRate = Math.round(
        rates.reduce((a, b) => a + b, 0) / rates.length
      );
    });
    
    Object.keys(viewportSummary).forEach(viewport => {
      const rates = viewportSummary[viewport].rates;
      viewportSummary[viewport].averageRate = Math.round(
        rates.reduce((a, b) => a + b, 0) / rates.length
      );
    });
    
    return {
      browsers: browserSummary,
      viewports: viewportSummary,
      tests: testSummary,
      overallSuccessRate: Math.round(
        this.results.reduce((sum, result) => sum + result.successRate, 0) / this.results.length
      )
    };
  }
  
  generateHTMLReport(reportData) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carousel Browser Compatibility Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 40px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .card { background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; }
    .success-rate { font-size: 2em; font-weight: bold; color: #28a745; }
    .success-rate.warning { color: #ffc107; }
    .success-rate.danger { color: #dc3545; }
    .results-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .results-table th, .results-table td { padding: 12px; text-align: left; border: 1px solid #ddd; }
    .results-table th { background-color: #f8f9fa; font-weight: 600; }
    .status-success { color: #28a745; font-weight: bold; }
    .status-warning { color: #ffc107; font-weight: bold; }
    .status-danger { color: #dc3545; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Carousel Browser Compatibility Report</h1>
    <p>Generated on ${new Date(reportData.timestamp).toLocaleString()}</p>
    <div class="success-rate ${reportData.summary.overallSuccessRate >= 80 ? 'success' : reportData.summary.overallSuccessRate >= 60 ? 'warning' : 'danger'}">
      ${reportData.summary.overallSuccessRate}% Overall Success Rate
    </div>
  </div>
  
  <div class="summary">
    <div class="card">
      <h3>Browser Compatibility</h3>
      ${Object.entries(reportData.summary.browsers).map(([browser, data]) => `
        <p><strong>${browser}</strong>: ${data.averageRate}% (${data.success}/${data.total} viewports)</p>
      `).join('')}
    </div>
    
    <div class="card">
      <h3>Viewport Compatibility</h3>
      ${Object.entries(reportData.summary.viewports).map(([viewport, data]) => `
        <p><strong>${viewport}</strong>: ${data.averageRate}% (${data.success}/${data.total} browsers)</p>
      `).join('')}
    </div>
    
    <div class="card">
      <h3>Feature Test Results</h3>
      ${Object.entries(reportData.summary.tests).map(([test, data]) => `
        <p><strong>${test}</strong>: ${Math.round((data.success/data.total)*100)}% (${data.success}/${data.total})</p>
      `).join('')}
    </div>
  </div>
  
  <h2>Detailed Results</h2>
  <table class="results-table">
    <thead>
      <tr>
        <th>Browser</th>
        <th>Viewport</th>
        <th>Success Rate</th>
        <th>Structure</th>
        <th>CSS Props</th>
        <th>Navigation</th>
        <th>Images</th>
        <th>A11y</th>
        <th>Responsive</th>
        <th>Performance</th>
        <th>JS Enhancement</th>
      </tr>
    </thead>
    <tbody>
      ${reportData.results.map(result => `
        <tr>
          <td>${result.browser}</td>
          <td>${result.viewport}</td>
          <td class="${result.successRate >= 80 ? 'status-success' : result.successRate >= 60 ? 'status-warning' : 'status-danger'}">
            ${result.successRate}%
          </td>
          <td class="${result.tests?.structureLoads?.success ? 'status-success' : 'status-danger'}">
            ${result.tests?.structureLoads?.success ? '✓' : '✗'}
          </td>
          <td class="${result.tests?.cssCustomProperties?.success ? 'status-success' : 'status-warning'}">
            ${result.tests?.cssCustomProperties?.success ? '✓' : '○'}
          </td>
          <td class="${result.tests?.navigation?.success ? 'status-success' : 'status-danger'}">
            ${result.tests?.navigation?.success ? '✓' : '✗'}
          </td>
          <td class="${result.tests?.images?.success ? 'status-success' : 'status-danger'}">
            ${result.tests?.images?.success ? '✓' : '✗'}
          </td>
          <td class="${result.tests?.accessibility?.success ? 'status-success' : 'status-danger'}">
            ${result.tests?.accessibility?.success ? '✓' : '✗'}
          </td>
          <td class="${result.tests?.responsive?.success ? 'status-success' : 'status-danger'}">
            ${result.tests?.responsive?.success ? '✓' : '✗'}
          </td>
          <td class="${result.tests?.performance?.success ? 'status-success' : 'status-warning'}">
            ${result.tests?.performance?.success ? '✓' : '○'}
          </td>
          <td class="${result.tests?.jsEnhancement?.success ? 'status-success' : 'status-warning'}">
            ${result.tests?.jsEnhancement?.success ? '✓' : '○'}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <h2>Legend</h2>
  <p>
    <span class="status-success">✓ Pass</span> |
    <span class="status-warning">○ Partial/Optional</span> |
    <span class="status-danger">✗ Fail</span>
  </p>
</body>
</html>`;
  }
  
  printSummary(summary) {
    console.log('📈 COMPATIBILITY SUMMARY');
    console.log('========================');
    console.log(`Overall Success Rate: ${summary.overallSuccessRate}%\n`);
    
    console.log('Browser Performance:');
    Object.entries(summary.browsers).forEach(([browser, data]) => {
      const status = data.averageRate >= 80 ? '✅' : data.averageRate >= 60 ? '⚠️' : '❌';
      console.log(`  ${status} ${browser}: ${data.averageRate}%`);
    });
    
    console.log('\nViewport Performance:');
    Object.entries(summary.viewports).forEach(([viewport, data]) => {
      const status = data.averageRate >= 80 ? '✅' : data.averageRate >= 60 ? '⚠️' : '❌';
      console.log(`  ${status} ${viewport}: ${data.averageRate}%`);
    });
    
    console.log('\nFeature Support:');
    Object.entries(summary.tests).forEach(([test, data]) => {
      const percentage = Math.round((data.success / data.total) * 100);
      const status = percentage >= 90 ? '✅' : percentage >= 70 ? '⚠️' : '❌';
      console.log(`  ${status} ${test}: ${percentage}% (${data.success}/${data.total})`);
    });
  }
  
  async ensureDirectoryExists(dir) {
    try {
      await fs.promises.access(dir);
    } catch {
      await fs.promises.mkdir(dir, { recursive: true });
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new BrowserCompatibilityTester();
  tester.runTests().catch(console.error);
}

module.exports = BrowserCompatibilityTester;