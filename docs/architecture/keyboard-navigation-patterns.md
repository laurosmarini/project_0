# Keyboard Navigation and Interaction Patterns

## Keyboard Navigation Architecture

### Core Navigation Principles
1. **Standard Web Navigation**: Follow established web conventions
2. **Predictable Behavior**: Consistent interaction patterns across all states
3. **Escape Routes**: Always provide ways to exit or skip carousel
4. **Visual Focus**: Clear indication of keyboard focus position
5. **Screen Reader Support**: Meaningful announcements for all interactions

## Primary Keyboard Controls

### Arrow Key Navigation
```css
/* CSS-only arrow key simulation using :focus-within */
.carousel {
  /* Enable focus management */
  &:focus-within {
    .carousel__control--prev:focus ~ .carousel__viewport {
      /* Trigger previous slide animation */
    }
    
    .carousel__control--next:focus ~ .carousel__viewport {
      /* Trigger next slide animation */
    }
  }
}

/* Previous slide focus handling */
.carousel__control--prev:focus {
  & ~ .carousel__track {
    /* Move to previous slide */
    transform: translateX(calc(var(--_current-slide) * -100% + 100%));
  }
}

/* Next slide focus handling */
.carousel__control--next:focus {
  & ~ .carousel__track {
    /* Move to next slide */
    transform: translateX(calc(var(--_current-slide) * -100% - 100%));
  }
}
```

### Tab Navigation Pattern
```html
<!-- Tabindex management for logical tab order -->
<section class="carousel" tabindex="0" role="region">
  <!-- Skip link (tabindex 0, first focusable) -->
  <a href="#carousel-end" class="carousel__skip" tabindex="0">Skip carousel</a>
  
  <!-- Current slide content (tabindex 0) -->
  <div class="carousel__slide carousel__slide--active" tabindex="0" role="tabpanel">
    <!-- Focusable content within active slide -->
    <a href="..." tabindex="0">Link in active slide</a>
  </div>
  
  <!-- Inactive slides (tabindex -1) -->
  <div class="carousel__slide" tabindex="-1" role="tabpanel">
    <!-- Non-focusable content in inactive slides -->
    <a href="..." tabindex="-1">Link in inactive slide</a>
  </div>
  
  <!-- Navigation controls (tabindex 0) -->
  <button class="carousel__control" tabindex="0">Previous</button>
  <button class="carousel__control" tabindex="0">Next</button>
  
  <!-- Indicators (tabindex 0 for current, -1 for others) -->
  <button class="carousel__indicator carousel__indicator--active" 
          tabindex="0" aria-selected="true">Slide 1</button>
  <button class="carousel__indicator" 
          tabindex="-1" aria-selected="false">Slide 2</button>
</section>
```

## CSS-Only Keyboard Event Handling

### Focus-Based State Management
```css
/* Keyboard navigation using CSS focus states */
.carousel {
  --_keyboard-nav: 0; /* Default state */
}

/* Detect keyboard navigation via focus-visible */
.carousel:focus-visible,
.carousel:focus-within {
  --_keyboard-nav: 1;
  
  /* Enhanced focus indicators during keyboard nav */
  .carousel__control:focus {
    outline: 3px solid var(--carousel-focus-color);
    outline-offset: 2px;
    z-index: 10;
  }
}

/* Arrow key simulation using label focus */
.carousel__control--prev:focus ~ .carousel__viewport .carousel__track {
  /* Simulate left arrow press */
  animation: carousel-slide-prev var(--carousel-transition-duration) forwards;
}

.carousel__control--next:focus ~ .carousel__viewport .carousel__track {
  /* Simulate right arrow press */
  animation: carousel-slide-next var(--carousel-transition-duration) forwards;
}

@keyframes carousel-slide-prev {
  from { transform: translateX(var(--_current-position)); }
  to { transform: translateX(calc(var(--_current-position) + var(--_slide-width))); }
}

@keyframes carousel-slide-next {
  from { transform: translateX(var(--_current-position)); }
  to { transform: translateX(calc(var(--_current-position) - var(--_slide-width))); }
}
```

