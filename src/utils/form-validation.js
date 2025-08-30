/**
 * WCAG 2.1 AA Compliant Form Validation
 * Provides accessible form validation with ARIA live regions and proper error handling
 */

class AccessibleFormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.statusRegion = document.getElementById('form-status');
        this.errorRegion = document.getElementById('form-errors');
        this.messagesContainer = document.getElementById('form-messages');
        
        // Validation rules
        this.validationRules = {
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                messages: {
                    required: 'Email address is required',
                    invalid: 'Please enter a valid email address'
                }
            },
            password: {
                required: true,
                minLength: 8,
                messages: {
                    required: 'Password is required',
                    minLength: 'Password must be at least 8 characters long'
                }
            }
        };
        
        // Debounce timer for real-time validation
        this.validationTimeout = null;
        
        this.init();
    }
    
    init() {
        if (!this.form) {
            console.error('Form not found');
            return;
        }
        
        this.setupEventListeners();
        this.setupPasswordToggle();
        this.setupFormSubmission();
        
        // Announce form is ready
        this.announceToScreenReader('Login form is ready. Please fill in your credentials.');
    }
    
    setupEventListeners() {
        // Real-time validation on blur and input
        const inputs = this.form.querySelectorAll('.form-input');
        
        inputs.forEach(input => {
            // Validate on blur
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            // Real-time validation with debouncing
            input.addEventListener('input', () => {
                clearTimeout(this.validationTimeout);
                this.validationTimeout = setTimeout(() => {
                    this.validateField(input, true);
                }, 500);
            });
            
            // Clear validation on focus
            input.addEventListener('focus', () => {
                this.clearFieldError(input);
            });
        });
    }
    
    setupPasswordToggle() {
        const passwordInput = document.getElementById('password');
        const toggleButton = document.getElementById('toggle-password');
        
        if (!passwordInput || !toggleButton) return;
        
        toggleButton.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            
            // Toggle password visibility
            passwordInput.type = isPassword ? 'text' : 'password';
            
            // Update button state and text
            toggleButton.setAttribute('aria-pressed', isPassword.toString());
            toggleButton.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
            toggleButton.querySelector('.toggle-text').textContent = isPassword ? 'Hide' : 'Show';
            
            // Announce change to screen readers
            this.announceToScreenReader(`Password is now ${isPassword ? 'visible' : 'hidden'}`);
            
            // Return focus to password input
            passwordInput.focus();
        });
        
        // Make toggle button focusable when password field has focus
        passwordInput.addEventListener('focus', () => {
            toggleButton.tabIndex = 0;
        });
        
        passwordInput.addEventListener('blur', (e) => {
            // Only make unfocusable if not moving to toggle button
            if (!e.relatedTarget || e.relatedTarget !== toggleButton) {
                toggleButton.tabIndex = -1;
            }
        });
    }
    
    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Clear previous messages
            this.clearAllErrors();
            this.hideMessages();
            
            // Validate all fields
            const isValid = this.validateForm();
            
            if (isValid) {
                await this.handleFormSubmission();
            } else {
                this.handleValidationErrors();
            }
        });
    }
    
    validateField(input, isRealTime = false) {
        const fieldName = input.name;
        const value = input.value.trim();
        const rules = this.validationRules[fieldName];
        
        if (!rules) return true;
        
        let isValid = true;
        let errorMessage = '';
        
        // Required validation
        if (rules.required && !value) {
            isValid = false;
            errorMessage = rules.messages.required;
        }
        // Pattern validation (email)
        else if (value && rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.messages.invalid;
        }
        // Minimum length validation
        else if (value && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = rules.messages.minLength;
        }
        
        // Update field state
        if (isValid) {
            this.clearFieldError(input);
            if (!isRealTime) {
                input.setAttribute('aria-invalid', 'false');
            }
        } else {
            this.showFieldError(input, errorMessage);
            input.setAttribute('aria-invalid', 'true');
        }
        
        return isValid;
    }
    
    validateForm() {
        const inputs = this.form.querySelectorAll('.form-input[required]');
        let isValid = true;
        let firstInvalidField = null;
        
        inputs.forEach(input => {
            const fieldValid = this.validateField(input);
            if (!fieldValid && !firstInvalidField) {
                firstInvalidField = input;
            }
            isValid = isValid && fieldValid;
        });
        
        // Focus first invalid field
        if (firstInvalidField) {
            firstInvalidField.focus();
        }
        
        return isValid;
    }
    
    showFieldError(input, message) {
        const errorId = input.getAttribute('aria-describedby').split(' ').find(id => id.includes('error'));
        const errorElement = document.getElementById(errorId);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('visible');
            
            // Update aria-describedby to include error
            const describedBy = input.getAttribute('aria-describedby') || '';
            if (!describedBy.includes(errorId)) {
                input.setAttribute('aria-describedby', describedBy + ' ' + errorId);
            }
        }
        
        // Add error styling
        input.classList.add('error');
    }
    
    clearFieldError(input) {
        const errorId = input.getAttribute('aria-describedby').split(' ').find(id => id.includes('error'));
        const errorElement = document.getElementById(errorId);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('visible');
        }
        
        // Remove error styling
        input.classList.remove('error');
        input.removeAttribute('aria-invalid');
    }
    
    clearAllErrors() {
        const errorElements = this.form.querySelectorAll('.form-error');
        const inputs = this.form.querySelectorAll('.form-input');
        
        errorElements.forEach(error => {
            error.textContent = '';
            error.classList.remove('visible');
        });
        
        inputs.forEach(input => {
            input.classList.remove('error');
            input.removeAttribute('aria-invalid');
        });
    }
    
    async handleFormSubmission() {
        const submitButton = document.getElementById('submit-button');
        const formData = new FormData(this.form);
        
        // Show loading state
        this.setLoadingState(true);
        submitButton.disabled = true;
        
        try {
            // Announce submission start
            this.announceToScreenReader('Submitting login form...');
            
            // Simulate API call
            await this.simulateApiCall(formData);
            
            // Show success message
            this.showMessage('Login successful! Redirecting...', 'success');
            
            // Simulate redirect after delay
            setTimeout(() => {
                this.announceToScreenReader('Login successful. You will be redirected to your dashboard.');
                // window.location.href = '/dashboard';
            }, 1500);
            
        } catch (error) {
            // Handle submission error
            this.showMessage('Login failed. Please check your credentials and try again.', 'error');
            this.announceError('Login failed. Please check your credentials and try again.');
        } finally {
            this.setLoadingState(false);
            submitButton.disabled = false;
        }
    }
    
    async simulateApiCall(formData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate occasional failures for demo
        if (Math.random() < 0.3) {
            throw new Error('Login failed');
        }
        
        return { success: true };
    }
    
    handleValidationErrors() {
        const errorCount = this.form.querySelectorAll('.form-error.visible').length;
        const errorText = errorCount === 1 ? 'error' : 'errors';
        
        this.announceError(`Form submission failed. Please fix ${errorCount} ${errorText} and try again.`);
        
        // Focus first field with error
        const firstErrorField = this.form.querySelector('.form-input[aria-invalid="true"]');
        if (firstErrorField) {
            firstErrorField.focus();
        }
    }
    
    setLoadingState(loading) {
        const submitButton = document.getElementById('submit-button');
        
        if (loading) {
            submitButton.classList.add('loading');
            submitButton.setAttribute('aria-describedby', 'submit-help loading-text');
            
            // Create loading announcement
            if (!document.getElementById('loading-text')) {
                const loadingText = document.createElement('span');
                loadingText.id = 'loading-text';
                loadingText.className = 'sr-only';
                loadingText.textContent = 'Please wait, submitting form...';
                submitButton.appendChild(loadingText);
            }
        } else {
            submitButton.classList.remove('loading');
            submitButton.setAttribute('aria-describedby', 'submit-help');
            
            const loadingText = document.getElementById('loading-text');
            if (loadingText) {
                loadingText.remove();
            }
        }
    }
    
    showMessage(message, type) {
        this.messagesContainer.textContent = message;
        this.messagesContainer.className = `form-messages ${type}`;
        
        // Scroll message into view
        this.messagesContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }
    
    hideMessages() {
        this.messagesContainer.className = 'form-messages';
        this.messagesContainer.textContent = '';
    }
    
    announceToScreenReader(message) {
        if (this.statusRegion) {
            this.statusRegion.textContent = message;
            // Clear after announcement
            setTimeout(() => {
                this.statusRegion.textContent = '';
            }, 1000);
        }
    }
    
    announceError(message) {
        if (this.errorRegion) {
            this.errorRegion.textContent = message;
            // Clear after announcement
            setTimeout(() => {
                this.errorRegion.textContent = '';
            }, 3000);
        }
    }
}

