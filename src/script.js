/**
 * WCAG 2.1 AA Compliant Login Form
 * Features: Live validation, ARIA announcements, keyboard navigation, screen reader support
 */

class AccessibleLoginForm {
    constructor(formSelector = '#loginForm') {
        this.form = document.querySelector(formSelector);
        this.announcements = document.getElementById('announcements');
        this.formSummary = document.getElementById('form-summary');
        
        if (!this.form) {
            console.error('Login form not found');
            return;
        }
        
        this.init();
    }
    
    init() {
        this.setupElements();
        this.bindEvents();
        this.setupValidation();
        this.setupPasswordToggle();
        this.setupAccessibilityFeatures();
        
        // Announce form ready for screen readers
        this.announce('Login form loaded and ready for input');
    }
    
    setupElements() {
        this.elements = {
            email: this.form.querySelector('#email'),
            password: this.form.querySelector('#password'),
            rememberMe: this.form.querySelector('#rememberMe'),
            submitBtn: this.form.querySelector('#submitBtn'),
            togglePassword: this.form.querySelector('#togglePassword'),
            emailError: this.form.querySelector('#email-error'),
            passwordError: this.form.querySelector('#password-error'),
            successMessage: document.getElementById('success-message')
        };
        
        // Validation state
        this.validationState = {
            email: false,
            password: false
        };
        
        // Form submission state
        this.isSubmitting = false;
    }
    
    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Real-time validation
        this.elements.email.addEventListener('blur', () => this.validateField('email'));
        this.elements.password.addEventListener('blur', () => this.validateField('password'));
        
        // Input events for clearing errors
        this.elements.email.addEventListener('input', () => this.clearFieldError('email'));
        this.elements.password.addEventListener('input', () => this.clearFieldError('password'));
        
        // Password toggle
        this.elements.togglePassword.addEventListener('click', this.togglePasswordVisibility.bind(this));
        
        // Remember me announcement
        this.elements.rememberMe.addEventListener('change', (e) => {
            const message = e.target.checked ? 
                'Remember me enabled. You will stay signed in for 30 days.' : 
                'Remember me disabled. You will need to sign in each visit.';
            this.announce(message);
        });
        
