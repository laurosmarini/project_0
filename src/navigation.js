/**
 * Accessible Responsive Navigation Bar
 * Provides keyboard navigation, focus management, and ARIA support
 */

class AccessibleNavigation {
  constructor() {
    this.nav = null;
    this.mobileToggle = null;
    this.dropdowns = [];
    this.currentDropdown = null;
    this.focusableElements = 'a[href], button, [tabindex]:not([tabindex="-1"])';
    this.isInitialized = false;

    // Bind methods to preserve context
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.closeMobileNav = this.closeMobileNav.bind(this);
    this.closeAllDropdowns = this.closeAllDropdowns.bind(this);

    this.init();
  }

  /**
   * Initialize the navigation system
   */
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * Setup navigation elements and event listeners
   */
  setup() {
    this.nav = document.querySelector('.nav-container') || document.querySelector('nav');
    
    if (!this.nav) {
      console.warn('Navigation container not found');
      return;
    }

    this.setupMobileToggle();
    this.setupDropdowns();
    this.setupEventListeners();
    this.setupAriaAttributes();
    this.isInitialized = true;

    // Announce to screen readers that navigation is ready
    this.announceToScreenReader('Navigation initialized and ready');
  }

  /**
   * Setup mobile navigation toggle
   */
  setupMobileToggle() {
    this.mobileToggle = this.nav.querySelector('.mobile-menu-toggle') || 
                       this.nav.querySelector('[aria-label*="menu"]') ||
                       this.nav.querySelector('.hamburger');

    if (!this.mobileToggle) {
      // Create mobile toggle if it doesn't exist
      this.createMobileToggle();
    }

    // Ensure proper ARIA attributes
    if (this.mobileToggle) {
      this.mobileToggle.setAttribute('aria-expanded', 'false');
      this.mobileToggle.setAttribute('aria-controls', 'main-navigation');
      this.mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
    }
  }

  /**
   * Create mobile toggle button if it doesn't exist
   */
  createMobileToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'mobile-menu-toggle';
    toggle.innerHTML = `
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    `;
    toggle.setAttribute('aria-label', 'Toggle navigation menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'main-navigation');

    const navList = this.nav.querySelector('ul') || this.nav.querySelector('.nav-list');
    if (navList) {
      this.nav.insertBefore(toggle, navList);
      this.mobileToggle = toggle;
    }
  }

