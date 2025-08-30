/**
 * Enhanced CSS Carousel - Progressive Enhancement JavaScript
 * Cross-browser compatible, performance-optimized, accessible
 * 
 * Features:
 * - Touch/swipe gestures
 * - Keyboard navigation enhancements
 * - Auto-play with pause on interaction
 * - Intersection Observer for performance
 * - Error handling and loading states
 * - Analytics and metrics
 */

(function(window, document) {
  'use strict';
  
  // Feature detection
  const features = {
    intersectionObserver: 'IntersectionObserver' in window,
    cssCustomProperties: CSS.supports && CSS.supports('color', 'var(--test)'),
    scrollSnap: 'scrollSnapType' in document.documentElement.style,
    aspectRatio: CSS.supports && CSS.supports('aspect-ratio', '1'),
    touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
  };
  
  // Add feature classes to document
  Object.keys(features).forEach(feature => {
    document.documentElement.classList.add(
      features[feature] ? feature : `no-${feature.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    );
  });
  
  /**
   * Enhanced Carousel Class
   */
  class EnhancedCarousel {
    constructor(element, options = {}) {
      this.carousel = element;
      this.options = {
        autoPlay: false,
        autoPlayDelay: 5000,
        pauseOnHover: true,
        pauseOnFocus: true,
        swipeThreshold: 50,
        keyboardNavigation: true,
        preloadImages: true,
        analytics: false,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        ...options
      };
      
      this.currentSlide = 0;
      this.totalSlides = 0;
      this.isPlaying = false;
      this.autoPlayTimer = null;
      this.touches = { startX: 0, endX: 0, startY: 0, endY: 0 };
      this.metrics = {
        interactions: 0,
        slideViews: {},
        timeSpent: {},
        errors: []
      };
      
      this.init();
    }
    
    /**
     * Initialize the carousel
     */
    init() {
      this.findElements();
      this.setupEventListeners();
      this.setupIntersectionObserver();
      this.preloadImages();
      this.updateState();
      
      if (this.options.autoPlay && !this.options.reducedMotion) {
        this.startAutoPlay();
      }
      
      // Log initialization
      if (this.options.analytics) {
        this.logEvent('carousel_initialized', {
          slides: this.totalSlides,
          features: Object.keys(features).filter(f => features[f])
        });
      }
    }
    
    /**
     * Find carousel elements
     */
    findElements() {
      this.track = this.carousel.querySelector('.carousel__track');
      this.slides = this.carousel.querySelectorAll('.carousel__slide');
      this.indicators = this.carousel.querySelectorAll('.carousel__indicator');
      this.arrows = this.carousel.querySelectorAll('.carousel__arrow');
      this.status = this.carousel.querySelector('.carousel__status');
      
      this.totalSlides = this.slides.length;
      
      // Set up slide indices
      this.slides.forEach((slide, index) => {
        slide.dataset.slideIndex = index;
      });
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
      // Hash change listener
      window.addEventListener('hashchange', this.handleHashChange.bind(this));
      
      // Keyboard navigation
      if (this.options.keyboardNavigation) {
        this.carousel.addEventListener('keydown', this.handleKeyboard.bind(this));
      }
      
      // Touch/swipe events
      if (features.touch) {
        this.track.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.track.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.track.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
      }
      
      // Mouse events for auto-play control
      if (this.options.pauseOnHover) {
        this.carousel.addEventListener('mouseenter', this.pauseAutoPlay.bind(this));
        this.carousel.addEventListener('mouseleave', this.resumeAutoPlay.bind(this));
      }
      
      if (this.options.pauseOnFocus) {
        this.carousel.addEventListener('focusin', this.pauseAutoPlay.bind(this));
        this.carousel.addEventListener('focusout', this.resumeAutoPlay.bind(this));
      }
      
      // Indicator clicks
      this.indicators.forEach(indicator => {
        indicator.addEventListener('click', this.handleIndicatorClick.bind(this));
      });
      
      // Arrow clicks
      this.arrows.forEach(arrow => {
        arrow.addEventListener('click', this.handleArrowClick.bind(this));
      });
      
      // Image error handling
      this.slides.forEach(slide => {
        const img = slide.querySelector('.carousel__image');
        if (img) {
          img.addEventListener('error', this.handleImageError.bind(this));
          img.addEventListener('load', this.handleImageLoad.bind(this));
        }
      });
      
      // Reduced motion preference changes
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      mediaQuery.addListener(this.handleReducedMotionChange.bind(this));
    }
    
    /**
     * Setup Intersection Observer for performance
     */
    setupIntersectionObserver() {
      if (!features.intersectionObserver) return;
      
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.handleSlideVisible(entry.target);
          } else {
            this.handleSlideHidden(entry.target);
          }
        });
      }, {
        root: this.track,
        threshold: 0.5
      });
      
      this.slides.forEach(slide => this.observer.observe(slide));
    }
    
    /**
     * Preload images for better performance
     */
    preloadImages() {
      if (!this.options.preloadImages) return;
      
      this.slides.forEach(slide => {
        const img = slide.querySelector('.carousel__image');
        if (img && img.dataset.src) {
          slide.dataset.loading = 'true';
          img.src = img.dataset.src;
        }
      });
    }
    
    /**
     * Handle hash changes
     */
    handleHashChange() {
      const hash = window.location.hash;
      const match = hash.match(/^#slide-(\d+)$/);
      
      if (match) {
        const slideIndex = parseInt(match[1]) - 1;
        if (slideIndex >= 0 && slideIndex < this.totalSlides) {
          this.goToSlide(slideIndex);
        }
      }
    }
    
    /**
     * Handle keyboard navigation
     */
    handleKeyboard(event) {
      const { key } = event;
      const activeElement = document.activeElement;
      
      // Handle indicator navigation
      if (activeElement.classList.contains('carousel__indicator')) {
        let currentIndex = Array.from(this.indicators).indexOf(activeElement);
        let newIndex = currentIndex;
        
        switch(key) {
          case 'ArrowLeft':
            event.preventDefault();
            newIndex = currentIndex > 0 ? currentIndex - 1 : this.indicators.length - 1;
            break;
          case 'ArrowRight':
            event.preventDefault();
            newIndex = currentIndex < this.indicators.length - 1 ? currentIndex + 1 : 0;
            break;
          case 'Home':
            event.preventDefault();
            newIndex = 0;
            break;
          case 'End':
            event.preventDefault();
            newIndex = this.indicators.length - 1;
            break;
          case 'Enter':
          case ' ':
            event.preventDefault();
            activeElement.click();
            return;
        }
        
        if (newIndex !== currentIndex) {
          this.indicators[newIndex].focus();
        }
      }
      
      // Global carousel shortcuts
      if (event.target === this.carousel || this.carousel.contains(event.target)) {
        switch(key) {
          case 'Escape':
            this.pauseAutoPlay();
            break;
          case 'p':
          case 'P':
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              this.toggleAutoPlay();
            }
            break;
        }
      }
    }
    
    /**
     * Handle touch start
     */
    handleTouchStart(event) {
      this.touches.startX = event.touches[0].clientX;
      this.touches.startY = event.touches[0].clientY;
      this.touches.startTime = Date.now();
      
      // Pause auto-play during touch
      this.pauseAutoPlay();
    }
    
    /**
     * Handle touch move
     */
    handleTouchMove(event) {
      // Prevent vertical scrolling if horizontal swipe detected
      const deltaX = Math.abs(event.touches[0].clientX - this.touches.startX);
      const deltaY = Math.abs(event.touches[0].clientY - this.touches.startY);
      
      if (deltaX > deltaY && deltaX > 10) {
        event.preventDefault();
      }
    }
    
    /**
     * Handle touch end
     */
    handleTouchEnd(event) {
      this.touches.endX = event.changedTouches[0].clientX;
      this.touches.endY = event.changedTouches[0].clientY;
      this.touches.endTime = Date.now();
      
      const deltaX = this.touches.startX - this.touches.endX;
      const deltaY = Math.abs(this.touches.startY - this.touches.endY);
      const deltaTime = this.touches.endTime - this.touches.startTime;
      
      // Only process horizontal swipes
      if (Math.abs(deltaX) > this.options.swipeThreshold && 
          Math.abs(deltaX) > deltaY && 
          deltaTime < 500) {
        
        if (deltaX > 0) {
          this.nextSlide();
        } else {
          this.previousSlide();
        }
        
        this.logEvent('swipe', { direction: deltaX > 0 ? 'left' : 'right' });
      }
      
      // Resume auto-play after touch
      setTimeout(() => this.resumeAutoPlay(), 1000);
    }
    
    /**
     * Handle indicator clicks
     */
    handleIndicatorClick(event) {
      event.preventDefault();
      
      const indicator = event.currentTarget;
      const slideTarget = indicator.getAttribute('data-slide-target');
      
      if (slideTarget) {
        const slideIndex = parseInt(slideTarget) - 1;
        this.goToSlide(slideIndex);
        this.logEvent('indicator_click', { slide: slideIndex });
      }
    }
    
    /**
     * Handle arrow clicks
     */
    handleArrowClick(event) {
      event.preventDefault();
      
      const arrow = event.currentTarget;
      const direction = arrow.getAttribute('data-direction');
      
      if (direction === 'next') {
        this.nextSlide();
      } else if (direction === 'prev') {
        this.previousSlide();
      }
      
      this.logEvent('arrow_click', { direction });
    }
    
    /**
     * Handle image errors
     */
    handleImageError(event) {
      const img = event.target;
      const slide = img.closest('.carousel__slide');
      
      img.setAttribute('data-error', 'true');
      slide.classList.add('carousel__slide--error');
      
      this.logEvent('image_error', {
        slide: parseInt(slide.dataset.slideIndex),
        src: img.src
      });
      
      this.metrics.errors.push({
        type: 'image_load_error',
        slide: parseInt(slide.dataset.slideIndex),
        src: img.src,
        timestamp: Date.now()
      });
    }
    
    /**
     * Handle image load success
     */
    handleImageLoad(event) {
      const img = event.target;
      const slide = img.closest('.carousel__slide');
      
      slide.removeAttribute('data-loading');
      slide.classList.add('carousel__slide--loaded');
    }
    
    /**
     * Handle reduced motion preference changes
     */
    handleReducedMotionChange(mediaQuery) {
      this.options.reducedMotion = mediaQuery.matches;
      
      if (this.options.reducedMotion) {
        this.pauseAutoPlay();
      }
    }
    
    /**
     * Handle slide becoming visible
     */
    handleSlideVisible(slide) {
      const slideIndex = parseInt(slide.dataset.slideIndex);
      
      if (!this.metrics.slideViews[slideIndex]) {
        this.metrics.slideViews[slideIndex] = 0;
      }
      this.metrics.slideViews[slideIndex]++;
      
      this.metrics.timeSpent[slideIndex] = Date.now();
    }
    
    /**
     * Handle slide becoming hidden
     */
    handleSlideHidden(slide) {
      const slideIndex = parseInt(slide.dataset.slideIndex);
      
      if (this.metrics.timeSpent[slideIndex]) {
        const viewTime = Date.now() - this.metrics.timeSpent[slideIndex];
        this.logEvent('slide_view_time', { slide: slideIndex, duration: viewTime });
      }
    }
    
    /**
     * Go to specific slide
     */
    goToSlide(slideIndex) {
      if (slideIndex < 0 || slideIndex >= this.totalSlides) return;
      
      this.currentSlide = slideIndex;
      this.updateState();
      this.updateURL();
      this.metrics.interactions++;
      
      this.logEvent('slide_change', { slide: slideIndex });
    }
    
    /**
     * Go to next slide
     */
    nextSlide() {
      const nextIndex = this.currentSlide < this.totalSlides - 1 ? 
        this.currentSlide + 1 : 0;
      this.goToSlide(nextIndex);
    }
    
    /**
     * Go to previous slide
     */
    previousSlide() {
      const prevIndex = this.currentSlide > 0 ? 
        this.currentSlide - 1 : this.totalSlides - 1;
      this.goToSlide(prevIndex);
    }
    
    /**
     * Update carousel state
     */
    updateState() {
      // Update indicators
      this.indicators.forEach((indicator, index) => {
        const isActive = index === this.currentSlide;
        indicator.setAttribute('aria-selected', isActive);
        indicator.setAttribute('tabindex', isActive ? '0' : '-1');
      });
      
      // Update arrows
      this.arrows.forEach(arrow => {
        const direction = arrow.getAttribute('data-direction');
        const targetSlide = direction === 'next' ? 
          (this.currentSlide + 1) % this.totalSlides :
          (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        
        arrow.setAttribute('href', `#slide-${targetSlide + 1}`);
      });
      
      // Update status
      if (this.status) {
        const currentSlideElement = this.slides[this.currentSlide];
        const title = currentSlideElement.querySelector('.carousel__slide-title')?.textContent || `Slide ${this.currentSlide + 1}`;
        this.status.innerHTML = `<span>Showing slide ${this.currentSlide + 1} of ${this.totalSlides}: ${title}</span>`;
      }
      
      // Update slide visibility for screen readers
      this.slides.forEach((slide, index) => {
        slide.setAttribute('aria-hidden', index !== this.currentSlide);
      });
    }
    
    /**
     * Update URL hash
     */
    updateURL() {
      const newHash = `#slide-${this.currentSlide + 1}`;
      if (window.location.hash !== newHash) {
        history.replaceState(null, null, newHash);
      }
    }
    
    /**
     * Start auto-play
     */
    startAutoPlay() {
      if (this.options.reducedMotion || this.isPlaying) return;
      
      this.isPlaying = true;
      this.autoPlayTimer = setInterval(() => {
        this.nextSlide();
      }, this.options.autoPlayDelay);
      
      this.logEvent('autoplay_start');
    }
    
    /**
     * Pause auto-play
     */
    pauseAutoPlay() {
      if (!this.isPlaying) return;
      
      this.isPlaying = false;
      if (this.autoPlayTimer) {
        clearInterval(this.autoPlayTimer);
        this.autoPlayTimer = null;
      }
      
      this.logEvent('autoplay_pause');
    }
    
    /**
     * Resume auto-play
     */
    resumeAutoPlay() {
      if (!this.options.autoPlay || this.options.reducedMotion) return;
      
      // Only resume if not currently playing and no recent interactions
      if (!this.isPlaying) {
        setTimeout(() => {
          if (!this.isPlaying) {
            this.startAutoPlay();
          }
        }, 2000);
      }
    }
    
    /**
     * Toggle auto-play
     */
    toggleAutoPlay() {
      if (this.isPlaying) {
        this.pauseAutoPlay();
      } else {
        this.startAutoPlay();
      }
    }
    
    /**
     * Log events for analytics
     */
    logEvent(eventName, data = {}) {
      if (!this.options.analytics) return;
      
      const eventData = {
        event: eventName,
        timestamp: Date.now(),
        carousel: this.carousel.dataset.carousel,
        currentSlide: this.currentSlide,
        ...data
      };
      
      // Send to analytics service (customize as needed)
      if (window.gtag) {
        window.gtag('event', eventName, {
          custom_parameter_1: JSON.stringify(eventData)
        });
      } else if (window.analytics) {
        window.analytics.track(eventName, eventData);
      }
      
      console.log('Carousel Event:', eventData);
    }
    
    /**
     * Get performance metrics
     */
    getMetrics() {
      return {
        ...this.metrics,
        currentSlide: this.currentSlide,
        totalSlides: this.totalSlides,
        features: Object.keys(features).filter(f => features[f])
      };
    }
    
    /**
     * Destroy carousel instance
     */
    destroy() {
      // Remove event listeners
      window.removeEventListener('hashchange', this.handleHashChange.bind(this));
      
      // Stop auto-play
      this.pauseAutoPlay();
      
      // Disconnect observer
      if (this.observer) {
        this.observer.disconnect();
      }
      
      // Log destruction
      this.logEvent('carousel_destroyed', this.getMetrics());
    }
  }
  
  /**
   * Auto-initialize carousels on page load
   */
  function initCarousels() {
    const carousels = document.querySelectorAll('[data-carousel]');
    
    carousels.forEach(carousel => {
      // Get options from data attributes
      const options = {
        autoPlay: carousel.dataset.autoplay === 'true',
        autoPlayDelay: parseInt(carousel.dataset.autoplayDelay) || 5000,
        analytics: carousel.dataset.analytics === 'true'
      };
      
      // Create enhanced carousel instance
      const instance = new EnhancedCarousel(carousel, options);
      
      // Store instance for external access
      carousel._carouselInstance = instance;
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousels);
  } else {
    initCarousels();
  }
  
  // Export for external use
  window.EnhancedCarousel = EnhancedCarousel;
  
})(window, document);