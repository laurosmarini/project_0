import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NavigationProvider } from '../../src/contexts/NavigationContext';

// Mock implementations for testing utilities

// Mock ResizeObserver for responsive tests
export const mockResizeObserver = () => {
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
};

// Mock IntersectionObserver for visibility tests
export const mockIntersectionObserver = () => {
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
};

// Mock window.matchMedia for media query tests
export const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Mock viewport dimensions
export const mockViewport = (width: number, height: number = 768) => {
  Object.defineProperties(window, {
    innerWidth: {
      writable: true,
      configurable: true,
      value: width,
    },
    innerHeight: {
      writable: true,
      configurable: true,
      value: height,
    },
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  navigationProps?: Record<string, any>;
  withRouter?: boolean;
}

export const renderWithNavigation = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { navigationProps = {}, withRouter = false, ...renderOptions } = options;

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    let wrappedChildren = (
      <NavigationProvider {...navigationProps}>
        {children}
      </NavigationProvider>
    );

    // Add router mock if needed
    if (withRouter) {
      // Mock router provider would go here
      wrappedChildren = <div data-testid="router-mock">{wrappedChildren}</div>;
    }

    return wrappedChildren;
  };

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

// Common test data
export const mockNavigationItems = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    children: []
  },
  {
    id: 'products',
    label: 'Products',
    href: '/products',
    children: [
      { id: 'laptops', label: 'Laptops', href: '/products/laptops' },
      { id: 'phones', label: 'Phones', href: '/products/phones' },
      { id: 'tablets', label: 'Tablets', href: '/products/tablets' }
    ]
  },
  {
    id: 'services',
    label: 'Services',
    href: '/services',
    children: [
      { id: 'support', label: 'Support', href: '/services/support' },
      { id: 'consulting', label: 'Consulting', href: '/services/consulting' }
    ]
  },
  {
    id: 'about',
    label: 'About',
    href: '/about',
    children: []
  }
];