        // Keyboard navigation improvements
        this.form.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    
    setupValidation() {
        // Email validation patterns
        this.validation = {
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                minLength: 5,
                maxLength: 254,
                messages: {
                    required: 'Email address is required',
                    invalid: 'Please enter a valid email address',
                    tooShort: 'Email must be at least 5 characters long',
                    tooLong: 'Email must be no more than 254 characters long'
                }
            },
            password: {
                required: true,
                minLength: 6,
                maxLength: 128,
                messages: {
                    required: 'Password is required',
                    tooShort: 'Password must be at least 6 characters long',
                    tooLong: 'Password must be no more than 128 characters long'
                }
            }
        };
    }
    
    setupPasswordToggle() {
        const toggleBtn = this.elements.togglePassword;
        const passwordField = this.elements.password;
        
        if (!toggleBtn || !passwordField) return;
        
        // Set initial state
        toggleBtn.setAttribute('aria-pressed', 'false');
    }
    
    setupAccessibilityFeatures() {
        // Add form description for screen readers
        const formDescription = document.createElement('div');
        formDescription.id = 'form-description';
        formDescription.className = 'sr-only';
        formDescription.textContent = 'Login form with email and password fields. Required fields are marked with asterisk. Use Tab to navigate between fields.';
        this.form.prepend(formDescription);
        
        // Associate form with description
        this.form.setAttribute('aria-describedby', 'form-description');
        
        // Improve field labeling
        this.elements.email.setAttribute('aria-label', 'Email address, required field');
        this.elements.password.setAttribute('aria-label', 'Password, required field');
        
        // Add role to form for better screen reader recognition
        this.form.setAttribute('role', 'form');
        this.form.setAttribute('aria-label', 'User login form');
    }
    
    validateField(fieldName) {
        const field = this.elements[fieldName];
        const rules = this.validation[fieldName];
        const value = field.value.trim();
        
        if (!field || !rules) return false;
        
        let isValid = true;
        let errorMessage = '';
        
        // Required validation
        if (rules.required && !value) {
            isValid = false;
            errorMessage = rules.messages.required;
        }
        // Length validation
        else if (value && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = rules.messages.tooShort;
        }
        else if (value && rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = rules.messages.tooLong;
        }
        // Pattern validation (for email)
        else if (value && rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.messages.invalid;
        }
        
        this.updateFieldValidation(fieldName, isValid, errorMessage);
        this.validationState[fieldName] = isValid;
        
        return isValid;
    }
    
    updateFieldValidation(fieldName, isValid, errorMessage) {
        const field = this.elements[fieldName];
        const errorElement = this.elements[fieldName + 'Error'];
        
        if (!field || !errorElement) return;
        
        if (isValid) {
            // Clear error state
            field.classList.remove('error');
            field.setAttribute('aria-invalid', 'false');
            errorElement.textContent = '';
            errorElement.classList.remove('visible');
        } else {
            // Set error state
            field.classList.add('error');
            field.setAttribute('aria-invalid', 'true');
            errorElement.textContent = errorMessage;
            errorElement.classList.add('visible');
            
            // Announce error to screen readers
            this.announce(`${fieldName} field error: ${errorMessage}`);
        }
    }
    
    clearFieldError(fieldName) {
        const field = this.elements[fieldName];
        const errorElement = this.elements[fieldName + 'Error'];
        
        if (!field || !errorElement) return;
        
        // Only clear if field has content and was previously invalid
        if (field.value.trim() && field.classList.contains('error')) {
            field.classList.remove('error');
            field.setAttribute('aria-invalid', 'false');
            errorElement.textContent = '';
            errorElement.classList.remove('visible');
        }
    }
    
    validateForm() {
        const emailValid = this.validateField('email');
        const passwordValid = this.validateField('password');
        
        const isFormValid = emailValid && passwordValid;
        
        if (!isFormValid) {
            this.showFormSummary();
        } else {
            this.hideFormSummary();
        }
        
        return isFormValid;
    }
    
    showFormSummary() {
        const errors = [];
        
        if (!this.validationState.email) {
            errors.push('Email address has errors');
        }
        if (!this.validationState.password) {
            errors.push('Password has errors');
        }
        
        if (errors.length === 0) return;
        
        const summaryContent = `
            <h2>Please fix the following errors:</h2>
            <ul>
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        `;
        
        this.formSummary.innerHTML = summaryContent;
        this.formSummary.classList.add('visible');
        
        // Focus the summary for screen readers
        this.formSummary.focus();
        
        // Announce the errors
        this.announce(`Form has ${errors.length} error${errors.length > 1 ? 's' : ''}. Please review and correct.`);
    }
    
    hideFormSummary() {
        this.formSummary.classList.remove('visible');
        this.formSummary.innerHTML = '';
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        
        if (this.isSubmitting) return;
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        this.isSubmitting = true;
        this.setLoadingState(true);
        
        // Announce form submission
        this.announce('Form submitted. Please wait while we process your login.');
        
        try {
            // Simulate API call
            await this.simulateLogin();
            
            // Success
            this.showSuccess();
            this.announce('Login successful! Welcome back. You will be redirected shortly.');
            
        } catch (error) {
            // Handle login error
            this.handleLoginError(error.message);
        } finally {
            this.isSubmitting = false;
            this.setLoadingState(false);
        }
    }
    
    async simulateLogin() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate success (90% success rate for demo)
        if (Math.random() < 0.1) {
            throw new Error('Invalid email or password');
        }
        
        return { success: true };
    }
    
    handleLoginError(message) {
        // Update form summary with login error
        this.formSummary.innerHTML = `
            <h2>Login Failed</h2>
            <p>${message}</p>
            <p>Please check your credentials and try again.</p>
        `;
        this.formSummary.classList.add('visible');
        this.formSummary.focus();
        
        // Announce error
        this.announce(`Login failed: ${message}`);
        
        // Clear password field for security
        this.elements.password.value = '';
        this.elements.password.focus();
    }
    
    showSuccess() {
        // Hide form and show success message
        this.form.style.display = 'none';
        this.elements.successMessage.style.display = 'block';
        this.elements.successMessage.focus();
        
        // Simulate redirect after delay
        setTimeout(() => {
            this.announce('Redirecting to dashboard...');
            // In real app, redirect would happen here
            // window.location.href = '/dashboard';
        }, 3000);
    }
    
    setLoadingState(loading) {
        const submitBtn = this.elements.submitBtn;
        
        if (loading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-label', 'Signing in, please wait');
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.setAttribute('aria-label', 'Sign in');
        }
    }
    
    togglePasswordVisibility() {
        const passwordField = this.elements.password;
        const toggleBtn = this.elements.togglePassword;
        const toggleText = toggleBtn.querySelector('.toggle-text');
        const eyeOpen = toggleBtn.querySelectorAll('.eye-open');
        const eyeClosed = toggleBtn.querySelectorAll('.eye-closed');
        
        const isCurrentlyHidden = passwordField.type === 'password';
        
        if (isCurrentlyHidden) {
            // Show password
            passwordField.type = 'text';
            toggleBtn.setAttribute('aria-pressed', 'true');
            toggleBtn.setAttribute('aria-label', 'Hide password');
            toggleText.textContent = 'Hide';
            
            // Update icon
            eyeOpen.forEach(path => path.style.display = 'none');
            eyeClosed.forEach(path => path.style.display = 'block');
            
            this.announce('Password is now visible');
        } else {
            // Hide password
            passwordField.type = 'password';
            toggleBtn.setAttribute('aria-pressed', 'false');
            toggleBtn.setAttribute('aria-label', 'Show password as plain text. Warning: this will display your password on the screen.');
            toggleText.textContent = 'Show';
            
            // Update icon
            eyeOpen.forEach(path => path.style.display = 'block');
            eyeClosed.forEach(path => path.style.display = 'none');
            
            this.announce('Password is now hidden');
        }
        
        // Return focus to password field
        passwordField.focus();
    }
    
    handleKeyDown(event) {
        const { key, target, shiftKey } = event;
        
        // Handle Enter key on form elements
        if (key === 'Enter') {
            if (target === this.elements.togglePassword) {
                event.preventDefault();
                this.togglePasswordVisibility();
            }
        }
        
        // Tab navigation improvements
        if (key === 'Tab') {
            // Let browser handle default tab behavior
            // but announce when entering/leaving password field
            if (target === this.elements.password && !shiftKey) {
                setTimeout(() => {
                    if (document.activeElement === this.elements.rememberMe) {
                        this.announce('Remember me checkbox. Use Space to toggle.');
                    }
                }, 10);
            }
        }
        
        // Escape key to clear form errors
        if (key === 'Escape' && this.formSummary.classList.contains('visible')) {
            this.hideFormSummary();
            this.announce('Form errors cleared');
        }
    }
    
    announce(message, priority = 'polite') {
        if (!this.announcements) return;
        
        // Clear previous announcement
        this.announcements.textContent = '';
        
        // Set aria-live level
        this.announcements.setAttribute('aria-live', priority);
        
        // Add new announcement with slight delay to ensure screen readers notice the change
        setTimeout(() => {
            this.announcements.textContent = message;
        }, 100);
        
        // Clear announcement after it's been read
        setTimeout(() => {
            this.announcements.textContent = '';
        }, 5000);
    }
    
    // Public method to focus first invalid field
    focusFirstError() {
        const firstErrorField = this.form.querySelector('.error');
        if (firstErrorField) {
            firstErrorField.focus();
            return true;
        }
        return false;
    }
    
    // Public method to reset form
    reset() {
        this.form.reset();
        this.hideFormSummary();
        
        // Clear all error states
        Object.keys(this.validationState).forEach(field => {
            this.clearFieldError(field);
            this.validationState[field] = false;
        });
        
        // Reset password visibility
        if (this.elements.password.type === 'text') {
            this.togglePasswordVisibility();
        }
        
        // Reset loading state
        this.setLoadingState(false);
        this.isSubmitting = false;
        
        // Hide success message and show form
        if (this.elements.successMessage.style.display !== 'none') {
            this.elements.successMessage.style.display = 'none';
            this.form.style.display = 'block';
        }
        
        // Announce reset
        this.announce('Form has been reset');
        
        // Focus first field
        this.elements.email.focus();
    }
}

