# Neobrutalist CSS System

A comprehensive neobrutalist design system featuring brutal shadows, neon accents, monospace typography, and dramatic interactions. Built for modern web experiences that demand attention and refuse to blend in.

## ✨ Features

### 🎯 Core Design Principles
- **Brutal Aesthetics**: Thick borders, harsh shadows, high contrast
- **Monospace Typography**: Complete hierarchy with JetBrains Mono and Space Grotesk
- **Neon Accents**: Cyberpunk-inspired glow effects and color palette
- **Mobile-First**: Responsive design that scales beautifully
- **Dark Theme**: Complete dark mode with neon highlights
- **Accessibility**: WCAG compliant with reduced motion support

### 🚀 Components
- **Buttons**: 12+ variants including neon, brutal, gradient, and glitch effects
- **Forms**: Complete form system with custom controls and validation states
- **Cards**: Multiple card layouts with badges, overlays, and special effects
- **Typography**: Comprehensive type scale with special effects
- **Layout**: Flexbox and CSS Grid utilities with responsive breakpoints
- **Animations**: 25+ animation classes with dramatic hover effects

### 🎨 Design Tokens
- **Colors**: High-contrast palette with neon accents
- **Spacing**: Consistent 8px base unit system
- **Shadows**: Brutal box shadows in multiple sizes
- **Typography**: Monospace and display font stacks
- **Borders**: 2px, 4px, 6px, and 8px brutal borders
- **Animations**: Smooth transitions with cubic-bezier easing

## 🛠 Installation

### Via CDN (Recommended)
```html
<!-- Import Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Import Neobrutalist CSS -->
<link rel="stylesheet" href="path/to/css/neobrutalist.css">
```

### Local Installation
1. Download the CSS files from this repository
2. Include the main stylesheet in your HTML:
```html
<link rel="stylesheet" href="css/neobrutalist.css">
```

### Modular Installation
Import individual components as needed:
```css
@import url('./base/variables.css');
@import url('./base/reset.css');
@import url('./components/buttons.css');
@import url('./utilities/spacing.css');
```

## 🎯 Quick Start

### Basic HTML Structure
```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Brutal App</title>
    <link rel="stylesheet" href="css/neobrutalist.css">
</head>
<body>
    <div class="neo-container">
        <h1 class="neo-h1 neo-text-brutal">HELLO WORLD</h1>
        <button class="neo-btn neo-btn-primary neo-btn-lg">
            GET STARTED
        </button>
    </div>
</body>
</html>
```

### Theme Switching
```javascript
// Toggle between light and dark themes
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('neo-theme', newTheme);
}
```

## 🎨 Component Examples

### Buttons
```html
<!-- Primary Button -->
<button class="neo-btn neo-btn-primary">Primary Action</button>

<!-- Neon Effect Button -->
<button class="neo-btn neo-btn-neon">Neon Glow</button>

<!-- Brutal Large Button -->
<button class="neo-btn neo-btn-brutal neo-btn-xl">BRUTAL IMPACT</button>

<!-- Animated Button -->
<button class="neo-btn neo-btn-primary neo-hover-animate-shake">
    Shake on Hover
</button>
```

### Cards
```html
<div class="neo-card neo-card-brutal">
    <div class="neo-card-badge neo-card-badge-neon">NEW</div>
    <div class="neo-card-header">
        <h3 class="neo-card-title">Card Title</h3>
        <p class="neo-card-subtitle">Card subtitle</p>
    </div>
    <div class="neo-card-body">
        <p>Card content with brutal styling and dramatic shadows.</p>
    </div>
    <div class="neo-card-footer">
        <button class="neo-btn neo-btn-primary neo-btn-sm">Action</button>
    </div>
</div>
```

