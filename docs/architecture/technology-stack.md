# Technology Stack - WCAG 2.1 Login Form System

## Architecture Decision Records (ADR)

### ADR-002: Technology Selection Framework

**Status**: Approved  
**Date**: 2025-08-29  
**Decision**: Establish accessibility-first technology selection criteria

**Context**: Technology choices directly impact accessibility compliance and user experience quality.

**Decision Criteria**:
1. **Accessibility Support**: Native ARIA support, keyboard navigation, screen reader compatibility
2. **Progressive Enhancement**: Graceful degradation capabilities
3. **Performance**: Minimal impact on assistive technology responsiveness
4. **Standards Compliance**: W3C standards adherence
5. **Community Support**: Active accessibility community and resources

## 1. Frontend Technology Stack

### 1.1 Core Technologies

#### HTML5 Semantic Elements
```html
<!-- Decision: Use native HTML5 elements for maximum accessibility -->
<main role="main" aria-labelledby="page-heading">
  <section aria-label="User Authentication">
    <form role="form" novalidate>
      <fieldset>
        <legend>Login Credentials</legend>
        <!-- Native form elements -->
      </fieldset>
    </form>
  </section>
</main>
```

**Rationale**:
- Native semantic elements provide built-in accessibility
- Screen readers have optimized support for HTML5 landmarks
- No JavaScript dependency for basic structure
- SEO and search engine accessibility benefits

#### CSS3 with Accessibility Extensions
```css
/* Modern CSS with accessibility features */
:root {
  /* CSS Custom Properties for theming */
  --focus-color: #005fcc;
  --error-color: #d73502;
  --success-color: #28a745;
  
  /* High contrast mode variables */
  --text-primary: var(--user-text-color, #212529);
  --background-primary: var(--user-bg-color, #ffffff);
}

/* CSS Grid for layout (with fallbacks) */
.form-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  /* Fallback for older browsers */
  @supports not (display: grid) {
    display: block;
  }
}

/* Container queries for responsive components */
@container (min-width: 320px) {
  .form-field {
    --field-spacing: 1rem;
  }
}

/* Accessibility-first media queries */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-contrast: high) {
  .form-input {
    border-width: 3px;
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: #ffffff;
    --background-primary: #121212;
  }
}
```

**Technology Decisions**:
- **CSS Custom Properties**: Dynamic theming support
- **CSS Grid/Flexbox**: Modern layout with fallbacks
- **Container Queries**: Component-based responsive design
- **CSS Logical Properties**: International language support

#### Modern JavaScript (ES2021+)
```javascript
// Progressive enhancement with modern JS features
class AccessibleFormController {
  #privateFields = new Map(); // Private fields
  
  constructor(element) {
    this.element = element;
    this.#initializeWithFallback();
  }
  
  async #initializeWithFallback() {
    try {
      // Use modern features with fallbacks
      const { ValidationEngine } = await import('./validation-engine.js');
      this.validator = new ValidationEngine();
      
      // Dynamic imports for feature detection
      if ('IntersectionObserver' in window) {
        const { LazyLoader } = await import('./lazy-loader.js');
        this.lazyLoader = new LazyLoader();
      }
      
      // Optional chaining and nullish coalescing
      this.config = this.element.dataset.config?.length 
        ? JSON.parse(this.element.dataset.config) 
        : {};
      
    } catch (error) {
      // Graceful degradation
      this.#initializeBasicFunctionality();
    }
  }
  
  // Use logical assignment operators
  updateField(name, value) {
    this.#privateFields.set(name, value);
    this.config.autoSave &&= this.#saveToStorage();
  }
}
```

**JavaScript Architecture Decisions**:
- **ES2021+ Features**: Modern syntax with transpilation fallbacks
- **Dynamic Imports**: Code splitting for performance
- **Private Fields**: Encapsulation and security
- **Optional Chaining**: Safer property access
- **Promise-based APIs**: Modern async patterns

### 1.2 Accessibility-Specific Technologies