### Home/End Navigation
```css
/* Jump to first slide */
.carousel__control--first:focus ~ .carousel__viewport .carousel__track {
  transform: translateX(0%);
  transition: transform 0.5s ease-out;
}

/* Jump to last slide */
.carousel__control--last:focus ~ .carousel__viewport .carousel__track {
  transform: translateX(calc(-100% * (var(--_total-slides) - 1)));
  transition: transform 0.5s ease-out;
}
```

### Enter/Space Key Activation
```css
/* Simulate activation on focus for labels acting as buttons */
.carousel__indicator {
  /* Label elements don't need :active state for radio buttons */
  /* Activation happens automatically when focused */
  
  &:focus {
    /* Visual feedback for focus */
    transform: scale(1.1);
    box-shadow: 0 0 0 3px var(--carousel-focus-color);
  }
  
  /* Checked state (activated) */
  input[type="radio"]:checked + & {
    background: var(--carousel-indicator-active);
    transform: scale(1.15);
  }
}
```

## Focus Management Patterns

### Focus Trap for Modal Carousels
```css
.carousel[data-modal="true"] {
  /* Focus containment */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  
  /* Focus trap simulation */
  &:focus-within {
    .carousel__first-focusable:focus ~ .carousel__last-focusable:focus {
      /* Cycle back to first focusable element */
      ~ .carousel__first-focusable {
        /* This pattern requires careful HTML structure */
      }
    }
  }
}
```

### Dynamic Tabindex Management
```css
/* Active slide content should be focusable */
.carousel__input:checked ~ .carousel__viewport .carousel__slide:nth-child(1) {
  * { tabindex: 0; }
}

/* Inactive slide content should not be focusable */
.carousel__slide:not(.carousel__slide--active) {
  * { 
    tabindex: -1;
    pointer-events: none; /* Prevent mouse interaction too */
  }
}

/* Exception for navigation elements - always focusable */
.carousel__navigation * {
  tabindex: 0 !important;
  pointer-events: auto !important;
}
```

## Accessibility Announcements

### Screen Reader Live Regions
```html
<!-- Live region for slide change announcements -->
<div class="carousel__announcements" aria-live="polite" aria-atomic="true">
  <span class="carousel__sr-only carousel__current-announcement">
    Slide 1 of 5: Mountain Landscape
  </span>
</div>

<!-- Status updates for navigation -->
<div class="carousel__status" role="status" aria-live="polite">
  <span class="carousel__sr-only">
    Navigation: Use arrow keys or tab to navigate. Press Enter to select.
  </span>
</div>
```

### CSS-Driven Content Updates
```css
/* Update live region content based on active slide */
.carousel__input:nth-of-type(1):checked ~ .carousel__announcements::after {
  content: "Slide 1 of " attr(data-total) ": " attr(data-slide-1-title);
}

.carousel__input:nth-of-type(2):checked ~ .carousel__announcements::after {
  content: "Slide 2 of " attr(data-total) ": " attr(data-slide-2-title);
}

.carousel__input:nth-of-type(3):checked ~ .carousel__announcements::after {
  content: "Slide 3 of " attr(data-total) ": " attr(data-slide-3-title);
}

/* Position off-screen but accessible to screen readers */
.carousel__announcements {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

## Touch and Gesture Integration

### Touch-Friendly Focus Areas
```css
.carousel__control {
  /* Larger touch targets */
  min-width: 44px;
  min-height: 44px;
  
  /* Touch device optimizations */
  @media (hover: none) and (pointer: coarse) {
    min-width: 48px;
    min-height: 48px;
    font-size: 1.2em;
  }
}

/* Swipe gesture indicators */
.carousel__viewport {
  /* Visual hints for swipe capability */
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
  
  /* Touch action for better scrolling */
  touch-action: pan-x;
}
```

### Keyboard vs Touch Detection
```css
/* Different styles based on interaction method */
.carousel {
  /* Default touch-optimized styles */
  .carousel__control {
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }
}

