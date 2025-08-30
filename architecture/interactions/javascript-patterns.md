# JavaScript Interaction Patterns

## Architecture Philosophy

### Progressive Enhancement Approach
1. **Base Layer**: Full functionality without JavaScript
2. **Enhancement Layer**: JavaScript adds smooth interactions
3. **Fallback Strategy**: Graceful degradation when JS fails
4. **Performance First**: Minimal JavaScript footprint

## Module Organization Pattern

### ES6 Module Structure
```javascript
// pricing-table.js - Main module
export class PricingTable {
  constructor(element, options = {}) {
    this.element = element;
    this.options = { ...this.defaultOptions, ...options };
    this.state = this.initializeState();
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.setupObservers();
    this.initializeComponents();
  }
}

// mobile-controller.js - Mobile-specific logic
export class MobileController {
  constructor(pricingTable) {
    this.parent = pricingTable;
    this.element = pricingTable.element;
    this.mobileBreakpoint = 768;
    
    this.init();
  }
}

// theme-manager.js - Theme switching
export class ThemeManager {
  constructor(element) {
    this.element = element;
    this.currentTheme = this.detectTheme();
    
    this.init();
  }
}
```

## Core Interaction Patterns

### 1. Mobile Collapse Management
```javascript
class MobileController {
  constructor(pricingTable) {
    this.parent = pricingTable;
    this.element = pricingTable.element;
    this.accordions = [];
    this.tabs = null;
    this.currentView = 'grid';
    
    this.init();
  }
  
  init() {
    this.setupResponsiveListener();
    this.initializeAccordions();
    this.initializeTabs();
    this.handleLayoutChange();
  }
  
  setupResponsiveListener() {
    // Use ResizeObserver for container-based responsive design
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
          const width = entry.contentRect.width;
          this.handleLayoutChange(width);
        });
      });
      
      this.resizeObserver.observe(this.element);
    } else {
      // Fallback to window resize
      window.addEventListener('resize', this.debounce(() => {
        this.handleLayoutChange();
      }, 150));
    }
  }
  
  handleLayoutChange(width = window.innerWidth) {
    const isMobile = width < 768;
    const newView = isMobile ? 'mobile' : 'grid';
    
    if (this.currentView !== newView) {
      this.currentView = newView;
      this.updateLayout(newView);
    }
  }
  
  updateLayout(layout) {
    this.element.setAttribute('data-layout', layout);
    
    if (layout === 'mobile') {
      this.enableMobileFeatures();
    } else {
      this.disableMobileFeatures();
    }
    
    // Announce change to screen readers
    this.announceLayoutChange(layout);
  }
  
  // Accordion Pattern for Features
  initializeAccordions() {
    const toggleButtons = this.element.querySelectorAll('.features-toggle');
    
    toggleButtons.forEach((button, index) => {
      const accordion = new AccordionController(button, {
        animationDuration: 250,
        closeOthers: false
      });
      
      this.accordions.push(accordion);
    });
  }
  
  // Tab Pattern for Plan Selection
  initializeTabs() {
    const tabContainer = this.element.querySelector('.pricing-mobile-tabs');
    
    if (tabContainer) {
      this.tabs = new TabController(tabContainer, {
        keyboardNavigation: true,
        swipeEnabled: true
      });
    }
  }
}
```

### 2. Accordion Controller
```javascript
class AccordionController {
  constructor(trigger, options = {}) {
    this.trigger = trigger;
    this.options = {
      animationDuration: 250,
      closeOthers: false,
      ...options
    };
    
    this.content = document.getElementById(
      this.trigger.getAttribute('aria-controls')
    );
    this.isOpen = this.trigger.getAttribute('aria-expanded') === 'true';
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.setupAnimation();
  }
  
  bindEvents() {
    this.trigger.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggle();
    });
    
    this.trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });
  }
  
  async toggle() {
    if (this.isAnimating) return;
    
    this.isOpen ? await this.close() : await this.open();
  }
  
  async open() {
    this.isAnimating = true;
    
    // Update ARIA states
    this.trigger.setAttribute('aria-expanded', 'true');
    this.content.removeAttribute('hidden');
    
    // Get natural height
    const height = this.content.scrollHeight;
    
    // Animate open
    this.content.style.height = '0';
    this.content.style.overflow = 'hidden';
    
    await this.animateHeight(height);
    
    // Clean up
    this.content.style.height = 'auto';
    this.content.style.overflow = 'visible';
    
    this.isOpen = true;
    this.isAnimating = false;
    
    // Announce to screen readers
    this.announceChange('expanded');
  }
  
  async close() {
    this.isAnimating = true;
    
    const height = this.content.scrollHeight;
    this.content.style.height = height + 'px';
    this.content.style.overflow = 'hidden';
    
    await this.animateHeight(0);
    
    // Update ARIA states
    this.trigger.setAttribute('aria-expanded', 'false');
    this.content.setAttribute('hidden', '');
    
    this.isOpen = false;
    this.isAnimating = false;
    
    this.announceChange('collapsed');
  }
  
  animateHeight(targetHeight) {
    return new Promise(resolve => {
      const animation = this.content.animate([
        { height: this.content.style.height },
        { height: targetHeight + 'px' }
      ], {
        duration: this.options.animationDuration,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
      });
      
      animation.addEventListener('finish', resolve);
    });
  }
}
```