#### ARIA Authoring Practices Guide Implementation
```javascript
// WAI-ARIA 1.2 compliant implementations
class AriaCombobox {
  constructor(element) {
    this.combobox = element;
    this.listbox = element.querySelector('[role="listbox"]');
    this.options = [...element.querySelectorAll('[role="option"]')];
    
    this.setupAriaAttributes();
    this.setupKeyboardNavigation();
  }
  
  setupAriaAttributes() {
    // Required ARIA attributes for combobox pattern
    this.combobox.setAttribute('role', 'combobox');
    this.combobox.setAttribute('aria-expanded', 'false');
    this.combobox.setAttribute('aria-haspopup', 'listbox');
    this.combobox.setAttribute('aria-controls', this.listbox.id);
    
    // Listbox attributes
    this.listbox.setAttribute('role', 'listbox');
    this.listbox.setAttribute('aria-label', 'Available options');
    
    // Option attributes
    this.options.forEach((option, index) => {
      option.setAttribute('role', 'option');
      option.setAttribute('aria-posinset', index + 1);
      option.setAttribute('aria-setsize', this.options.length);
    });
  }
  
  setupKeyboardNavigation() {
    // Implement WAI-ARIA keyboard patterns
    this.combobox.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this.navigateOptions(1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.navigateOptions(-1);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          this.selectCurrentOption();
          break;
        case 'Escape':
          this.closeListbox();
          break;
      }
    });
  }
}
```

#### Screen Reader Testing Integration
```javascript
// Automated screen reader testing utilities
class ScreenReaderTester {
  constructor() {
    this.virtualBuffer = [];
    this.announcements = [];
  }
  
  simulateScreenReaderNavigation(startElement) {
    const walker = document.createTreeWalker(
      startElement,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          // Filter for accessible elements
          return this.isAccessibleElement(node) 
            ? NodeFilter.FILTER_ACCEPT 
            : NodeFilter.FILTER_SKIP;
        }
      }
    );
    
    const accessibleElements = [];
    let node;
    
    while (node = walker.nextNode()) {
      accessibleElements.push({
        element: node,
        accessibleName: this.computeAccessibleName(node),
        role: this.computeRole(node),
        description: this.computeDescription(node)
      });
    }
    
    return accessibleElements;
  }
  
  computeAccessibleName(element) {
    // Implementation of accessible name computation algorithm
    // https://www.w3.org/TR/accname-1.1/
    
    // Step 1: aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElements = labelledBy.split(' ')
        .map(id => document.getElementById(id))
        .filter(el => el);
      
      if (labelElements.length > 0) {
        return labelElements.map(el => el.textContent.trim()).join(' ');
      }
    }
    
    // Step 2: aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return ariaLabel.trim();
    }
    
    // Step 3: Associated labels
    if (element.tagName === 'INPUT') {
      const labels = element.labels;
      if (labels && labels.length > 0) {
        return Array.from(labels).map(label => label.textContent.trim()).join(' ');
      }
    }
    
    // Step 4: placeholder (for inputs)
    if (element.tagName === 'INPUT' && element.placeholder) {
      return element.placeholder;
    }
    
    // Step 5: text content (for certain elements)
    const textContentTags = ['BUTTON', 'A', 'SUMMARY'];
    if (textContentTags.includes(element.tagName)) {
      return element.textContent.trim();
    }
    
    return '';
  }
}
```

### 1.3 Build and Development Tools