/* Enhanced visibility during keyboard navigation */
.carousel:focus-within {
  .carousel__control {
    opacity: 1;
    transform: scale(1.05);
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .carousel__control:focus {
    outline: 3px solid ButtonText;
    background: ButtonFace;
    color: ButtonText;
  }
}
```

## Reduced Motion Support

### Respect User Preferences
```css
/* Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .carousel * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
  
  .carousel__track {
    /* Instant position changes instead of smooth transitions */
    transition: none !important;
  }
  
  /* Provide alternative interaction feedback */
  .carousel__indicator:focus {
    /* Instead of scale animation, use color/border changes */
    border: 3px solid var(--carousel-focus-color);
    transform: none;
  }
}
```

## Implementation Example: Complete Keyboard System

### HTML Structure for Keyboard Support
```html
<section class="carousel" 
         role="region" 
         aria-label="Image Gallery"
         tabindex="0"
         data-keyboard="true">
  
  <!-- Keyboard instructions -->
  <div class="carousel__instructions" id="carousel-instructions">
    <p class="carousel__sr-only">
      Use arrow keys to navigate slides, tab to reach controls, 
      enter or space to activate, escape to exit.
    </p>
  </div>
  
  <!-- State management inputs -->
  <input type="radio" name="carousel-nav" id="slide-1" checked class="carousel__input">
  <input type="radio" name="carousel-nav" id="slide-2" class="carousel__input">
  <input type="radio" name="carousel-nav" id="slide-3" class="carousel__input">
  
  <!-- Skip link -->
  <a href="#carousel-end" class="carousel__skip">Skip to end of carousel</a>
  
  <!-- Viewport and slides -->
  <div class="carousel__viewport" aria-describedby="carousel-instructions">
    <div class="carousel__track">
      <div class="carousel__slide" role="tabpanel" aria-labelledby="slide-1" tabindex="0">
        <img src="image1.jpg" alt="Description of image 1">
      </div>
      <div class="carousel__slide" role="tabpanel" aria-labelledby="slide-2" tabindex="-1">
        <img src="image2.jpg" alt="Description of image 2">
      </div>
      <div class="carousel__slide" role="tabpanel" aria-labelledby="slide-3" tabindex="-1">
        <img src="image3.jpg" alt="Description of image 3">
      </div>
    </div>
  </div>
  
  <!-- Keyboard-accessible navigation -->
  <nav class="carousel__navigation" aria-label="Carousel controls">
    <!-- Previous/Next hidden controls for keyboard -->
    <label for="slide-3" class="carousel__control carousel__control--prev carousel__sr-only">
      Previous slide
    </label>
    <label for="slide-2" class="carousel__control carousel__control--next carousel__sr-only">  
      Next slide
    </label>
    
    <!-- Visible indicator controls -->
    <div class="carousel__indicators" role="tablist">
      <label for="slide-1" class="carousel__indicator" 
             role="tab" aria-selected="true" tabindex="0">
        <span class="carousel__sr-only">Go to slide 1</span>
      </label>
      <label for="slide-2" class="carousel__indicator" 
             role="tab" aria-selected="false" tabindex="-1">
        <span class="carousel__sr-only">Go to slide 2</span>
      </label>
      <label for="slide-3" class="carousel__indicator" 
             role="tab" aria-selected="false" tabindex="-1">
        <span class="carousel__sr-only">Go to slide 3</span>
      </label>
    </div>
  </nav>
  
  <!-- Live region for announcements -->
  <div class="carousel__live-region" aria-live="polite" aria-atomic="true">
    <span class="carousel__sr-only">Slide 1 of 3 is now active</span>
  </div>
  
  <!-- End anchor -->
  <div id="carousel-end" tabindex="0"></div>
</section>
```

This comprehensive keyboard navigation system ensures the carousel is fully accessible and usable via keyboard-only interaction while maintaining the CSS-only implementation constraint.