// Utility functions for enhanced accessibility

/**
 * Polyfill for browsers that don't support aria-live regions properly
 */
function ensureAriaLiveSupport() {
    const testRegion = document.createElement('div');
    testRegion.setAttribute('aria-live', 'polite');
    testRegion.style.position = 'absolute';
    testRegion.style.left = '-10000px';
    testRegion.textContent = 'test';
    document.body.appendChild(testRegion);
    
    setTimeout(() => {
        document.body.removeChild(testRegion);
    }, 1000);
}

/**
 * Enhance keyboard navigation for the entire page
 */
function enhanceKeyboardNavigation() {
    // Skip link for keyboard users
    const skipLink = document.createElement('a');
    skipLink.href = '#loginForm';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only';
    skipLink.style.position = 'absolute';
    skipLink.style.top = '10px';
    skipLink.style.left = '10px';
    skipLink.style.zIndex = '9999';
    skipLink.style.background = '#000';
    skipLink.style.color = '#fff';
    skipLink.style.padding = '8px 16px';
    skipLink.style.textDecoration = 'none';
    skipLink.style.borderRadius = '4px';
    
    skipLink.addEventListener('focus', function() {
        this.style.position = 'fixed';
        this.classList.remove('sr-only');
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.position = 'absolute';
        this.classList.add('sr-only');
    });
    
    document.body.prepend(skipLink);
}

