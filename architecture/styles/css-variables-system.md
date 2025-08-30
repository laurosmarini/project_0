# CSS Custom Properties Organization

## Naming Convention Strategy

### Namespace Pattern: `--pricing-{category}-{property}-{modifier}`

```css
/* Color System */
--pricing-color-primary: #2563eb;
--pricing-color-primary-hover: #1d4ed8;
--pricing-color-primary-active: #1e40af;

--pricing-color-secondary: #64748b;
--pricing-color-accent: #f59e0b;
--pricing-color-success: #10b981;
--pricing-color-warning: #f59e0b;
--pricing-color-danger: #ef4444;

/* Surface Colors */
--pricing-surface-background: #ffffff;
--pricing-surface-card: #ffffff;
--pricing-surface-featured: #f8fafc;
--pricing-surface-hover: #f1f5f9;

/* Text Colors */
--pricing-text-primary: #0f172a;
--pricing-text-secondary: #64748b;
--pricing-text-muted: #94a3b8;
--pricing-text-inverse: #ffffff;

/* Border Colors */
--pricing-border-default: #e2e8f0;
--pricing-border-hover: #cbd5e1;
--pricing-border-featured: #3b82f6;
```

## Typography System

```css
/* Font Families */
--pricing-font-primary: 'Inter', -apple-system, system-ui, sans-serif;
--pricing-font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;

/* Font Weights */
--pricing-weight-light: 300;
--pricing-weight-normal: 400;
--pricing-weight-medium: 500;
--pricing-weight-semibold: 600;
--pricing-weight-bold: 700;

/* Font Sizes (Fluid Typography) */
--pricing-text-xs: clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem);
--pricing-text-sm: clamp(0.875rem, 0.8rem + 0.3vw, 1rem);
--pricing-text-base: clamp(1rem, 0.9rem + 0.4vw, 1.125rem);
--pricing-text-lg: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
--pricing-text-xl: clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem);
--pricing-text-2xl: clamp(1.5rem, 1.3rem + 0.8vw, 2rem);
--pricing-text-3xl: clamp(1.875rem, 1.6rem + 1vw, 2.5rem);

/* Line Heights */
--pricing-leading-tight: 1.25;
--pricing-leading-normal: 1.5;
--pricing-leading-relaxed: 1.75;
```

## Spacing System (8px Grid)

```css
/* Base Spacing Unit */
--pricing-space-unit: 0.5rem; /* 8px */

/* Spacing Scale */
--pricing-space-0: 0;
--pricing-space-1: calc(var(--pricing-space-unit) * 0.5); /* 4px */
--pricing-space-2: var(--pricing-space-unit); /* 8px */
--pricing-space-3: calc(var(--pricing-space-unit) * 1.5); /* 12px */
--pricing-space-4: calc(var(--pricing-space-unit) * 2); /* 16px */
--pricing-space-5: calc(var(--pricing-space-unit) * 2.5); /* 20px */
--pricing-space-6: calc(var(--pricing-space-unit) * 3); /* 24px */
--pricing-space-8: calc(var(--pricing-space-unit) * 4); /* 32px */
--pricing-space-10: calc(var(--pricing-space-unit) * 5); /* 40px */
--pricing-space-12: calc(var(--pricing-space-unit) * 6); /* 48px */
--pricing-space-16: calc(var(--pricing-space-unit) * 8); /* 64px */
--pricing-space-20: calc(var(--pricing-space-unit) * 10); /* 80px */

/* Component-Specific Spacing */
--pricing-tier-padding: var(--pricing-space-6);
--pricing-tier-gap: var(--pricing-space-4);
--pricing-feature-spacing: var(--pricing-space-3);
```

## Layout Properties

```css
/* Container Widths */
--pricing-container-sm: 640px;
--pricing-container-md: 768px;
--pricing-container-lg: 1024px;
--pricing-container-xl: 1280px;

/* Grid System */
--pricing-grid-columns: 3;
--pricing-grid-gap: var(--pricing-space-6);
--pricing-tier-min-width: 280px;
--pricing-tier-max-width: 320px;

/* Border Radius */
--pricing-radius-sm: 0.25rem;
--pricing-radius-md: 0.5rem;
--pricing-radius-lg: 0.75rem;
--pricing-radius-xl: 1rem;

/* Shadows */
--pricing-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--pricing-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--pricing-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--pricing-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

/* Featured Tier Enhancements */
--pricing-featured-scale: 1.05;
--pricing-featured-shadow: var(--pricing-shadow-xl);
--pricing-featured-border-width: 2px;
```

