# CSS-Only Responsive Image Carousel

A fully accessible, responsive image carousel implemented using only CSS. No JavaScript required for core functionality.

## Features

- **Pure CSS Implementation** - Works without JavaScript
- **Responsive Design** - Mobile-first approach with breakpoints
- **Full Accessibility** - WCAG 2.1 AA compliant
- **Keyboard Navigation** - Complete keyboard support
- **Cross-browser Compatible** - Works in all modern browsers
- **Multiple Variations** - 6 different carousel styles included

## Quick Start

```html
<link rel="stylesheet" href="image-carousel.css">

<section class="carousel" role="region" aria-labelledby="carousel-heading">
  <header class="carousel__header">
    <h2 id="carousel-heading" class="carousel__title">My Gallery</h2>
  </header>
  
  <div class="carousel__container">
    <div class="carousel__track">
      <article class="carousel__slide" id="slide-1" tabindex="0">
        <img src="image1.jpg" alt="Description" class="carousel__image">
        <div class="carousel__caption">
          <h3 class="carousel__slide-title">Image Title</h3>
          <p class="carousel__slide-description">Image description</p>
        </div>
      </article>
      <!-- More slides... -->
    </div>
    
    <nav class="carousel__navigation" role="tablist">
      <a href="#slide-1" class="carousel__indicator" role="tab" 
         aria-label="Go to slide 1">
        <span class="carousel__indicator-label">1</span>
      </a>
      <!-- More indicators... -->
    </nav>
  </div>
</section>
```

## Files Structure

```
src/components/carousel/
├── image-carousel.html      # Main implementation example
├── image-carousel.css       # Core carousel styles
├── carousel-variations.css  # Additional carousel variations
├── carousel-demo.html      # Complete demo with all variations
└── README.md              # This documentation
```

## Carousel Variations

### 1. Standard Carousel
Full-featured carousel with captions, arrows, and dot indicators.
```html
<section class="carousel">
```

### 2. Minimal Carousel
Clean design without captions.
```html
<section class="carousel carousel--minimal">
```

### 3. Thumbnail Navigation
Visual thumbnail indicators instead of dots.
```html
<section class="carousel carousel--thumbnail">
```

### 4. Auto-playing Carousel
Automatically cycles through slides using CSS animations.
```html
<section class="carousel carousel--autoplay">
```

### 5. Hero Carousel
Full-width carousel perfect for hero sections.
```html
<section class="carousel carousel--hero">
```

### 6. Vertical Carousel
Slides arranged vertically instead of horizontally.
```html
<section class="carousel carousel--vertical">
```

## Accessibility Features

### WCAG 2.1 AA Compliance
- ✅ Color contrast ratios meet 4.5:1 minimum
- ✅ All functionality available via keyboard
- ✅ Proper focus management and visible indicators
- ✅ Screen reader compatible with ARIA roles
- ✅ Supports high contrast and reduced motion preferences

### Keyboard Navigation
- **Tab** - Move between interactive elements
- **Enter/Space** - Activate focused elements
- **Arrow keys** - Navigate between slides (via browser anchor behavior)

### Screen Reader Support
- Proper semantic structure with landmarks
- ARIA roles: `region`, `tablist`, `tab`, `tabpanel`, `img`
- Descriptive labels and live region announcements
- Image alt text and caption associations

## Browser Support

### Modern Browsers (Full Support)
- Chrome 69+
- Firefox 68+ 
- Safari 14+
- Edge 79+

### Mobile Browsers
- iOS Safari 14+
- Chrome Android 69+
- Samsung Internet 10+

### CSS Features Used
- CSS Scroll Snap (with fallbacks)
- CSS Custom Properties
- CSS Grid and Flexbox
- CSS `:target` pseudo-class
- CSS Transforms and Transitions

## Customization

### CSS Custom Properties
```css
:root {
  --carousel-primary: #2563eb;
  --carousel-space-4: 1rem;
  --carousel-border-radius: 0.5rem;
  --carousel-transition-normal: 300ms ease-in-out;
  /* ... more variables */
}
```

### Responsive Breakpoints
```css
/* Mobile: 320px - 767px */
/* Tablet: 768px - 1023px */  
/* Desktop: 1024px+ */
/* Large Desktop: 1440px+ */
```

### Utility Classes
```css
.carousel--no-shadows    /* Remove all shadows */
.carousel--rounded-none  /* Remove border radius */
.carousel--compact      /* Tighter spacing */
.carousel--spacious     /* More generous spacing */
```

## Implementation Notes

### CSS-Only Navigation
The carousel uses CSS `:target` pseudo-class for navigation:
```css
#slide-1:target ~ .carousel__track { 
  transform: translateX(0%); 
}
#slide-2:target ~ .carousel__track { 
  transform: translateX(-100%); 
}
```

### Scroll-Snap Enhancement
Modern browsers get smooth scrolling with scroll-snap:
```css
.carousel__track {
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
}

.carousel__slide {
  scroll-snap-align: center;
  scroll-snap-stop: always;
}
```

### Performance Considerations
- Uses CSS transforms for hardware acceleration
- Lazy loading images with `loading="lazy"`
- Minimal layout shifts during responsive changes
- Efficient CSS selectors to minimize reflows

## Troubleshooting

### Common Issues

**Slides not transitioning smoothly:**
- Ensure all slides have the same parent container
- Check that `:target` selectors match slide IDs
- Verify CSS custom properties are supported

**Keyboard navigation not working:**
- Check that indicators have proper `href` attributes
- Ensure `role="tab"` and `tabindex` attributes are set
- Verify focus styles are visible

**Accessibility warnings:**
- Add proper `aria-label` attributes to all interactive elements
- Ensure image `alt` text is descriptive
- Check heading hierarchy is logical

### Browser-Specific Issues

**Safari:**
- Add `-webkit-backdrop-filter` for blur effects
- Test scroll-snap behavior across different Safari versions

**Firefox:**
- Use `scrollbar-width: none` to hide scrollbars
- Test `:focus-visible` pseudo-class support

## Performance Optimization

### Image Optimization
- Use appropriate image sizes for different breakpoints
- Implement responsive images with `srcset` attribute
- Add `loading="lazy"` to images below the fold

### CSS Optimization  
- Use CSS custom properties for consistent theming
- Minimize reflows by using transform/opacity animations
- Enable hardware acceleration with `will-change` when needed

## Contributing

When adding new variations or features:

1. Follow the existing BEM naming convention
2. Ensure full keyboard accessibility
3. Test across multiple browsers and devices
4. Add proper ARIA labels and roles
5. Update documentation and examples

## License

This carousel implementation is open source and available under the MIT License.