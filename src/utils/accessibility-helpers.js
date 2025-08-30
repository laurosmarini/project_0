/**
 * Accessibility Helper Functions
 * WCAG 2.1 AA compliance utilities and screen reader support
 */

class AccessibilityHelpers {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupHighContrastDetection();
        this.setupReducedMotionDetection();
        this.setupScreenReaderDetection();
        this.setupFocusManagement();
        this.createSkipLinks();
    }
    
    /**
     * Detect and handle high contrast mode preference
     */
    setupHighContrastDetection() {
        const highContrastMedia = window.matchMedia('(prefers-contrast: high)');
        
        const handleHighContrast = (e) => {
            if (e.matches) {
                document.body.classList.add('high-contrast');
                this.announceToUser('High contrast mode is active');
            } else {
                document.body.classList.remove('high-contrast');
            }
        };
        
        handleHighContrast(highContrastMedia);
        highContrastMedia.addListener(handleHighContrast);
    }
    
    /**
     * Detect and handle reduced motion preference
     */
    setupReducedMotionDetection() {
        const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleReducedMotion = (e) => {
            if (e.matches) {
                document.body.classList.add('reduced-motion');
                // Disable smooth scrolling
                document.documentElement.style.scrollBehavior = 'auto';
            } else {
                document.body.classList.remove('reduced-motion');
                document.documentElement.style.scrollBehavior = '';
            }
        };
        
        handleReducedMotion(reducedMotionMedia);
        reducedMotionMedia.addListener(handleReducedMotion);
    }
    
    /**
     * Detect screen reader usage
     */
    setupScreenReaderDetection() {
        // Simple screen reader detection
        const isScreenReader = navigator.userAgent.includes('NVDA') ||
                              navigator.userAgent.includes('JAWS') ||
                              navigator.userAgent.includes('VoiceOver') ||
                              window.speechSynthesis ||
                              navigator.maxTouchPoints === 0 && navigator.userAgent.includes('Windows');
        
        if (isScreenReader) {
            document.body.classList.add('screen-reader-active');
        }
    }
    
    /**
     * Enhanced focus management
     */
    setupFocusManagement() {
        // Track focus method (mouse vs keyboard)
        let isMouseUser = false;
        
        document.addEventListener('mousedown', () => {
            isMouseUser = true;
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                isMouseUser = false;
            }
        });
        
        // Enhanced focus indicators for keyboard users
        document.addEventListener('focusin', (e) => {
            if (!isMouseUser) {
                e.target.classList.add('keyboard-focus');
            }
        });
        
        document.addEventListener('focusout', (e) => {
            e.target.classList.remove('keyboard-focus');
        });
        
        // Focus restoration after dynamic content changes
        this.focusStack = [];
    }
    
    /**
     * Create skip navigation links
     */
    createSkipLinks() {
        const skipContainer = document.createElement('div');
        skipContainer.className = 'skip-links';
        skipContainer.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#login-form" class="skip-link">Skip to login form</a>
        `;
        
        // Insert at the beginning of the body
        document.body.insertBefore(skipContainer, document.body.firstChild);
        
        // Style skip links
        const style = document.createElement('style');
        style.textContent = `
            .skip-links {
                position: absolute;
                top: -100px;
                left: 0;
                z-index: 1000;
            }
            
            .skip-link {
                position: absolute;
                left: -10000px;
                top: auto;
                width: 1px;
                height: 1px;
                overflow: hidden;
                background: #000;
                color: #fff;
                padding: 8px 16px;
                text-decoration: none;
                font-weight: bold;
                border-radius: 0 0 4px 4px;
            }
            
            .skip-link:focus {
                position: static;
                width: auto;
                height: auto;
                left: 0;
                top: 0;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Announce messages to screen readers
     */
    announceToUser(message, priority = 'polite') {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 2000);
    }
    
    /**
     * Save focus position
     */
    saveFocus() {
        this.focusStack.push(document.activeElement);
    }
    
    /**
     * Restore focus position
     */
    restoreFocus() {
        if (this.focusStack.length > 0) {
            const element = this.focusStack.pop();
            if (element && element.focus) {
                element.focus();
            }
        }
    }
    
    /**
     * Validate color contrast
     */
    validateContrast(foreground, background) {
        // Convert colors to RGB
        const rgb1 = this.hexToRgb(foreground);
        const rgb2 = this.hexToRgb(background);
        
        // Calculate relative luminance
        const l1 = this.getLuminance(rgb1);
        const l2 = this.getLuminance(rgb2);
        
        // Calculate contrast ratio
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        const contrast = (lighter + 0.05) / (darker + 0.05);
        
        return {
            ratio: contrast,
            aa: contrast >= 4.5,
            aaa: contrast >= 7
        };
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    getLuminance(rgb) {
        const { r, g, b } = rgb;
        
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }
    
    /**
     * Check if element is visible to assistive technology
     */
    isVisibleToAT(element) {
        const style = window.getComputedStyle(element);
        
        // Hidden via CSS
        if (style.display === 'none' || style.visibility === 'hidden') {
            return false;
        }
        
        // Hidden via aria-hidden
        if (element.getAttribute('aria-hidden') === 'true') {
            return false;
        }
        
        // Check if element has content
        const hasContent = element.textContent.trim() !== '' || 
                          element.hasAttribute('aria-label') ||
                          element.hasAttribute('aria-labelledby');
        
        return hasContent;
    }
    
    /**
     * Generate unique ID for ARIA relationships
     */
    generateId(prefix = 'aria') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Set up aria-describedby relationships
     */
    setupAriaDescribedBy(control, descriptions) {
        const ids = descriptions.map(desc => {
            if (typeof desc === 'string') {
                // Create description element
                const id = this.generateId('desc');
                const element = document.createElement('div');
                element.id = id;
                element.className = 'sr-only';
                element.textContent = desc;
                control.parentNode.appendChild(element);
                return id;
            }
            return desc.id;
        });
        
        control.setAttribute('aria-describedby', ids.join(' '));
    }
    
    /**
     * Validate form accessibility
     */
    validateFormAccessibility(form) {
        const issues = [];
        
        // Check for labels
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            const label = form.querySelector(`label[for="${input.id}"]`);
            const ariaLabel = input.getAttribute('aria-label');
            const ariaLabelledby = input.getAttribute('aria-labelledby');
            
            if (!label && !ariaLabel && !ariaLabelledby) {
                issues.push(`Input ${input.name || input.id} missing label`);
            }
        });
        
        // Check for fieldsets on radio/checkbox groups
        const radioGroups = {};
        const radios = form.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            if (!radioGroups[radio.name]) {
                radioGroups[radio.name] = [];
            }
            radioGroups[radio.name].push(radio);
        });
        
        Object.keys(radioGroups).forEach(groupName => {
            if (radioGroups[groupName].length > 1) {
                const fieldset = radioGroups[groupName][0].closest('fieldset');
                if (!fieldset) {
                    issues.push(`Radio group ${groupName} should be wrapped in fieldset`);
                }
            }
        });
        
        return issues;
    }
}