  /**
   * Setup dropdown menus
   */
  setupDropdowns() {
    const dropdownTriggers = this.nav.querySelectorAll('[aria-haspopup="true"], .has-dropdown > a, .dropdown-trigger');
    
    this.dropdowns = Array.from(dropdownTriggers).map(trigger => {
      const dropdown = trigger.nextElementSibling || 
                      trigger.parentElement.querySelector('.dropdown-menu') ||
                      trigger.parentElement.querySelector('ul');

      if (dropdown) {
        // Setup ARIA attributes
        trigger.setAttribute('aria-haspopup', 'true');
        trigger.setAttribute('aria-expanded', 'false');
        
        if (!dropdown.id) {
          dropdown.id = `dropdown-${Math.random().toString(36).substr(2, 9)}`;
        }
        trigger.setAttribute('aria-controls', dropdown.id);

        // Hide dropdown initially
        dropdown.setAttribute('aria-hidden', 'true');
        dropdown.style.display = 'none';

        return { trigger, dropdown, isOpen: false };
      }
      return null;
    }).filter(Boolean);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Global event listeners
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('click', this.handleClick);
    document.addEventListener('focusin', this.handleFocus);
    document.addEventListener('focusout', this.handleBlur);

    // Touch events for mobile
    document.addEventListener('touchstart', this.handleTouch.bind(this), { passive: true });

    // Resize handler for responsive behavior
    window.addEventListener('resize', this.handleResize.bind(this));

    // Mobile toggle specific events
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener('click', this.toggleMobileNav.bind(this));
    }
  }

  /**
   * Setup initial ARIA attributes
   */
  setupAriaAttributes() {
    const mainNav = this.nav.querySelector('ul') || this.nav.querySelector('.nav-list');
    if (mainNav && !mainNav.id) {
      mainNav.id = 'main-navigation';
    }

    // Ensure navigation has proper role
    if (!this.nav.getAttribute('role')) {
      this.nav.setAttribute('role', 'navigation');
    }

    // Add aria-label if missing
    if (!this.nav.getAttribute('aria-label') && !this.nav.getAttribute('aria-labelledby')) {
      this.nav.setAttribute('aria-label', 'Main navigation');
    }
  }

  /**
   * Handle keyboard navigation
   */
  handleKeydown(event) {
    const { key, target, shiftKey } = event;

    switch (key) {
      case 'Escape':
        this.handleEscapeKey(event);
        break;
      case 'Enter':
      case ' ':
        this.handleActivationKey(event);
        break;
      case 'ArrowDown':
        this.handleArrowDown(event);
        break;
      case 'ArrowUp':
        this.handleArrowUp(event);
        break;
      case 'ArrowLeft':
        this.handleArrowLeft(event);
        break;
      case 'ArrowRight':
        this.handleArrowRight(event);
        break;
      case 'Tab':
        this.handleTabKey(event);
        break;
    }
  }

  /**
   * Handle escape key - close current dropdown or mobile menu
   */
  handleEscapeKey(event) {
    if (this.currentDropdown) {
      this.closeDropdown(this.currentDropdown);
      this.currentDropdown.trigger.focus();
      event.preventDefault();
    } else if (this.isMobileNavOpen()) {
      this.closeMobileNav();
      this.mobileToggle.focus();
      event.preventDefault();
    }
  }

  /**
   * Handle activation keys (Enter/Space)
   */
  handleActivationKey(event) {
    const trigger = this.getDropdownTrigger(event.target);
    if (trigger) {
      event.preventDefault();
      const dropdown = this.getDropdownByTrigger(trigger);
      if (dropdown) {
        this.toggleDropdown(dropdown);
      }
    }
  }

  /**
   * Handle arrow key navigation
   */
  handleArrowDown(event) {
    const dropdown = this.getCurrentDropdown(event.target);
    if (dropdown && dropdown.isOpen) {
      event.preventDefault();
      this.focusNextItem(dropdown.dropdown);
    } else {
      const trigger = this.getDropdownTrigger(event.target);
      if (trigger) {
        event.preventDefault();
        const dropdownObj = this.getDropdownByTrigger(trigger);
        if (dropdownObj) {
          this.openDropdown(dropdownObj);
          this.focusFirstItem(dropdownObj.dropdown);
        }
      }
    }
  }

  handleArrowUp(event) {
    const dropdown = this.getCurrentDropdown(event.target);
    if (dropdown && dropdown.isOpen) {
      event.preventDefault();
      this.focusPrevItem(dropdown.dropdown);
    }
  }

  handleArrowLeft(event) {
    if (this.isInDropdown(event.target)) {
      event.preventDefault();
      const dropdown = this.getCurrentDropdown(event.target);
      if (dropdown) {
        this.closeDropdown(dropdown);
        dropdown.trigger.focus();
      }
    }
  }

  handleArrowRight(event) {
    const trigger = this.getDropdownTrigger(event.target);
    if (trigger) {
      event.preventDefault();
      const dropdown = this.getDropdownByTrigger(trigger);
      if (dropdown) {
        this.openDropdown(dropdown);
        this.focusFirstItem(dropdown.dropdown);
      }
    }
  }

  /**
   * Handle tab key for focus management
   */
  handleTabKey(event) {
    const dropdown = this.getCurrentDropdown(event.target);
    if (dropdown && dropdown.isOpen) {
      const focusableItems = dropdown.dropdown.querySelectorAll(this.focusableElements);
      const firstItem = focusableItems[0];
      const lastItem = focusableItems[focusableItems.length - 1];

      if (event.shiftKey && event.target === firstItem) {
        event.preventDefault();
        dropdown.trigger.focus();
      } else if (!event.shiftKey && event.target === lastItem) {
        event.preventDefault();
        this.closeDropdown(dropdown);
        this.focusNextTrigger(dropdown.trigger);
      }
    }
  }

  /**
   * Handle click events
   */
  handleClick(event) {
    const trigger = this.getDropdownTrigger(event.target);
    
    if (trigger) {
      event.preventDefault();
      const dropdown = this.getDropdownByTrigger(trigger);
      if (dropdown) {
        this.toggleDropdown(dropdown);
      }
    } else if (!this.isInDropdown(event.target) && !this.isInNav(event.target)) {
      // Click outside navigation - close all dropdowns and mobile menu
      this.closeAllDropdowns();
      if (this.isMobileNavOpen()) {
        this.closeMobileNav();
      }
    }
  }

  /**
   * Handle focus events
   */
  handleFocus(event) {
    if (!this.isInNav(event.target)) {
      return;
    }

    // If focusing on a dropdown trigger, prepare for keyboard navigation
    const trigger = this.getDropdownTrigger(event.target);
    if (trigger) {
      const dropdown = this.getDropdownByTrigger(trigger);
      if (dropdown && !dropdown.isOpen) {
        // Don't auto-open on focus, wait for user interaction
      }
    }
  }

  /**
   * Handle blur events with delay to manage focus transitions
   */
  handleBlur(event) {
    setTimeout(() => {
      const focusedElement = document.activeElement;
      
      // Check if focus moved outside current dropdown
      if (this.currentDropdown) {
        const isInCurrentDropdown = this.currentDropdown.dropdown.contains(focusedElement) ||
                                   this.currentDropdown.trigger === focusedElement;
        
        if (!isInCurrentDropdown) {
          this.closeDropdown(this.currentDropdown);
        }
      }
    }, 100);
  }

  /**
   * Handle touch events for mobile
   */
  handleTouch(event) {
    const target = event.target;
    
    // Handle touch on dropdown triggers
    const trigger = this.getDropdownTrigger(target);
    if (trigger) {
      const dropdown = this.getDropdownByTrigger(trigger);
      if (dropdown) {
        // On touch devices, first touch opens dropdown, second touch follows link
        if (!dropdown.isOpen) {
          event.preventDefault();
          this.openDropdown(dropdown);
        }
      }
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Close mobile navigation and dropdowns on resize
    if (window.innerWidth > 768) { // Assuming tablet breakpoint
      if (this.isMobileNavOpen()) {
        this.closeMobileNav();
      }
      this.closeAllDropdowns();
    }
  }

  /**
   * Toggle mobile navigation
   */
  toggleMobileNav() {
    const isOpen = this.isMobileNavOpen();
    
    if (isOpen) {
      this.closeMobileNav();
    } else {
      this.openMobileNav();
    }
  }

  /**
   * Open mobile navigation
   */
  openMobileNav() {
    const navList = this.nav.querySelector('#main-navigation') || 
                   this.nav.querySelector('ul') || 
                   this.nav.querySelector('.nav-list');

    if (navList) {
      navList.classList.add('is-open');
      navList.setAttribute('aria-hidden', 'false');
      this.mobileToggle.setAttribute('aria-expanded', 'true');
      this.mobileToggle.classList.add('is-active');
      
      // Add body scroll lock
      document.body.style.overflow = 'hidden';
      
      // Focus first navigation item
      const firstLink = navList.querySelector(this.focusableElements);
      if (firstLink) {
        firstLink.focus();
      }

      this.announceToScreenReader('Navigation menu opened');
    }
  }

  /**
   * Close mobile navigation
   */
  closeMobileNav() {
    const navList = this.nav.querySelector('#main-navigation') || 
                   this.nav.querySelector('ul') || 
                   this.nav.querySelector('.nav-list');

    if (navList) {
      navList.classList.remove('is-open');
      navList.setAttribute('aria-hidden', 'true');
      this.mobileToggle.setAttribute('aria-expanded', 'false');
      this.mobileToggle.classList.remove('is-active');
      
      // Remove body scroll lock
      document.body.style.overflow = '';
      
      this.announceToScreenReader('Navigation menu closed');
    }
  }

  /**
   * Check if mobile navigation is open
   */
  isMobileNavOpen() {
    return this.mobileToggle.getAttribute('aria-expanded') === 'true';
  }

  /**
   * Toggle dropdown menu
   */
  toggleDropdown(dropdown) {
    if (dropdown.isOpen) {
      this.closeDropdown(dropdown);
    } else {
      this.openDropdown(dropdown);
    }
  }

  /**
   * Open dropdown menu
   */
  openDropdown(dropdown) {
    // Close other dropdowns first
    this.closeAllDropdowns();

    dropdown.isOpen = true;
    dropdown.trigger.setAttribute('aria-expanded', 'true');
    dropdown.dropdown.setAttribute('aria-hidden', 'false');
    dropdown.dropdown.style.display = 'block';
    dropdown.dropdown.classList.add('is-open');
    
    this.currentDropdown = dropdown;

    // Add smooth animation
    requestAnimationFrame(() => {
      dropdown.dropdown.classList.add('animate-in');
    });

    this.announceToScreenReader(`${dropdown.trigger.textContent} submenu opened`);
  }

  /**
   * Close dropdown menu
   */
  closeDropdown(dropdown) {
    dropdown.isOpen = false;
    dropdown.trigger.setAttribute('aria-expanded', 'false');
    dropdown.dropdown.setAttribute('aria-hidden', 'true');
    dropdown.dropdown.classList.remove('is-open', 'animate-in');
    
    // Delay hiding to allow animation
    setTimeout(() => {
      if (!dropdown.isOpen) {
        dropdown.dropdown.style.display = 'none';
      }
    }, 200);

    if (this.currentDropdown === dropdown) {
      this.currentDropdown = null;
    }

    this.announceToScreenReader(`${dropdown.trigger.textContent} submenu closed`);
  }

  /**
   * Close all dropdown menus
   */
  closeAllDropdowns() {
    this.dropdowns.forEach(dropdown => {
      if (dropdown.isOpen) {
        this.closeDropdown(dropdown);
      }
    });
  }

  /**
   * Focus management utilities
   */
  focusFirstItem(container) {
    const firstItem = container.querySelector(this.focusableElements);
    if (firstItem) {
      firstItem.focus();
    }
  }

  focusNextItem(container) {
    const focusableItems = Array.from(container.querySelectorAll(this.focusableElements));
    const currentIndex = focusableItems.indexOf(document.activeElement);
    const nextIndex = (currentIndex + 1) % focusableItems.length;
    focusableItems[nextIndex].focus();
  }

  focusPrevItem(container) {
    const focusableItems = Array.from(container.querySelectorAll(this.focusableElements));
    const currentIndex = focusableItems.indexOf(document.activeElement);
    const prevIndex = (currentIndex - 1 + focusableItems.length) % focusableItems.length;
    focusableItems[prevIndex].focus();
  }

  focusNextTrigger(currentTrigger) {
    const allTriggers = this.dropdowns.map(d => d.trigger);
    const currentIndex = allTriggers.indexOf(currentTrigger);
    const nextIndex = (currentIndex + 1) % allTriggers.length;
    allTriggers[nextIndex].focus();
  }

  /**
   * Helper methods
   */
  getDropdownTrigger(element) {
    const trigger = element.closest('[aria-haspopup="true"], .dropdown-trigger, .has-dropdown > a');
    return trigger && this.nav.contains(trigger) ? trigger : null;
  }

  getDropdownByTrigger(trigger) {
    return this.dropdowns.find(d => d.trigger === trigger);
  }

  getCurrentDropdown(element) {
    return this.dropdowns.find(d => 
      d.dropdown.contains(element) || d.trigger === element
    );
  }

  isInDropdown(element) {
    return this.dropdowns.some(d => d.dropdown.contains(element));
  }

  isInNav(element) {
    return this.nav && this.nav.contains(element);
  }

  /**
   * Announce messages to screen readers
   */
  announceToScreenReader(message) {
    let announcer = document.getElementById('nav-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'nav-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.cssText = `
        position: absolute !important;
        left: -10000px !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
      `;
      document.body.appendChild(announcer);
    }

    announcer.textContent = message;

    // Clear the message after a short delay
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }

  /**
   * Public API methods
   */
  destroy() {
    if (!this.isInitialized) return;

    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('focusin', this.handleFocus);
    document.removeEventListener('focusout', this.handleBlur);
    document.removeEventListener('touchstart', this.handleTouch);
    window.removeEventListener('resize', this.handleResize);

    // Close all dropdowns and mobile nav
    this.closeAllDropdowns();
    if (this.isMobileNavOpen()) {
      this.closeMobileNav();
    }

    // Remove announcer
    const announcer = document.getElementById('nav-announcer');
    if (announcer) {
      announcer.remove();
    }

    this.isInitialized = false;
  }

  refresh() {
    if (this.isInitialized) {
      this.destroy();
    }
    this.setup();
  }
}

// Auto-initialize when script loads
let navigationInstance = null;

// Initialize navigation
function initNavigation() {
  if (!navigationInstance) {
    navigationInstance = new AccessibleNavigation();
  }
  return navigationInstance;
}

// Expose to global scope for manual initialization if needed
window.AccessibleNavigation = AccessibleNavigation;
window.initNavigation = initNavigation;

// Auto-initialize
initNavigation();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibleNavigation;
}