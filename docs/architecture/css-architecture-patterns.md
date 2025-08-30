# CSS Architecture Patterns for Image Carousel

## CSS Architecture Philosophy

### Design System Approach
The carousel CSS architecture follows a systematic approach based on:
- **Atomic Design Principles**: Building from atoms (properties) to organisms (full carousel)
- **ITCSS (Inverted Triangle CSS)**: Organized from generic to specific
- **Component-Driven Architecture**: Self-contained, reusable components

## File Structure

```
src/styles/
├── 01-settings/
│   ├── _variables.scss
│   └── _custom-properties.scss
├── 02-tools/
│   ├── _mixins.scss
│   └── _functions.scss
├── 03-generic/
│   ├── _reset.scss
│   └── _normalize.scss
├── 04-elements/
│   ├── _images.scss
│   └── _buttons.scss
├── 05-objects/
│   ├── _container.scss
│   └── _grid.scss
├── 06-components/
│   ├── _carousel.scss
│   ├── _carousel-viewport.scss
│   ├── _carousel-navigation.scss
│   └── _carousel-indicators.scss
├── 07-utilities/
│   ├── _spacing.scss
│   ├── _visibility.scss
│   └── _accessibility.scss
└── main.scss
```

## Custom Properties Strategy

### Hierarchical Property System
```scss
// Global carousel properties
:root {
  // Layout dimensions
  --carousel-width: 100%;
  --carousel-aspect-ratio: 16 / 9;
  --carousel-gap: 1rem;
  --carousel-border-radius: 0.5rem;
  
  // Responsive slides
  --carousel-slides-mobile: 1;
  --carousel-slides-tablet: 2;
  --carousel-slides-desktop: 3;
  --carousel-slides-wide: 4;
  
  // Animation timing
  --carousel-transition-duration: 300ms;
  --carousel-transition-easing: cubic-bezier(0.4, 0.0, 0.2, 1);
  --carousel-animation-delay: 0ms;
  
  // Colors and theming
  --carousel-bg: hsl(0, 0%, 100%);
  --carousel-border: hsl(0, 0%, 90%);
  --carousel-shadow: 0 2px 8px hsla(0, 0%, 0%, 0.1);
  
  // Navigation colors
  --carousel-nav-bg: hsla(0, 0%, 0%, 0.7);
  --carousel-nav-color: hsl(0, 0%, 100%);
  --carousel-nav-hover: hsla(0, 0%, 0%, 0.9);
  
  // Focus and accessibility
  --carousel-focus-outline: 2px solid hsl(211, 100%, 50%);
  --carousel-focus-offset: 2px;
  
  // Indicator styling
  --carousel-indicator-size: 0.75rem;
  --carousel-indicator-gap: 0.5rem;
  --carousel-indicator-inactive: hsla(0, 0%, 100%, 0.5);
  --carousel-indicator-active: hsl(0, 0%, 100%);
}

// Component-specific property overrides
.carousel {
  // Allow component-level customization
  --_carousel-current-slide: 0;
  --_carousel-total-slides: 1;
  --_carousel-slide-width: calc(100% / var(--carousel-slides-visible, 1));
}
```

### Responsive Property Management
```scss
// Media query mixins for property updates
@mixin carousel-responsive-properties {
  // Mobile (default)
  --carousel-slides-visible: var(--carousel-slides-mobile);
  --carousel-height: 250px;
  --carousel-nav-size: 2.5rem;
  
  @media (min-width: 768px) {
    // Tablet
    --carousel-slides-visible: var(--carousel-slides-tablet);
    --carousel-height: 300px;
    --carousel-nav-size: 3rem;
  }
  
  @media (min-width: 1024px) {
    // Desktop
    --carousel-slides-visible: var(--carousel-slides-desktop);
    --carousel-height: 400px;
    --carousel-nav-size: 3.5rem;
  }
  
  @media (min-width: 1440px) {
    // Wide desktop
    --carousel-slides-visible: var(--carousel-slides-wide);
    --carousel-height: 450px;
    --carousel-nav-size: 4rem;
  }
}
```

## Component Architecture Patterns

### Base Carousel Component
```scss
.carousel {
  @include carousel-responsive-properties;
  
  // Container setup
  position: relative;
  width: var(--carousel-width);
  height: var(--carousel-height);
  background: var(--carousel-bg);
  border-radius: var(--carousel-border-radius);
  box-shadow: var(--carousel-shadow);
  
  // CSS containment for performance
  contain: layout style paint;
  
  // Accessibility
  scroll-behavior: smooth;
  
  // Custom property calculations
  --_carousel-slide-width: calc(100% / var(--carousel-slides-visible));
  --_carousel-track-width: calc(100% * var(--_carousel-total-slides));
}
```

### Viewport Pattern
```scss
.carousel__viewport {
  // Clipping container
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
  
  // Touch scrolling optimization
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}
```