## Animation & Transitions

```css
/* Timing Functions */
--pricing-ease-in: cubic-bezier(0.4, 0, 1, 1);
--pricing-ease-out: cubic-bezier(0, 0, 0.2, 1);
--pricing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Duration */
--pricing-duration-fast: 150ms;
--pricing-duration-normal: 250ms;
--pricing-duration-slow: 350ms;

/* Transitions */
--pricing-transition-colors: color var(--pricing-duration-fast) var(--pricing-ease-in-out),
                            background-color var(--pricing-duration-fast) var(--pricing-ease-in-out),
                            border-color var(--pricing-duration-fast) var(--pricing-ease-in-out);

--pricing-transition-transform: transform var(--pricing-duration-normal) var(--pricing-ease-out);
--pricing-transition-shadow: box-shadow var(--pricing-duration-normal) var(--pricing-ease-out);

/* Mobile Collapse Animations */
--pricing-collapse-duration: var(--pricing-duration-normal);
--pricing-slide-duration: var(--pricing-duration-fast);
```

## Theme System

### Light Theme (Default)
```css
:root {
  /* Light theme variables */
  --pricing-theme: 'light';
  
  /* Override base colors for light theme */
  --pricing-surface-background: #ffffff;
  --pricing-surface-card: #ffffff;
  --pricing-text-primary: #0f172a;
  --pricing-border-default: #e2e8f0;
}
```

### Dark Theme
```css
[data-theme="dark"] {
  --pricing-theme: 'dark';
  
  /* Dark theme overrides */
  --pricing-surface-background: #0f172a;
  --pricing-surface-card: #1e293b;
  --pricing-surface-featured: #334155;
  
  --pricing-text-primary: #f8fafc;
  --pricing-text-secondary: #cbd5e1;
  --pricing-text-muted: #94a3b8;
  
  --pricing-border-default: #334155;
  --pricing-border-hover: #475569;
  
  --pricing-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --pricing-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --pricing-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4);
}
```

## Responsive Variables

```css
/* Mobile-specific overrides */
@media (max-width: 767px) {
  :root {
    --pricing-grid-columns: 1;
    --pricing-tier-padding: var(--pricing-space-4);
    --pricing-tier-gap: var(--pricing-space-3);
    --pricing-container-padding: var(--pricing-space-4);
  }
}

/* Tablet-specific overrides */
@media (min-width: 768px) and (max-width: 1023px) {
  :root {
    --pricing-grid-columns: 2;
    --pricing-tier-max-width: 350px;
  }
}

/* Desktop enhancements */
@media (min-width: 1024px) {
  :root {
    --pricing-grid-columns: 3;
    --pricing-tier-padding: var(--pricing-space-8);
    --pricing-hover-lift: -4px;
  }
}
```

## Usage Patterns

### Component-Level Variables
```css
.pricing-tier {
  /* Local variables for this component */
  --tier-background: var(--pricing-surface-card);
  --tier-border: var(--pricing-border-default);
  --tier-shadow: var(--pricing-shadow-md);
  
  background-color: var(--tier-background);
  border: 1px solid var(--tier-border);
  box-shadow: var(--tier-shadow);
}

.pricing-tier[data-featured="true"] {
  /* Override local variables for featured state */
  --tier-background: var(--pricing-surface-featured);
  --tier-border: var(--pricing-border-featured);
  --tier-shadow: var(--pricing-featured-shadow);
  
  transform: scale(var(--pricing-featured-scale));
}
```

### Runtime Theme Switching
```css
.pricing-table {
  /* Smooth theme transitions */
  transition: var(--pricing-transition-colors);
}

.pricing-tier {
  transition: var(--pricing-transition-colors),
              var(--pricing-transition-shadow);
}
```

## Maintenance Guidelines

1. **Consistency**: Always use variables instead of hardcoded values
2. **Semantic Naming**: Names should describe purpose, not appearance
3. **Cascading**: Override variables at appropriate levels
4. **Documentation**: Comment complex calculations and relationships
5. **Testing**: Verify variable changes across all themes and breakpoints