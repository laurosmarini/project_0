# CSS File Organization Structure

## Directory Architecture

```
src/
├── styles/
│   ├── base/
│   │   ├── _reset.css              # Browser normalization
│   │   ├── _variables.css          # CSS custom properties
│   │   ├── _typography.css         # Font and text styles
│   │   └── _accessibility.css      # A11y utilities
│   ├── components/
│   │   ├── carousel/
│   │   │   ├── _carousel-base.css      # Core structure
│   │   │   ├── _carousel-state.css     # Radio input states
│   │   │   ├── _carousel-navigation.css # Dot indicators
│   │   │   ├── _carousel-controls.css  # Prev/next buttons
│   │   │   ├── _carousel-slides.css    # Slide styling
│   │   │   ├── _carousel-animations.css # Transitions
│   │   │   ├── _carousel-themes.css    # Color variants
│   │   │   └── _carousel-responsive.css # Breakpoints
│   │   └── _components.css         # Component imports
│   ├── utilities/
│   │   ├── _screen-reader.css      # SR-only classes
│   │   ├── _focus-management.css   # Focus indicators
│   │   └── _motion-preferences.css # Reduced motion
│   └── main.css                    # Main entry point
```

## Import Strategy

### main.css - Entry Point
```css
/* Base Layer - Foundational styles */
@import './base/_variables.css';
@import './base/_reset.css';
@import './base/_typography.css';
@import './base/_accessibility.css';

/* Component Layer - Feature-specific styles */
@import './components/_components.css';

/* Utility Layer - Helper classes */
@import './utilities/_screen-reader.css';
@import './utilities/_focus-management.css';
@import './utilities/_motion-preferences.css';
```

### components/_components.css
```css
/* Carousel component imports */
@import './carousel/_carousel-base.css';
@import './carousel/_carousel-state.css';
@import './carousel/_carousel-navigation.css';
@import './carousel/_carousel-controls.css';
@import './carousel/_carousel-slides.css';
@import './carousel/_carousel-animations.css';
@import './carousel/_carousel-themes.css';
@import './carousel/_carousel-responsive.css';
```

## File Content Organization

### _variables.css - Design System
```css
:root {
  /* Carousel Dimensions */
  --carousel-aspect-ratio: 16 / 9;
  --carousel-min-height: 200px;
  --carousel-max-height: 600px;
  --carousel-border-radius: 0.5rem;
  
  /* Animation System */
  --carousel-duration-fast: 0.15s;
  --carousel-duration-medium: 0.3s;
  --carousel-duration-slow: 0.5s;
  --carousel-easing: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Color Palette */
  --carousel-neutral-100: #f8f9fa;
  --carousel-neutral-500: #6c757d;
  --carousel-neutral-900: #212529;
  --carousel-primary-500: #007bff;
  --carousel-primary-600: #0056b3;
  
  /* Spacing Scale */
  --carousel-space-xs: 0.25rem;
  --carousel-space-sm: 0.5rem;
  --carousel-space-md: 1rem;
  --carousel-space-lg: 1.5rem;
  --carousel-space-xl: 2rem;
  
  /* Typography */
  --carousel-font-size-sm: 0.875rem;
  --carousel-font-size-base: 1rem;
  --carousel-font-size-lg: 1.125rem;
  --carousel-line-height: 1.5;
  
  /* Z-Index Scale */
  --z-carousel-base: 1;
  --z-carousel-controls: 2;
  --z-carousel-navigation: 3;
  --z-carousel-overlay: 4;
}
```

### _carousel-base.css - Core Structure
```css
.carousel {
  /* Container setup */
  position: relative;
  width: 100%;
  aspect-ratio: var(--carousel-aspect-ratio);
  min-height: var(--carousel-min-height);
  max-height: var(--carousel-max-height);
  
  /* Performance optimizations */
  contain: layout style paint;
  overflow: hidden;
  border-radius: var(--carousel-border-radius);
  background-color: var(--carousel-neutral-100);
}

.carousel__container {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel__track {
  display: flex;
  width: calc(100% * var(--slide-count, 3));
  height: 100%;
  transition: transform var(--carousel-duration-medium) var(--carousel-easing);
  will-change: transform;
}

/* Hidden radio inputs for state */
.carousel__control {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  clip: rect(0, 0, 0, 0);
}
```

### _carousel-state.css - State Management
```css
/* Dynamic slide positioning based on checked state */
.carousel__control:nth-of-type(1):checked ~ .carousel__container .carousel__track {
  transform: translateX(0%);
}

.carousel__control:nth-of-type(2):checked ~ .carousel__container .carousel__track {
  transform: translateX(calc(-100% / var(--slide-count, 3)));
}

.carousel__control:nth-of-type(3):checked ~ .carousel__container .carousel__track {
  transform: translateX(calc(-200% / var(--slide-count, 3)));
}

/* Navigation active states */
.carousel__control:nth-of-type(1):checked ~ .carousel__navigation .carousel__nav-item:nth-child(1),
.carousel__control:nth-of-type(2):checked ~ .carousel__navigation .carousel__nav-item:nth-child(2),
.carousel__control:nth-of-type(3):checked ~ .carousel__navigation .carousel__nav-item:nth-child(3) {
  background-color: var(--carousel-primary-500);
  transform: scale(1.2);
}
```

## Build Configuration

### CSS Processing Pipeline
```json
{
  "css": {
    "postcss": {
      "plugins": [
        "postcss-import",
        "postcss-custom-properties",
        "postcss-nesting",
        "autoprefixer",
        "cssnano"
      ]
    }
  }
}
```

### Critical CSS Strategy
```css
/* Above-the-fold critical styles */
.carousel,
.carousel__container,
.carousel__track,
.carousel__slide {
  /* Critical layout properties only */
}

/* Non-critical styles loaded asynchronously */
@import './carousel/_carousel-animations.css' (min-width: 0);
@import './carousel/_carousel-themes.css' (min-width: 0);
```

## Naming Convention

### BEM Methodology
```css
/* Block */
.carousel { }

/* Elements */
.carousel__container { }
.carousel__track { }
.carousel__slide { }
.carousel__navigation { }
.carousel__nav-item { }
.carousel__controls { }
.carousel__control { }

/* Modifiers */
.carousel--theme-dark { }
.carousel--size-large { }
.carousel__slide--active { }
.carousel__control--prev { }
.carousel__control--next { }

/* States */
.carousel.is-transitioning { }
.carousel__slide.is-current { }
```

### CSS Custom Property Naming
```css
/* Pattern: --component-property-variant-state */
--carousel-bg-primary-default
--carousel-border-radius-large
--carousel-transition-duration-slow
--carousel-nav-size-small-hover
```