### Track and Slide Pattern
```scss
.carousel__track {
  // Flexbox track for slide positioning
  display: flex;
  width: var(--_carousel-track-width);
  height: 100%;
  transition: transform var(--carousel-transition-duration) var(--carousel-transition-easing);
  
  // Hardware acceleration
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

.carousel__slide {
  // Individual slide container
  flex: 0 0 var(--_carousel-slide-width);
  height: 100%;
  padding: 0 calc(var(--carousel-gap) / 2);
  display: flex;
  align-items: center;
  justify-content: center;
  
  // Image optimization
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    border-radius: calc(var(--carousel-border-radius) * 0.5);
  }
}
```

## State Management Patterns

### Radio Button State System
```scss
// Hidden radio inputs for state management
.carousel__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  
  // Screen reader accessibility
  clip: rect(1px, 1px, 1px, 1px);
  height: 1px;
  width: 1px;
  overflow: hidden;
}

// State-based track positioning
@for $i from 1 through 10 {
  .carousel__input:nth-of-type(#{$i}):checked ~ .carousel__track {
    transform: translateX(calc(-100% * (#{$i} - 1) / var(--carousel-slides-visible)));
  }
}
```

### Indicator State Styling
```scss
.carousel__indicator {
  position: relative;
  width: var(--carousel-indicator-size);
  height: var(--carousel-indicator-size);
  border-radius: 50%;
  background: var(--carousel-indicator-inactive);
  border: none;
  cursor: pointer;
  transition: all var(--carousel-transition-duration) var(--carousel-transition-easing);
  
  // Focus styling
  &:focus {
    outline: var(--carousel-focus-outline);
    outline-offset: var(--carousel-focus-offset);
  }
  
  // Active state via corresponding radio button
  .carousel__input:checked + & {
    background: var(--carousel-indicator-active);
    transform: scale(1.2);
  }
}
```

## Animation Patterns

### Transition System
```scss
// Smooth slide transitions
.carousel__track {
  transition: 
    transform var(--carousel-transition-duration) var(--carousel-transition-easing),
    opacity 200ms ease-out;
}

// Staggered indicator animations
.carousel__indicators {
  .carousel__indicator {
    transition-delay: calc(var(--carousel-animation-delay) * var(--_indicator-index, 0));
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .carousel * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

### Loading and Lazy Loading Patterns
```scss
.carousel__slide {
  // Loading state
  &[data-loading="true"] {
    background: linear-gradient(90deg, 
      var(--carousel-bg) 0%, 
      hsla(0, 0%, 95%, 1) 50%, 
      var(--carousel-bg) 100%);
    background-size: 200% 100%;
    animation: carousel-loading 1.5s infinite;
  }
  
  // Lazy loading intersection observer support
  img[data-lazy] {
    opacity: 0;
    transition: opacity 300ms ease-in-out;
    
    &.loaded {
      opacity: 1;
    }
  }
}

@keyframes carousel-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## Accessibility Patterns

### Focus Management
```scss
.carousel {
  // Focus trap for modal carousels
  &[data-modal="true"] {
    &:focus-within {
      outline: var(--carousel-focus-outline);
      outline-offset: var(--carousel-focus-offset);
    }
  }
}

// Skip links for carousel navigation
.carousel__skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--carousel-bg);
  color: var(--carousel-nav-color);
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
  
  &:focus {
    top: 6px;
  }
}
```

### Screen Reader Patterns
```scss
.carousel__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Live region styling
.carousel__live-region {
  @extend .carousel__sr-only;
  
  // Ensure announcements are made
  &[aria-live="polite"],
  &[aria-live="assertive"] {
    position: absolute;
  }
}
```

## Performance Patterns

### Critical CSS Extraction
```scss
// Above-the-fold carousel styles
.carousel-critical {
  // Essential layout properties only
  position: relative;
  width: 100%;
  overflow: hidden;
  
  .carousel__track {
    display: flex;
    transform: translate3d(0, 0, 0);
  }
  
  .carousel__slide {
    flex-shrink: 0;
  }
}
```

### Container Queries (Future Enhancement)
```scss
// Modern container query support
@container carousel (min-width: 768px) {
  .carousel {
    --carousel-slides-visible: 2;
  }
}

@container carousel (min-width: 1024px) {
  .carousel {
    --carousel-slides-visible: 3;
  }
}
```

## Theming Patterns

### CSS Custom Property Theming
```scss
// Light theme (default)
.carousel {
  color-scheme: light;
}

// Dark theme
.carousel[data-theme="dark"] {
  --carousel-bg: hsl(220, 13%, 18%);
  --carousel-border: hsl(220, 13%, 28%);
  --carousel-nav-bg: hsla(0, 0%, 100%, 0.1);
  --carousel-nav-color: hsl(0, 0%, 90%);
  
  color-scheme: dark;
}

// High contrast theme
.carousel[data-theme="high-contrast"] {
  --carousel-bg: hsl(0, 0%, 0%);
  --carousel-border: hsl(0, 0%, 100%);
  --carousel-nav-bg: hsl(0, 0%, 100%);
  --carousel-nav-color: hsl(0, 0%, 0%);
  --carousel-focus-outline: 3px solid hsl(60, 100%, 50%);
}
```

This comprehensive CSS architecture provides a maintainable, scalable, and performant foundation for the image carousel component.