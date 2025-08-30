/**
 * CSS Performance Benchmark Suite
 * Measures theme switching performance, CSS parsing, and rendering metrics
 */

class CSSPerformanceBenchmark {
  constructor() {
    this.metrics = {
      parsing: {},
      rendering: {},
      transitions: {},
      memory: {}
    };
  }

  async runBenchmarks() {
    console.log('🚀 Starting CSS Performance Benchmarks...');
    
    await this.benchmarkCSSParsing();
    await this.benchmarkThemeTransitions();
    await this.benchmarkMemoryUsage();
    await this.benchmarkRenderingPerformance();
    
    return this.generatePerformanceReport();
  }

  async benchmarkCSSParsing() {
    const startTime = performance.now();
    
    // Simulate CSS parsing by creating style elements
    const cssFiles = [
      '/css/theme-variables.css',
      '/css/theme-base.css', 
      '/css/theme-toggle.css'
    ];

    const parsingTimes = [];
    
    for (const cssFile of cssFiles) {
      const parseStart = performance.now();
      
      // Create and inject stylesheet
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssFile;
      
      await new Promise((resolve) => {
        link.onload = () => {
          const parseEnd = performance.now();
          parsingTimes.push({
            file: cssFile,
            parseTime: parseEnd - parseStart
          });
          resolve();
        };
        document.head.appendChild(link);
      });
    }

    this.metrics.parsing = {
      totalTime: performance.now() - startTime,
      individualFiles: parsingTimes,
      averageParseTime: parsingTimes.reduce((sum, item) => sum + item.parseTime, 0) / parsingTimes.length
    };
  }

  async benchmarkThemeTransitions() {
    const transitionMetrics = {
      themeSwitch: [],
      propertyUpdates: [],
      frameTimes: []
    };

    // Test theme switching performance
    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();
      
      // Toggle theme
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // Wait for transition to complete
      await this.waitForTransition();
      
      const endTime = performance.now();
      transitionMetrics.themeSwitch.push(endTime - startTime);
    }

    // Test CSS custom property updates
    const testProperties = [
      '--color-background',
      '--color-text-primary',
      '--color-primary',
      '--shadow-base'
    ];

    for (const property of testProperties) {
      const startTime = performance.now();
      
      // Force custom property recalculation
      const computedValue = getComputedStyle(document.documentElement).getPropertyValue(property);
      
      const endTime = performance.now();
      transitionMetrics.propertyUpdates.push({
        property,
        computeTime: endTime - startTime,
        value: computedValue.trim()
      });
    }

