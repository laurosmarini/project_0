# Responsive Breakpoint Strategy & Mobile Collapse

## Breakpoint Philosophy

### Mobile-First Progressive Enhancement
- **Base**: Mobile (320px+) - Core functionality
- **Enhancement 1**: Tablet (768px+) - Improved layout
- **Enhancement 2**: Desktop (1024px+) - Full feature set
- **Enhancement 3**: Large (1440px+) - Optimized spacing

## Breakpoint System

```css
/* Breakpoint Variables */
:root {
  --bp-mobile: 320px;
  --bp-mobile-lg: 480px;
  --bp-tablet: 768px;
  --bp-desktop: 1024px;
  --bp-desktop-lg: 1440px;
  --bp-desktop-xl: 1920px;
}

/* Media Query Mixins (for consistency) */
@media (min-width: 480px)  { /* Mobile Large */ }
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Desktop Large */ }
```

## Layout Transformation Strategy

### Mobile (320px - 767px): Stacked Cards
```css
.pricing-table {
  /* Mobile: Single column stack */
  --pricing-layout: 'mobile';
  
  display: block;
  padding: var(--pricing-space-4);
}

.pricing-tiers {
  display: flex;
  flex-direction: column;
  gap: var(--pricing-space-4);
}

.pricing-tier {
  width: 100%;
  max-width: none;
  
  /* Mobile-specific styling */
  border-radius: var(--pricing-radius-md);
  padding: var(--pricing-space-4);
}

/* Hide desktop comparison table */
.pricing-comparison {
  display: none;
}

/* Show mobile-optimized interface */
.pricing-mobile {
  display: block;
}
```

### Tablet (768px - 1023px): Two-Column Grid
```css
@media (min-width: 768px) {
  .pricing-tiers {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--pricing-space-6);
    max-width: 640px;
    margin: 0 auto;
  }
  
  .pricing-tier:nth-child(3) {
    grid-column: 1 / -1; /* Enterprise spans full width */
    max-width: 320px;
    justify-self: center;
  }
  
  /* Start showing simplified comparison */
  .pricing-comparison {
    display: block;
  }
  
  .pricing-mobile {
    display: none;
  }
}
```

### Desktop (1024px+): Three-Column Layout
```css
@media (min-width: 1024px) {
  .pricing-table {
    --pricing-layout: 'desktop';
    max-width: var(--pricing-container-lg);
    margin: 0 auto;
    padding: var(--pricing-space-8);
  }
  
  .pricing-tiers {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--pricing-space-6);
    align-items: start; /* Prevent equal height stretching */
  }
  
  .pricing-tier {
    /* Desktop enhancements */
    transition: var(--pricing-transition-transform),
                var(--pricing-transition-shadow);
  }
  
  .pricing-tier:hover {
    transform: translateY(-4px);
    box-shadow: var(--pricing-shadow-xl);
  }
  
  /* Full comparison table */
  .pricing-comparison {
    display: block;
    margin-top: var(--pricing-space-12);
  }
}
```

## Mobile Collapse Patterns

### Pattern 1: Accordion (Recommended for Features)
```html
<div class="pricing-features" data-collapse="accordion">
  <button class="features-toggle" aria-expanded="false" aria-controls="features-content">
    <span>View Features</span>
    <svg class="toggle-icon" aria-hidden="true"><!-- chevron --></svg>
  </button>
  
  <div class="features-content" id="features-content" hidden>
    <ul class="feature-list">
      <!-- features -->
    </ul>
  </div>
</div>
```

```css
.features-toggle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--pricing-space-3);
  
  background: transparent;
  border: 1px solid var(--pricing-border-default);
  border-radius: var(--pricing-radius-md);
  
  cursor: pointer;
  transition: var(--pricing-transition-colors);
}

.features-toggle:hover {
  background-color: var(--pricing-surface-hover);
}

.toggle-icon {
  transition: transform var(--pricing-duration-fast);
}

.features-toggle[aria-expanded="true"] .toggle-icon {
  transform: rotate(180deg);
}

.features-content {
  overflow: hidden;
  transition: height var(--pricing-collapse-duration) var(--pricing-ease-out);
}

.features-content[hidden] {
  height: 0;
}

.features-content:not([hidden]) {
  height: auto;
}
```

