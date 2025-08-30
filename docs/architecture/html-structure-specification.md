# HTML Structure Specification for CSS-Only Image Carousel

## Semantic HTML Foundation

### Core HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Image Carousel</title>
  <link rel="stylesheet" href="carousel.css">
</head>
<body>
  <!-- Main carousel component -->
  <section class="carousel" role="region" aria-label="Featured Images" data-slides="5">
    <!-- Hidden radio inputs for state management -->
    <input class="carousel__input" type="radio" name="carousel-navigation" id="slide-1" checked aria-describedby="slide-1-desc">
    <input class="carousel__input" type="radio" name="carousel-navigation" id="slide-2" aria-describedby="slide-2-desc">
    <input class="carousel__input" type="radio" name="carousel-navigation" id="slide-3" aria-describedby="slide-3-desc">
    <input class="carousel__input" type="radio" name="carousel-navigation" id="slide-4" aria-describedby="slide-4-desc">
    <input class="carousel__input" type="radio" name="carousel-navigation" id="slide-5" aria-describedby="slide-5-desc">
    
    <!-- Skip link for accessibility -->
    <a href="#carousel-end" class="carousel__skip-link">Skip carousel</a>
    
    <!-- Carousel viewport and content -->
    <div class="carousel__viewport" aria-live="polite" aria-atomic="false">
      <div class="carousel__track">
        <!-- Slide 1 -->
        <div class="carousel__slide" role="tabpanel" aria-labelledby="slide-1" tabindex="0">
          <figure class="carousel__figure">
            <img 
              src="images/image-1-800w.jpg" 
              srcset="images/image-1-400w.jpg 400w,
                      images/image-1-800w.jpg 800w,
                      images/image-1-1200w.jpg 1200w"
              sizes="(max-width: 767px) 100vw,
                     (max-width: 1023px) 50vw,
                     (max-width: 1439px) 33.333vw,
                     25vw"
              alt="Beautiful mountain landscape with snow-capped peaks"
              loading="eager"
              decoding="async"
              class="carousel__image">
            <figcaption class="carousel__caption" id="slide-1-desc">
              Mountain Landscape - A breathtaking view of snow-capped mountain peaks during golden hour
            </figcaption>
          </figure>
        </div>
        
        <!-- Slide 2 -->
        <div class="carousel__slide" role="tabpanel" aria-labelledby="slide-2" tabindex="-1">
          <figure class="carousel__figure">
            <img 
              src="images/image-2-800w.jpg" 
              srcset="images/image-2-400w.jpg 400w,
                      images/image-2-800w.jpg 800w,
                      images/image-2-1200w.jpg 1200w"
              sizes="(max-width: 767px) 100vw,
                     (max-width: 1023px) 50vw,
                     (max-width: 1439px) 33.333vw,
                     25vw"
              alt="Serene ocean sunset with vibrant orange and pink colors"
              loading="lazy"
              decoding="async"
              class="carousel__image">
            <figcaption class="carousel__caption" id="slide-2-desc">
              Ocean Sunset - A peaceful evening view of the ocean with spectacular sunset colors
            </figcaption>
          </figure>
        </div>
        
        <!-- Slide 3 -->
        <div class="carousel__slide" role="tabpanel" aria-labelledby="slide-3" tabindex="-1">
          <figure class="carousel__figure">
            <img 
              src="images/image-3-800w.jpg" 
              srcset="images/image-3-400w.jpg 400w,
                      images/image-3-800w.jpg 800w,
                      images/image-3-1200w.jpg 1200w"
              sizes="(max-width: 767px) 100vw,
                     (max-width: 1023px) 50vw,
                     (max-width: 1439px) 33.333vw,
                     25vw"
              alt="Dense forest with tall trees and filtered sunlight"
              loading="lazy"
              decoding="async"
              class="carousel__image">
            <figcaption class="carousel__caption" id="slide-3-desc">
              Forest Path - A mystical forest scene with sunlight filtering through tall trees
            </figcaption>
          </figure>
        </div>
        
        <!-- Slide 4 -->
        <div class="carousel__slide" role="tabpanel" aria-labelledby="slide-4" tabindex="-1">
          <figure class="carousel__figure">
            <img 
              src="images/image-4-800w.jpg" 
              srcset="images/image-4-400w.jpg 400w,
                      images/image-4-800w.jpg 800w,
                      images/image-4-1200w.jpg 1200w"
              sizes="(max-width: 767px) 100vw,
                     (max-width: 1023px) 50vw,
                     (max-width: 1439px) 33.333vw,
                     25vw"
              alt="Urban cityscape at night with illuminated skyscrapers"
              loading="lazy"
              decoding="async"
              class="carousel__image">
            <figcaption class="carousel__caption" id="slide-4-desc">
              City Lights - A vibrant nighttime view of the city skyline with glowing buildings
            </figcaption>
          </figure>
        </div>
        
        <!-- Slide 5 -->
        <div class="carousel__slide" role="tabpanel" aria-labelledby="slide-5" tabindex="-1">
          <figure class="carousel__figure">
            <img 
              src="images/image-5-800w.jpg" 
              srcset="images/image-5-400w.jpg 400w,
                      images/image-5-800w.jpg 800w,
                      images/image-5-1200w.jpg 1200w"
              sizes="(max-width: 767px) 100vw,
                     (max-width: 1023px) 50vw,
                     (max-width: 1439px) 33.333vw,
                     25vw"
              alt="Colorful flower field with blooming wildflowers"
              loading="lazy"
              decoding="async"
              class="carousel__image">
            <figcaption class="carousel__caption" id="slide-5-desc">
              Flower Field - A vibrant meadow filled with colorful wildflowers in full bloom
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
    
    <!-- Navigation controls -->
    <nav class="carousel__navigation" aria-label="Carousel navigation">
      <div class="carousel__controls">
        <!-- Previous button -->
        <label for="slide-5" class="carousel__control carousel__control--prev" 
               aria-label="Previous slide" role="button" tabindex="0"
               data-carousel-prev>
          <span class="carousel__control-icon" aria-hidden="true">❮</span>
          <span class="carousel__sr-only">Previous image</span>
        </label>
        
        <!-- Next button -->
        <label for="slide-2" class="carousel__control carousel__control--next" 
               aria-label="Next slide" role="button" tabindex="0"
               data-carousel-next>
          <span class="carousel__control-icon" aria-hidden="true">❯</span>
          <span class="carousel__sr-only">Next image</span>
        </label>
      </div>
      
      <!-- Slide indicators -->
      <div class="carousel__indicators" role="tablist" aria-label="Select slide">
        <label for="slide-1" class="carousel__indicator" 
               role="tab" aria-selected="true" aria-controls="slide-1"
               aria-label="Go to slide 1" tabindex="0">
          <span class="carousel__sr-only">Slide 1: Mountain Landscape</span>
        </label>
        
        <label for="slide-2" class="carousel__indicator" 
               role="tab" aria-selected="false" aria-controls="slide-2"
               aria-label="Go to slide 2" tabindex="-1">
          <span class="carousel__sr-only">Slide 2: Ocean Sunset</span>
        </label>
        
        <label for="slide-3" class="carousel__indicator" 
               role="tab" aria-selected="false" aria-controls="slide-3"
               aria-label="Go to slide 3" tabindex="-1">
          <span class="carousel__sr-only">Slide 3: Forest Path</span>
        </label>
        
        <label for="slide-4" class="carousel__indicator" 
               role="tab" aria-selected="false" aria-controls="slide-4"
               aria-label="Go to slide 4" tabindex="-1">
          <span class="carousel__sr-only">Slide 4: City Lights</span>
        </label>
        
        <label for="slide-5" class="carousel__indicator" 
               role="tab" aria-selected="false" aria-controls="slide-5"
               aria-label="Go to slide 5" tabindex="-1">
          <span class="carousel__sr-only">Slide 5: Flower Field</span>
        </label>
      </div>
    </nav>
    
    <!-- Carousel metadata -->
    <div class="carousel__metadata" aria-live="polite">
      <div class="carousel__counter" role="status">
        <span class="carousel__current">1</span> of <span class="carousel__total">5</span>
      </div>
      
      <!-- Live region for screen reader announcements -->
      <div class="carousel__live-region carousel__sr-only" aria-live="polite" aria-atomic="true">
        Slide 1 of 5: Mountain Landscape
      </div>
    </div>
    
    <!-- End anchor for skip link -->
    <div id="carousel-end"></div>
  </section>