    this.metrics.transitions = {
      averageSwitchTime: transitionMetrics.themeSwitch.reduce((a, b) => a + b, 0) / transitionMetrics.themeSwitch.length,
      minSwitchTime: Math.min(...transitionMetrics.themeSwitch),
      maxSwitchTime: Math.max(...transitionMetrics.themeSwitch),
      propertyUpdates: transitionMetrics.propertyUpdates
    };
  }

  waitForTransition() {
    return new Promise(resolve => {
      const duration = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--theme-transition-duration').replace('s', '')) * 1000;
      setTimeout(resolve, duration + 50); // Add 50ms buffer
    });
  }

  async benchmarkMemoryUsage() {
    if ('memory' in performance) {
      const beforeMemory = performance.memory;
      
      // Create many theme-related elements
      const testElements = [];
      for (let i = 0; i < 1000; i++) {
        const div = document.createElement('div');
        div.className = 'card theme-test-element';
        div.style.cssText = `
          background-color: var(--color-surface);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
        `;
        testElements.push(div);
        document.body.appendChild(div);
      }

      // Force style recalculation
      testElements.forEach(el => getComputedStyle(el).backgroundColor);

      const afterMemory = performance.memory;

      // Clean up
      testElements.forEach(el => el.remove());

      this.metrics.memory = {
        usedJSHeapSize: afterMemory.usedJSHeapSize - beforeMemory.usedJSHeapSize,
        totalJSHeapSize: afterMemory.totalJSHeapSize,
        jsHeapSizeLimit: afterMemory.jsHeapSizeLimit,
        memoryEfficient: (afterMemory.usedJSHeapSize - beforeMemory.usedJSHeapSize) < 1024 * 1024 // Less than 1MB
      };
    } else {
      this.metrics.memory = {
        note: 'Performance.memory API not available in this browser'
      };
    }
  }

  async benchmarkRenderingPerformance() {
    const renderingMetrics = {
      paintTimes: [],
      layoutTimes: [],
      compositeTimes: []
    };

    // Test rendering performance with PerformanceObserver
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'paint':
              renderingMetrics.paintTimes.push({
                name: entry.name,
                startTime: entry.startTime,
                duration: entry.duration
              });
              break;
            case 'layout-shift':
              renderingMetrics.layoutTimes.push({
                startTime: entry.startTime,
                value: entry.value
              });
              break;
          }
        }
      });

      observer.observe({ entryTypes: ['paint', 'layout-shift'] });

      // Trigger theme changes and measure
      for (let i = 0; i < 5; i++) {
        document.documentElement.setAttribute('data-theme', i % 2 === 0 ? 'dark' : 'light');
        await this.waitForTransition();
      }

      observer.disconnect();
    }

    // Test FPS during transitions
    const fpsMeasurement = await this.measureFPS();

    this.metrics.rendering = {
      paintMetrics: renderingMetrics.paintTimes,
      layoutShifts: renderingMetrics.layoutTimes,
      fps: fpsMeasurement,
      smoothTransitions: fpsMeasurement.averageFPS > 50
    };
  }

  measureFPS() {
    return new Promise(resolve => {
      const frameTimes = [];
      let lastTime = performance.now();
      let frameCount = 0;

      function measureFrame() {
        const currentTime = performance.now();
        const frameTime = currentTime - lastTime;
        frameTimes.push(frameTime);
        lastTime = currentTime;
        frameCount++;

        if (frameCount < 60) { // Measure for ~1 second at 60fps
          requestAnimationFrame(measureFrame);
        } else {
          const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          const averageFPS = 1000 / averageFrameTime;
          
          resolve({
            averageFPS: Math.round(averageFPS),
            frameTimeVariance: Math.sqrt(frameTimes.reduce((sq, n) => sq + Math.pow(n - averageFrameTime, 2), 0) / frameTimes.length),
            droppedFrames: frameTimes.filter(time => time > 16.67).length // Frames longer than 16.67ms (60fps threshold)
          });
        }
      }

      // Start theme transition and measure FPS
      document.documentElement.setAttribute('data-theme', 
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
      );
      
      requestAnimationFrame(measureFrame);
    });
  }

  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      metrics: this.metrics,
      scores: this.calculatePerformanceScores(),
      recommendations: this.generateOptimizationRecommendations()
    };

    return report;
  }

  calculatePerformanceScores() {
    const scores = {
      parsing: this.metrics.parsing.averageParseTime < 50 ? 100 : Math.max(0, 100 - this.metrics.parsing.averageParseTime),
      transitions: this.metrics.transitions.averageSwitchTime < 100 ? 100 : Math.max(0, 100 - this.metrics.transitions.averageSwitchTime / 2),
      memory: this.metrics.memory.memoryEfficient ? 100 : 70,
      rendering: this.metrics.rendering.fps?.averageFPS > 50 ? 100 : (this.metrics.rendering.fps?.averageFPS || 60) / 60 * 100
    };

    const overall = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

    return {
      individual: scores,
      overall: Math.round(overall),
      grade: overall >= 90 ? 'A+' : overall >= 80 ? 'A' : overall >= 70 ? 'B' : overall >= 60 ? 'C' : 'D'
    };
  }

  generateOptimizationRecommendations() {
    const recommendations = [];

    if (this.metrics.parsing.averageParseTime > 50) {
      recommendations.push('Consider minifying CSS files for faster parsing');
    }

    if (this.metrics.transitions.averageSwitchTime > 100) {
      recommendations.push('Optimize CSS transitions - consider reducing animated properties');
    }

    if (this.metrics.memory && !this.metrics.memory.memoryEfficient) {
      recommendations.push('Monitor memory usage with many theme-aware elements');
    }

    if (this.metrics.rendering.fps && this.metrics.rendering.fps.averageFPS < 50) {
      recommendations.push('Optimize rendering performance - consider will-change property for transitioning elements');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is excellent - no optimizations needed');
    }

    return recommendations;
  }
}

// Auto-run benchmarks if in browser environment
if (typeof window !== 'undefined') {
  window.CSSPerformanceBenchmark = CSSPerformanceBenchmark;
}

module.exports = CSSPerformanceBenchmark;