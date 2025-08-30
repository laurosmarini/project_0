# File Organization & Modular Architecture

## Project Structure

```
pricing-table-component/
├── src/
│   ├── styles/
│   │   ├── base/
│   │   │   ├── _reset.css
│   │   │   ├── _variables.css
│   │   │   └── _typography.css
│   │   ├── components/
│   │   │   ├── _pricing-table.css
│   │   │   ├── _pricing-tier.css
│   │   │   ├── _pricing-features.css
│   │   │   └── _pricing-mobile.css
│   │   ├── utilities/
│   │   │   ├── _layout.css
│   │   │   ├── _spacing.css
│   │   │   └── _accessibility.css
│   │   ├── themes/
│   │   │   ├── _light-theme.css
│   │   │   └── _dark-theme.css
│   │   └── main.css
│   ├── scripts/
│   │   ├── core/
│   │   │   ├── pricing-table.js
│   │   │   ├── base-component.js
│   │   │   └── event-emitter.js
│   │   ├── components/
│   │   │   ├── mobile-controller.js
│   │   │   ├── accordion-controller.js
│   │   │   ├── tab-controller.js
│   │   │   └── theme-manager.js
│   │   ├── utils/
│   │   │   ├── dom-utils.js
│   │   │   ├── animation-utils.js
│   │   │   ├── accessibility-utils.js
│   │   │   └── performance-utils.js
│   │   └── main.js
│   └── templates/
│       ├── pricing-table.html
│       ├── pricing-tier.html
│       └── mobile-interface.html
├── dist/
│   ├── css/
│   │   ├── pricing-table.min.css
│   │   └── pricing-table.css
│   ├── js/
│   │   ├── pricing-table.min.js
│   │   ├── pricing-table.js
│   │   └── pricing-table.esm.js
│   └── assets/
│       └── icons/
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   └── utils/
│   ├── integration/
│   └── accessibility/
├── docs/
│   ├── api/
│   ├── examples/
│   └── guides/
├── examples/
│   ├── basic/
│   ├── advanced/
│   └── integrations/
├── tools/
│   ├── build/
│   └── dev/
├── package.json
├── rollup.config.js
├── postcss.config.js
└── README.md
```

## CSS Architecture (ITCSS + BEM)

### Layer Organization (ITCSS)
```css
/* main.css - Entry point */
@import 'base/reset';
@import 'base/variables';
@import 'base/typography';

@import 'components/pricing-table';
@import 'components/pricing-tier';
@import 'components/pricing-features';
@import 'components/pricing-mobile';

@import 'utilities/layout';
@import 'utilities/spacing';
@import 'utilities/accessibility';

@import 'themes/light-theme';
@import 'themes/dark-theme';
```

### Component-Level CSS (BEM)
```css
/* _pricing-table.css */
.pricing-table {
  /* Block styles */
}

.pricing-table__header {
  /* Element styles */
}

.pricing-table__title {
  /* Element styles */
}

.pricing-table--dark {
  /* Modifier styles */
}

.pricing-table--compact {
  /* Modifier styles */
}
```

### CSS Custom Properties Organization
```css
/* _variables.css */
:root {
  /* === DESIGN TOKENS === */
  
  /* Colors */
  --pricing-color-primary: #2563eb;
  --pricing-color-secondary: #64748b;
  
  /* Typography */
  --pricing-font-primary: 'Inter', system-ui, sans-serif;
  --pricing-text-base: 1rem;
  
  /* Spacing */
  --pricing-space-unit: 0.5rem;
  --pricing-space-4: calc(var(--pricing-space-unit) * 2);
  
  /* Layout */
  --pricing-container-max: 1200px;
  --pricing-tier-min-width: 280px;
  
  /* Animation */
  --pricing-duration-fast: 150ms;
  --pricing-ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

## JavaScript Architecture (ES6 Modules)

### Core Module Pattern
```javascript
// core/base-component.js
export class BaseComponent {
  constructor(element, options = {}) {
    this.element = element;
    this.options = { ...this.constructor.defaultOptions, ...options };
    this.state = {};
    this.initialized = false;
  }
  
  static defaultOptions = {}
  
  init() {
    if (this.initialized) return;
    
    this.bindEvents();
    this.initialized = true;
    
    return this;
  }
  
  bindEvents() {
    // Override in subclasses
  }
  
  destroy() {
    this.initialized = false;
  }
}
```

### Component Inheritance
```javascript
// core/pricing-table.js
import { BaseComponent } from './base-component.js';
import { MobileController } from '../components/mobile-controller.js';
import { ThemeManager } from '../components/theme-manager.js';

export class PricingTable extends BaseComponent {
  static defaultOptions = {
    mobileBreakpoint: 768,
    enableAnimations: true,
    theme: 'auto'
  }
  