/**
 * Add high contrast mode detection
 */
function detectHighContrastMode() {
    // Create a test element to detect high contrast mode
    const testEl = document.createElement('div');
    testEl.style.color = 'rgb(31, 32, 33)';
    testEl.style.backgroundColor = 'rgb(31, 32, 33)';
    document.body.appendChild(testEl);
    
    const computed = window.getComputedStyle(testEl);
    const isHighContrast = computed.color !== computed.backgroundColor;
    
    document.body.removeChild(testEl);
    
    if (isHighContrast) {
        document.documentElement.setAttribute('data-high-contrast', 'true');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Run accessibility enhancements
    ensureAriaLiveSupport();
    enhanceKeyboardNavigation();
    detectHighContrastMode();
    
    // Initialize the login form
    const loginForm = new AccessibleLoginForm();
    
    // Make form globally available for testing/debugging
    window.loginForm = loginForm;
    
    // Add global keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Alt + L to focus login form
        if (event.altKey && event.key === 'l') {
            event.preventDefault();
            const emailField = document.getElementById('email');
            if (emailField) {
                emailField.focus();
                loginForm.announce('Login form focused');
            }
        }
        
        // Alt + R to reset form
        if (event.altKey && event.key === 'r') {
            event.preventDefault();
            if (confirm('Are you sure you want to reset the form?')) {
                loginForm.reset();
            }
        }
    });
    
    console.log('🚀 WCAG 2.1 AA Compliant Login Form initialized');
    console.log('💡 Keyboard shortcuts: Alt+L (focus form), Alt+R (reset form)');
    console.log('🎯 Features: Live validation, ARIA announcements, screen reader support');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AccessibleLoginForm };
}