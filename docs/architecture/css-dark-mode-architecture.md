# CSS-Only Dark/Light Mode Toggle - Technical Architecture

## System Overview

This architecture defines a scalable, performant, and accessible CSS-only dark/light mode toggle system that works across modern and legacy browsers while maintaining optimal user experience.

## 1. CSS Custom Properties Structure (Theme Variables)

### Core Architecture

```css
/* Theme Variables Architecture */
:root {
  /* Color Primitives */
  --color-primary-hue: 220;
  --color-primary-saturation: 100%;
  --color-neutral-hue: 220;
  
  /* Semantic Color Tokens */
  --color-background: hsl(var(--color-neutral-hue), 10%, 98%);
  --color-surface: hsl(var(--color-neutral-hue), 10%, 100%);
  --color-text-primary: hsl(var(--color-neutral-hue), 15%, 15%);
  --color-text-secondary: hsl(var(--color-neutral-hue), 10%, 45%);
  --color-border: hsl(var(--color-neutral-hue), 15%, 90%);
  --color-accent: hsl(var(--color-primary-hue), var(--color-primary-saturation), 50%);
  
  /* Component-Specific Tokens */
  --button-background: var(--color-accent);
  --button-text: white;
  --card-background: var(--color-surface);
  --card-shadow: hsla(var(--color-neutral-hue), 20%, 0%, 0.08);
  
  /* Animation & Transition Properties */
  --transition-duration: 0.25s;
  --transition-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --transition-property: background-color, border-color, color, fill, stroke, box-shadow;
}

/* Dark Theme Override */
[data-theme="dark"] {
  --color-background: hsl(var(--color-neutral-hue), 15%, 8%);
  --color-surface: hsl(var(--color-neutral-hue), 15%, 12%);
  --color-text-primary: hsl(var(--color-neutral-hue), 10%, 95%);
  --color-text-secondary: hsl(var(--color-neutral-hue), 5%, 65%);
  --color-border: hsl(var(--color-neutral-hue), 15%, 25%);
  --card-shadow: hsla(0, 0%, 0%, 0.3);
}
```

### Variable Hierarchy

1. **Primitive Tokens**: Base values (hue, saturation, lightness)
2. **Semantic Tokens**: Context-aware colors (background, text, border)
3. **Component Tokens**: Specific component styling
4. **Animation Tokens**: Transition and timing values

## 2. Toggle Mechanism Architecture

### Primary: CSS `:has()` Selector (Modern Browsers)

```css
/* Modern Approach with :has() */
.theme-toggle {
  position: relative;
  width: 3rem;
  height: 1.5rem;
  border-radius: 0.75rem;
  background: var(--color-border);
  transition: background-color var(--transition-duration) var(--transition-easing);
  cursor: pointer;
}

body:has(.theme-toggle__input:checked) {
  --theme-mode: "dark";
}

.theme-toggle__input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.theme-toggle__slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(1.5rem - 4px);
  height: calc(1.5rem - 4px);
  border-radius: 50%;
  background: var(--color-surface);
  transition: transform var(--transition-duration) var(--transition-easing);
  box-shadow: var(--card-shadow);
}

.theme-toggle__input:checked + .theme-toggle__slider {
  transform: translateX(1.5rem);
}
```

### Fallback: Checkbox Hack (Legacy Support)

```css
/* Legacy Browser Support */
.theme-toggle__input:checked ~ * {
  --color-background: hsl(var(--color-neutral-hue), 15%, 8%);
  --color-surface: hsl(var(--color-neutral-hue), 15%, 12%);
  /* ... other dark theme variables */
}

/* Alternative: Adjacent sibling approach */
.theme-toggle__input:checked + .theme-container {
  /* Dark theme styles cascade down */
}
```

## 3. Browser Compatibility & Fallback Strategies

### Tier 1: Modern Browsers (2022+)
- CSS `:has()` selector
- CSS custom properties with `hsl()` functions
- Advanced transition animations

### Tier 2: Standard Browsers (2018+)
- CSS custom properties
- Checkbox hack toggle mechanism
- Basic transitions

### Tier 3: Legacy Browsers (2015+)
- Hardcoded theme classes
- JavaScript enhancement required
- No smooth transitions