// WCAG Color Contrast Checker
class ContrastChecker {
    static checkElements() {
        const elements = document.querySelectorAll('*');
        const issues = [];
        
        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            const color = style.color;
            const backgroundColor = style.backgroundColor;
            
            if (color && backgroundColor && 
                backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                backgroundColor !== 'transparent') {
                
                const contrast = AccessibilityHelpers.prototype.validateContrast(
                    this.rgbToHex(color),
                    this.rgbToHex(backgroundColor)
                );
                
                if (!contrast.aa) {
                    issues.push({
                        element: el,
                        ratio: contrast.ratio,
                        color,
                        backgroundColor
                    });
                }
            }
        });
        
        return issues;
    }
    
    static rgbToHex(rgb) {
        const values = rgb.match(/\d+/g);
        if (!values || values.length < 3) return '#000000';
        
        return '#' + values.slice(0, 3)
            .map(x => parseInt(x).toString(16).padStart(2, '0'))
            .join('');
    }
}

// Initialize accessibility helpers when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const accessibilityHelpers = new AccessibilityHelpers();
    
    // Validate form accessibility in development
    if (process?.env?.NODE_ENV === 'development') {
        const form = document.getElementById('login-form');
        if (form) {
            const issues = accessibilityHelpers.validateFormAccessibility(form);
            if (issues.length > 0) {
                console.warn('Accessibility issues found:', issues);
            }
        }
        
        // Check contrast issues
        const contrastIssues = ContrastChecker.checkElements();
        if (contrastIssues.length > 0) {
            console.warn('Contrast issues found:', contrastIssues);
        }
    }
    
    console.log('Accessibility helpers initialized');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AccessibilityHelpers, ContrastChecker };
}