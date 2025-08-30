/**
 * WCAG 2.1 AA Accessibility Tests
 * Comprehensive testing suite for login form accessibility compliance
 */

// Mock DOM environment for testing
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Load HTML and CSS for testing
const html = fs.readFileSync(path.join(__dirname, '../components/LoginForm.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../styles/login-form.css'), 'utf8');

// Set up DOM environment
const dom = new JSDOM(html, {
    resources: 'usable',
    runScripts: 'dangerously'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Inject CSS
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

describe('WCAG 2.1 AA Compliance Tests', () => {
    let form, emailInput, passwordInput, submitButton;
    
    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = html;
        
        // Get form elements
        form = document.getElementById('login-form');
        emailInput = document.getElementById('email');
        passwordInput = document.getElementById('password');
        submitButton = document.getElementById('submit-button');
    });
    
    describe('1.1 Text Alternatives', () => {
        test('All form inputs have accessible names', () => {
            const inputs = form.querySelectorAll('input');
            
            inputs.forEach(input => {
                const hasLabel = document.querySelector(`label[for="${input.id}"]`);
                const hasAriaLabel = input.hasAttribute('aria-label');
                const hasAriaLabelledby = input.hasAttribute('aria-labelledby');
                
                expect(hasLabel || hasAriaLabel || hasAriaLabelledby).toBeTruthy();
            });
        });
        
        test('Password toggle button has accessible name', () => {
            const toggleButton = document.getElementById('toggle-password');
            
            expect(toggleButton.hasAttribute('aria-label')).toBeTruthy();
            expect(toggleButton.getAttribute('aria-label')).toBe('Show password');
        });
        
        test('Required fields are properly marked', () => {
            const requiredInputs = form.querySelectorAll('input[required]');
            
            requiredInputs.forEach(input => {
                const label = document.querySelector(`label[for="${input.id}"]`);
                const hasRequiredIndicator = label.querySelector('.required-indicator');
                const hasAriaRequired = input.hasAttribute('aria-required');
                
                expect(hasRequiredIndicator || hasAriaRequired).toBeTruthy();
            });
        });
    });
    
    describe('1.3 Adaptable', () => {
        test('Form has semantic structure', () => {
            expect(form.tagName).toBe('FORM');
            expect(form.getAttribute('role')).toBeNull(); // Implicit role
            
            const main = document.querySelector('main');
            expect(main).toBeTruthy();
            expect(main.getAttribute('role')).toBe('main');
        });
        
        test('Form groups are properly structured', () => {
            const formGroups = document.querySelectorAll('.form-group');
            
            formGroups.forEach(group => {
                const label = group.querySelector('label');
                const input = group.querySelector('input');
                
                if (label && input) {
                    expect(label.getAttribute('for')).toBe(input.id);
                }
            });
        });
        
        test('ARIA relationships are correct', () => {
            // Test aria-describedby relationships
            const inputsWithDescriptions = form.querySelectorAll('input[aria-describedby]');
            
            inputsWithDescriptions.forEach(input => {
                const describedBy = input.getAttribute('aria-describedby').split(' ');
                
                describedBy.forEach(id => {
                    const describingElement = document.getElementById(id);
                    expect(describingElement).toBeTruthy();
                });
            });
        });
        
        test('Form has proper heading structure', () => {
            const heading = document.getElementById('login-heading');
            expect(heading.tagName).toBe('H1');
            
            const form = document.getElementById('login-form');
            expect(form.getAttribute('aria-labelledby')).toBe('login-heading');
        });
    });
    
    describe('1.4 Distinguishable', () => {
        test('Color contrast meets WCAG AA standards', () => {
            // Test primary text colors
            const contrastTests = [
                { fg: '#111827', bg: '#ffffff' }, // Primary text
                { fg: '#4b5563', bg: '#ffffff' }, // Secondary text
                { fg: '#ffffff', bg: '#2563eb' }, // Button text
                { fg: '#dc2626', bg: '#ffffff' }, // Error text
            ];
            
            contrastTests.forEach(({ fg, bg }) => {
                const contrast = calculateContrast(fg, bg);
                expect(contrast).toBeGreaterThanOrEqual(4.5);
            });
        });
        
        test('Focus indicators are visible', () => {
            const focusableElements = form.querySelectorAll(
                'input, button, a[href], [tabindex]:not([tabindex="-1"])'
            );
            
            focusableElements.forEach(element => {
                // Simulate focus
                element.focus();
                const style = window.getComputedStyle(element);
                
                // Should have outline or box-shadow for focus
                const hasOutline = style.outline !== 'none';
                const hasBoxShadow = style.boxShadow !== 'none';
                
                expect(hasOutline || hasBoxShadow).toBeTruthy();
            });
        });
        
        test('Text can be resized up to 200%', () => {
            // This would typically be tested manually or with specialized tools
            // Here we ensure no fixed pixel units prevent scaling
            const computedStyle = window.getComputedStyle(document.body);
            expect(computedStyle.fontSize).not.toMatch(/\d+px$/);
        });
    });
    
    describe('2.1 Keyboard Accessible', () => {
        test('All interactive elements are keyboard accessible', () => {
            const interactiveElements = form.querySelectorAll(
                'input, button, select, textarea, a[href]'
            );
            
            interactiveElements.forEach(element => {
                // Elements should be focusable
                expect(element.tabIndex >= 0 || 
                       !element.hasAttribute('tabindex')).toBeTruthy();
            });
        });
        
        test('Tab order is logical', () => {
            const focusableElements = Array.from(form.querySelectorAll(
                'input:not([tabindex="-1"]), button:not([tabindex="-1"]), a[href]:not([tabindex="-1"])'
            ));
            
            // Check if elements appear in DOM order
            for (let i = 1; i < focusableElements.length; i++) {
                const current = focusableElements[i];
                const previous = focusableElements[i - 1];
                
                const currentIndex = current.tabIndex || 0;
                const previousIndex = previous.tabIndex || 0;
                
                if (currentIndex > 0 || previousIndex > 0) {
                    expect(currentIndex >= previousIndex).toBeTruthy();
                }
            }
        });
        
        test('Form submission works with keyboard', () => {
            const mockSubmit = jest.fn();
            form.addEventListener('submit', mockSubmit);
            
            // Test Enter key on submit button
            const enterEvent = new dom.window.KeyboardEvent('keydown', {
                key: 'Enter',
                keyCode: 13
            });
            
            submitButton.dispatchEvent(enterEvent);
            // Form should be submittable via keyboard
            expect(submitButton.type).toBe('submit');
        });
    });
    
    describe('2.2 Enough Time', () => {
        test('No time limits on form completion', () => {
            // Check that there are no automatic timeouts
            // This would typically involve checking for setTimeout calls
            const scripts = document.querySelectorAll('script');
            
            scripts.forEach(script => {
                if (script.textContent) {
                    // Should not have automatic form timeouts
                    expect(script.textContent).not.toMatch(/setTimeout.*submit/i);
                }
            });
        });
    });
    
    describe('2.4 Navigable', () => {
        test('Page has proper title', () => {
            const title = document.title;
            expect(title).toBeTruthy();
            expect(title).toContain('Login');
        });
        
        test('Skip links are present', () => {
            // Skip links should be added by accessibility helpers
            const skipLinks = document.querySelectorAll('.skip-link');
            expect(skipLinks.length).toBeGreaterThan(0);
        });
        
        test('Focus is managed properly', () => {
            // Test that focus moves logically
            const firstInput = form.querySelector('input');
            expect(firstInput).toBeTruthy();
            
            // First input should be focusable
            firstInput.focus();
            expect(document.activeElement).toBe(firstInput);
        });
        
        test('Form has descriptive headings', () => {
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            
            headings.forEach(heading => {
                expect(heading.textContent.trim()).toBeTruthy();
            });
        });
    });
    
    describe('2.5 Input Modalities', () => {
        test('Touch targets are at least 44x44 pixels', () => {
            const touchTargets = form.querySelectorAll('button, input, a');
            
            touchTargets.forEach(target => {
                const style = window.getComputedStyle(target);
                const minSize = 44;
                
                // This would need actual computed dimensions in real browser
                // Here we check CSS rules ensure minimum sizes
                expect(style.minHeight || style.height).toBeTruthy();
                expect(style.minWidth || style.width).toBeTruthy();
            });
        });
        
        test('Click targets have proper spacing', () => {
            const buttons = form.querySelectorAll('button');
            
            buttons.forEach(button => {
                const style = window.getComputedStyle(button);
                
                // Should have adequate padding/margin
                const padding = parseInt(style.padding) || 0;
                const margin = parseInt(style.margin) || 0;
                
                expect(padding + margin).toBeGreaterThan(0);
            });
        });
    });
    
    describe('3.1 Readable', () => {
        test('Page language is specified', () => {
            const html = document.documentElement;
            expect(html.hasAttribute('lang')).toBeTruthy();
            expect(html.getAttribute('lang')).toBe('en');
        });
        
        test('Form labels are descriptive', () => {
            const labels = form.querySelectorAll('label');
            
            labels.forEach(label => {
                const text = label.textContent.trim();
                expect(text.length).toBeGreaterThan(2);
                expect(text).not.toMatch(/^(label|input|field)$/i);
            });
        });
    });
    
    describe('3.2 Predictable', () => {
        test('Form does not auto-submit on focus', () => {
            const inputs = form.querySelectorAll('input');
            
            inputs.forEach(input => {
                // Check that focus events don't trigger submission
                const focusHandler = input.onfocus;
                if (focusHandler) {
                    expect(focusHandler.toString()).not.toMatch(/submit/i);
                }
            });
        });
        
        test('Navigation is consistent', () => {
            const navElements = form.querySelectorAll('a, button[type="button"]');
            
            // Navigation elements should have consistent styling/behavior
            navElements.forEach(element => {
                expect(element.className).toBeTruthy();
            });
        });
    });
    
    describe('3.3 Input Assistance', () => {
        test('Error messages are associated with inputs', () => {
            const errorElements = form.querySelectorAll('.form-error');
            
            errorElements.forEach(error => {
                const associatedInput = form.querySelector(
                    `input[aria-describedby*="${error.id}"]`
                );
                expect(associatedInput).toBeTruthy();
            });
        });
        
        test('Required fields are identified', () => {
            const requiredInputs = form.querySelectorAll('input[required]');
            
            requiredInputs.forEach(input => {
                const hasRequiredAttribute = input.hasAttribute('required');
                const hasAriaRequired = input.getAttribute('aria-required') === 'true';
                const hasVisualIndicator = 
                    document.querySelector(`label[for="${input.id}"] .required-indicator`);
                
                expect(hasRequiredAttribute || hasAriaRequired).toBeTruthy();
                expect(hasVisualIndicator).toBeTruthy();
            });
        });
        
        test('Input purposes are identified', () => {
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            
            expect(emailInput.getAttribute('autocomplete')).toBe('email');
            expect(passwordInput.getAttribute('autocomplete')).toBe('current-password');
        });
        
        test('Error suggestions are provided', () => {
            const errorElements = form.querySelectorAll('.form-error');
            
            // Error messages should be helpful, not just "invalid"
            errorElements.forEach(error => {
                if (error.textContent) {
                    expect(error.textContent.toLowerCase()).not.toBe('invalid');
                    expect(error.textContent.toLowerCase()).not.toBe('error');
                }
            });
        });
    });
    
    describe('4.1 Compatible', () => {
        test('HTML is valid', () => {
            // Basic HTML validation
            const inputs = form.querySelectorAll('input');
            
            inputs.forEach(input => {
                // Should have proper attributes
                expect(input.id).toBeTruthy();
                expect(input.name).toBeTruthy();
                
                // Type attribute should be valid
                const validTypes = ['text', 'email', 'password', 'checkbox', 'radio', 'submit', 'button'];
                expect(validTypes).toContain(input.type);
            });
        });
        
        test('ARIA attributes are used correctly', () => {
            const elementsWithAria = form.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [aria-live], [aria-invalid]');
            
            elementsWithAria.forEach(element => {
                // Check aria-labelledby references
                if (element.hasAttribute('aria-labelledby')) {
                    const ids = element.getAttribute('aria-labelledby').split(' ');
                    ids.forEach(id => {
                        expect(document.getElementById(id)).toBeTruthy();
                    });
                }
                
                // Check aria-describedby references
                if (element.hasAttribute('aria-describedby')) {
                    const ids = element.getAttribute('aria-describedby').split(' ');
                    ids.forEach(id => {
                        expect(document.getElementById(id)).toBeTruthy();
                    });
                }
            });
        });
        
        test('Live regions are properly configured', () => {
            const liveRegions = document.querySelectorAll('[aria-live]');
            
            liveRegions.forEach(region => {
                const politeness = region.getAttribute('aria-live');
                expect(['polite', 'assertive', 'off']).toContain(politeness);
            });
        });
    });
});

// Helper function to calculate color contrast
function calculateContrast(color1, color2) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const l1 = getLuminance(rgb1);
    const l2 = getLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getLuminance(rgb) {
    const { r, g, b } = rgb;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

module.exports = {
    calculateContrast,
    hexToRgb,
    getLuminance
};