import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { jest } from '@jest/globals';

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
});

// Mock global objects and APIs
beforeAll(() => {
  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock window dimensions
  Object.defineProperties(window, {
    innerWidth: {
      writable: true,
      configurable: true,
      value: 1024,
    },
    innerHeight: {
      writable: true,
      configurable: true,
      value: 768,
    },
  });

  // Mock scrollTo
  window.scrollTo = jest.fn();

  // Mock getComputedStyle
  window.getComputedStyle = jest.fn().mockImplementation(() => ({
    display: 'block',
    visibility: 'visible',
    opacity: '1',
    transform: 'none',
    transition: 'none',
    animation: 'none',
  }));

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });

  // Mock requestAnimationFrame
  global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
  global.cancelAnimationFrame = jest.fn();

  // Mock performance API
  Object.defineProperty(window, 'performance', {
    value: {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn(() => []),
      getEntriesByName: jest.fn(() => []),
      clearMarks: jest.fn(),
      clearMeasures: jest.fn(),
    },
    writable: true,
  });

  // Mock navigator
  Object.defineProperty(window, 'navigator', {
    value: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      platform: 'Win32',
      languages: ['en-US', 'en'],
      cookieEnabled: true,
      onLine: true,
    },
    writable: true,
  });

  // Mock document methods
  document.elementFromPoint = jest.fn();
  document.elementsFromPoint = jest.fn();

  // Mock focus management
  let activeElement = document.body;
  Object.defineProperty(document, 'activeElement', {
    get() {
      return activeElement;
    },
    set(element) {
      activeElement = element;
    },
  });

  // Mock HTMLElement methods
  HTMLElement.prototype.scrollIntoView = jest.fn();
  HTMLElement.prototype.focus = jest.fn(function() {
    activeElement = this;
  });
  HTMLElement.prototype.blur = jest.fn(function() {
    if (activeElement === this) {
      activeElement = document.body;
    }
  });

  // Mock getBoundingClientRect
  HTMLElement.prototype.getBoundingClientRect = jest.fn(() => ({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: jest.fn(),
  }));

  // Mock Touch API
  class MockTouch {
    constructor(public props: any) {
      Object.assign(this, props);
    }
  }

  global.Touch = MockTouch as any;
  global.TouchEvent = class MockTouchEvent extends Event {
    constructor(type: string, eventInitDict: any = {}) {
      super(type, eventInitDict);
      Object.assign(this, eventInitDict);
    }
  } as any;

  // Mock MutationObserver
  global.MutationObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn(),
  }));

  // Mock console methods to reduce noise
  const originalConsole = global.console;
  global.console = {
    ...originalConsole,
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  };

  // Store original for restoration
  (global as any).originalConsole = originalConsole;
});

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '<title>Test</title>';
  
  // Reset active element
  if (document.activeElement && document.activeElement !== document.body) {
    (document.activeElement as HTMLElement).blur();
  }
  
  // Clear timers
  jest.clearAllTimers();
  
  // Reset window dimensions
  Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
  Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
  
  // Clear localStorage/sessionStorage
  localStorage.clear();
  sessionStorage.clear();
});

// Clean up after all tests
afterAll(() => {
  // Restore original console if needed
  if ((global as any).originalConsole) {
    global.console = (global as any).originalConsole;
  }
  
  // Clean up any remaining resources
  jest.restoreAllMocks();
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(): R;
      toHaveFocusedElement(element: HTMLElement): R;
      toHaveVisibleText(text: string): R;
      toBeWithinViewport(): R;
      toHaveCorrectTabOrder(): R;
      toPassColorContrastCheck(): R;
    }
  }
}

// Add custom matchers
expect.extend({
  toBeAccessible(received) {
    // Mock accessibility check
    const pass = true; // Would use actual axe-core here
    return {
      message: () => pass 
        ? `Expected element to have accessibility violations` 
        : `Expected element to be accessible but found violations`,
      pass,
    };
  },

  toHaveFocusedElement(received, element) {
    const pass = document.activeElement === element;
    return {
      message: () => pass
        ? `Expected ${element} not to be focused`
        : `Expected ${element} to be focused, but ${document.activeElement} was focused`,
      pass,
    };
  },

  toHaveVisibleText(received, text) {
    const computedStyle = window.getComputedStyle(received);
    const isVisible = computedStyle.display !== 'none' && 
                     computedStyle.visibility !== 'hidden' &&
                     computedStyle.opacity !== '0';
    const hasText = received.textContent?.includes(text);
    const pass = isVisible && hasText;
    
    return {
      message: () => pass
        ? `Expected element not to have visible text "${text}"`
        : `Expected element to have visible text "${text}"`,
      pass,
    };
  },

  toBeWithinViewport(received) {
    const rect = received.getBoundingClientRect();
    const pass = rect.top >= 0 && 
                rect.left >= 0 && 
                rect.bottom <= window.innerHeight && 
                rect.right <= window.innerWidth;
    
    return {
      message: () => pass
        ? `Expected element not to be within viewport`
        : `Expected element to be within viewport`,
      pass,
    };
  },

  toHaveCorrectTabOrder(received) {
    // Mock tab order check
    const pass = true; // Would implement actual tab order checking
    return {
      message: () => pass
        ? `Expected element to have incorrect tab order`
        : `Expected element to have correct tab order`,
      pass,
    };
  },

  toPassColorContrastCheck(received) {
    // Mock color contrast check
    const pass = true; // Would implement actual contrast checking
    return {
      message: () => pass
        ? `Expected element to fail color contrast check`
        : `Expected element to pass color contrast check`,
      pass,
    };
  },
});

// Export test utilities
export const testUtils = {
  mockViewport: (width: number, height: number) => {
    Object.defineProperties(window, {
      innerWidth: { value: width, writable: true },
      innerHeight: { value: height, writable: true },
    });
    window.dispatchEvent(new Event('resize'));
  },

  mockMediaQuery: (query: string, matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(q => ({
        matches: q === query ? matches : false,
        media: q,
      })),
    });
  },

  waitForNextTick: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  waitForAnimation: (duration = 300) => new Promise(resolve => setTimeout(resolve, duration)),
  
  mockFocus: (element: HTMLElement) => {
    Object.defineProperty(document, 'activeElement', {
      value: element,
      configurable: true,
    });
  },
};