</body>
</html>
```

## HTML Structure Patterns

### State Management HTML Pattern
```html
<!-- Radio button pattern for CSS-only state management -->
<div class="carousel" data-carousel-id="gallery-1">
  <!-- State inputs (hidden) -->
  <input type="radio" name="gallery-1-nav" id="gallery-1-slide-1" class="carousel__input" checked>
  <input type="radio" name="gallery-1-nav" id="gallery-1-slide-2" class="carousel__input">
  <input type="radio" name="gallery-1-nav" id="gallery-1-slide-3" class="carousel__input">
  
  <!-- Content that responds to state changes -->
  <div class="carousel__content">
    <!-- Slides respond to :checked state -->
  </div>
  
  <!-- Navigation that triggers state changes -->
  <nav class="carousel__navigation">
    <label for="gallery-1-slide-1" class="carousel__indicator"></label>
    <label for="gallery-1-slide-2" class="carousel__indicator"></label>
    <label for="gallery-1-slide-3" class="carousel__indicator"></label>
  </nav>
</div>
```

### Responsive Image Pattern
```html
<!-- Responsive image with multiple sources and lazy loading -->
<picture class="carousel__picture">
  <!-- WebP format for modern browsers -->
  <source 
    type="image/webp"
    srcset="images/slide-1-400w.webp 400w,
            images/slide-1-800w.webp 800w,
            images/slide-1-1200w.webp 1200w,
            images/slide-1-1600w.webp 1600w"
    sizes="(max-width: 767px) 100vw,
           (max-width: 1023px) 50vw,
           (max-width: 1439px) 33.333vw,
           25vw">
  
  <!-- JPEG fallback -->
  <img 
    src="images/slide-1-800w.jpg"
    srcset="images/slide-1-400w.jpg 400w,
            images/slide-1-800w.jpg 800w,
            images/slide-1-1200w.jpg 1200w,
            images/slide-1-1600w.jpg 1600w"
    sizes="(max-width: 767px) 100vw,
           (max-width: 1023px) 50vw,
           (max-width: 1439px) 33.333vw,
           25vw"
    alt="Descriptive alternative text for the image"
    loading="lazy"
    decoding="async"
    class="carousel__image">