// Keyboard navigation enhancement
class KeyboardNavigationManager {
    constructor() {
        this.init();
    }
    
    init() {
        // Trap focus within the form when using Tab navigation
        this.setupFocusTrap();
        
        // Enhanced keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    setupFocusTrap() {
        const form = document.getElementById('login-form');
        const focusableElements = form.querySelectorAll(
            'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        form.addEventListener('keydown', (e) => {
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
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + L to focus email field
            if (e.altKey && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                document.getElementById('email')?.focus();
            }
            
            // Alt + P to focus password field
            if (e.altKey && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                document.getElementById('password')?.focus();
            }
            
            // Alt + S to submit form
            if (e.altKey && e.key.toLowerCase() === 's') {
                e.preventDefault();
                document.getElementById('submit-button')?.click();
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize form validation
    const validator = new AccessibleFormValidator('login-form');
    
    // Initialize keyboard navigation
    const keyboardManager = new KeyboardNavigationManager();
    
    // Focus management - focus the first input on page load
    const firstInput = document.getElementById('email');
    if (firstInput) {
        // Slight delay to ensure screen readers announce the page content first
        setTimeout(() => {
            firstInput.focus();
        }, 100);
    }
    
    console.log('WCAG 2.1 AA compliant login form initialized');
});