### Progressive Enhancement Strategy

```css
/* Base: No theme support */
body {
  background-color: #ffffff;
  color: #333333;
}

/* Enhanced: CSS Custom Properties */
@supports (color: var(--test)) {
  body {
    background-color: var(--color-background);
    color: var(--color-text-primary);
  }
}

/* Advanced: :has() selector */
@supports selector(:has(*)) {
  body:has(.theme-toggle__input:checked) {
    --theme-mode: "dark";
  }
}
```

## 4. LocalStorage Integration Approach

### CSS-Only State Persistence

```css
/* CSS reads from data attribute set by minimal JS */
[data-theme="dark"] {
  /* Dark theme variables */
}

[data-theme="light"] {
  /* Light theme variables (optional, defaults) */
}

/* Prefers-color-scheme integration */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    /* Auto dark theme when no preference set */
    --color-background: hsl(var(--color-neutral-hue), 15%, 8%);
    /* ... */
  }
}
```

### Minimal JavaScript Enhancement

```javascript
// Minimal JS for persistence (under 200 bytes)
(function() {
  const saved = localStorage.getItem('theme');
  const prefer = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = saved || (prefer ? 'dark' : 'light');
  
  document.addEventListener('change', (e) => {
    if (e.target.matches('.theme-toggle__input')) {
      const theme = e.target.checked ? 'dark' : 'light';
      document.documentElement.dataset.theme = theme;
      localStorage.setItem('theme', theme);
    }
  });
})();
```

## 5. File Organization & Naming Conventions

### Directory Structure

```
src/styles/
├── tokens/
│   ├── colors.css              # Color primitive definitions
│   ├── typography.css          # Font and text tokens
│   └── spacing.css             # Layout and spacing tokens
├── themes/
│   ├── base.css                # Root theme variables
│   ├── dark.css                # Dark theme overrides
│   └── light.css               # Light theme overrides (optional)
├── components/
│   ├── theme-toggle.css        # Toggle component styles
│   ├── button.css              # Component using theme tokens
│   └── card.css                # Component using theme tokens
├── utilities/
│   ├── transitions.css         # Animation utilities
│   └── accessibility.css      # A11y enhancements
└── main.css                    # Import orchestration
```

### Naming Conventions

- **Variables**: `--{category}-{property}-{variant?}`
  - `--color-text-primary`
  - `--spacing-component-padding`
  - `--font-size-heading-large`

- **Components**: `{component}__{element}--{modifier}`
  - `.theme-toggle__input`
  - `.theme-toggle__slider--dark`

- **Utility Classes**: `u-{property}-{value}`
  - `.u-transition-colors`
  - `.u-visually-hidden`

## 6. Performance Optimization Strategy

### CSS Architecture Optimizations

```css
/* Minimize repaints with transform-based animations */
.theme-toggle__slider {
  transform: translateX(0);
  will-change: transform;
}

/* Use contain for toggle component */
.theme-toggle {
  contain: layout style paint;
}

/* Optimize transitions for 60fps */
.theme-transition {
  transition: var(--transition-property) var(--transition-duration) var(--transition-easing);
}

/* Reduce layout thrash */
body {
  transition: background-color var(--transition-duration) var(--transition-easing);
}
```

### Loading Strategy

```css
/* Critical CSS inlined in head */
:root {
  color-scheme: light dark; /* Browser optimization hint */
  /* Core theme variables */
}

/* Non-critical theme CSS loaded async */
@media (prefers-color-scheme: dark) {
  /* Dark theme styles for faster initial render */
}
```

### Bundle Size Optimization

- **Gzip**: Estimated ~2KB for complete system
- **Tree Shaking**: Modular CSS imports
- **CSS Minification**: Variable name shortening in production

## 7. Accessibility Specifications

### WCAG 2.1 AA Compliance