</picture>
```

### Accessibility Enhancement Patterns
```html
<!-- Enhanced accessibility structure -->
<section class="carousel" 
         role="region" 
         aria-label="Product Gallery"
         aria-roledescription="carousel"
         data-slides="5">
  
  <!-- Keyboard navigation instructions -->
  <div class="carousel__instructions carousel__sr-only">
    <p>Use arrow keys to navigate between slides, or tab to the navigation buttons.</p>
  </div>
  
  <!-- Slides with proper ARIA -->
  <div class="carousel__slide" 
       role="tabpanel"
       aria-labelledby="slide-1-title"
       aria-describedby="slide-1-desc"
       tabindex="0"
       data-slide="1">
    
    <!-- Slide content with semantic structure -->
    <article class="carousel__article">
      <header>
        <h3 id="slide-1-title" class="carousel__title">
          Mountain Adventure
        </h3>
      </header>
      
      <figure class="carousel__figure">
        <img class="carousel__image" alt="...">
        <figcaption id="slide-1-desc" class="carousel__caption">
          Detailed description of the image content
        </figcaption>
      </figure>
    </article>
  </div>
  
  <!-- Navigation with enhanced ARIA -->
  <nav class="carousel__navigation" 
       aria-label="Carousel navigation"
       role="tablist">
    
    <button class="carousel__indicator"
            role="tab"
            aria-selected="true"
            aria-controls="slide-1"
            aria-label="View slide 1: Mountain Adventure"
            tabindex="0"
            data-slide-index="1">
      <span class="carousel__sr-only">Slide 1</span>
    </button>
  </nav>
</section>
```

## Component Variants

### Minimal Carousel Structure
```html
<!-- Simplified version for basic use cases -->
<div class="carousel carousel--minimal" data-slides="3">
  <input type="radio" name="minimal-nav" id="min-1" checked hidden>
  <input type="radio" name="minimal-nav" id="min-2" hidden>
  <input type="radio" name="minimal-nav" id="min-3" hidden>
  
  <div class="carousel__track">
    <div class="carousel__slide"><img src="1.jpg" alt="Image 1"></div>
    <div class="carousel__slide"><img src="2.jpg" alt="Image 2"></div>
    <div class="carousel__slide"><img src="3.jpg" alt="Image 3"></div>
  </div>
  
  <nav class="carousel__dots">
    <label for="min-1"></label>
    <label for="min-2"></label>
    <label for="min-3"></label>
  </nav>
