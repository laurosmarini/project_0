/**
 * Cross-Browser Compatibility Testing Matrix
 * Tests CSS-only carousel across different browsers and versions
 */

class BrowserCompatibilityTester {
  constructor() {
    this.supportMatrix = this.generateSupportMatrix();
    this.criticalFeatures = this.defineCriticalFeatures();
  }

  generateSupportMatrix() {
    return {
      chrome: {
        name: "Google Chrome",
        versions: {
          "118+": { support: "full", notes: "Complete support for all features" },
          "90-117": { support: "full", notes: "Minor CSS grid improvements in newer versions" },
          "80-89": { support: "partial", notes: "Some CSS custom property limitations" },
          "<80": { support: "minimal", notes: "Requires significant fallbacks" }
        },
        marketShare: "65.12%",
        testPriority: "critical"
      },
      firefox: {
        name: "Mozilla Firefox", 
        versions: {
          "118+": { support: "full", notes: "Excellent standards compliance" },
          "100-117": { support: "full", notes: "Strong CSS support with minor vendor prefixes" },
          "80-99": { support: "good", notes: "scroll-snap behavior slightly different" },
          "<80": { support: "partial", notes: "CSS grid gaps need fallbacks" }
        },
        marketShare: "3.05%",
        testPriority: "high"
      },
      safari: {
        name: "Apple Safari",
        versions: {
          "16+": { support: "full", notes: "Safari 16 resolved major CSS issues" },
          "14-15": { support: "good", notes: "Some scroll-snap inconsistencies" },
          "12-13": { support: "partial", notes: "CSS custom properties need fallbacks" },
          "<12": { support: "minimal", notes: "Significant feature gaps" }
        },
        marketShare: "18.78%", 
        testPriority: "critical"
      },
      edge: {
        name: "Microsoft Edge",
        versions: {
          "118+": { support: "full", notes: "Chromium-based, identical to Chrome" },
          "79-117": { support: "full", notes: "Strong Chromium compatibility" },
          "Legacy": { support: "poor", notes: "Legacy Edge lacks modern CSS features" }
        },
        marketShare: "4.12%",
        testPriority: "medium"
      },
      opera: {
        name: "Opera",
        versions: {
          "104+": { support: "full", notes: "Chromium-based, mirrors Chrome support" },
          "76-103": { support: "full", notes: "Excellent compatibility" }
        },
        marketShare: "2.08%",
        testPriority: "low"
      },
      mobileSafari: {
        name: "Mobile Safari (iOS)",
        versions: {
          "16+": { support: "full", notes: "Improved touch and gesture handling" },
          "14-15": { support: "good", notes: "Touch scrolling optimizations needed" },
          "<14": { support: "partial", notes: "Scroll-snap support limited" }
        },
        marketShare: "22.54%",
        testPriority: "critical"
      },
      chrome_mobile: {
        name: "Chrome Mobile",
        versions: {
          "118+": { support: "full", notes: "Desktop parity with touch optimizations" },
          "90-117": { support: "full", notes: "Strong mobile performance" }
        },
        marketShare: "31.12%",
        testPriority: "critical"
      }
    };
  }