```css
/* Contrast Ratios */
:root {
  --color-text-primary: hsl(var(--color-neutral-hue), 15%, 15%); /* 4.5:1 minimum */
  --color-text-secondary: hsl(var(--color-neutral-hue), 10%, 45%); /* 3:1 minimum */
}

[data-theme="dark"] {
  --color-text-primary: hsl(var(--color-neutral-hue), 10%, 95%); /* 4.5:1 minimum */
  --color-text-secondary: hsl(var(--color-neutral-hue), 5%, 65%); /* 3:1 minimum */
}

/* Focus Indicators */
.theme-toggle__input:focus-visible + .theme-toggle__slider {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .theme-toggle,
  .theme-toggle__slider,
  .theme-transition {
    transition-duration: 0.01ms;
  }
}
```

### Screen Reader Support

```html
<label class="theme-toggle" for="theme-toggle-input">
  <input 
    type="checkbox" 
    id="theme-toggle-input"
    class="theme-toggle__input"
    aria-describedby="theme-toggle-description"
  >
  <span class="theme-toggle__slider" aria-hidden="true"></span>
  <span class="u-visually-hidden" id="theme-toggle-description">
    Toggle between light and dark theme
  </span>
</label>
```

## 8. Smooth Theme Transition System

### Animation Architecture

```css
/* Global transition coordinator */
.theme-transition {
  transition: 
    background-color var(--transition-duration) var(--transition-easing),
    border-color var(--transition-duration) var(--transition-easing),
    color var(--transition-duration) var(--transition-easing),
    fill var(--transition-duration) var(--transition-easing),
    stroke var(--transition-duration) var(--transition-easing),
    box-shadow var(--transition-duration) var(--transition-easing);
}

/* Apply to all themed elements */
*:not(.theme-toggle__slider) {
  transition-property: var(--transition-property);
  transition-duration: var(--transition-duration);
  transition-timing-function: var(--transition-easing);
}

/* Staggered animations for visual hierarchy */
.card { transition-delay: 0ms; }
.button { transition-delay: 50ms; }
.text { transition-delay: 100ms; }
```

## 9. Mobile-Friendly Implementation

### Touch-Optimized Toggle

```css
.theme-toggle {
  min-width: 44px; /* iOS/Android minimum touch target */
  min-height: 44px;
  padding: 0.5rem;
}

/* Mobile-specific optimizations */
@media (max-width: 768px) {
  .theme-toggle {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
  }
}

/* Hover states only on non-touch devices */
@media (hover: hover) and (pointer: fine) {
  .theme-toggle:hover .theme-toggle__slider {
    transform: scale(1.1);
  }
}
```

## 10. Architecture Decision Records (ADRs)

### ADR-001: CSS Custom Properties Over Sass Variables
**Decision**: Use CSS custom properties for theme variables
**Rationale**: Runtime theme switching, better browser support, smaller bundle size
**Consequences**: Requires PostCSS fallbacks for IE11 support

### ADR-002: :has() Selector with Checkbox Fallback
**Decision**: Progressive enhancement from checkbox hack to :has() selector
**Rationale**: Future-proof while maintaining backward compatibility
**Consequences**: Dual maintenance burden during transition period

### ADR-003: Minimal JavaScript Enhancement
**Decision**: Use minimal JS only for localStorage persistence
**Rationale**: Maintains "CSS-only" philosophy while adding essential UX
**Consequences**: Graceful degradation without JS

## Implementation Phases

### Phase 1: Core Architecture (Week 1)
- CSS custom properties system
- Basic toggle mechanism
- Theme variable definitions

### Phase 2: Enhanced Features (Week 2)
- Smooth transitions
- Accessibility improvements
- Mobile optimizations

### Phase 3: Advanced Optimizations (Week 3)
- Performance enhancements
- Browser compatibility testing
- Documentation completion

## Success Metrics

- **Performance**: First Paint < 1.6s, Theme Switch < 250ms
- **Accessibility**: WCAG 2.1 AA compliance, screen reader tested
- **Compatibility**: 95%+ browser support (based on usage analytics)
- **Bundle Size**: < 3KB gzipped for complete system
- **Developer Experience**: < 5 minutes to implement in existing project

## Risk Mitigation

- **Browser Support**: Progressive enhancement strategy
- **Performance**: Lazy loading non-critical theme CSS
- **Accessibility**: Automated testing in CI/CD
- **Maintenance**: Comprehensive documentation and examples