</div>
```

### Full-Featured Carousel Structure
```html
<!-- Complete version with all features -->
<section class="carousel carousel--full-featured" 
         role="region"
         aria-label="Image Gallery"
         data-auto-height="true"
         data-loop="true"
         data-slides="4">
  
  <!-- State management -->
  <input type="radio" name="full-nav" id="full-1" class="carousel__state" checked>
  <input type="radio" name="full-nav" id="full-2" class="carousel__state">
  <input type="radio" name="full-nav" id="full-3" class="carousel__state">
  <input type="radio" name="full-nav" id="full-4" class="carousel__state">
  
  <!-- Carousel header -->
  <header class="carousel__header">
    <h2 class="carousel__title">Featured Gallery</h2>
    <p class="carousel__description">A collection of our finest photography</p>
  </header>
  
  <!-- Main viewport -->
  <div class="carousel__viewport" aria-live="polite">
    <div class="carousel__track">
      <div class="carousel__slide" data-bg="dark">
        <figure class="carousel__figure">
          <picture class="carousel__picture">
            <!-- Multiple image sources -->
          </picture>
          <figcaption class="carousel__caption">
            <h3 class="carousel__slide-title">Slide Title</h3>
            <p class="carousel__slide-description">Slide description</p>
            <a href="#" class="carousel__slide-link">Learn More</a>
          </figcaption>
        </figure>
      </div>
      <!-- More slides... -->
    </div>
  </div>
  
  <!-- Enhanced navigation -->
  <nav class="carousel__navigation">
    <!-- Arrow controls -->
    <div class="carousel__controls">
      <label for="full-4" class="carousel__control carousel__control--prev">
        <svg class="carousel__icon" aria-hidden="true"><!-- SVG icon --></svg>
        <span class="carousel__sr-only">Previous slide</span>
      </label>
      
      <label for="full-2" class="carousel__control carousel__control--next">
        <svg class="carousel__icon" aria-hidden="true"><!-- SVG icon --></svg>
        <span class="carousel__sr-only">Next slide</span>
      </label>
    </div>
    
    <!-- Indicators with thumbnails -->
    <div class="carousel__indicators" role="tablist">
      <label for="full-1" class="carousel__indicator" role="tab">
        <img src="thumb-1.jpg" alt="" class="carousel__thumbnail">
        <span class="carousel__sr-only">Slide 1</span>
      </label>
      <!-- More indicators... -->
    </div>
    
    <!-- Progress bar -->
    <div class="carousel__progress" role="progressbar" aria-valuenow="1" aria-valuemax="4">
      <div class="carousel__progress-fill"></div>
    </div>
  </nav>
  
  <!-- Footer metadata -->
  <footer class="carousel__footer">
    <div class="carousel__counter" role="status">
      <span class="carousel__current-slide">1</span>
      <span class="carousel__separator">/</span>
      <span class="carousel__total-slides">4</span>
    </div>
    
    <div class="carousel__actions">
      <button class="carousel__fullscreen" aria-label="Enter fullscreen mode">
        <svg aria-hidden="true"><!-- Fullscreen icon --></svg>
      </button>
    </div>
  </footer>
</section>
```

## Data Attributes and Configuration

### Configuration Data Attributes
```html
<div class="carousel"
     data-slides="5"                    <!-- Total number of slides -->
     data-visible="1"                   <!-- Default visible slides -->
     data-visible-tablet="2"            <!-- Tablet visible slides -->
     data-visible-desktop="3"           <!-- Desktop visible slides -->
     data-gap="16"                      <!-- Gap between slides in pixels -->
     data-loop="true"                   <!-- Enable infinite looping -->
     data-auto-height="false"           <!-- Dynamic height adjustment -->
     data-transition="slide"            <!-- Transition type: slide, fade -->
     data-duration="300"                <!-- Transition duration in ms -->
     data-easing="ease-in-out"          <!-- CSS easing function -->
     data-lazy="true"                   <!-- Enable lazy loading -->
     data-preload="1"                   <!-- Number of slides to preload -->
     data-keyboard="true"               <!-- Enable keyboard navigation -->
     data-touch="true"                  <!-- Enable touch gestures -->
     data-theme="light"                 <!-- Color theme -->
     data-aspect-ratio="16/9">          <!-- Aspect ratio -->
  <!-- Carousel content -->
</div>
```

### Responsive Behavior Data Attributes
```html
<!-- Responsive configuration via data attributes -->
<div class="carousel"
     data-breakpoints='[
       {"width": 0, "slides": 1, "gap": 8},
       {"width": 768, "slides": 2, "gap": 12},
       {"width": 1024, "slides": 3, "gap": 16},
       {"width": 1440, "slides": 4, "gap": 20}
     ]'>
  <!-- Content -->
</div>
```

This HTML structure provides a solid foundation for the CSS-only carousel with comprehensive accessibility features and responsive image handling.