  defineCriticalFeatures() {
    return [
      {
        feature: "CSS Custom Properties",
        cssProperty: "--carousel-primary",
        fallback: "hardcoded colors",
        support: {
          chrome: "88+",
          firefox: "31+", 
          safari: "10+",
          edge: "79+"
        },
        testMethod: "checkCustomPropsSupport"
      },
      {
        feature: "CSS Grid Layout",
        cssProperty: "display: grid",
        fallback: "flexbox layout",
        support: {
          chrome: "57+",
          firefox: "52+",
          safari: "10.1+", 
          edge: "79+"
        },
        testMethod: "checkGridSupport"
      },
      {
        feature: "Scroll Snap",
        cssProperty: "scroll-snap-type",
        fallback: "regular scroll behavior",
        support: {
          chrome: "69+",
          firefox: "68+",
          safari: "11+",
          edge: "79+"
        },
        testMethod: "checkScrollSnapSupport"
      },
      {
        feature: "CSS Transforms",
        cssProperty: "transform: translateX()",
        fallback: "margin-left positioning",
        support: {
          chrome: "36+",
          firefox: "16+",
          safari: "9+",
          edge: "79+"
        },
        testMethod: "checkTransformSupport"
      },
      {
        feature: ":target Pseudo-class",
        cssProperty: ":target",
        fallback: "none needed",
        support: {
          chrome: "1+",
          firefox: "1+",
          safari: "1.2+",
          edge: "79+"
        },
        testMethod: "checkTargetSupport"
      },
      {
        feature: "Backdrop Filter",
        cssProperty: "backdrop-filter: blur()",
        fallback: "solid background",
        support: {
          chrome: "76+",
          firefox: "103+",
          safari: "9+",
          edge: "79+"
        },
        testMethod: "checkBackdropFilterSupport"
      },
      {
        feature: "CSS Gap",
        cssProperty: "gap",
        fallback: "margin-based spacing",
        support: {
          chrome: "84+",
          firefox: "63+",
          safari: "14.1+",
          edge: "84+"
        },
        testMethod: "checkGapSupport"
      },
      {
        feature: "aspect-ratio",
        cssProperty: "aspect-ratio: 16/10",
        fallback: "padding-top percentage",
        support: {
          chrome: "88+",
          firefox: "89+",
          safari: "15+",
          edge: "88+"
        },
        testMethod: "checkAspectRatioSupport"
      }
    ];
  }

  // FEATURE DETECTION METHODS
  checkCustomPropsSupport() {
    return CSS.supports('--custom', 'value');
  }

  checkGridSupport() {
    return CSS.supports('display', 'grid');
  }

  checkScrollSnapSupport() {
    return CSS.supports('scroll-snap-type', 'x mandatory');
  }

  checkTransformSupport() {
    return CSS.supports('transform', 'translateX(100px)');
  }

  checkTargetSupport() {
    // :target is universally supported, but check for CSS.supports availability
    return typeof CSS !== 'undefined';
  }

  checkBackdropFilterSupport() {
    return CSS.supports('backdrop-filter', 'blur(10px)') || 
           CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
  }

  checkGapSupport() {
    return CSS.supports('gap', '1rem');
  }

  checkAspectRatioSupport() {
    return CSS.supports('aspect-ratio', '16/9');
  }

  // AUTOMATED TESTING
  runFeatureDetection() {
    const results = {
      browser: this.detectBrowser(),
      features: {},
      fallbacksNeeded: [],
      overallCompatibility: 'unknown'
    };

    this.criticalFeatures.forEach(feature => {
      const isSupported = this[feature.testMethod]();
      results.features[feature.feature] = {
        supported: isSupported,
        fallback: isSupported ? null : feature.fallback,
        critical: ['CSS Custom Properties', 'CSS Transforms', ':target Pseudo-class'].includes(feature.feature)
      };

      if (!isSupported) {
        results.fallbacksNeeded.push({
          feature: feature.feature,
          fallback: feature.fallback,
          critical: results.features[feature.feature].critical
        });
      }
    });

    // Calculate overall compatibility
    const supportedCount = Object.values(results.features).filter(f => f.supported).length;
    const totalCount = this.criticalFeatures.length;
    const supportPercentage = (supportedCount / totalCount) * 100;

    if (supportPercentage >= 90) results.overallCompatibility = 'excellent';
    else if (supportPercentage >= 75) results.overallCompatibility = 'good';
    else if (supportPercentage >= 50) results.overallCompatibility = 'partial';
    else results.overallCompatibility = 'poor';

    return results;
  }