### Forms
```html
<form class="neo-form">
    <div class="neo-form-group">
        <label class="neo-label neo-label-required" for="email">Email</label>
        <input type="email" id="email" class="neo-input" placeholder="your@email.com">
        <div class="neo-help-text">Enter your email address</div>
    </div>
    
    <div class="neo-form-group">
        <label class="neo-checkbox">
            <input type="checkbox">
            <span class="neo-checkbox-mark"></span>
            I agree to the terms
        </label>
    </div>
    
    <button type="submit" class="neo-btn neo-btn-primary neo-btn-lg">
        SUBMIT
    </button>
</form>
```

### Typography
```html
<h1 class="neo-h1 neo-text-brutal">BRUTAL HEADING</h1>
<h2 class="neo-h2 neo-text-neon">Neon Subheading</h2>
<p class="neo-text-glitch" data-text="GLITCH">GLITCH EFFECT</p>
<code class="neo-code">inline.code()</code>
```

## 🛠 Utility Classes

### Layout
```html
<!-- Flexbox -->
<div class="neo-flex neo-justify-center neo-items-center neo-gap-4">
    <div>Item 1</div>
    <div>Item 2</div>
</div>

<!-- Grid -->
<div class="neo-grid neo-grid-cols-3 neo-gap-6">
    <div>Grid Item</div>
    <div>Grid Item</div>
    <div>Grid Item</div>
</div>

<!-- Container -->
<div class="neo-container">
    <div class="neo-section">Content</div>
</div>
```

### Spacing
```html
<!-- Padding -->
<div class="neo-p-4">Padding all sides</div>
<div class="neo-px-6 neo-py-3">Padding x and y axis</div>

<!-- Margin -->
<div class="neo-m-4">Margin all sides</div>
<div class="neo-mx-auto">Centered horizontally</div>
```

### Effects
```html
<!-- Shadows -->
<div class="neo-shadow-brutal-lg">Large brutal shadow</div>
<div class="neo-shadow-neon-cyan">Neon cyan glow</div>

<!-- Borders -->
<div class="neo-border-4 neo-border-neon-magenta">Thick neon border</div>

<!-- Animations -->
<div class="neo-animate-pulse">Pulsing element</div>
<div class="neo-hover-animate-bounce">Bounce on hover</div>
```

## 🎨 Color System

### Primary Palette
```css
--neo-black: #0a0a0a
--neo-white: #fafafa
--neo-gray-400: #a3a3a3
--neo-gray-600: #525252
--neo-gray-800: #262626
```

### Neon Accents
```css
--neo-neon-cyan: #00ffff
--neo-neon-magenta: #ff00ff
--neo-neon-yellow: #ffff00
--neo-neon-green: #00ff00
```

### Status Colors
```css
--neo-success: #22c55e
--neo-warning: #eab308
--neo-error: #ef4444
--neo-info: #3b82f6
```

## 📐 Spacing System

Based on 8px increments for consistent spacing:

```css
--neo-space-1: 0.25rem    /* 4px */
--neo-space-2: 0.5rem     /* 8px */
--neo-space-3: 0.75rem    /* 12px */
--neo-space-4: 1rem       /* 16px */
--neo-space-6: 1.5rem     /* 24px */
--neo-space-8: 2rem       /* 32px */
--neo-space-12: 3rem      /* 48px */
--neo-space-16: 4rem      /* 64px */
```

## 🎭 Animation System

### Available Animations
- `neo-animate-spin` - Continuous rotation
- `neo-animate-pulse` - Opacity pulsing
- `neo-animate-bounce` - Bouncing motion
- `neo-animate-shake` - Horizontal shake
- `neo-animate-glitch` - Glitch effect
- `neo-animate-neon-pulse` - Neon glow pulsing

### Hover Effects
- `neo-hover-animate-shake` - Shake on hover
- `neo-hover-animate-bounce` - Bounce on hover  
- `neo-hover-animate-pulse` - Pulse on hover
- `neo-hover-animate-glow` - Glow on hover

