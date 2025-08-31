/**
 * KeyboardNavigation - Handles keyboard navigation support
 * Provides comprehensive keyboard accessibility and navigation shortcuts
 */

export class KeyboardNavigation {
    constructor(config = {}) {
        this.config = {
            focusableElements: [
                '.category-btn',
                '.benchmark-item',
                '.search-input',
                '.filter-btn',
                '.completion-btn',
                'button',
                'input',
                'select',
                'textarea',
                'a[href]',
                '[tabindex]:not([tabindex="-1"])'
            ],
            shortcuts: {
                'Escape': 'escape',
                '/': 'search',
                '?': 'help',
                'h': 'home',
                'e': 'easy',
                'm': 'medium',
                'd': 'hard',
                'f': 'filter',
                'Enter': 'activate',
                ' ': 'activate',
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right',
                'Tab': 'tab',
                'Home': 'first',
                'End': 'last',
                'PageUp': 'pageUp',
                'PageDown': 'pageDown'
            },
            skipLinks: true,
            focusTrap: false,
            ...config
        };

        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.navigationMode = 'default'; // default, search, modal
        this.focusHistory = [];
        this.keySequence = [];
        this.sequenceTimeout = null;
        
        this.initialized = false;

        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleFocusIn = this.handleFocusIn.bind(this);
        this.handleFocusOut = this.handleFocusOut.bind(this);
        this.updateFocusableElements = this.updateFocusableElements.bind(this);
    }

