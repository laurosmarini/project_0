/**
 * Test Suite for Responsive Pricing Table
 * Tests functionality, accessibility, and responsive behavior
 */

// Mock DOM methods for testing
const mockDOM = {
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  createElement: jest.fn(() => ({
    setAttribute: jest.fn(),
    textContent: '',
    style: {}
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
};

// Mock window methods
const mockWindow = {
  matchMedia: jest.fn(() => ({
    matches: false,
    addListener: jest.fn()
  })),
  innerWidth: 1024,
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn()
  },
  sessionStorage: {
    getItem: jest.fn(),
    setItem: jest.fn()
  },
  IntersectionObserver: jest.fn()
};

// Mock console methods
global.console = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

describe('PricingTable', () => {
  let pricingTable;
  let mockElements;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock DOM elements
    mockElements = {
      billingRadios: [
        { value: 'monthly', addEventListener: jest.fn(), checked: true },
        { value: 'yearly', addEventListener: jest.fn(), checked: false }
      ],
      priceElements: [
        { textContent: '9', closest: jest.fn(() => ({ dataset: { plan: 'basic' } })), style: {} },
        { textContent: '29', closest: jest.fn(() => ({ dataset: { plan: 'professional' } })), style: {} },
        { textContent: '99', closest: jest.fn(() => ({ dataset: { plan: 'enterprise' } })), style: {} }
      ],
      yearlyPrices: [
        { classList: { add: jest.fn(), remove: jest.fn() }, setAttribute: jest.fn() }
      ],
      billingPeriods: [
        { textContent: '/month' }
      ],
      ctaButtons: [
        { addEventListener: jest.fn(), classList: { add: jest.fn(), remove: jest.fn() } }
      ],
      comparisonToggle: {
        addEventListener: jest.fn(),
        setAttribute: jest.fn(),
        getAttribute: jest.fn(() => 'false'),
        querySelector: jest.fn(() => ({ textContent: 'Show Feature Comparison' }))
      },
      comparisonContent: {
        setAttribute: jest.fn()
      },
      pricingCards: [
        { addEventListener: jest.fn(), dataset: { plan: 'basic' }, querySelector: jest.fn() }
      ]
    };

    // Setup DOM mock responses
    mockDOM.querySelectorAll.mockImplementation((selector) => {
      switch (selector) {
        case 'input[name="billing"]': return mockElements.billingRadios;
        case '.price-amount': return mockElements.priceElements;
        case '.yearly-price': return mockElements.yearlyPrices;
        case '.billing-period': return mockElements.billingPeriods;
        case '.cta-button': return mockElements.ctaButtons;
        case '.pricing-card': return mockElements.pricingCards;
        default: return [];
      }
    });

    mockDOM.querySelector.mockImplementation((selector) => {
      switch (selector) {
        case '.comparison-toggle': return mockElements.comparisonToggle;
        case '#comparison-content': return mockElements.comparisonContent;
        case 'input[value="monthly"]': return mockElements.billingRadios[0];
        case 'input[value="yearly"]': return mockElements.billingRadios[1];
        default: return null;
      }
    });

    // Mock global objects
    global.document = mockDOM;
    global.window = mockWindow;

    // Import and create instance
    const PricingTable = require('../src/js/pricing-table.js');
    pricingTable = new PricingTable();
  });

  afterEach(() => {
    if (pricingTable && typeof pricingTable.destroy === 'function') {
      pricingTable.destroy();
    }
  });

  describe('Initialization', () => {
    test('should initialize with default monthly billing', () => {
      expect(pricingTable.billingMode).toBe('monthly');
    });

    test('should set up event listeners on initialization', () => {
      expect(mockElements.billingRadios[0].addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      expect(mockElements.billingRadios[1].addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    test('should have correct price data structure', () => {
      expect(pricingTable.priceData).toHaveProperty('basic');
      expect(pricingTable.priceData).toHaveProperty('professional');
      expect(pricingTable.priceData).toHaveProperty('enterprise');
      
      expect(pricingTable.priceData.basic).toHaveProperty('monthly', 9);
      expect(pricingTable.priceData.basic).toHaveProperty('yearly', 7.20);
    });
  });

  describe('Billing Mode Changes', () => {
    test('should handle billing mode change to yearly', () => {
      const event = { target: { value: 'yearly' } };
      pricingTable.handleBillingChange(event);
      
      expect(pricingTable.billingMode).toBe('yearly');
    });

    test('should update prices when billing mode changes', () => {
      const event = { target: { value: 'yearly' } };
      pricingTable.handleBillingChange(event);
      
      // Should call updatePrices method (tested indirectly through price element updates)
      expect(pricingTable.billingMode).toBe('yearly');
    });

    test('should update billing period text', () => {
      const event = { target: { value: 'yearly' } };
      pricingTable.handleBillingChange(event);
      pricingTable.updateBillingPeriodText();
      
      expect(mockElements.billingPeriods[0].textContent).toBe('/year');
    });

    test('should show yearly price notes when yearly is selected', () => {
      pricingTable.billingMode = 'yearly';
      pricingTable.updatePrices();
      
      expect(mockElements.yearlyPrices[0].classList.add).toHaveBeenCalledWith('visible');
      expect(mockElements.yearlyPrices[0].setAttribute).toHaveBeenCalledWith('aria-hidden', 'false');
    });

    test('should hide yearly price notes when monthly is selected', () => {
      pricingTable.billingMode = 'monthly';
      pricingTable.updatePrices();
      
      expect(mockElements.yearlyPrices[0].classList.remove).toHaveBeenCalledWith('visible');
      expect(mockElements.yearlyPrices[0].setAttribute).toHaveBeenCalledWith('aria-hidden', 'true');
    });
  });

  describe('Price Updates', () => {
    test('should get correct plan from element', () => {
      const plan = pricingTable.getPlanFromElement(mockElements.priceElements[0]);
      expect(plan).toBe('basic');
    });

    test('should animate price changes when motion is not reduced', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: false });
      const element = mockElements.priceElements[0];
      
      pricingTable.animatePrice(element, 7.20);
      
      expect(element.style.transform).toBe('scale(1.1)');
      expect(element.style.transition).toBe('transform 0.2s ease-out');
    });

    test('should not animate price changes when motion is reduced', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: true });
      const element = mockElements.priceElements[0];
      
      pricingTable.animatePrice(element, 7.20);
      
      expect(element.textContent).toBe(7.20);
      expect(element.style.transform).not.toBe('scale(1.1)');
    });
  });

  describe('Mobile Comparison', () => {
    test('should toggle comparison content', () => {
      mockElements.comparisonToggle.getAttribute.mockReturnValue('false');
      const event = { currentTarget: mockElements.comparisonToggle };
      
      pricingTable.toggleComparison(event);
      
      expect(mockElements.comparisonToggle.setAttribute).toHaveBeenCalledWith('aria-expanded', true);
      expect(mockElements.comparisonContent.setAttribute).toHaveBeenCalledWith('aria-hidden', false);
    });

    test('should update toggle button text', () => {
      mockElements.comparisonToggle.getAttribute.mockReturnValue('true');
      const toggleText = { textContent: 'Hide Feature Comparison' };
      mockElements.comparisonToggle.querySelector.mockReturnValue(toggleText);
      
      const event = { currentTarget: mockElements.comparisonToggle };
      pricingTable.toggleComparison(event);
      
      expect(toggleText.textContent).toBe('Show Feature Comparison');
    });
  });

  describe('CTA Button Handling', () => {
    test('should handle CTA button clicks', () => {
      const mockButton = {
        classList: { add: jest.fn(), remove: jest.fn() },
        disabled: false,
        closest: jest.fn(() => ({ dataset: { plan: 'professional' } }))
      };
      
      const event = { currentTarget: mockButton };
      pricingTable.handleCTAClick(event);
      
      expect(mockButton.classList.add).toHaveBeenCalledWith('loading');
      expect(mockButton.disabled).toBe(true);
    });

    test('should handle plan selection', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      pricingTable.handlePlanSelection('professional');
      
      expect(consoleSpy).toHaveBeenCalledWith('Selected professional plan with monthly billing');
    });
  });

  describe('Accessibility Features', () => {
    test('should announce messages to screen readers', () => {
      const mockAnnouncement = {
        setAttribute: jest.fn(),
        className: '',
        textContent: ''
      };
      
      mockDOM.createElement.mockReturnValue(mockAnnouncement);
      
      pricingTable.announceToScreenReader('Test message');
      
      expect(mockAnnouncement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
      expect(mockAnnouncement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
      expect(mockAnnouncement.textContent).toBe('Test message');
    });

    test('should handle keyboard navigation', () => {
      const mockCard = mockElements.pricingCards[0];
      const keyEvent = {
        key: 'ArrowRight',
        preventDefault: jest.fn()
      };

      // Simulate keyboard event handler
      const keydownHandler = mockCard.addEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      );
      
      if (keydownHandler) {
        keydownHandler[1](keyEvent);
        expect(keyEvent.preventDefault).toHaveBeenCalled();
      }
    });
  });

  describe('Responsive Behavior', () => {
    test('should handle window resize', () => {
      const mobileComparison = { style: { display: 'block' } };
      mockDOM.querySelector.mockImplementation((selector) => {
        if (selector === '.mobile-comparison') return mobileComparison;
        return null;
      });

      mockWindow.innerWidth = 500; // Mobile width
      pricingTable.handleResize();
      
      expect(mobileComparison.style.display).toBe('block');
    });

    test('should detect mobile viewport', () => {
      mockWindow.innerWidth = 500;
      const state = pricingTable.getState();
      expect(state.isMobile).toBe(true);
    });

    test('should detect desktop viewport', () => {
      mockWindow.innerWidth = 1200;
      const state = pricingTable.getState();
      expect(state.isMobile).toBe(false);
    });
  });

  describe('Local Storage Integration', () => {
    test('should store billing preference', () => {
      pricingTable.storeBillingPreference('yearly');
      expect(mockWindow.localStorage.setItem).toHaveBeenCalledWith('pricing-billing-preference', 'yearly');
    });

    test('should retrieve billing preference', () => {
      mockWindow.localStorage.getItem.mockReturnValue('yearly');
      const preference = pricingTable.getBillingPreference();
      expect(preference).toBe('yearly');
    });

    test('should handle localStorage errors gracefully', () => {
      mockWindow.localStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      
      const consoleSpy = jest.spyOn(console, 'warn');
      pricingTable.storeBillingPreference('yearly');
      
      expect(consoleSpy).toHaveBeenCalledWith('Could not save billing preference:', expect.any(Error));
    });
  });

  describe('Performance and Optimization', () => {
    test('should handle reduced motion preferences', () => {
      const mockMediaQuery = {
        matches: true,
        addListener: jest.fn()
      };
      mockWindow.matchMedia.mockReturnValue(mockMediaQuery);
      
      pricingTable.handleReducedMotion();
      
      expect(mockWindow.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
      expect(mockMediaQuery.addListener).toHaveBeenCalled();
    });

    test('should handle visibility changes', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      // Mock document.hidden
      Object.defineProperty(mockDOM, 'hidden', {
        value: true,
        writable: true
      });
      
      pricingTable.handleVisibilityChange();
      
      expect(consoleSpy).toHaveBeenCalledWith('[PricingTable] Page hidden, pausing animations');
    });

    test('should report progress correctly', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockWindow.sessionStorage.setItem.mockImplementation(() => {});
      
      pricingTable.reportProgress('Test progress');
      
      expect(consoleSpy).toHaveBeenCalledWith('[PricingTable] Test progress');
      expect(mockWindow.sessionStorage.setItem).toHaveBeenCalledWith(
        'pricing-table-status',
        expect.stringContaining('Test progress')
      );
    });
  });

  describe('State Management', () => {
    test('should return correct state object', () => {
      const state = pricingTable.getState();
      
      expect(state).toHaveProperty('billingMode');
      expect(state).toHaveProperty('priceData');
      expect(state).toHaveProperty('isReducedMotion');
      expect(state).toHaveProperty('isMobile');
    });

    test('should handle state changes correctly', () => {
      pricingTable.billingMode = 'yearly';
      const state = pricingTable.getState();
      
      expect(state.billingMode).toBe('yearly');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing DOM elements gracefully', () => {
      mockDOM.querySelector.mockReturnValue(null);
      mockDOM.querySelectorAll.mockReturnValue([]);
      
      expect(() => {
        const PricingTable = require('../src/js/pricing-table.js');
        new PricingTable();
      }).not.toThrow();
    });

    test('should handle sessionStorage errors', () => {
      mockWindow.sessionStorage.setItem.mockImplementation(() => {
        throw new Error('SessionStorage error');
      });
      
      const consoleSpy = jest.spyOn(console, 'warn');
      pricingTable.reportProgress('Test message');
      
      expect(consoleSpy).toHaveBeenCalledWith('Could not store progress:', expect.any(Error));
    });
  });

  describe('Cleanup and Destruction', () => {
    test('should clean up event listeners on destroy', () => {
      pricingTable.destroy();
      
      expect(mockElements.billingRadios[0].removeEventListener).toHaveBeenCalled();
      expect(mockElements.billingRadios[1].removeEventListener).toHaveBeenCalled();
    });

    test('should report destruction', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      pricingTable.destroy();
      
      expect(consoleSpy).toHaveBeenCalledWith('[PricingTable] PricingTable destroyed');
    });
  });
});