#### Webpack Configuration for Accessibility
```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const AccessibilityWebpackPlugin = require('./plugins/accessibility-webpack-plugin');

module.exports = {
  entry: {
    'login-form': './src/components/login-form/index.js',
    'accessibility-polyfills': './src/polyfills/accessibility.js'
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  // Support for assistive technologies
                  browsers: ['> 1%', 'last 2 versions', 'not ie <= 10']
                },
                useBuiltIns: 'usage',
                corejs: 3
              }]
            ]
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]--[hash:base64:5]'
              }
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  ['autoprefixer'],
                  ['postcss-accessibility', { // Custom plugin for a11y
                    colorContrast: {
                      threshold: 4.5,
                      ignoreClasses: ['.ignore-contrast']
                    }
                  }]
                ]
              }
            }
          },
          'sass-loader'
        ]
      }
    ]
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: false, // Manual injection for accessibility control
      templateParameters: {
        lang: 'en',
        dir: 'ltr',
        viewport: 'width=device-width, initial-scale=1',
        themeColor: '#005fcc'
      }
    }),
    
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    
    // Custom accessibility plugin
    new AccessibilityWebpackPlugin({
      axeConfig: {
        rules: {
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'aria-valid-attr': { enabled: true }
        }
      },
      failOnError: true
    })
  ],
  
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        accessibility: {
          test: /[\\/]accessibility[\\/]/,
          name: 'accessibility',
          chunks: 'all',
          priority: 20
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        }
      }
    }
  }
};
```

#### ESLint Configuration for Accessibility
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended'  // JSX accessibility rules
  ],
  
  plugins: [
    '@typescript-eslint',
    'jsx-a11y'
  ],
  
  rules: {
    // Custom accessibility rules
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/no-access-key': 'error',
    'jsx-a11y/no-autofocus': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
    
    // Custom rules for accessibility
    'no-focus-trap': 'error',
    'require-aria-label': 'warn'
  },
  
  settings: {
    'jsx-a11y': {
      components: {
        LoginForm: 'form',
        FormField: 'div',
        ErrorSummary: 'div'
      }
    }
  }
};
```

## 2. Testing Infrastructure

### 2.1 Automated Accessibility Testing

#### Playwright with axe-core Integration
```javascript
// tests/accessibility/axe.test.js
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright');

test.describe('Login Form Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should pass axe accessibility tests', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab order
    await page.keyboard.press('Tab');
    await expect(page.locator('#email')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#password')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('.submit-button')).toBeFocused();
  });

  test('should announce errors to screen readers', async ({ page }) => {
    // Submit empty form
    await page.click('.submit-button');
    
    // Check for aria-live announcement
    const liveRegion = page.locator('#error-announcements');
    await expect(liveRegion).toHaveText(/There are \d+ errors/);
    
    // Check error summary focus
    const errorSummary = page.locator('#error-summary');
    await expect(errorSummary).toBeFocused();
  });

  test('should maintain focus indicators', async ({ page }) => {
    const emailField = page.locator('#email');
    await emailField.focus();
    
    // Check for visible focus indicator
    const focusIndicator = await emailField.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow
      };
    });
    
    expect(focusIndicator.outline).not.toBe('none');
  });
});
```

#### Jest Unit Tests for Accessibility
```javascript
// tests/unit/accessibility.test.js
import { JSDOM } from 'jsdom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LoginFormController } from '../src/components/login-form/controller.js';

expect.extend(toHaveNoViolations);

