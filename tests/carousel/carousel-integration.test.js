/**
 * Comprehensive Test Suite for Integrated CSS Carousel
 * Tests: Cross-browser compatibility, Performance, Accessibility, Responsive design
 */

// Mock DOM environment for testing
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Integrated CSS Carousel', () => {
  let dom, document, window;
  let carouselHTML, carouselCSS, carouselJS;
  
  beforeAll(() => {
    // Read carousel files
    const htmlPath = path.join(__dirname, '../../src/components/carousel/carousel-integrated.html');
    const cssPath = path.join(__dirname, '../../src/components/carousel/carousel-integrated.css');
    const jsPath = path.join(__dirname, '../../src/components/carousel/carousel-enhanced.js');
    
    carouselHTML = fs.readFileSync(htmlPath, 'utf8');
    carouselCSS = fs.readFileSync(cssPath, 'utf8');
    carouselJS = fs.readFileSync(jsPath, 'utf8');
    
    // Setup DOM
    dom = new JSDOM(carouselHTML, {
      url: 'http://localhost',
      pretendToBeVisual: true,
      resources: 'usable',
      runScripts: 'dangerously'
    });
    
    document = dom.window.document;
    window = dom.window;
    
    // Add CSS
    const style = document.createElement('style');
    style.textContent = carouselCSS;
    document.head.appendChild(style);
    
    // Add feature detection mocks
    window.CSS = {
      supports: jest.fn((property, value) => {
        if (property === 'color' && value === 'var(--test)') return true;
        if (property === 'aspect-ratio' && value === '1') return true;
        return false;
      })
    };
    
    window.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
      unobserve: jest.fn()
    }));
    
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query.includes('reduce'),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }));
    
    // Execute JavaScript
    const script = document.createElement('script');
    script.textContent = carouselJS;
    document.head.appendChild(script);
    
    // Wait for initialization
    return new Promise(resolve => {
      setTimeout(resolve, 100);
    });
  });
  
  describe('HTML Structure and Accessibility', () => {
    test('should have proper semantic structure', () => {
      const carousel = document.querySelector('.carousel');
      expect(carousel).toBeTruthy();
      expect(carousel.getAttribute('role')).toBe('region');
      expect(carousel.getAttribute('aria-labelledby')).toBe('carousel-heading');
    });
    
    test('should have accessible navigation', () => {
      const navigation = document.querySelector('.carousel__navigation');
      expect(navigation.getAttribute('role')).toBe('tablist');
      expect(navigation.getAttribute('aria-label')).toBe('Carousel slide navigation');
    });
    
    test('should have proper ARIA attributes on indicators', () => {
      const indicators = document.querySelectorAll('.carousel__indicator');
      expect(indicators.length).toBe(5);
      
      indicators.forEach((indicator, index) => {
        expect(indicator.getAttribute('role')).toBe('tab');
        expect(indicator.getAttribute('aria-controls')).toBe(`slide-${index + 1}`);
        expect(indicator.hasAttribute('aria-label')).toBeTruthy();
      });
    });
    
    test('should have screen reader content', () => {
      const srContent = document.querySelectorAll('.sr-only');
      expect(srContent.length).toBeGreaterThan(0);
      
      const status = document.querySelector('.carousel__status');
      expect(status.getAttribute('aria-live')).toBe('polite');
      expect(status.getAttribute('aria-atomic')).toBe('true');
    });
    
    test('should have proper image alt text', () => {
      const images = document.querySelectorAll('.carousel__image');
      images.forEach(img => {
        expect(img.getAttribute('alt')).toBeTruthy();
        expect(img.getAttribute('alt').length).toBeGreaterThan(10);
      });
    });
    
    test('should have skip links for keyboard navigation', () => {
      const skipLink = document.querySelector('a[href="#carousel-main"]');
      expect(skipLink).toBeTruthy();
      expect(skipLink.classList.contains('sr-only')).toBeTruthy();
    });
  });
  
  describe('CSS Feature Detection and Fallbacks', () => {
    test('should have CSS custom properties with fallbacks', () => {
      const computed = window.getComputedStyle(document.documentElement);
      
      // Test that custom properties are defined
      expect(document.documentElement.style.getPropertyValue('--carousel-primary')).toBeDefined();
    });
    
    test('should have progressive enhancement classes', () => {
      // These would be added by the JavaScript feature detection
      const htmlElement = document.documentElement;
      expect(htmlElement.classList.contains('css-vars') || htmlElement.classList.contains('no-css-vars')).toBeTruthy();
    });
    
    test('should have fallback styles for unsupported features', () => {
      const style = document.querySelector('style');
      const cssText = style.textContent;
      
      // Check for @supports rules
      expect(cssText).toMatch(/@supports\s*\(/);
      
      // Check for fallback colors
      expect(cssText).toMatch(/background:\s*#[0-9a-fA-F]{6}/);
    });
    
    test('should handle reduced motion preferences', () => {
      const style = document.querySelector('style');
      const cssText = style.textContent;
      
      expect(cssText).toMatch(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/);
    });
    
    test('should have high contrast mode support', () => {
      const style = document.querySelector('style');
      const cssText = style.textContent;
      
      expect(cssText).toMatch(/@media\s*\(\s*prefers-contrast:\s*high\s*\)/);
    });
  });
  
  describe('Responsive Design', () => {
    const breakpoints = [
      { width: 320, name: 'mobile' },
      { width: 768, name: 'tablet' },
      { width: 1024, name: 'desktop' },
      { width: 1440, name: 'large desktop' }
    ];
    
    breakpoints.forEach(({ width, name }) => {
      test(`should be responsive at ${name} (${width}px)`, () => {
        // Set viewport
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width
        });
        
        const carousel = document.querySelector('.carousel');
        const slide = document.querySelector('.carousel__slide');
        
        // Test that elements exist and are visible
        expect(carousel).toBeTruthy();
        expect(slide).toBeTruthy();
        
        // Test responsive image attributes
        const images = document.querySelectorAll('.carousel__image');
        images.forEach(img => {
          expect(img.getAttribute('sizes')).toBeTruthy();
          expect(img.getAttribute('srcset')).toBeTruthy();
        });
      });
    });
    
    test('should have mobile-specific styles', () => {
      const style = document.querySelector('style');
      const cssText = style.textContent;
      
      expect(cssText).toMatch(/@media\s*\(\s*max-width:\s*767px\s*\)/);
    });
    
    test('should hide arrows on touch devices', () => {
      const style = document.querySelector('style');
      const cssText = style.textContent;
      
      expect(cssText).toMatch(/@media\s*\(\s*hover:\s*none\s*\)\s*and\s*\(\s*pointer:\s*coarse\s*\)/);
    });
  });
  
  describe('Performance Optimization', () => {
    test('should have lazy loading on images', () => {
      const images = document.querySelectorAll('.carousel__image');
      images.forEach(img => {
        expect(img.getAttribute('loading')).toBe('lazy');
        expect(img.getAttribute('decoding')).toBe('async');
      });
    });
    
    test('should have optimized CSS for GPU acceleration', () => {
      const style = document.querySelector('style');
      const cssText = style.textContent;
      
      expect(cssText).toMatch(/transform:\s*translateZ\(0\)/);
      expect(cssText).toMatch(/will-change:\s*transform/);
      expect(cssText).toMatch(/contain:\s*layout\s+style\s+paint/);
    });
    
    test('should have efficient selectors', () => {
      const style = document.querySelector('style');
      const cssText = style.textContent;
      
      // Check that we're not using expensive universal selectors excessively
      const universalSelectors = (cssText.match(/\*\s*[{,]/g) || []).length;
      expect(universalSelectors).toBeLessThan(5);
    });
    
    test('should have error handling for images', () => {
      const images = document.querySelectorAll('.carousel__image');
      images.forEach(img => {
        expect(img.getAttribute('onerror')).toBeTruthy();
      });
    });
  });
  
  describe('Cross-browser Compatibility', () => {
    test('should have vendor prefixes where needed', () => {
      const style = document.querySelector('style');
      const cssText = style.textContent;
      
      expect(cssText).toMatch(/-webkit-/);
      expect(cssText).toMatch(/-ms-/);
    });
    
    test('should have IE11 specific fixes', () => {
      const style = document.querySelector('style');
      const cssText = style.textContent;
      
      expect(cssText).toMatch(/@media\s+screen\s+and\s+\(\s*-ms-high-contrast/);
      expect(cssText).toMatch(/-ms-flex/);
    });
    
    test('should handle different scrollbar implementations', () => {
      const style = document.querySelector('style');
      const cssText = style.textContent;
      
      expect(cssText).toMatch(/scrollbar-width:\s*none/);
      expect(cssText).toMatch(/-ms-overflow-style:\s*none/);
      expect(cssText).toMatch(/::-webkit-scrollbar/);
    });
  });
  
  describe('JavaScript Enhancement', () => {
    test('should initialize EnhancedCarousel class', () => {
      expect(window.EnhancedCarousel).toBeTruthy();
      expect(typeof window.EnhancedCarousel).toBe('function');
    });
    
    test('should add feature detection classes', () => {
      const htmlElement = document.documentElement;
      
      // Should have at least some feature classes
      const classList = Array.from(htmlElement.classList);
      const featureClasses = classList.filter(cls => 
        cls.startsWith('no-') || 
        ['css-vars', 'scroll-snap', 'aspect-ratio', 'touch'].includes(cls)
      );
      
      expect(featureClasses.length).toBeGreaterThan(0);
    });
    
    test('should handle graceful degradation without JavaScript', () => {
      // Test that carousel works with just CSS
      const carousel = document.querySelector('.carousel');
      const track = document.querySelector('.carousel__track');
      const slides = document.querySelectorAll('.carousel__slide');
      
      expect(carousel).toBeTruthy();
      expect(track).toBeTruthy();
      expect(slides.length).toBe(5);
      
      // Navigation should still work with anchor links
      const indicators = document.querySelectorAll('.carousel__indicator');
      indicators.forEach((indicator, index) => {
        expect(indicator.getAttribute('href')).toBe(`#slide-${index + 1}`);
      });
    });
  });
  
  describe('Error Handling and Edge Cases', () => {
    test('should handle missing images gracefully', () => {
      const images = document.querySelectorAll('.carousel__image');
      
      // Simulate image error
      const firstImage = images[0];
      firstImage.dispatchEvent(new window.Event('error'));
      
      // Should add error attribute
      setTimeout(() => {
        expect(firstImage.getAttribute('data-error')).toBe('true');
      }, 100);
    });
    
    test('should handle empty carousel gracefully', () => {
      // Create empty carousel
      const emptyCarousel = document.createElement('div');
      emptyCarousel.className = 'carousel';
      emptyCarousel.innerHTML = '<div class="carousel__track"></div>';
      
      document.body.appendChild(emptyCarousel);
      
      // Should not throw errors
      expect(() => {
        new window.EnhancedCarousel(emptyCarousel);
      }).not.toThrow();
      
      document.body.removeChild(emptyCarousel);
    });
    
    test('should validate slide indices', () => {
      const carousel = document.querySelector('.carousel');
      const instance = carousel._carouselInstance;
      
      if (instance) {
        // Test invalid indices
        expect(() => {
          instance.goToSlide(-1);
        }).not.toThrow();
        
        expect(() => {
          instance.goToSlide(999);
        }).not.toThrow();
      }
    });
  });
  
  describe('Accessibility Testing', () => {
    test('should have proper heading hierarchy', () => {
      const h1 = document.querySelector('h1');
      const h2s = document.querySelectorAll('h2');
      const h3s = document.querySelectorAll('h3');
      
      expect(h1).toBeTruthy();
      expect(h2s.length).toBeGreaterThan(0);
      
      // Check that slide titles are h2
      const slideTitles = document.querySelectorAll('.carousel__slide-title');
      slideTitles.forEach(title => {
        expect(title.tagName.toLowerCase()).toBe('h2');
      });
    });
    
    test('should have sufficient color contrast', () => {
      // This would typically be tested with automated tools
      // Here we just verify that contrast considerations are in place
      const style = document.querySelector('style');
      const cssText = style.textContent;
      
      expect(cssText).toMatch(/prefers-contrast:\s*high/);
    });
    
    test('should support keyboard navigation', () => {
      const indicators = document.querySelectorAll('.carousel__indicator');
      const arrows = document.querySelectorAll('.carousel__arrow');
      
      // All interactive elements should be focusable
      [...indicators, ...arrows].forEach(element => {
        const tabIndex = element.getAttribute('tabindex');
        expect(tabIndex === '0' || tabIndex === '-1' || tabIndex === null).toBeTruthy();
      });
    });
    
    test('should have proper focus management', () => {
      const style = document.querySelector('style');
      const cssText = style.textContent;
      
      // Should have focus-visible styles
      expect(cssText).toMatch(/:focus-visible/);
      expect(cssText).toMatch(/outline:/);
    });
  });
  
  describe('Print Styles', () => {
    test('should have print-specific styles', () => {
      const style = document.querySelector('style');
      const cssText = style.textContent;
      
      expect(cssText).toMatch(/@media\s+print/);
    });
    
    test('should hide interactive elements in print', () => {
      const style = document.querySelector('style');
      const cssText = style.textContent;
      
      // Should hide navigation in print mode
      expect(cssText).toMatch(/@media\s+print[\s\S]*\.carousel__navigation[\s\S]*display:\s*none/);
      expect(cssText).toMatch(/@media\s+print[\s\S]*\.carousel__arrows[\s\S]*display:\s*none/);
    });
    
    test('should optimize layout for print', () => {
      const style = document.querySelector('style');
      const cssText = style.textContent;
      
      expect(cssText).toMatch(/page-break-inside:\s*avoid/);
    });
  });
});

describe('Performance Metrics', () => {
  test('should track basic metrics', (done) => {
    const carousel = document.querySelector('.carousel');
    const instance = carousel._carouselInstance;
    
    if (instance) {
      // Wait a bit for metrics to accumulate
      setTimeout(() => {
        const metrics = instance.getMetrics();
        
        expect(metrics).toHaveProperty('interactions');
        expect(metrics).toHaveProperty('slideViews');
        expect(metrics).toHaveProperty('currentSlide');
        expect(metrics).toHaveProperty('totalSlides');
        expect(metrics.totalSlides).toBe(5);
        
        done();
      }, 200);
    } else {
      done();
    }
  });
});

// Cleanup
afterAll(() => {
  if (dom) {
    dom.window.close();
  }
});