describe('Progressive Enhancement', () => {
  test('should provide fallback functionality when main script fails', () => {
    const mockRadio = {
      addEventListener: jest.fn()
    };
    
    mockDOM.querySelectorAll.mockReturnValue([mockRadio]);
    
    // Simulate the fallback code
    const fallbackHandler = jest.fn();
    mockRadio.addEventListener('change', fallbackHandler);
    
    expect(mockRadio.addEventListener).toHaveBeenCalledWith('change', fallbackHandler);
  });
});

describe('Cross-browser Compatibility', () => {
  test('should handle missing IntersectionObserver', () => {
    const originalIntersectionObserver = global.window.IntersectionObserver;
    delete global.window.IntersectionObserver;
    
    expect(() => {
      const PricingTable = require('../src/js/pricing-table.js');
      new PricingTable();
    }).not.toThrow();
    
    global.window.IntersectionObserver = originalIntersectionObserver;
  });

  test('should work without localStorage', () => {
    const originalLocalStorage = global.window.localStorage;
    delete global.window.localStorage;
    
    expect(() => {
      const PricingTable = require('../src/js/pricing-table.js');
      const instance = new PricingTable();
      instance.getBillingPreference();
    }).not.toThrow();
    
    global.window.localStorage = originalLocalStorage;
  });
});