    /**
     * Initialize keyboard navigation
     */
    async init() {
        try {
            if (this.config.skipLinks) {
                this.createSkipLinks();
            }
            
            this.updateFocusableElements();
            this.setupEventListeners();
            this.setupAriaLiveRegion();
            this.initialized = true;

            console.log('✅ KeyboardNavigation initialized');
        } catch (error) {
            console.error('❌ KeyboardNavigation initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create skip links for accessibility
     */
    createSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.setAttribute('role', 'navigation');
        skipLinks.setAttribute('aria-label', 'Skip links');
        
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#search" class="skip-link">Skip to search</a>
            <a href="#categories" class="skip-link">Skip to categories</a>
            <a href="#benchmarks" class="skip-link">Skip to benchmarks</a>
        `;

        document.body.insertBefore(skipLinks, document.body.firstChild);

        // Add main content landmark if it doesn't exist
        let mainContent = document.getElementById('main-content');
        if (!mainContent) {
            const contentArea = document.querySelector('.content') || document.querySelector('main');
            if (contentArea) {
                contentArea.id = 'main-content';
            }
        }
    }

    /**
     * Set up ARIA live region for announcements
     */
    setupAriaLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.className = 'sr-only';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(liveRegion);

        this.liveRegion = liveRegion;
    }

    /**
     * Update focusable elements list
     */
    updateFocusableElements() {
        const selector = this.config.focusableElements.join(', ');
        const elements = Array.from(document.querySelectorAll(selector))
            .filter(el => this.isElementFocusable(el));

        this.focusableElements = elements;
        this.updateCurrentFocusIndex();
    }

    /**
     * Check if element is focusable
     */
    isElementFocusable(element) {
        // Skip hidden elements
        if (element.offsetParent === null || 
            getComputedStyle(element).display === 'none' ||
            getComputedStyle(element).visibility === 'hidden') {
            return false;
        }

        // Skip disabled elements
        if (element.disabled || element.getAttribute('aria-disabled') === 'true') {
            return false;
        }

        // Skip elements with tabindex="-1" unless they have focus
        if (element.tabIndex === -1 && element !== document.activeElement) {
            return false;
        }

        return true;
    }

    /**
     * Update current focus index
     */
    updateCurrentFocusIndex() {
        const activeElement = document.activeElement;
        this.currentFocusIndex = this.focusableElements.indexOf(activeElement);
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        document.addEventListener('focusin', this.handleFocusIn);
        document.addEventListener('focusout', this.handleFocusOut);

        // Update focusable elements when DOM changes
        if (window.MutationObserver) {
            this.mutationObserver = new MutationObserver(() => {
                this.updateFocusableElements();
            });

            this.mutationObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['disabled', 'aria-disabled', 'tabindex', 'hidden']
            });
        }

        // Listen for navigation mode changes
        document.addEventListener('navigation:mode', (event) => {
            this.setNavigationMode(event.detail.mode);
        });

        // Listen for focus requests
        document.addEventListener('focus:request', (event) => {
            this.focusElement(event.detail.selector || event.detail.element);
        });

        // Listen for announcements
        document.addEventListener('announce', (event) => {
            this.announce(event.detail.message);
        });
    }

    /**
     * Handle keydown events
     */
    handleKeyDown(event) {
        const { key, ctrlKey, altKey, shiftKey, metaKey } = event;
        
        // Track key sequence for multi-key shortcuts
        this.addToKeySequence(key);

        // Handle modifiers
        if (ctrlKey || altKey || metaKey) {
            return this.handleModifierShortcuts(event);
        }

        // Get action for key
        const action = this.config.shortcuts[key];
        if (!action) return;

        // Handle different navigation modes
        switch (this.navigationMode) {
            case 'search':
                return this.handleSearchModeKey(event, action);
            case 'modal':
                return this.handleModalModeKey(event, action);
            default:
                return this.handleDefaultModeKey(event, action);
        }
    }

    /**
     * Handle keyup events
     */
    handleKeyUp(event) {
        // Clear sequence timer
        if (this.sequenceTimeout) {
            clearTimeout(this.sequenceTimeout);
        }

        // Reset key sequence after delay
        this.sequenceTimeout = setTimeout(() => {
            this.keySequence = [];
        }, 1000);
    }

    /**
     * Add key to sequence
     */
    addToKeySequence(key) {
        this.keySequence.push(key);
        
        // Limit sequence length
        if (this.keySequence.length > 3) {
            this.keySequence = this.keySequence.slice(-3);
        }
    }

    /**
     * Handle modifier shortcuts
     */
    handleModifierShortcuts(event) {
        const { key, ctrlKey, altKey, shiftKey } = event;

        // Ctrl + shortcuts
        if (ctrlKey && !altKey) {
            switch (key) {
                case 'f':
                    event.preventDefault();
                    this.focusSearch();
                    return;
                case 'k':
                    event.preventDefault();
                    this.focusSearch();
                    return;
                case '/':
                    event.preventDefault();
                    this.focusSearch();
                    return;
                case '1':
                case '2':
                case '3':
                    event.preventDefault();
                    this.switchToCategory(parseInt(key) - 1);
                    return;
            }
        }

        // Alt + shortcuts
        if (altKey && !ctrlKey) {
            switch (key) {
                case 'h':
                    event.preventDefault();
                    this.showHelp();
                    return;
                case 'f':
                    event.preventDefault();
                    this.toggleFilters();
                    return;
            }
        }

        // Shift + Tab for reverse tab navigation
        if (shiftKey && key === 'Tab') {
            event.preventDefault();
            this.focusPrevious();
            return;
        }
    }

    /**
     * Handle default mode keys
     */
    handleDefaultModeKey(event, action) {
        switch (action) {
            case 'search':
                event.preventDefault();
                this.focusSearch();
                break;

            case 'help':
                event.preventDefault();
                this.showHelp();
                break;

            case 'home':
                event.preventDefault();
                this.focusHome();
                break;

            case 'easy':
                event.preventDefault();
                this.switchToCategory('Easy');
                break;

            case 'medium':
                event.preventDefault();
                this.switchToCategory('Medium');
                break;

            case 'hard':
                event.preventDefault();
                this.switchToCategory('Hard');
                break;

            case 'filter':
                event.preventDefault();
                this.toggleFilters();
                break;

            case 'escape':
                this.handleEscape();
                break;

            case 'activate':
                if (event.target.matches('button, [role="button"], a, [role="link"]')) {
                    // Let default behavior handle activation
                    return;
                }
                event.preventDefault();
                this.activateCurrentElement();
                break;

            case 'up':
                event.preventDefault();
                this.navigateUp();
                break;

            case 'down':
                event.preventDefault();
                this.navigateDown();
                break;

            case 'left':
                event.preventDefault();
                this.navigateLeft();
                break;

            case 'right':
                event.preventDefault();
                this.navigateRight();
                break;

            case 'tab':
                if (event.shiftKey) {
                    event.preventDefault();
                    this.focusPrevious();
                } else {
                    event.preventDefault();
                    this.focusNext();
                }
                break;

            case 'first':
                event.preventDefault();
                this.focusFirst();
                break;

            case 'last':
                event.preventDefault();
                this.focusLast();
                break;

            case 'pageUp':
                event.preventDefault();
                this.pageUp();
                break;

            case 'pageDown':
                event.preventDefault();
                this.pageDown();
                break;
        }
    }

    /**
     * Handle search mode keys
     */
    handleSearchModeKey(event, action) {
        switch (action) {
            case 'escape':
                event.preventDefault();
                this.exitSearchMode();
                break;

            case 'up':
            case 'down':
                event.preventDefault();
                // Navigate search results
                this.navigateSearchResults(action === 'down' ? 1 : -1);
                break;
        }
    }

    /**
     * Handle modal mode keys
     */
    handleModalModeKey(event, action) {
        switch (action) {
            case 'escape':
                event.preventDefault();
                this.closeModal();
                break;

            case 'tab':
                if (this.config.focusTrap) {
                    event.preventDefault();
                    this.trapFocus(event.shiftKey);
                }
                break;
        }
    }

    /**
     * Navigation methods
     */
    navigateUp() {
        const current = document.activeElement;
        
        // Try contextual navigation first
        if (current.matches('.benchmark-item')) {
            this.navigateBenchmarks(-1);
        } else if (current.matches('.category-btn')) {
            this.navigateCategories(-1);
        } else {
            this.focusPrevious();
        }
    }

    navigateDown() {
        const current = document.activeElement;
        
        if (current.matches('.benchmark-item')) {
            this.navigateBenchmarks(1);
        } else if (current.matches('.category-btn')) {
            this.navigateCategories(1);
        } else {
            this.focusNext();
        }
    }

    navigateLeft() {
        const current = document.activeElement;
        
        if (current.matches('.category-btn')) {
            this.navigateCategories(-1);
        } else {
            this.focusPrevious();
        }
    }

    navigateRight() {
        const current = document.activeElement;
        
        if (current.matches('.category-btn')) {
            this.navigateCategories(1);
        } else {
            this.focusNext();
        }
    }

    /**
     * Navigate within benchmark items
     */
    navigateBenchmarks(direction) {
        const benchmarks = Array.from(document.querySelectorAll('.benchmark-item:not([style*="display: none"])'));
        const current = document.activeElement.closest('.benchmark-item');
        const currentIndex = benchmarks.indexOf(current);
        
        if (currentIndex === -1) return;
        
        const newIndex = currentIndex + direction;
        const target = benchmarks[newIndex];
        
        if (target) {
            this.focusElement(target);
            this.announce(`Benchmark ${newIndex + 1} of ${benchmarks.length}`);
        }
    }

    /**
     * Navigate within category buttons
     */
    navigateCategories(direction) {
        const categories = Array.from(document.querySelectorAll('.category-btn'));
        const current = document.activeElement;
        const currentIndex = categories.indexOf(current);
        
        if (currentIndex === -1) return;
        
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = categories.length - 1;
        if (newIndex >= categories.length) newIndex = 0;
        
        const target = categories[newIndex];
        if (target) {
            this.focusElement(target);
            this.announce(`${target.textContent} category`);
        }
    }

    /**
     * Focus management methods
     */
    focusNext() {
        this.updateFocusableElements();
        
        if (this.focusableElements.length === 0) return;
        
        let nextIndex = this.currentFocusIndex + 1;
        if (nextIndex >= this.focusableElements.length) {
            nextIndex = 0;
        }
        
        this.focusElementAtIndex(nextIndex);
    }

    focusPrevious() {
        this.updateFocusableElements();
        
        if (this.focusableElements.length === 0) return;
        
        let prevIndex = this.currentFocusIndex - 1;
        if (prevIndex < 0) {
            prevIndex = this.focusableElements.length - 1;
        }
        
        this.focusElementAtIndex(prevIndex);
    }

    focusFirst() {
        if (this.focusableElements.length > 0) {
            this.focusElementAtIndex(0);
        }
    }

    focusLast() {
        if (this.focusableElements.length > 0) {
            this.focusElementAtIndex(this.focusableElements.length - 1);
        }
    }

    focusElementAtIndex(index) {
        const element = this.focusableElements[index];
        if (element) {
            this.focusElement(element);
            this.currentFocusIndex = index;
        }
    }

    /**
     * Focus element by selector or element
     */
    focusElement(elementOrSelector) {
        let element;
        
        if (typeof elementOrSelector === 'string') {
            element = document.querySelector(elementOrSelector);
        } else {
            element = elementOrSelector;
        }
        
        if (element && this.isElementFocusable(element)) {
            // Add to focus history
            this.addToFocusHistory(document.activeElement);
            
            element.focus();
            
            // Scroll into view if needed
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
        }
    }

    /**
     * Specific focus methods
     */
    focusSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            this.focusElement(searchInput);
            this.setNavigationMode('search');
            this.announce('Search focused');
        }
    }

    focusHome() {
        const homeElement = document.querySelector('.title, h1') || 
                           document.querySelector('#main-content') ||
                           document.body;
        this.focusElement(homeElement);
        this.announce('Moved to top of page');
    }

    switchToCategory(categoryOrIndex) {
        let category;
        
        if (typeof categoryOrIndex === 'number') {
            const categories = ['Easy', 'Medium', 'Hard'];
            category = categories[categoryOrIndex];
        } else {
            category = categoryOrIndex;
        }
        
        if (category) {
            this.dispatchEvent('category:set', { category });
            this.announce(`Switched to ${category} category`);
        }
    }

    /**
     * Page navigation
     */
    pageUp() {
        const viewportHeight = window.innerHeight;
        window.scrollBy(0, -viewportHeight * 0.8);
        this.announce('Scrolled up one page');
    }

    pageDown() {
        const viewportHeight = window.innerHeight;
        window.scrollBy(0, viewportHeight * 0.8);
        this.announce('Scrolled down one page');
    }

    /**
     * Modal and search handling
     */
    showHelp() {
        this.announce('Keyboard shortcuts: Use arrow keys to navigate, Enter to activate, Escape to close, / to search');
        
        // Could trigger help modal here
        this.dispatchEvent('help:show');
    }

    toggleFilters() {
        const filterSection = document.querySelector('.filter-section');
        if (filterSection) {
            const isVisible = getComputedStyle(filterSection).display !== 'none';
            filterSection.style.display = isVisible ? 'none' : 'block';
            this.announce(isVisible ? 'Filters hidden' : 'Filters shown');
        }
    }

    handleEscape() {
        // Clear search if in search mode
        if (this.navigationMode === 'search') {
            this.exitSearchMode();
            return;
        }

        // Close modals, dropdowns, etc.
        this.dispatchEvent('escape:pressed');
        
        // Return focus to main content
        this.focusHome();
    }

    exitSearchMode() {
        this.setNavigationMode('default');
        
        // Clear search if desired
        const searchInput = document.querySelector('.search-input');
        if (searchInput && searchInput.value) {
            this.dispatchEvent('search:clear');
        }
        
        this.focusHome();
        this.announce('Exited search mode');
    }

    closeModal() {
        this.dispatchEvent('modal:close');
        this.restoreFocus();
    }

    /**
     * Focus trap for modals
     */
    trapFocus(reverse = false) {
        const focusableInModal = document.querySelectorAll('.modal [tabindex], .modal button, .modal input, .modal select, .modal textarea, .modal a[href]');
        const focusableArray = Array.from(focusableInModal);
        
        if (focusableArray.length === 0) return;
        
        const currentIndex = focusableArray.indexOf(document.activeElement);
        let nextIndex;
        
        if (reverse) {
            nextIndex = currentIndex <= 0 ? focusableArray.length - 1 : currentIndex - 1;
        } else {
            nextIndex = currentIndex >= focusableArray.length - 1 ? 0 : currentIndex + 1;
        }
        
        focusableArray[nextIndex].focus();
    }

    /**
     * Focus history management
     */
    addToFocusHistory(element) {
        if (element && element !== document.body) {
            this.focusHistory.push(element);
            
            // Limit history size
            if (this.focusHistory.length > 10) {
                this.focusHistory = this.focusHistory.slice(-10);
            }
        }
    }

    restoreFocus() {
        const previousElement = this.focusHistory.pop();
        if (previousElement && this.isElementFocusable(previousElement)) {
            this.focusElement(previousElement);
        } else {
            this.focusHome();
        }
    }

    /**
     * Navigation mode management
     */
    setNavigationMode(mode) {
        this.navigationMode = mode;
        document.body.dataset.navigationMode = mode;
        
        this.dispatchEvent('navigation:mode-changed', { mode });
    }

    /**
     * Activate current element
     */
    activateCurrentElement() {
        const current = document.activeElement;
        
        if (current.matches('button, [role="button"]')) {
            current.click();
        } else if (current.matches('a, [role="link"]')) {
            current.click();
        } else if (current.matches('input[type="checkbox"], input[type="radio"]')) {
            current.click();
        } else if (current.matches('.benchmark-item')) {
            // Toggle completion for benchmark
            const toggleBtn = current.querySelector('[data-action="toggle-completion"]');
            if (toggleBtn) {
                toggleBtn.click();
            }
        }
    }

    /**
     * Handle focus events
     */
    handleFocusIn(event) {
        this.updateCurrentFocusIndex();
        
        // Announce focused element if it has aria-label or title
        const element = event.target;
        const announcement = element.getAttribute('aria-label') || 
                           element.getAttribute('title') ||
                           this.getElementDescription(element);
        
        if (announcement && element !== document.body) {
            // Debounce announcements
            clearTimeout(this.announceTimeout);
            this.announceTimeout = setTimeout(() => {
                this.announce(announcement);
            }, 100);
        }
    }

    handleFocusOut(event) {
        // Clear announcement timeout
        if (this.announceTimeout) {
            clearTimeout(this.announceTimeout);
        }
    }

    /**
     * Get description of element for screen readers
     */
    getElementDescription(element) {
        if (element.matches('.benchmark-item')) {
            const title = element.querySelector('.benchmark-title')?.textContent;
            const points = element.querySelector('.benchmark-points')?.textContent;
            return `Benchmark: ${title}, ${points}`;
        }
        
        if (element.matches('.category-btn')) {
            return `Category: ${element.textContent}`;
        }
        
        if (element.matches('.search-input')) {
            return 'Search benchmarks';
        }
        
        return element.textContent?.trim() || element.value || '';
    }

    /**
     * Announce message to screen readers
     */
    announce(message) {
        if (this.liveRegion && message) {
            this.liveRegion.textContent = message;
            
            // Clear after a delay to allow re-announcement of same message
            setTimeout(() => {
                this.liveRegion.textContent = '';
            }, 1000);
        }
    }

    /**
     * Search results navigation
     */
    navigateSearchResults(direction) {
        const results = Array.from(document.querySelectorAll('.benchmark-item:not([style*="display: none"])'));
        const current = document.activeElement.closest('.benchmark-item');
        let currentIndex = results.indexOf(current);
        
        if (currentIndex === -1) {
            currentIndex = direction > 0 ? -1 : results.length;
        }
        
        const newIndex = currentIndex + direction;
        const target = results[newIndex];
        
        if (target) {
            this.focusElement(target);
            this.announce(`Result ${newIndex + 1} of ${results.length}`);
        }
    }

    /**
     * Get navigation stats
     */
    getNavigationStats() {
        return {
            focusableElementsCount: this.focusableElements.length,
            currentFocusIndex: this.currentFocusIndex,
            navigationMode: this.navigationMode,
            focusHistoryLength: this.focusHistory.length
        };
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(type, detail = {}) {
        const event = new CustomEvent(type, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Destroy keyboard navigation
     */
    destroy() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('focusin', this.handleFocusIn);
        document.removeEventListener('focusout', this.handleFocusOut);

        // Cleanup mutation observer
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }

        // Clear timeouts
        if (this.sequenceTimeout) {
            clearTimeout(this.sequenceTimeout);
        }
        if (this.announceTimeout) {
            clearTimeout(this.announceTimeout);
        }

        // Remove live region
        if (this.liveRegion) {
            this.liveRegion.remove();
        }

        // Clear data
        this.focusableElements = [];
        this.focusHistory = [];
        this.keySequence = [];
        this.initialized = false;
    }
}