  init() {
    super.init();
    
    this.mobileController = new MobileController(this);
    this.themeManager = new ThemeManager(this.element);
    
    this.setupIntersectionObserver();
    
    return this;
  }
}
```

### Utility Modules
```javascript
// utils/dom-utils.js
export const DOM = {
  query: (selector, context = document) => context.querySelector(selector),
  queryAll: (selector, context = document) => [...context.querySelectorAll(selector)],
  
  closest: (element, selector) => element.closest(selector),
  
  addClass: (element, className) => element.classList.add(className),
  removeClass: (element, className) => element.classList.remove(className),
  toggleClass: (element, className, force) => element.classList.toggle(className, force),
  
  setAttributes: (element, attributes) => {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
};

// utils/performance-utils.js
export const Performance = {
  debounce: (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },
  
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  raf: (callback) => {
    return window.requestAnimationFrame(callback);
  }
};
```

## Build System Configuration

### Rollup Configuration
```javascript
// rollup.config.js
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: 'src/scripts/main.js',
    output: [
      {
        name: 'PricingTable',
        file: 'dist/js/pricing-table.js',
        format: 'umd'
      },
      {
        file: 'dist/js/pricing-table.esm.js',
        format: 'esm'
      }
    ],
    plugins: [
      resolve(),
      babel({ babelHelpers: 'bundled' }),
      production && terser()
    ]
  }
];
```

### PostCSS Configuration
```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-import'),
    require('autoprefixer'),
    require('cssnano')({ preset: 'default' })
  ]
};
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"rollup -c -w\" \"postcss src/styles/main.css -o dist/css/pricing-table.css -w\"",
    "build": "rollup -c && postcss src/styles/main.css -o dist/css/pricing-table.css",
    "build:min": "npm run build && postcss dist/css/pricing-table.css -o dist/css/pricing-table.min.css --env production",
    "test": "jest",
    "test:a11y": "jest --config=jest.a11y.config.js",
    "lint:js": "eslint src/scripts",
    "lint:css": "stylelint src/styles/**/*.css",
    "serve": "live-server --port=3000 --open=examples/"
  }
}
```

## Documentation Structure

### API Documentation
```markdown
<!-- docs/api/pricing-table.md -->
# PricingTable API

## Constructor
`new PricingTable(element, options)`

### Parameters
- `element` (HTMLElement): Container element
- `options` (Object): Configuration options

### Options
- `mobileBreakpoint` (Number): Breakpoint for mobile layout (default: 768)
- `enableAnimations` (Boolean): Enable smooth animations (default: true)
- `theme` (String): Theme mode - 'light', 'dark', or 'auto' (default: 'auto')

## Methods
- `init()`: Initialize the component
- `destroy()`: Clean up event listeners and references
- `setTheme(theme)`: Change theme programmatically
- `updatePricing(data)`: Update pricing data dynamically
```

### Integration Guides
```markdown
<!-- docs/guides/integration.md -->
# Integration Guide

## Basic Usage
```html
<div class="pricing-table" data-config='{"theme": "dark"}'>
  <!-- pricing content -->
</div>
```

## Framework Integration

### React
```jsx
import { useEffect, useRef } from 'react';
import { PricingTable } from 'pricing-table-component';

function PricingTableComponent({ options }) {
  const ref = useRef(null);
  
  useEffect(() => {
    const instance = new PricingTable(ref.current, options);
    return () => instance.destroy();
  }, [options]);
  
  return <div ref={ref} className="pricing-table" />;
}
```
```

## Testing Architecture

### Unit Tests
```javascript
// tests/unit/components/pricing-table.test.js
import { PricingTable } from '../../../src/scripts/core/pricing-table.js';

describe('PricingTable', () => {
  let container;
  let pricingTable;
  
  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = '<div class="pricing-table"></div>';
    document.body.appendChild(container);
    
    pricingTable = new PricingTable(container.firstElementChild);
  });
  
  afterEach(() => {
    pricingTable.destroy();
    document.body.removeChild(container);
  });
  
  test('should initialize with default options', () => {
    expect(pricingTable.options.mobileBreakpoint).toBe(768);
    expect(pricingTable.options.enableAnimations).toBe(true);
  });
});
```

### Accessibility Tests
```javascript
// tests/accessibility/pricing-table.a11y.test.js
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('PricingTable Accessibility', () => {
  test('should have no accessibility violations', async () => {
    const container = document.createElement('div');
    container.innerHTML = pricingTableHTML;
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Deployment & Distribution

### NPM Package Structure
```json
{
  "name": "responsive-pricing-table",
  "version": "1.0.0",
  "main": "dist/js/pricing-table.js",
  "module": "dist/js/pricing-table.esm.js",
  "style": "dist/css/pricing-table.css",
  "files": ["dist/", "src/", "docs/"],
  "exports": {
    ".": {
      "import": "./dist/js/pricing-table.esm.js",
      "require": "./dist/js/pricing-table.js"
    },
    "./css": "./dist/css/pricing-table.css"
  }
}
```

### CDN Distribution
```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/responsive-pricing-table@1.0.0/dist/css/pricing-table.min.css">

<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/responsive-pricing-table@1.0.0/dist/js/pricing-table.min.js"></script>
```

## Version Control & Maintenance

### Semantic Versioning
- **Major**: Breaking API changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, no API changes

### Changelog Structure
```markdown
# Changelog

## [1.1.0] - 2025-08-29

### Added
- Dark theme support
- Swipe gestures for mobile carousel
- Container query support (experimental)

### Fixed
- Focus management in accordion mode
- High contrast mode compatibility

### Changed
- Improved animation performance
- Updated accessibility patterns
```

This modular architecture ensures maintainability, scalability, and clear separation of concerns while providing a robust foundation for the responsive pricing table component.