  detectBrowser() {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      return { name: 'Chrome', version: this.extractVersion(userAgent, 'Chrome/') };
    } else if (userAgent.includes('Firefox')) {
      return { name: 'Firefox', version: this.extractVersion(userAgent, 'Firefox/') };
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return { name: 'Safari', version: this.extractVersion(userAgent, 'Version/') };
    } else if (userAgent.includes('Edg')) {
      return { name: 'Edge', version: this.extractVersion(userAgent, 'Edg/') };
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      return { name: 'Opera', version: this.extractVersion(userAgent, 'OPR/') };
    } else {
      return { name: 'Unknown', version: 'Unknown' };
    }
  }

  extractVersion(userAgent, prefix) {
    const versionStart = userAgent.indexOf(prefix) + prefix.length;
    const versionEnd = userAgent.indexOf(' ', versionStart);
    return userAgent.substring(versionStart, versionEnd === -1 ? undefined : versionEnd);
  }

  // COMPATIBILITY REPORT GENERATOR
  generateCompatibilityReport() {
    const detection = this.runFeatureDetection();
    const browserInfo = this.supportMatrix[detection.browser.name.toLowerCase()];

    return {
      testSummary: {
        browser: detection.browser,
        timestamp: new Date().toISOString(),
        overallCompatibility: detection.overallCompatibility,
        supportedFeatures: Object.keys(detection.features).filter(f => detection.features[f].supported).length,
        totalFeatures: this.criticalFeatures.length
      },
      featureAnalysis: detection.features,
      fallbackRecommendations: detection.fallbacksNeeded,
      browserContext: browserInfo,
      recommendations: this.generateRecommendations(detection),
      testMatrix: this.generateTestMatrix()
    };
  }

  generateRecommendations(detection) {
    const recommendations = [];

    if (detection.fallbacksNeeded.some(f => f.feature === 'CSS Custom Properties')) {
      recommendations.push({
        priority: 'High',
        type: 'Fallback Required',
        description: 'Implement hardcoded color values for older browsers',
        implementation: 'Use PostCSS custom properties plugin or Sass variables'
      });
    }

    if (detection.fallbacksNeeded.some(f => f.feature === 'Scroll Snap')) {
      recommendations.push({
        priority: 'Medium',
        type: 'Graceful Degradation',
        description: 'Carousel remains functional without scroll-snap',
        implementation: 'No action needed - carousel works with regular scrolling'
      });
    }

    if (detection.fallbacksNeeded.some(f => f.feature === 'Backdrop Filter')) {
      recommendations.push({
        priority: 'Low',
        type: 'Visual Enhancement',
        description: 'Use solid background as fallback for navigation blur',
        implementation: 'Already implemented via background: rgba() fallback'
      });
    }

    return recommendations;
  }

  generateTestMatrix() {
    return {
      desktop: {
        chrome: { priority: 'critical', coverage: '65%' },
        firefox: { priority: 'high', coverage: '8%' },
        safari: { priority: 'high', coverage: '19%' },
        edge: { priority: 'medium', coverage: '4%' }
      },
      mobile: {
        chrome_mobile: { priority: 'critical', coverage: '31%' },
        mobile_safari: { priority: 'critical', coverage: '23%' },
        samsung_internet: { priority: 'medium', coverage: '3%' }
      },
      testingApproach: [
        'Automated feature detection via CSS.supports()',
        'Visual regression testing across browsers',
        'Functional testing on real devices',
        'Performance benchmarking per browser',
        'Accessibility testing with screen readers'
      ]
    };
  }
}

// Export and auto-run
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrowserCompatibilityTester;
}

if (typeof window !== 'undefined') {
  window.browserCompatibilityTester = new BrowserCompatibilityTester();
  
  // Auto-run when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const report = window.browserCompatibilityTester.generateCompatibilityReport();
    console.log('🌐 Browser Compatibility Report:', report);
    window.compatibilityReport = report;
  });
}