// Large navigation for stress testing
export const largeNavigationItems = Array.from({ length: 50 }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`,
  href: `/item-${i}`,
  children: i % 3 === 0 ? Array.from({ length: 10 }, (_, j) => ({
    id: `item-${i}-sub-${j}`,
    label: `Sub Item ${j + 1}`,
    href: `/item-${i}/sub-${j}`
  })) : []
}));

// Complex nested navigation
export const nestedNavigationItems = [
  {
    id: 'level1-1',
    label: 'Level 1 - Item 1',
    href: '/level1-1',
    children: [
      {
        id: 'level2-1',
        label: 'Level 2 - Item 1',
        href: '/level1-1/level2-1',
        children: [
          { id: 'level3-1', label: 'Level 3 - Item 1', href: '/level1-1/level2-1/level3-1' },
          { id: 'level3-2', label: 'Level 3 - Item 2', href: '/level1-1/level2-1/level3-2' }
        ]
      },
      {
        id: 'level2-2',
        label: 'Level 2 - Item 2',
        href: '/level1-1/level2-2',
        children: []
      }
    ]
  }
];

// Test utilities for accessibility
export const axeMatchers = {
  toHaveNoViolations: expect.extend({
    toHaveNoViolations(received) {
      const pass = received.violations.length === 0;
      
      if (pass) {
        return {
          message: () => `Expected accessibility violations but none were found`,
          pass: true,
        };
      } else {
        const violations = received.violations
          .map((violation: any) => `${violation.id}: ${violation.description}`)
          .join('\n');
        
        return {
          message: () => `Expected no accessibility violations but found:\n${violations}`,
          pass: false,
        };
      }
    },
  }),
};

// Focus testing utilities
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors));
};

export const getVisibleElements = (elements: HTMLElement[]): HTMLElement[] => {
  return elements.filter(element => {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetParent !== null;
  });
};

// Keyboard navigation test helpers
export const KeyCodes = {
  TAB: { key: 'Tab' },
  SHIFT_TAB: { key: 'Tab', shiftKey: true },
  ENTER: { key: 'Enter' },
  SPACE: { key: ' ' },
  ESCAPE: { key: 'Escape' },
  ARROW_UP: { key: 'ArrowUp' },
  ARROW_DOWN: { key: 'ArrowDown' },
  ARROW_LEFT: { key: 'ArrowLeft' },
  ARROW_RIGHT: { key: 'ArrowRight' },
  HOME: { key: 'Home' },
  END: { key: 'End' }
};

// Wait for animations/transitions
export const waitForAnimation = (duration: number = 300) => {
  return new Promise(resolve => setTimeout(resolve, duration));
};

// Mock user interactions
export const mockTouchEvents = (element: HTMLElement) => {
  const touchStart = new TouchEvent('touchstart', {
    bubbles: true,
    cancelable: true,
    touches: [new Touch({
      identifier: 1,
      target: element,
      clientX: 100,
      clientY: 100
    })]
  });

  const touchEnd = new TouchEvent('touchend', {
    bubbles: true,
    cancelable: true,
    touches: []
  });

  element.dispatchEvent(touchStart);
  element.dispatchEvent(touchEnd);
};

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const startTime = performance.now();
  renderFn();
  const endTime = performance.now();
  return endTime - startTime;
};

export const measureMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

// Mock data generators
export const generateNavigationItems = (count: number, hasChildren: boolean = false) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `generated-${i}`,
    label: `Generated Item ${i + 1}`,
    href: `/generated-${i}`,
    children: hasChildren && i % 2 === 0 ? [
      { id: `generated-${i}-child-1`, label: `Child 1`, href: `/generated-${i}/child-1` },
      { id: `generated-${i}-child-2`, label: `Child 2`, href: `/generated-${i}/child-2` }
    ] : []
  }));
};

// Test environment setup
export const setupTestEnvironment = () => {
  mockResizeObserver();
  mockIntersectionObserver();
  mockMatchMedia();
  
  // Mock console methods to avoid noise in tests
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  
  // Setup fake timers if needed
  jest.useFakeTimers();
  
  return () => {
    // Cleanup function
    jest.restoreAllMocks();
    jest.useRealTimers();
  };
};

// Custom Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
      toBeAccessible(): R;
      toHaveFocusedElement(element: HTMLElement): R;
    }
  }
}

// Screen reader testing utilities
export const getAriaLabel = (element: HTMLElement): string => {
  return element.getAttribute('aria-label') || 
         element.getAttribute('aria-labelledby') || 
         element.textContent || '';
};

export const getAriaDescription = (element: HTMLElement): string => {
  const describedBy = element.getAttribute('aria-describedby');
  if (describedBy) {
    const descElement = document.getElementById(describedBy);
    return descElement?.textContent || '';
  }
  return '';
};

// Snapshot testing utilities
export const createSerializableProps = (props: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(props).filter(([, value]) => 
      typeof value !== 'function' && value !== undefined
    )
  );
};

// Test cleanup utilities
export const cleanupAfterEach = () => {
  // Clear any remaining timers
  jest.clearAllTimers();
  
  // Clear DOM
  document.body.innerHTML = '';
  
  // Reset focus
  if (document.activeElement && document.activeElement !== document.body) {
    (document.activeElement as HTMLElement).blur();
  }
  
  // Clear any mocked functions
  jest.clearAllMocks();
};

// Export common test patterns
export const testPatterns = {
  expectFocusOrder: async (elements: (HTMLElement | string)[], userEvent: any) => {
    for (const element of elements) {
      await userEvent.tab();
      const el = typeof element === 'string' ? 
        document.querySelector(element) as HTMLElement : element;
      expect(el).toHaveFocus();
    }
  },
  
  expectNoAccessibilityViolations: async (container: HTMLElement) => {
    // Would integrate with axe-core here
    const violations = []; // Mock - would be actual axe results
    expect(violations).toHaveLength(0);
  },
  
  expectResponsiveBreakpoint: (element: HTMLElement, breakpoint: string) => {
    expect(element).toHaveClass(`responsive-${breakpoint}`);
  }
};