describe('LoginForm Accessibility Units', () => {
  let dom, container, loginForm;
  
  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <div id="test-container"></div>
        </body>
      </html>
    `);
    
    global.window = dom.window;
    global.document = dom.window.document;
    
    container = document.getElementById('test-container');
    container.innerHTML = `
      <form class="login-form" role="form" aria-describedby="form-instructions">
        <div id="form-instructions">Please enter your credentials</div>
        
        <div class="form-field">
          <label for="email">Email Address *</label>
          <input type="email" id="email" name="email" required aria-describedby="email-hint">
          <div id="email-hint">Enter your registered email</div>
          <div id="email-error" class="field-error" role="alert" hidden></div>
        </div>
        
        <button type="submit" class="submit-button">Sign In</button>
        
        <div aria-live="polite" id="form-status" class="sr-only"></div>
      </form>
    `;
    
    loginForm = new LoginFormController(container.querySelector('.login-form'));
  });
  
  afterEach(() => {
    dom.window.close();
  });
  
  test('should have no accessibility violations', async () => {
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('should properly compute accessible names', () => {
    const emailField = document.getElementById('email');
    const computedName = loginForm.computeAccessibleName(emailField);
    
    expect(computedName).toBe('Email Address *');
  });
  
  test('should manage ARIA states correctly', async () => {
    const emailField = document.getElementById('email');
    
    // Trigger validation error
    emailField.value = 'invalid-email';
    await loginForm.validateField('email');
    
    expect(emailField.getAttribute('aria-invalid')).toBe('true');
    expect(emailField.getAttribute('aria-describedby')).toContain('email-error');
    
    // Fix error
    emailField.value = 'valid@example.com';
    await loginForm.validateField('email');
    
    expect(emailField.getAttribute('aria-invalid')).toBe('false');
  });
  
  test('should announce form status changes', async () => {
    const liveRegion = document.getElementById('form-status');
    
    // Trigger form submission
    const form = container.querySelector('.login-form');
    form.dispatchEvent(new Event('submit'));
    
    expect(liveRegion.textContent).toContain('Submitting form');
  });
});
```

### 2.2 Cross-Browser and Assistive Technology Testing

#### Browser Testing Matrix
```yaml
# .github/workflows/accessibility-testing.yml
name: Accessibility Testing

on: [push, pull_request]

jobs:
  accessibility-tests:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
        screen-reader: [none, nvda-simulation, jaws-simulation]
        
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Install Playwright browsers
        run: npx playwright install ${{ matrix.browser }}
        
      - name: Run accessibility tests
        run: |
          npm run test:accessibility -- \
            --browser=${{ matrix.browser }} \
            --screen-reader=${{ matrix.screen-reader }}
            
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: accessibility-test-results-${{ matrix.browser }}-${{ matrix.screen-reader }}
          path: test-results/
```

## 3. Development and Production Infrastructure

### 3.1 Development Environment

#### Local Development Setup
```json
{
  "name": "wcag-login-form",
  "version": "1.0.0",
  "description": "WCAG 2.1 AA compliant login form system",
  "main": "src/index.js",
  "scripts": {
    "dev": "webpack serve --mode development --config webpack.dev.js",
    "build": "webpack --mode production --config webpack.prod.js",
    "test": "jest",
    "test:a11y": "npm run test:unit:a11y && npm run test:e2e:a11y",
    "test:unit:a11y": "jest --testPathPattern=accessibility",
    "test:e2e:a11y": "playwright test tests/accessibility/",
    "lint": "eslint src/ --ext .js,.ts",
    "lint:a11y": "eslint src/ --ext .js,.ts --config .eslintrc.a11y.js",
    "audit:a11y": "axe src/index.html --rules wcag2a,wcag2aa,wcag21aa",
    "serve": "http-server dist/ -p 8080 -c-1"
  },
  "devDependencies": {
    "@axe-core/playwright": "^4.8.2",
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "@playwright/test": "^1.40.0",
    "@typescript-eslint/eslint-plugin": "^6.9.0",
    "@typescript-eslint/parser": "^6.9.0",
    "axe-core": "^4.8.2",
    "babel-loader": "^9.1.3",
    "css-loader": "^6.8.1",
    "eslint": "^8.52.0",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "html-webpack-plugin": "^5.5.3",
    "jest": "^29.7.0",
    "jest-axe": "^8.0.0",
    "jsdom": "^22.1.0",
    "mini-css-extract-plugin": "^2.7.6",
    "postcss": "^8.4.31",
    "postcss-loader": "^7.3.3",
    "sass": "^1.69.5",
    "sass-loader": "^13.3.2",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^4.15.1"
  },
  "dependencies": {
    "core-js": "^3.33.0"
  }
}
```

#### VSCode Development Configuration
```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "typescript",
    "html"
  ],
  "emmet.includeLanguages": {
    "html": "html"
  },
  "html.validate.scripts": true,
  "html.validate.styles": true,
  "css.validate": true,
  "scss.validate": true,
  
  // Accessibility-specific settings
  "accessibility.ignoreRules": [],
  "accessibility.alertLevel": "error",
  
  // Extensions recommendations
  "extensions.recommendations": [
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "axe-core.axe-linter" // Accessibility linting
  ]
}
```

### 3.2 Production Deployment

#### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration with security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration with Security Headers
```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'";
    
    # Accessibility headers
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    add_header Pragma "no-cache" always;
    add_header Expires "0" always;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Main location block
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## 4. Performance and Optimization

### 4.1 Critical Rendering Path Optimization

#### Resource Loading Strategy
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Accessible Form</title>
    
    <!-- Critical CSS inlined -->
    <style>
        /* Critical path CSS - inlined for performance */
        .login-form { max-width: 400px; margin: 0 auto; }
        .form-field { margin-bottom: 1rem; }
        .form-input { width: 100%; min-height: 44px; padding: 12px; }
        .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; }
    </style>
    
    <!-- Preload critical resources -->
    <link rel="preload" href="/fonts/roboto-v30-latin-regular.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/css/main.css" as="style">
    <link rel="preload" href="/js/login-form.js" as="script">
    
    <!-- Load non-critical CSS asynchronously -->
    <link rel="preload" href="/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/css/main.css"></noscript>
    
    <!-- DNS prefetch for external resources -->
    <link rel="dns-prefetch" href="//api.example.com">
</head>
<body>
    <!-- Main content loads immediately -->
    <main role="main" id="main-content">
        <!-- Form structure here -->
    </main>
    
    <!-- Load JavaScript with optimal strategy -->
    <script type="module" src="/js/login-form.js" defer></script>
    <script nomodule src="/js/login-form.legacy.js" defer></script>
</body>
</html>
```

### 4.2 Bundle Optimization

#### Code Splitting Strategy
```javascript
// webpack.optimization.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Critical accessibility code
        accessibility: {
          test: /[\\/](accessibility|a11y)[\\/]/,
          name: 'accessibility',
          chunks: 'all',
          priority: 30,
          enforce: true
        },
        
        // Form validation logic
        validation: {
          test: /[\\/]validation[\\/]/,
          name: 'validation',
          chunks: 'all',
          priority: 25
        },
        
        // Polyfills for older browsers
        polyfills: {
          test: /[\\/](polyfill|core-js)[\\/]/,
          name: 'polyfills',
          chunks: 'all',
          priority: 20
        },
        
        // Third-party libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        }
      }
    },
    
    // Runtime chunk for webpack module loading
    runtimeChunk: {
      name: 'runtime'
    },
    
    // Tree shaking for unused code
    usedExports: true,
    sideEffects: [
      '*.css',
      '*.scss',
      './src/polyfills/*'
    ]
  }
};
```

## 5. Monitoring and Analytics

### 5.1 Accessibility Monitoring

#### Real User Monitoring (RUM) for Accessibility
```javascript
// accessibility-monitoring.js
class AccessibilityMonitor {
  constructor() {
    this.metrics = {
      focusTraps: 0,
      ariaErrors: 0,
      keyboardIssues: 0,
      contrastFailures: 0,
      screenReaderUsers: 0
    };
    
    this.init();
  }
  
  init() {
    this.detectAssistiveTechnology();
    this.monitorFocusManagement();
    this.trackKeyboardNavigation();
    this.monitorAriaUpdates();
    this.setupPerformanceObserver();
  }
  
  detectAssistiveTechnology() {
    // Detect screen reader usage
    if (this.isScreenReaderActive()) {
      this.metrics.screenReaderUsers++;
      this.trackScreenReaderMetrics();
    }
    
    // Track high contrast mode usage
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.track('accessibility.high_contrast_mode', 1);
    }
    
    // Track reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.track('accessibility.reduced_motion', 1);
    }
  }
  
  monitorFocusManagement() {
    document.addEventListener('focusin', (event) => {
      const element = event.target;
      
      // Track focus on form elements
      if (element.matches('input, select, textarea, button')) {
        this.track('accessibility.focus', {
          element: element.tagName.toLowerCase(),
          hasLabel: !!element.labels?.length || !!element.getAttribute('aria-label'),
          hasDescription: !!element.getAttribute('aria-describedby')
        });
      }
      
      // Detect focus traps
      if (this.isFocusTrapped(element)) {
        this.metrics.focusTraps++;
        this.track('accessibility.focus_trap', 1);
      }
    });
  }
  
  trackKeyboardNavigation() {
    let tabPresses = 0;
    let keyboardUser = false;
    
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        tabPresses++;
        keyboardUser = true;
        
        // Track tab order issues
        const activeElement = document.activeElement;
        if (!this.isElementVisible(activeElement)) {
          this.metrics.keyboardIssues++;
          this.track('accessibility.hidden_focus', 1);
        }
      }
      
      // Track keyboard shortcuts usage
      if (event.altKey || event.ctrlKey || event.metaKey) {
        this.track('accessibility.keyboard_shortcut', {
          key: event.key,
          modifiers: {
            alt: event.altKey,
            ctrl: event.ctrlKey,
            meta: event.metaKey
          }
        });
      }
    });
    
    // Report keyboard usage patterns
    window.addEventListener('beforeunload', () => {
      if (keyboardUser) {
        this.track('accessibility.keyboard_user', {
          tabPresses,
          sessionDuration: Date.now() - this.startTime
        });
      }
    });
  }
  
  track(event, data) {
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', event, data);
    }
    
    // Send to internal monitoring
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        data,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }).catch(console.error);
  }
}

// Initialize monitoring
new AccessibilityMonitor();
```

### 5.2 Performance Monitoring

#### Web Vitals for Accessibility
```javascript
// performance-monitoring.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

class AccessibilityPerformanceMonitor {
  constructor() {
    this.init();
  }
  
  init() {
    // Core Web Vitals
    getCLS(this.sendMetric.bind(this));
    getFID(this.sendMetric.bind(this));
    getFCP(this.sendMetric.bind(this));
    getLCP(this.sendMetric.bind(this));
    getTTFB(this.sendMetric.bind(this));
    
    // Custom accessibility metrics
    this.measureFormInteractionDelay();
    this.measureScreenReaderResponseTime();
    this.measureFocusVisibleDelay();
  }
  
  measureFormInteractionDelay() {
    const formElements = document.querySelectorAll('input, button, select, textarea');
    
    formElements.forEach(element => {
      element.addEventListener('click', () => {
        const startTime = performance.now();
        
        requestAnimationFrame(() => {
          const endTime = performance.now();
          const delay = endTime - startTime;
          
          this.sendMetric({
            name: 'form_interaction_delay',
            value: delay,
            element: element.tagName.toLowerCase(),
            id: element.id || 'anonymous'
          });
        });
      });
    });
  }
  
  measureScreenReaderResponseTime() {
    const liveRegions = document.querySelectorAll('[aria-live]');
    
    liveRegions.forEach(region => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const startTime = performance.now();
            
            // Approximate screen reader processing time
            setTimeout(() => {
              const endTime = performance.now();
              const responseTime = endTime - startTime;
              
              this.sendMetric({
                name: 'screen_reader_response_time',
                value: responseTime,
                liveType: region.getAttribute('aria-live'),
                contentLength: region.textContent.length
              });
            }, 100); // Estimated screen reader delay
          }
        });
      });
      
      observer.observe(region, {
        childList: true,
        characterData: true,
        subtree: true
      });
    });
  }
  
  sendMetric(metric) {
    // Send to analytics
    gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: metric.name,
      value: Math.round(metric.value),
      non_interaction: true
    });
    
    // Send to monitoring service
    fetch('/api/performance-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...metric,
        timestamp: Date.now(),
        url: window.location.href
      })
    }).catch(console.error);
  }
}

new AccessibilityPerformanceMonitor();
```

This comprehensive technology stack documentation provides the complete foundation for building, testing, and deploying a WCAG 2.1 AA compliant login form system with modern web technologies and accessibility-first development practices.