### Entrance Animations
- `neo-animate-fade-in` - Fade in entrance
- `neo-animate-slide-up` - Slide up entrance
- `neo-animate-zoom-in` - Zoom in entrance

## 🌙 Dark Theme

The system includes a complete dark theme that can be toggled:

```html
<!-- Light theme (default) -->
<html data-theme="light">

<!-- Dark theme -->
<html data-theme="dark">
```

### JavaScript Theme Toggle
```javascript
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('neo-theme', newTheme);
}

// Load saved theme preference
const savedTheme = localStorage.getItem('neo-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
```

## 📱 Responsive Design

Mobile-first approach with breakpoints:

```css
/* Mobile first (default) */
.neo-grid-cols-1 { /* Mobile layout */ }

/* Tablet and up */
@media (min-width: 768px) {
    .neo-md-grid-cols-2 { /* Tablet layout */ }
}

/* Desktop and up */
@media (min-width: 1024px) {
    .neo-lg-grid-cols-3 { /* Desktop layout */ }
}
```

### Responsive Utilities
```html
<!-- Hide on mobile, show on desktop -->
<div class="neo-hidden neo-lg-block">Desktop only</div>

<!-- Stack on mobile, flex on tablet+ -->
<div class="neo-flex-col neo-md-flex-row">Responsive flex</div>

<!-- Different grid layouts per breakpoint -->
<div class="neo-grid neo-grid-cols-1 neo-md-grid-cols-2 neo-lg-grid-cols-3">
    <!-- Grid items -->
</div>
```

## ♿ Accessibility

### Built-in Accessibility Features
- High contrast ratios (WCAG AA compliant)
- Focus visible states with neon outlines
- Reduced motion support for vestibular disorders
- Proper ARIA labels and semantic markup
- Keyboard navigation support

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

## 🔧 Customization

### CSS Custom Properties
Override default values by redefining CSS custom properties:

```css
:root {
    /* Override neon colors */
    --neo-neon-cyan: #00d4ff;
    --neo-neon-magenta: #ff0080;
    
    /* Adjust spacing */
    --neo-space-base: 1.2rem;
    
    /* Modify shadows */
    --neo-shadow-brutal-base: 8px 8px 0px var(--neo-black);
}
```

### Theme Extension
Create custom themes by extending the base variables:

```css
[data-theme="custom"] {
    --neo-bg-primary: #1a1a2e;
    --neo-bg-secondary: #16213e;
    --neo-text-primary: #eee;
    --neo-neon-cyan: #0f3460;
}
```

## 🚀 Performance

- **Minimal CSS**: ~50KB minified
- **No JavaScript dependencies**
- **Tree-shakable**: Import only what you need
- **Modern CSS**: Uses native CSS Grid and Flexbox
- **Optimized animations**: Hardware-accelerated transforms

## 📦 File Structure

```
css/
├── base/
│   ├── variables.css      # CSS custom properties
│   ├── reset.css         # Modern CSS reset
│   ├── typography.css    # Typography system
│   └── animations.css    # Animation keyframes
├── components/
│   ├── buttons.css       # Button components
│   ├── forms.css         # Form components
│   └── cards.css         # Card components
├── utilities/
│   ├── layout.css        # Layout utilities
│   ├── spacing.css       # Spacing utilities
│   └── effects.css       # Visual effects
└── neobrutalist.css      # Main compiled stylesheet
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across different browsers
5. Submit a pull request

### Development Setup
```bash
git clone https://github.com/your-username/neobrutalist-css
cd neobrutalist-css
# Open examples/index.html in your browser
```

## 📄 License

MIT License - feel free to use in personal and commercial projects.

## 🎉 Credits

- **Typography**: JetBrains Mono, Space Grotesk
- **Inspiration**: Brutalist architecture, cyberpunk aesthetics
- **Design Philosophy**: Maximum impact, minimal compromise

---

Made with ⚡ and 🖤 by developers who believe design should make a statement.