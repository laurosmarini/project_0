/**
 * Responsive Pricing Table with Progressive Enhancement
 * Handles billing toggle, mobile interactions, and accessibility features
 * 
 * @version 1.0.0
 * @author Frontend Development Team
 */

class PricingTable {
  constructor() {
    this.billingMode = 'monthly';
    this.priceData = {
      basic: { monthly: 9, yearly: 7.20 },
      professional: { monthly: 29, yearly: 23.20 },
      enterprise: { monthly: 99, yearly: 79.20 }
    };
    
    this.init();
  }

  /**
   * Initialize the pricing table functionality
   */
  init() {
    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.handleReducedMotion();
    this.setupKeyboardNavigation();
    this.initializeBillingToggle();
    
    // Report initialization
    this.reportProgress('PricingTable initialized successfully');
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Billing toggle
    const billingRadios = document.querySelectorAll('input[name="billing"]');
    billingRadios.forEach(radio => {
      radio.addEventListener('change', this.handleBillingChange.bind(this));
    });

    // Mobile comparison toggle
    const comparisonToggle = document.querySelector('.comparison-toggle');
    if (comparisonToggle) {
      comparisonToggle.addEventListener('click', this.toggleComparison.bind(this));
    }

    // CTA buttons
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
      button.addEventListener('click', this.handleCTAClick.bind(this));
    });

    // Window resize for responsive behavior
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(this.handleResize.bind(this), 250);
    });

    // Handle visibility changes for performance
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Handle billing mode changes (Monthly/Yearly)
   * @param {Event} event - The change event
   */
  handleBillingChange(event) {
    this.billingMode = event.target.value;
    this.updatePrices();
    this.updateBillingPeriodText();
    this.announceToScreenReader(`Switched to ${this.billingMode} billing`);
    
    // Store user preference
    this.storeBillingPreference(this.billingMode);
    
    this.reportProgress(`Billing changed to ${this.billingMode}`);
  }

  /**
   * Update all price displays based on billing mode
   */
  updatePrices() {
    const priceElements = document.querySelectorAll('.price-amount');
    const yearlyPrices = document.querySelectorAll('.yearly-price');
    
    priceElements.forEach(element => {
      const plan = this.getPlanFromElement(element);
      if (plan && this.priceData[plan]) {
        const price = this.priceData[plan][this.billingMode];
        this.animatePrice(element, price);
      }
    });

    // Show/hide yearly price notes
    yearlyPrices.forEach(element => {
      if (this.billingMode === 'yearly') {
        element.classList.add('visible');
        element.setAttribute('aria-hidden', 'false');
      } else {
        element.classList.remove('visible');
        element.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /**
   * Update billing period text
   */
  updateBillingPeriodText() {
    const billingPeriods = document.querySelectorAll('.billing-period');
    const periodText = this.billingMode === 'yearly' ? '/year' : '/month';
    
    billingPeriods.forEach(element => {
      element.textContent = periodText;
    });
  }

  /**
   * Animate price changes
   * @param {Element} element - Price element to animate
   * @param {number} newPrice - New price to display
   */
  animatePrice(element, newPrice) {
    if (!element) return;

    const shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (shouldAnimate) {
      element.style.transform = 'scale(1.1)';
      element.style.transition = 'transform 0.2s ease-out';
      
      setTimeout(() => {
        element.textContent = newPrice;
        element.style.transform = 'scale(1)';
        
        setTimeout(() => {
          element.style.transition = '';
        }, 200);
      }, 100);
    } else {
      element.textContent = newPrice;
    }
  }

  /**
   * Get plan name from a price element
   * @param {Element} element - Price element
   * @returns {string|null} Plan name
   */
  getPlanFromElement(element) {
    const card = element.closest('.pricing-card');
    return card ? card.dataset.plan : null;
  }

  /**
   * Toggle mobile comparison section
   * @param {Event} event - Click event
   */
  toggleComparison(event) {
    const button = event.currentTarget;
    const content = document.getElementById('comparison-content');
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    
    button.setAttribute('aria-expanded', !isExpanded);
    content.setAttribute('aria-hidden', isExpanded);
    
    const toggleText = button.querySelector('.toggle-text');
    if (toggleText) {
      toggleText.textContent = isExpanded 
        ? 'Show Feature Comparison' 
        : 'Hide Feature Comparison';
    }

    this.announceToScreenReader(
      isExpanded ? 'Feature comparison hidden' : 'Feature comparison shown'
    );
  }

  /**
   * Handle CTA button clicks
   * @param {Event} event - Click event
   */
  handleCTAClick(event) {
    const button = event.currentTarget;
    const card = button.closest('.pricing-card');
    const plan = card ? card.dataset.plan : 'unknown';
    
    // Add loading state
    button.classList.add('loading');
    button.disabled = true;
    
    // Simulate API call or redirect
    setTimeout(() => {
      button.classList.remove('loading');
      button.disabled = false;
      
      // In a real application, this would redirect to checkout
      this.handlePlanSelection(plan);
    }, 1000);
    
    this.reportProgress(`CTA clicked for ${plan} plan`);
  }

  /**
   * Handle plan selection
   * @param {string} plan - Selected plan name
   */
  handlePlanSelection(plan) {
    const message = `Selected ${plan} plan with ${this.billingMode} billing`;
    console.log(message);
    
    // In a real app, you would:
    // - Send analytics event
    // - Redirect to checkout
    // - Store selection in localStorage
    
    this.announceToScreenReader(`${plan} plan selected`);
  }

  /**
   * Set up intersection observer for animations
   */
  setupIntersectionObserver() {
    if (!window.IntersectionObserver) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, observerOptions);

    // Observe pricing cards
    const cards = document.querySelectorAll('.pricing-card');
    cards.forEach(card => observer.observe(card));
  }

  /**
   * Handle window resize events
   */
  handleResize() {
    const isMobile = window.innerWidth < 768;
    const mobileComparison = document.querySelector('.mobile-comparison');
    
    if (mobileComparison) {
      mobileComparison.style.display = isMobile ? 'block' : 'none';
    }

    // Recalculate any responsive elements if needed
    this.reportProgress('Window resized, responsive adjustments made');
  }

  /**
   * Handle reduced motion preferences
   */
  handleReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updateMotionPreferences = (mediaQuery) => {
      const shouldReduceMotion = mediaQuery.matches;
      document.documentElement.style.setProperty(
        '--transition-duration', 
        shouldReduceMotion ? '0ms' : '250ms'
      );
    };

    prefersReducedMotion.addListener(updateMotionPreferences);
    updateMotionPreferences(prefersReducedMotion);
  }

  /**
   * Set up keyboard navigation
   */
  setupKeyboardNavigation() {
    const cards = document.querySelectorAll('.pricing-card');
    
    cards.forEach((card, index) => {
      card.addEventListener('keydown', (event) => {
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            this.focusCard(index - 1);
            break;
          case 'ArrowRight':
            event.preventDefault();
            this.focusCard(index + 1);
            break;
          case 'Home':
            event.preventDefault();
            this.focusCard(0);
            break;
          case 'End':
            event.preventDefault();
            this.focusCard(cards.length - 1);
            break;
        }
      });
    });
  }

  /**
   * Focus a specific pricing card
   * @param {number} index - Card index to focus
   */
  focusCard(index) {
    const cards = document.querySelectorAll('.pricing-card');
    const targetIndex = Math.max(0, Math.min(index, cards.length - 1));
    const targetCard = cards[targetIndex];
    
    if (targetCard) {
      const ctaButton = targetCard.querySelector('.cta-button');
      if (ctaButton) {
        ctaButton.focus();
      }
    }
  }

  /**
   * Initialize billing toggle state
   */
  initializeBillingToggle() {
    // Check for saved preference
    const savedBilling = this.getBillingPreference();
    if (savedBilling) {
      const radio = document.querySelector(`input[value="${savedBilling}"]`);
      if (radio) {
        radio.checked = true;
        this.billingMode = savedBilling;
        this.updatePrices();
        this.updateBillingPeriodText();
      }
    }
  }

  /**
   * Store billing preference in localStorage
   * @param {string} billing - Billing mode to store
   */
  storeBillingPreference(billing) {
    try {
      localStorage.setItem('pricing-billing-preference', billing);
    } catch (error) {
      console.warn('Could not save billing preference:', error);
    }
  }

  /**
   * Get billing preference from localStorage
   * @returns {string|null} Stored billing preference
   */
  getBillingPreference() {
    try {
      return localStorage.getItem('pricing-billing-preference');
    } catch (error) {
      console.warn('Could not retrieve billing preference:', error);
      return null;
    }
  }

  /**
   * Handle page visibility changes
   */
  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, pause any unnecessary work
      this.reportProgress('Page hidden, pausing animations');
    } else {
      // Page is visible, resume normal operation
      this.reportProgress('Page visible, resuming normal operation');
    }
  }

  /**
   * Announce messages to screen readers
   * @param {string} message - Message to announce
   */
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Report progress to hooks system
   * @param {string} message - Progress message
   */
  reportProgress(message) {
    // In a real application, this would integrate with the hooks system
    console.log(`[PricingTable] ${message}`);
    
    // Store in session for coordination
    try {
      sessionStorage.setItem('pricing-table-status', JSON.stringify({
        timestamp: new Date().toISOString(),
        message,
        billingMode: this.billingMode
      }));
    } catch (error) {
      console.warn('Could not store progress:', error);
    }
  }

  /**
   * Get current state for debugging/testing
   * @returns {Object} Current state object
   */
  getState() {
    return {
      billingMode: this.billingMode,
      priceData: this.priceData,
      isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      isMobile: window.innerWidth < 768
    };
  }

  /**
   * Destroy instance and clean up
   */
  destroy() {
    // Remove event listeners
    const billingRadios = document.querySelectorAll('input[name="billing"]');
    billingRadios.forEach(radio => {
      radio.removeEventListener('change', this.handleBillingChange);
    });

    const comparisonToggle = document.querySelector('.comparison-toggle');
    if (comparisonToggle) {
      comparisonToggle.removeEventListener('click', this.toggleComparison);
    }

    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
      button.removeEventListener('click', this.handleCTAClick);
    });

    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    this.reportProgress('PricingTable destroyed');
  }
}

// Progressive Enhancement - Only initialize if DOM is ready
function initializePricingTable() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.pricingTable = new PricingTable();
    });
  } else {
    window.pricingTable = new PricingTable();
  }
}

// Error handling wrapper
try {
  initializePricingTable();
} catch (error) {
  console.error('Failed to initialize PricingTable:', error);
  
  // Fallback for critical functionality
  document.addEventListener('DOMContentLoaded', () => {
    const billingRadios = document.querySelectorAll('input[name="billing"]');
    billingRadios.forEach(radio => {
      radio.addEventListener('change', (event) => {
        const isYearly = event.target.value === 'yearly';
        const yearlyPrices = document.querySelectorAll('.yearly-price');
        
        yearlyPrices.forEach(element => {
          element.style.opacity = isYearly ? '1' : '0';
        });
      });
    });
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PricingTable;
}

// AMD support
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return PricingTable;
  });
}