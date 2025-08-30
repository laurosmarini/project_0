/**
 * Accessible Responsive Navigation Component
 * Implements WCAG 2.1 AA standards for keyboard navigation, screen reader support,
 * and responsive mobile/desktop interactions.
 */

class AccessibleNavigation {
    constructor(selector) {
        this.nav = document.querySelector(selector);
        this.mobileToggle = this.nav.querySelector('.mobile-menu-toggle');
        this.navMenu = this.nav.querySelector('.nav-menu');
        this.dropdownToggles = this.nav.querySelectorAll('.dropdown-toggle');
        this.submenuToggles = this.nav.querySelectorAll('.submenu-toggle');
        this.announcements = document.getElementById('navigation-announcements');
        this.isDesktop = window.innerWidth > 768;
        this.currentFocus = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupResponsiveHandling();
        this.setupAccessibilityFeatures();
        
        // Initialize ARIA states
        this.updateAriaStates();
        
        // Announce navigation is ready for screen readers
        this.announce('Navigation menu is ready');
    }

    setupEventListeners() {
        // Mobile menu toggle
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }

        // Dropdown toggles
        this.dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleDropdown(toggle);
            });
        });

        // Submenu toggles
        this.submenuToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSubmenu(toggle);
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.nav.contains(e.target)) {
                this.closeAllDropdowns();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle escape key globally
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscape();
            }
        });
    }

    setupKeyboardNavigation() {
        // Handle keyboard navigation on all focusable elements
        const focusableElements = this.nav.querySelectorAll(
            'a, button, [tabindex]:not([tabindex="-1"])'
        );

        focusableElements.forEach(element => {
            element.addEventListener('keydown', (e) => {
                this.handleKeyNavigation(e, element);
            });
        });
    }

    setupFocusManagement() {
        const focusableElements = this.nav.querySelectorAll(
            'a, button, [tabindex]:not([tabindex="-1"])'
        );

        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                this.currentFocus = element;
                this.updateFocusIndicator(element);
            });

            element.addEventListener('blur', () => {
                this.removeFocusIndicator(element);
            });
        });
    }

    setupResponsiveHandling() {
        // Set initial state based on screen size
        this.updateResponsiveState();
    }

    setupAccessibilityFeatures() {
        // Add focus-visible polyfill class if needed
        if (!CSS.supports('selector(:focus-visible)')) {
            document.documentElement.classList.add('js-focus-visible');
        }

        // Ensure all interactive elements have proper ARIA labels
        this.validateAriaLabels();
    }

    handleKeyNavigation(e, element) {
        switch (e.key) {
            case 'Enter':
            case ' ':
                if (element.classList.contains('dropdown-toggle') || 
                    element.classList.contains('submenu-toggle')) {
                    e.preventDefault();
                    element.click();
                }
                break;

            case 'ArrowDown':
                if (element.getAttribute('aria-haspopup') === 'true') {
                    e.preventDefault();
                    this.openDropdown(element);
                    this.focusFirstDropdownItem(element);
                } else if (element.closest('.dropdown-menu')) {
                    e.preventDefault();
                    this.focusNextDropdownItem(element);
                }
                break;

            case 'ArrowUp':
                if (element.closest('.dropdown-menu')) {
                    e.preventDefault();
                    this.focusPreviousDropdownItem(element);
                }
                break;

            case 'ArrowRight':
                if (this.isDesktop && element.getAttribute('role') === 'menuitem') {
                    e.preventDefault();
                    this.focusNextNavItem(element);
                } else if (element.closest('.dropdown-menu') && 
                          element.closest('li').querySelector('.submenu')) {
                    e.preventDefault();
                    this.openSubmenu(element);
                }
                break;

            case 'ArrowLeft':
                if (this.isDesktop && element.getAttribute('role') === 'menuitem') {
                    e.preventDefault();
                    this.focusPreviousNavItem(element);
                } else if (element.closest('.submenu')) {
                    e.preventDefault();
                    this.closeSubmenu(element);
                }
                break;

            case 'Home':
                if (element.closest('.dropdown-menu')) {
                    e.preventDefault();
                    this.focusFirstDropdownItem(
                        element.closest('.dropdown-menu').previousElementSibling
                    );
                }
                break;

            case 'End':
                if (element.closest('.dropdown-menu')) {
                    e.preventDefault();
                    this.focusLastDropdownItem(
                        element.closest('.dropdown-menu').previousElementSibling
                    );
                }
                break;

            case 'Tab':
                // Let natural tab behavior work, but close dropdowns
                setTimeout(() => {
                    if (!this.nav.contains(document.activeElement)) {
                        this.closeAllDropdowns();
                    }
                }, 0);
                break;
        }
    }

    toggleMobileMenu() {
        const isExpanded = this.mobileToggle.getAttribute('aria-expanded') === 'true';
        
        this.mobileToggle.setAttribute('aria-expanded', (!isExpanded).toString());
        this.navMenu.setAttribute('aria-hidden', isExpanded.toString());
        
        // Update announcements for screen readers
        this.announce(isExpanded ? 'Menu closed' : 'Menu opened');
        
        // Focus management
        if (!isExpanded) {
            // Menu is being opened - don't change focus
            this.navMenu.classList.add('mobile-open');
        } else {
            // Menu is being closed
            this.navMenu.classList.remove('mobile-open');
            this.closeAllDropdowns();
        }
    }

    toggleDropdown(toggle) {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        const dropdown = document.getElementById(toggle.getAttribute('aria-controls'));
        
        // Close other open dropdowns
        this.closeOtherDropdowns(toggle);
        
        // Toggle current dropdown
        toggle.setAttribute('aria-expanded', (!isExpanded).toString());
        dropdown.setAttribute('aria-hidden', isExpanded.toString());
        
        if (!isExpanded) {
            // Opening dropdown
            dropdown.classList.add('dropdown-open');
            this.announce(`${toggle.textContent.trim()} menu opened`);
            
            // Position dropdown if needed
            this.positionDropdown(dropdown);
        } else {
            // Closing dropdown
            dropdown.classList.remove('dropdown-open');
            this.announce(`${toggle.textContent.trim()} menu closed`);
            toggle.focus();
        }
    }

    toggleSubmenu(toggle) {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        const submenu = document.getElementById(toggle.getAttribute('aria-controls'));
        
        toggle.setAttribute('aria-expanded', (!isExpanded).toString());
        submenu.setAttribute('aria-hidden', isExpanded.toString());
        
        if (!isExpanded) {
            submenu.classList.add('submenu-open');
            this.announce(`${toggle.textContent.trim()} submenu opened`);
            this.positionSubmenu(submenu);
        } else {
            submenu.classList.remove('submenu-open');
            this.announce(`${toggle.textContent.trim()} submenu closed`);
            toggle.focus();
        }
    }

    openDropdown(toggle) {
        if (toggle.getAttribute('aria-expanded') === 'false') {
            this.toggleDropdown(toggle);
        }
    }

    openSubmenu(toggle) {
        if (toggle.getAttribute('aria-expanded') === 'false') {
            this.toggleSubmenu(toggle);
        }
    }

    closeDropdown(toggle) {
        if (toggle.getAttribute('aria-expanded') === 'true') {
            this.toggleDropdown(toggle);
        }
    }

    closeSubmenu(element) {
        const submenu = element.closest('.submenu');
        if (submenu) {
            const toggle = document.querySelector(
                `[aria-controls="${submenu.id}"]`
            );
            if (toggle) {
                this.toggleSubmenu(toggle);
            }
        }
    }

    closeAllDropdowns() {
        this.dropdownToggles.forEach(toggle => {
            if (toggle.getAttribute('aria-expanded') === 'true') {
                this.closeDropdown(toggle);
            }
        });

        this.submenuToggles.forEach(toggle => {
            if (toggle.getAttribute('aria-expanded') === 'true') {
                this.toggleSubmenu(toggle);
            }
        });
    }

    closeOtherDropdowns(currentToggle) {
        this.dropdownToggles.forEach(toggle => {
            if (toggle !== currentToggle && 
                toggle.getAttribute('aria-expanded') === 'true') {
                this.closeDropdown(toggle);
            }
        });
    }

    focusFirstDropdownItem(toggle) {
        const dropdown = document.getElementById(toggle.getAttribute('aria-controls'));
        const firstItem = dropdown.querySelector('a, button');
        if (firstItem) {
            firstItem.focus();
        }
    }

    focusLastDropdownItem(toggle) {
        const dropdown = document.getElementById(toggle.getAttribute('aria-controls'));
        const items = dropdown.querySelectorAll('a, button');
        const lastItem = items[items.length - 1];
        if (lastItem) {
            lastItem.focus();
        }
    }

    focusNextDropdownItem(currentElement) {
        const dropdown = currentElement.closest('.dropdown-menu, .submenu');
        const items = Array.from(dropdown.querySelectorAll('a, button'));
        const currentIndex = items.indexOf(currentElement);
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex].focus();
    }

    focusPreviousDropdownItem(currentElement) {
        const dropdown = currentElement.closest('.dropdown-menu, .submenu');
        const items = Array.from(dropdown.querySelectorAll('a, button'));
        const currentIndex = items.indexOf(currentElement);
        const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        items[prevIndex].focus();
    }

    focusNextNavItem(currentElement) {
        const navItems = Array.from(this.nav.querySelectorAll('.nav-list > .nav-item .nav-link'));
        const currentIndex = navItems.indexOf(currentElement);
        const nextIndex = (currentIndex + 1) % navItems.length;
        navItems[nextIndex].focus();
    }

    focusPreviousNavItem(currentElement) {
        const navItems = Array.from(this.nav.querySelectorAll('.nav-list > .nav-item .nav-link'));
        const currentIndex = navItems.indexOf(currentElement);
        const prevIndex = currentIndex === 0 ? navItems.length - 1 : currentIndex - 1;
        navItems[prevIndex].focus();
    }

    handleEscape() {
        if (this.currentFocus && this.currentFocus.closest('.dropdown-menu, .submenu')) {
            // Focus is in a dropdown/submenu
            const dropdown = this.currentFocus.closest('.dropdown-menu');
            const submenu = this.currentFocus.closest('.submenu');
            
            if (submenu && !dropdown.contains(submenu)) {
                // In a submenu that's not in a dropdown
                const submenuToggle = document.querySelector(`[aria-controls="${submenu.id}"]`);
                this.toggleSubmenu(submenuToggle);
            } else if (dropdown) {
                // In a dropdown
                const dropdownToggle = document.querySelector(`[aria-controls="${dropdown.id}"]`);
                this.closeDropdown(dropdownToggle);
            }
        } else if (!this.isDesktop && 
                   this.mobileToggle.getAttribute('aria-expanded') === 'true') {
            // Mobile menu is open
            this.toggleMobileMenu();
            this.mobileToggle.focus();
        }
    }

    handleResize() {
        const wasDesktop = this.isDesktop;
        this.isDesktop = window.innerWidth > 768;
        
        if (wasDesktop !== this.isDesktop) {
            this.updateResponsiveState();
            this.closeAllDropdowns();
        }
    }

    updateResponsiveState() {
        if (this.isDesktop) {
            // Desktop mode
            this.navMenu.setAttribute('aria-hidden', 'false');
            this.mobileToggle.setAttribute('aria-expanded', 'false');
            this.navMenu.classList.remove('mobile-open');
        } else {
            // Mobile mode
            if (this.mobileToggle.getAttribute('aria-expanded') === 'false') {
                this.navMenu.setAttribute('aria-hidden', 'true');
            }
        }
    }

    positionDropdown(dropdown) {
        // Simple positioning - can be enhanced based on viewport
        const rect = dropdown.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        if (rect.right > viewportWidth) {
            dropdown.style.left = 'auto';
            dropdown.style.right = '0';
        }
    }

    positionSubmenu(submenu) {
        // Position submenu to avoid viewport overflow
        const rect = submenu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        if (rect.right > viewportWidth) {
            submenu.style.left = 'auto';
            submenu.style.right = '100%';
            submenu.style.marginLeft = '0';
            submenu.style.marginRight = '0.5rem';
        }
    }

    updateFocusIndicator(element) {
        // Add visual focus indicator if needed
        element.classList.add('focus-visible');
    }

    removeFocusIndicator(element) {
        // Remove visual focus indicator
        element.classList.remove('focus-visible');
    }

    updateAriaStates() {
        // Ensure all ARIA states are properly initialized
        this.dropdownToggles.forEach(toggle => {
            if (!toggle.hasAttribute('aria-expanded')) {
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        this.submenuToggles.forEach(toggle => {
            if (!toggle.hasAttribute('aria-expanded')) {
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        const dropdownMenus = this.nav.querySelectorAll('.dropdown-menu, .submenu');
        dropdownMenus.forEach(menu => {
            if (!menu.hasAttribute('aria-hidden')) {
                menu.setAttribute('aria-hidden', 'true');
            }
        });
    }

    validateAriaLabels() {
        // Check that all interactive elements have proper labels
        const interactiveElements = this.nav.querySelectorAll(
            'a, button, [role="menuitem"]'
        );

        interactiveElements.forEach(element => {
            const hasLabel = element.getAttribute('aria-label') ||
                           element.getAttribute('aria-labelledby') ||
                           element.textContent.trim() ||
                           element.querySelector('.sr-only');

            if (!hasLabel) {
                console.warn('Interactive element missing accessible label:', element);
            }
        });
    }

    announce(message) {
        if (this.announcements && message) {
            this.announcements.textContent = message;
            
            // Clear the message after a short delay to allow for re-announcements
            setTimeout(() => {
                this.announcements.textContent = '';
            }, 1000);
        }
    }

    // Public API methods
    destroy() {
        // Clean up event listeners and reset states
        this.closeAllDropdowns();
        
        // Remove event listeners (simplified - in production you'd store references)
        // This is a basic cleanup - in production you'd want to track and remove all listeners
        const newNav = this.nav.cloneNode(true);
        this.nav.parentNode.replaceChild(newNav, this.nav);
    }

    refresh() {
        // Reinitialize the navigation component
        this.destroy();
        this.__proto__.constructor.call(this, '.main-navigation');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the navigation component
    window.navigation = new AccessibleNavigation('.main-navigation');
    
    // Expose for debugging and testing
    if (window.location.search.includes('debug=true')) {
        console.log('Navigation component initialized:', window.navigation);
    }
});

// Handle page visibility changes to maintain proper state
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.navigation) {
        window.navigation.closeAllDropdowns();
    }
});

// Additional utility functions for enhanced accessibility
const NavigationUtils = {
    // Check if user prefers reduced motion
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
    
    // Get current color scheme preference
    getColorScheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },
    
    // Check if high contrast is preferred
    prefersHighContrast() {
        return window.matchMedia('(prefers-contrast: high)').matches;
    },
    
    // Announce to screen readers
    announce(message, priority = 'polite') {
        const announcer = document.getElementById('navigation-announcements');
        if (announcer) {
            announcer.setAttribute('aria-live', priority);
            announcer.textContent = message;
            
            setTimeout(() => {
                announcer.textContent = '';
                announcer.setAttribute('aria-live', 'polite');
            }, 1000);
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AccessibleNavigation, NavigationUtils };
}