### Pattern 2: Tabs (Alternative for Plan Selection)
```html
<div class="pricing-mobile-tabs" role="tablist" aria-label="Pricing plans">
  <div class="tab-controls">
    <button class="tab-control" role="tab" data-tier="basic" aria-selected="true">
      Basic
    </button>
    <button class="tab-control" role="tab" data-tier="pro">
      Pro
    </button>
    <button class="tab-control" role="tab" data-tier="enterprise">
      Enterprise
    </button>
  </div>
  
  <div class="tab-panels">
    <div class="tab-panel" role="tabpanel" data-tier="basic">
      <!-- Basic plan content -->
    </div>
    <!-- Other panels... -->
  </div>
</div>
```

```css
.tab-controls {
  display: flex;
  border-bottom: 1px solid var(--pricing-border-default);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tab-controls::-webkit-scrollbar {
  display: none;
}

.tab-control {
  flex: 1;
  min-width: 80px;
  padding: var(--pricing-space-3) var(--pricing-space-4);
  
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  
  color: var(--pricing-text-secondary);
  font-weight: var(--pricing-weight-medium);
  
  cursor: pointer;
  transition: var(--pricing-transition-colors);
}

.tab-control[aria-selected="true"] {
  color: var(--pricing-color-primary);
  border-bottom-color: var(--pricing-color-primary);
}

.tab-panel {
  padding: var(--pricing-space-6) var(--pricing-space-4);
  animation: slideIn var(--pricing-slide-duration) var(--pricing-ease-out);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Pattern 3: Carousel/Swiper (Advanced)
```html
<div class="pricing-carousel" data-touch-enabled="true">
  <div class="carousel-track" data-slide="0">
    <div class="carousel-slide" data-tier="basic">
      <!-- Plan content -->
    </div>
    <!-- Other slides... -->
  </div>
  
  <div class="carousel-indicators">
    <button class="indicator" data-slide="0" aria-label="Basic plan"></button>
    <button class="indicator" data-slide="1" aria-label="Pro plan"></button>
    <button class="indicator" data-slide="2" aria-label="Enterprise plan"></button>
  </div>
</div>
```

## Container Query Support (Future Enhancement)

```css
/* When container queries are widely supported */
.pricing-table {
  container-type: inline-size;
  container-name: pricing;
}

@container pricing (min-width: 768px) {
  .pricing-tiers {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@container pricing (min-width: 1024px) {
  .pricing-tiers {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Responsive Images & Icons

```css
/* Scalable icons */
.pricing-icon {
  width: clamp(1rem, 2vw, 1.5rem);
  height: clamp(1rem, 2vw, 1.5rem);
}

/* Responsive logo sizing */
.pricing-logo {
  max-width: 100px;
  height: auto;
}

@media (min-width: 768px) {
  .pricing-logo {
    max-width: 120px;
  }
}
```

## Touch & Interaction Considerations

### Touch Targets (44px minimum)
```css
.pricing-cta,
.features-toggle,
.tab-control {
  min-height: 44px;
  min-width: 44px;
  padding: var(--pricing-space-3) var(--pricing-space-4);
}
```

### Hover States (Desktop Only)
```css
@media (hover: hover) and (pointer: fine) {
  .pricing-tier:hover {
    transform: translateY(-4px);
    box-shadow: var(--pricing-shadow-xl);
  }
  
  .pricing-cta:hover {
    background-color: var(--pricing-color-primary-hover);
  }
}
```

### Focus States (Always Visible)
```css
.pricing-cta:focus,
.features-toggle:focus,
.tab-control:focus {
  outline: 2px solid var(--pricing-color-primary);
  outline-offset: 2px;
}
```

## Performance Considerations

### Lazy Loading & Intersection Observer
```css
/* Fade-in animation for components coming into view */
.pricing-tier {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity var(--pricing-duration-slow) var(--pricing-ease-out),
              transform var(--pricing-duration-slow) var(--pricing-ease-out);
}

.pricing-tier.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  .pricing-tier,
  .features-content,
  .tab-panel {
    transition: none;
    animation: none;
  }
  
  .pricing-tier:hover {
    transform: none;
  }
}
```