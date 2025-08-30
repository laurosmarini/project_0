# Component Structure & HTML Semantics

## HTML Architecture Pattern

### Base Structure
```html
<section class="pricing-table" role="region" aria-labelledby="pricing-heading">
  <header class="pricing-table__header">
    <h2 id="pricing-heading" class="pricing-table__title">Choose Your Plan</h2>
    <p class="pricing-table__subtitle">Find the perfect plan for your needs</p>
  </header>

  <!-- Desktop: Side-by-side comparison -->
  <div class="pricing-tiers" data-layout="grid">
    <article class="pricing-tier" data-tier="basic">
      <header class="pricing-tier__header">
        <h3 class="pricing-tier__name">Basic</h3>
        <div class="pricing-tier__price">
          <span class="price__currency">$</span>
          <span class="price__amount">9</span>
          <span class="price__period">/month</span>
        </div>
      </header>
      
      <div class="pricing-tier__content">
        <ul class="pricing-tier__features" role="list">
          <li class="feature-item" data-available="true">
            <span class="feature-icon" aria-hidden="true">✓</span>
            <span class="feature-text">Up to 10 users</span>
          </li>
          <li class="feature-item" data-available="false">
            <span class="feature-icon" aria-hidden="true">✗</span>
            <span class="feature-text">Advanced analytics</span>
          </li>
        </ul>
      </div>
      
      <footer class="pricing-tier__footer">
        <button class="pricing-tier__cta btn btn--primary" data-tier="basic">
          Start Free Trial
        </button>
      </footer>
    </article>
    
    <!-- Additional tiers... -->
  </div>

  <!-- Mobile: Tabbed/Accordion Interface -->
  <div class="pricing-mobile" data-layout="mobile" hidden>
    <nav class="pricing-tabs" role="tablist" aria-label="Pricing plans">
      <button class="pricing-tab" role="tab" data-tier="basic" aria-selected="true">
        Basic
      </button>
      <button class="pricing-tab" role="tab" data-tier="pro">
        Pro
      </button>
    </nav>
    
    <div class="pricing-panels">
      <div class="pricing-panel" role="tabpanel" data-tier="basic">
        <!-- Tier content -->
      </div>
    </div>
  </div>

  <!-- Feature Comparison Table (Desktop) -->
  <div class="pricing-comparison" data-layout="desktop">
    <table class="comparison-table" role="table">
      <caption class="comparison-caption">Feature Comparison</caption>
      <thead>
        <tr>
          <th scope="col" class="comparison-feature">Features</th>
          <th scope="col" class="comparison-tier">Basic</th>
          <th scope="col" class="comparison-tier comparison-tier--featured">Pro</th>
          <th scope="col" class="comparison-tier">Enterprise</th>
        </tr>
      </thead>
      <tbody>
        <tr class="comparison-row">
          <th scope="row" class="feature-name">Users</th>
          <td class="feature-value">Up to 10</td>
          <td class="feature-value">Up to 100</td>
          <td class="feature-value">Unlimited</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>
```

## Semantic Principles

### 1. Accessibility First
- **Landmark Roles**: `region`, `tablist`, `tabpanel`
- **Heading Hierarchy**: Proper h1-h6 structure
- **Screen Reader Support**: `aria-label`, `aria-labelledby`, `aria-describedby`
- **Focus Management**: Visible focus indicators, logical tab order
- **Alternative Text**: Meaningful descriptions for icons

### 2. Progressive Enhancement
- **Base Layer**: Semantic HTML works without CSS/JS
- **Enhancement Layer**: CSS provides visual layout
- **Interaction Layer**: JavaScript adds dynamic behavior

### 3. Data Attributes Strategy
```html
<!-- Layout control -->
data-layout="grid|mobile|desktop"
data-orientation="horizontal|vertical"

<!-- State management -->
data-tier="basic|pro|enterprise"
data-featured="true|false"
data-available="true|false"
data-selected="true|false"

<!-- Behavior control -->
data-collapsible="true|false"
data-animated="true|false"
data-theme="light|dark"
```

## Component Interfaces

### PricingTable Props
```typescript
interface PricingTableProps {
  plans: PricingPlan[]
  featured?: string
  layout?: 'auto' | 'grid' | 'mobile'
  theme?: 'light' | 'dark'
  currency?: string
  showComparison?: boolean
}
```

### PricingTier Props
```typescript
interface PricingTierProps {
  name: string
  price: number | string
  period: string
  features: Feature[]
  featured?: boolean
  ctaText: string
  ctaAction: () => void
}
```

### Feature Definition
```typescript
interface Feature {
  name: string
  description?: string
  available: boolean
  highlight?: boolean
  tooltip?: string
}
```

## Layout Patterns

### Grid Layout (Desktop)
- 3-column equal width grid
- Featured tier gets visual emphasis
- Consistent height alignment
- Hover effects and animations

### Stacked Layout (Mobile)
- Vertical card stack
- Swipeable carousel option
- Accordion-style feature lists
- Sticky CTA buttons

### Tabbed Layout (Mobile Alternative)
- Horizontal tab navigation
- Content panels below
- Touch-friendly tab controls
- Smooth transitions

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Indicators**: Visible and consistent
- **Text Scaling**: Support up to 200% zoom
- **Keyboard Navigation**: Complete keyboard access
- **Screen Reader**: Proper semantic structure

### Keyboard Interaction Patterns
- **Tab Order**: Logical progression through content
- **Arrow Keys**: Navigate between tabs/tiers
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals or return to main view

### Screen Reader Optimization
- **Live Regions**: Announce dynamic changes
- **Descriptive Labels**: Clear purpose for all controls
- **Table Headers**: Proper association with data
- **Status Updates**: Inform about loading/success states