### 3. Tab Controller
```javascript
class TabController {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      keyboardNavigation: true,
      swipeEnabled: false,
      ...options
    };
    
    this.tabs = [...container.querySelectorAll('[role="tab"]')];
    this.panels = [...container.querySelectorAll('[role="tabpanel"]')];
    this.currentIndex = this.findActiveTab();
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.setupKeyboardNavigation();
    
    if (this.options.swipeEnabled) {
      this.setupSwipeGestures();
    }
  }
  
  bindEvents() {
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        this.activateTab(index);
      });
    });
  }
  
  setupKeyboardNavigation() {
    if (!this.options.keyboardNavigation) return;
    
    this.container.addEventListener('keydown', (e) => {
      const { key } = e;
      let newIndex = this.currentIndex;
      
      switch (key) {
        case 'ArrowLeft':
          newIndex = (this.currentIndex - 1 + this.tabs.length) % this.tabs.length;
          break;
        case 'ArrowRight':
          newIndex = (this.currentIndex + 1) % this.tabs.length;
          break;
        case 'Home':
          newIndex = 0;
          break;
        case 'End':
          newIndex = this.tabs.length - 1;
          break;
        default:
          return;
      }
      
      e.preventDefault();
      this.activateTab(newIndex, { focus: true });
    });
  }
  
  activateTab(index, options = {}) {
    if (index === this.currentIndex) return;
    
    // Deactivate current tab
    this.tabs[this.currentIndex].setAttribute('aria-selected', 'false');
    this.panels[this.currentIndex].setAttribute('hidden', '');
    
    // Activate new tab
    this.tabs[index].setAttribute('aria-selected', 'true');
    this.panels[index].removeAttribute('hidden');
    
    if (options.focus) {
      this.tabs[index].focus();
    }
    
    this.currentIndex = index;
    
    // Trigger custom event
    this.container.dispatchEvent(new CustomEvent('tabchange', {
      detail: { index, tab: this.tabs[index], panel: this.panels[index] }
    }));
  }
  
  setupSwipeGestures() {
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    
    const panelContainer = this.container.querySelector('.tab-panels');
    
    panelContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    
    panelContainer.addEventListener('touchmove', (e) => {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    }, { passive: true });
    
    panelContainer.addEventListener('touchend', () => {
      const deltaX = startX - currentX;
      const deltaY = startY - currentY;
      
      // Check if horizontal swipe is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && this.currentIndex < this.tabs.length - 1) {
          // Swipe left - next tab
          this.activateTab(this.currentIndex + 1);
        } else if (deltaX < 0 && this.currentIndex > 0) {
          // Swipe right - previous tab
          this.activateTab(this.currentIndex - 1);
        }
      }
    }, { passive: true });
  }
}
```

## Event Management & Performance

### 1. Event Delegation Pattern
```javascript
class PricingTable {
  bindEvents() {
    // Use event delegation for performance
    this.element.addEventListener('click', this.handleClick.bind(this));
    this.element.addEventListener('keydown', this.handleKeydown.bind(this));
    this.element.addEventListener('focusin', this.handleFocusIn.bind(this));
    this.element.addEventListener('focusout', this.handleFocusOut.bind(this));
  }
  
  handleClick(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    
    const action = target.dataset.action;
    const tier = target.dataset.tier;
    
    switch (action) {
      case 'select-plan':
        this.selectPlan(tier, target);
        break;
      case 'toggle-features':
        this.toggleFeatures(target);
        break;
      case 'compare':
        this.showComparison();
        break;
    }
  }
}
```

### 2. Intersection Observer for Animations
```javascript
class AnimationController {
  constructor(elements) {
    this.elements = elements;
    this.options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    this.init();
  }
  
  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        this.options
      );
      
      this.elements.forEach(el => this.observer.observe(el));
    } else {
      // Fallback: Show all elements immediately
      this.elements.forEach(el => el.classList.add('is-visible'));
    }
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        this.observer.unobserve(entry.target);
      }
    });
  }
}
```

### 3. Memory Management & Cleanup
```javascript
class PricingTable {
  destroy() {
    // Remove event listeners
    this.element.removeEventListener('click', this.handleClick);
    
    // Disconnect observers
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    // Clean up child components
    this.mobileController?.destroy();
    this.themeManager?.destroy();
    
    // Clear references
    this.element = null;
    this.options = null;
    this.state = null;
  }
}
```

## Accessibility Enhancements

### 1. Screen Reader Announcements
```javascript
class A11yAnnouncer {
  constructor() {
    this.liveRegion = this.createLiveRegion();
  }
  
  createLiveRegion() {
    const region = document.createElement('div');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
    return region;
  }
  
  announce(message, priority = 'polite') {
    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      this.liveRegion.textContent = '';
    }, 1000);
  }
}
```

### 2. Focus Management
```javascript
class FocusManager {
  static trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }
  
  static restoreFocus(previouslyFocused) {
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
  }
}
```

## Initialization & Configuration

### Main Entry Point
```javascript
// pricing-table-init.js
document.addEventListener('DOMContentLoaded', () => {
  const pricingTables = document.querySelectorAll('.pricing-table');
  
  pricingTables.forEach(element => {
    const config = JSON.parse(element.dataset.config || '{}');
    new PricingTable(element, config);
  });
});

// For dynamic initialization
window.PricingTable = PricingTable;
```

### Configuration Options
```javascript
const defaultOptions = {
  // Layout options
  mobileBreakpoint: 768,
  enableAnimations: true,
  animationDuration: 250,
  
  // Mobile options
  mobileLayout: 'accordion', // 'accordion' | 'tabs' | 'carousel'
  swipeEnabled: false,
  
  // Accessibility options
  announceChanges: true,
  respectReducedMotion: true,
  
  // Theme options
  theme: 'auto', // 'light' | 'dark' | 'auto'
  enableThemeToggle: false,
  
  // Performance options
  lazyLoad: true,
  debounceResize: 150,
  
  // Callbacks
  onPlanSelect: null,
  onLayoutChange: null,
  onThemeChange: null
};
```