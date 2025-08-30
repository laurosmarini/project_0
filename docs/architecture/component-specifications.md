# Component Specifications - WCAG 2.1 Login Form System

## Component Architecture Overview

This document defines the detailed specifications for each component in the accessible login form system, ensuring WCAG 2.1 AA compliance through modular, testable design patterns.

## 1. LoginForm Component

### 1.1 Component Interface
```typescript
interface LoginFormProps {
  action: string;
  method: 'POST';
  noValidate: true;
  onSubmit: (event: SubmitEvent) => Promise<void>;
  onValidationError: (errors: ValidationError[]) => void;
  ariaDescribedBy?: string;
}

interface LoginFormState {
  isSubmitting: boolean;
  errors: ValidationError[];
  touched: Record<string, boolean>;
  values: Record<string, string>;
}
```

### 1.2 HTML Template Structure
```html
<!-- LoginForm.html -->
<form 
  role="form" 
  class="login-form" 
  aria-describedby="form-instructions login-requirements"
  novalidate
  data-component="LoginForm"
>
  <!-- Form Instructions -->
  <div id="form-instructions" class="form-instructions">
    <p>Please enter your credentials to sign in to your account.</p>
  </div>
  
  <!-- Requirements Summary -->
  <div id="login-requirements" class="requirements-summary" aria-label="Form requirements">
    <ul>
      <li>Email address is required</li>
      <li>Password is required</li>
      <li>Remember to use your registered email</li>
    </ul>
  </div>
  
  <!-- Form Fields Container -->
  <fieldset class="login-fieldset">
    <legend class="login-legend">Login Credentials</legend>
    
    <!-- Email Field Component -->
    <div class="form-group" data-component="FormField" data-field="email">
      <!-- EmailField component will be inserted here -->
    </div>
    
    <!-- Password Field Component -->
    <div class="form-group" data-component="FormField" data-field="password">
      <!-- PasswordField component will be inserted here -->
    </div>
    
    <!-- Remember Me Component -->
    <div class="form-group" data-component="FormField" data-field="remember">
      <!-- RememberMeField component will be inserted here -->
    </div>
  </fieldset>
  
  <!-- Form Actions -->
  <div class="form-actions" role="group" aria-label="Form actions">
    <button 
      type="submit" 
      class="submit-button primary-button"
      aria-describedby="submit-help"
      data-component="SubmitButton"
    >
      <span class="button-text">Sign In</span>
      <span class="loading-indicator" aria-hidden="true" hidden>
        <span class="sr-only">Signing in, please wait</span>
      </span>
    </button>
    
    <div id="submit-help" class="button-help">
      Press Enter or click to submit the form
    </div>
  </div>
  
  <!-- Error Summary Component -->
  <div 
    id="error-summary" 
    class="error-summary" 
    role="alert" 
    aria-labelledby="error-summary-heading"
    hidden
    data-component="ErrorSummary"
  >
    <!-- ErrorSummary component will be populated here -->
  </div>
  
  <!-- Live Regions for Screen Reader Announcements -->
  <div aria-live="polite" aria-atomic="false" id="form-status" class="sr-only"></div>
  <div aria-live="assertive" aria-atomic="true" id="error-announcements" class="sr-only"></div>
</form>
```

### 1.3 CSS Architecture
```scss
// LoginForm.scss
.login-form {
  // Base form styles
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  
  // Accessibility features
  &:focus-within {
    outline: 2px solid var(--focus-color);
    outline-offset: 2px;
  }
  
  // High contrast mode support
  @media (prefers-contrast: high) {
    border: 2px solid;
  }
  
  // Reduced motion support
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

.form-instructions {
  margin-bottom: 1.5rem;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-secondary);
}

.requirements-summary {
  background-color: var(--info-background);
  border: 1px solid var(--info-border);
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
    
    li {
      margin-bottom: 0.5rem;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.login-fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

.login-legend {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
  
  // Ensure legend is accessible
  &:focus {
    outline: 2px solid var(--focus-color);
    outline-offset: 2px;
  }
}

.form-actions {
  margin-top: 1.5rem;
  text-align: center;
}

.submit-button {
  // Accessible button sizing
  min-height: 44px;
  min-width: 120px;
  padding: 12px 24px;
  
  // Visual design
  background-color: var(--primary-color);
  color: var(--primary-text);
  border: 2px solid var(--primary-color);
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  
  // Interactive states
  &:hover:not(:disabled) {
    background-color: var(--primary-hover);
    border-color: var(--primary-hover);
  }
  
  &:focus {
    outline: 2px solid var(--focus-color);
    outline-offset: 2px;
  }
  
  &:active:not(:disabled) {
    background-color: var(--primary-active);
    border-color: var(--primary-active);
  }
  
  &:disabled {
    background-color: var(--disabled-background);
    border-color: var(--disabled-border);
    color: var(--disabled-text);
    cursor: not-allowed;
  }
  
  // Loading state
  &.loading {
    .button-text {
      opacity: 0;
    }
    
    .loading-indicator {
      display: inline-block;
    }
  }
}

.button-help {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

// Screen reader only content
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## 2. FormField Component

### 2.1 Component Interface
```typescript
interface FormFieldProps {
  type: 'text' | 'email' | 'password' | 'checkbox';
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  hint?: string;
  validation?: ValidationRule[];
  autocomplete?: string;
  ariaDescribedBy?: string;
}
```

### 2.2 HTML Template Structure
```html
<!-- FormField.html -->
<div class="form-field" data-component="FormField" data-field-type="{{type}}">
  <label for="{{fieldId}}" class="form-label {{#if required}}required{{/if}}">
    {{label}}
    {{#if required}}
    <span class="required-indicator" aria-label="required field">*</span>
    {{/if}}
  </label>
  
  {{#if hint}}
  <div id="{{fieldId}}-hint" class="field-hint">{{hint}}</div>
  {{/if}}
  
  <input
    type="{{type}}"
    id="{{fieldId}}"
    name="{{name}}"
    class="form-input"
    {{#if required}}required{{/if}}
    {{#if disabled}}disabled{{/if}}
    {{#if readonly}}readonly{{/if}}
    {{#if placeholder}}placeholder="{{placeholder}}"{{/if}}
    {{#if autocomplete}}autocomplete="{{autocomplete}}"{{/if}}
    aria-invalid="false"
    {{#if hint}}aria-describedby="{{fieldId}}-hint"{{/if}}
    data-validation="{{validation}}"
  />
  
  <!-- Error message container -->
  <div 
    id="{{fieldId}}-error" 
    class="field-error" 
    role="alert"
    aria-live="polite"
    hidden
  ></div>
  
  <!-- Success indicator -->
  <div 
    id="{{fieldId}}-success" 
    class="field-success" 
    aria-live="polite"
    hidden
  >
    <span aria-hidden="true">✓</span>
    <span class="sr-only">Field is valid</span>
  </div>
</div>
```

### 2.3 CSS Specifications
```scss
// FormField.scss
.form-field {
  margin-bottom: 1.5rem;
  position: relative;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.5;
  
  &.required::after {
    content: '';
  }
  
  // Focus management for labels
  &:focus {
    outline: 2px solid var(--focus-color);
    outline-offset: 2px;
  }
}

.required-indicator {
  color: var(--error-color);
  font-weight: bold;
  margin-left: 0.25rem;
}

.field-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.form-input {
  width: 100%;
  min-height: 44px; // WCAG AA touch target
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  line-height: 1.5;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  
  // Accessible focus styles
  &:focus {
    border-color: var(--focus-color);
    outline: none;
    box-shadow: 0 0 0 2px var(--focus-ring-color);
  }
  
  // Error state
  &[aria-invalid="true"] {
    border-color: var(--error-color);
    box-shadow: 0 0 0 2px var(--error-ring-color);
  }
  
  // Success state
  &.valid {
    border-color: var(--success-color);
  }
  
  // Disabled state
  &:disabled {
    background-color: var(--disabled-background);
    border-color: var(--disabled-border);
    color: var(--disabled-text);
    cursor: not-allowed;
  }
  
  // High contrast mode
  @media (prefers-contrast: high) {
    border-width: 3px;
  }
  
  // Placeholder contrast
  &::placeholder {
    color: var(--placeholder-color);
    opacity: 1;
  }
}

.field-error {
  display: flex;
  align-items: flex-start;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--error-color);
  line-height: 1.4;
  
  &::before {
    content: "⚠";
    margin-right: 0.5rem;
    flex-shrink: 0;
    font-weight: bold;
  }
  
  // Ensure error is visible
  &:not([hidden]) {
    display: flex;
  }
}

.field-success {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--success-color);
  
  &:not([hidden]) {
    display: flex;
  }
}
```

## 3. EmailField Component

### 3.1 Specialized Email Field
```html
<!-- EmailField.html -->
<div class="form-field email-field" data-component="EmailField">
  <label for="email" class="form-label required">
    Email Address
    <span class="required-indicator" aria-label="required field">*</span>
  </label>
  
  <div id="email-hint" class="field-hint">
    Enter the email address associated with your account
  </div>
  
  <input
    type="email"
    id="email"
    name="email"
    class="form-input"
    required
    autocomplete="username"
    spellcheck="false"
    aria-describedby="email-hint"
    aria-invalid="false"
    placeholder="your.email@example.com"
    data-validation="email,required"
  />
  
  <div id="email-error" class="field-error" role="alert" aria-live="polite" hidden></div>
  <div id="email-success" class="field-success" aria-live="polite" hidden>
    <span aria-hidden="true">✓</span>
    <span class="sr-only">Valid email address</span>
  </div>
</div>
```

## 4. PasswordField Component

### 4.1 Accessible Password Field with Toggle
```html
<!-- PasswordField.html -->
<div class="form-field password-field" data-component="PasswordField">
  <label for="password" class="form-label required">
    Password
    <span class="required-indicator" aria-label="required field">*</span>
  </label>
  
  <div id="password-hint" class="field-hint">
    Enter your account password
  </div>
  
  <div class="password-container">
    <input
      type="password"
      id="password"
      name="password"
      class="form-input password-input"
      required
      autocomplete="current-password"
      aria-describedby="password-hint"
      aria-invalid="false"
      data-validation="required,minlength:8"
    />
    
    <button
      type="button"
      class="password-toggle"
      aria-label="Show password"
      aria-pressed="false"
      aria-describedby="toggle-help"
      data-component="PasswordToggle"
    >
      <span class="toggle-icon" aria-hidden="true">
        <svg class="show-icon" viewBox="0 0 24 24" width="20" height="20">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
        <svg class="hide-icon" viewBox="0 0 24 24" width="20" height="20" hidden>
          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
        </svg>
      </span>
      <span class="sr-only">Toggle password visibility</span>
    </button>
  </div>
  
  <div id="toggle-help" class="toggle-help">
    Click to show or hide your password
  </div>
  
  <div id="password-error" class="field-error" role="alert" aria-live="polite" hidden></div>
  <div id="password-success" class="field-success" aria-live="polite" hidden>
    <span aria-hidden="true">✓</span>
    <span class="sr-only">Password meets requirements</span>
  </div>
</div>
```

### 4.2 Password Field CSS
```scss
.password-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  flex: 1;
  padding-right: 60px; // Space for toggle button
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  color: var(--text-secondary);
  
  &:focus {
    outline: 2px solid var(--focus-color);
    outline-offset: 2px;
  }
  
  &:hover {
    background-color: var(--hover-background);
    color: var(--text-primary);
  }
  
  &[aria-pressed="true"] {
    color: var(--primary-color);
  }
  
  // Ensure minimum touch target
  min-width: 44px;
  min-height: 44px;
}

.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-help {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}
```

## 5. ErrorSummary Component

### 5.1 Accessible Error Summary
```html
<!-- ErrorSummary.html -->
<div 
  id="error-summary" 
  class="error-summary" 
  role="alert" 
  aria-labelledby="error-summary-heading"
  data-component="ErrorSummary"
  tabindex="-1"
>
  <h2 id="error-summary-heading" class="error-summary-heading">
    <span class="error-icon" aria-hidden="true">⚠</span>
    There <span class="error-count-text">is 1 error</span> that needs your attention
  </h2>
  
  <div class="error-summary-body">
    <p class="error-summary-description">
      Please review and correct the following:
    </p>
    
    <ul class="error-list" role="list">
      <!-- Error items will be dynamically inserted here -->
    </ul>
  </div>
</div>
```

### 5.2 Error Summary CSS
```scss
.error-summary {
  background-color: var(--error-background);
  border: 3px solid var(--error-color);
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  
  &:focus {
    outline: 2px solid var(--focus-color);
    outline-offset: 2px;
  }
}

.error-summary-heading {
  color: var(--error-color);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.error-summary-description {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.error-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.error-item {
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.error-link {
  color: var(--error-color);
  text-decoration: underline;
  font-weight: 500;
  
  &:hover {
    text-decoration: none;
    background-color: var(--error-hover-background);
  }
  
  &:focus {
    outline: 2px solid var(--focus-color);
    outline-offset: 2px;
    text-decoration: none;
  }
}
```

## 6. JavaScript Component Controllers

### 6.1 LoginFormController
```javascript
// LoginFormController.js
class LoginFormController {
  constructor(element) {
    this.form = element;
    this.fields = new Map();
    this.errorManager = new ErrorManager();
    this.focusManager = new FocusManager();
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.initializeComponents();
    this.setupAccessibilityFeatures();
  }
  
  setupEventListeners() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    this.form.addEventListener('input', this.handleInput.bind(this));
    this.form.addEventListener('focusout', this.handleFieldBlur.bind(this));
  }
  
  initializeComponents() {
    // Initialize form field components
    const fieldElements = this.form.querySelectorAll('[data-component="FormField"]');
    fieldElements.forEach(element => {
      const fieldType = element.dataset.field;
      const fieldController = this.createFieldController(element, fieldType);
      this.fields.set(fieldType, fieldController);
    });
  }
  
  createFieldController(element, type) {
    switch(type) {
      case 'email':
        return new EmailFieldController(element);
      case 'password':
        return new PasswordFieldController(element);
      default:
        return new FormFieldController(element);
    }
  }
  
  async handleSubmit(event) {
    event.preventDefault();
    
    if (this.isSubmitting) return;
    
    this.setSubmittingState(true);
    
    try {
      const isValid = await this.validateForm();
      
      if (!isValid) {
        this.focusManager.focusFirstError();
        return;
      }
      
      await this.submitForm();
      
    } catch (error) {
      this.handleSubmissionError(error);
    } finally {
      this.setSubmittingState(false);
    }
  }
  
  async validateForm() {
    const validationPromises = Array.from(this.fields.values())
      .map(field => field.validate());
    
    const results = await Promise.all(validationPromises);
    const isValid = results.every(result => result.isValid);
    
    if (!isValid) {
      const errors = results
        .filter(result => !result.isValid)
        .map(result => result.errors)
        .flat();
      
      this.errorManager.showErrorSummary(errors);
    } else {
      this.errorManager.hideErrorSummary();
    }
    
    return isValid;
  }
  
  setSubmittingState(isSubmitting) {
    this.isSubmitting = isSubmitting;
    const submitButton = this.form.querySelector('.submit-button');
    
    if (isSubmitting) {
      submitButton.disabled = true;
      submitButton.classList.add('loading');
      submitButton.setAttribute('aria-busy', 'true');
      this.announceToScreenReader('Submitting form, please wait');
    } else {
      submitButton.disabled = false;
      submitButton.classList.remove('loading');
      submitButton.setAttribute('aria-busy', 'false');
    }
  }
  
  announceToScreenReader(message, priority = 'polite') {
    const liveRegion = document.getElementById('form-status');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = message;
  }
}
```

### 6.2 FormFieldController
```javascript
// FormFieldController.js
class FormFieldController {
  constructor(element) {
    this.container = element;
    this.input = element.querySelector('.form-input');
    this.errorContainer = element.querySelector('.field-error');
    this.successContainer = element.querySelector('.field-success');
    this.validators = this.parseValidation();
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupAriaAttributes();
  }
  
  setupEventListeners() {
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.input.addEventListener('blur', this.handleBlur.bind(this));
    this.input.addEventListener('focus', this.handleFocus.bind(this));
  }
  
  setupAriaAttributes() {
    // Ensure proper aria-describedby relationship
    const describedBy = [];
    
    if (this.container.querySelector('.field-hint')) {
      describedBy.push(`${this.input.id}-hint`);
    }
    
    if (describedBy.length > 0) {
      this.input.setAttribute('aria-describedby', describedBy.join(' '));
    }
  }
  
  async validate() {
    const value = this.input.value.trim();
    const errors = [];
    
    for (const validator of this.validators) {
      const result = await this.runValidator(validator, value);
      if (!result.isValid) {
        errors.push(result.error);
      }
    }
    
    this.updateValidationState(errors);
    
    return {
      isValid: errors.length === 0,
      errors: errors.map(error => ({
        field: this.input.name,
        fieldId: this.input.id,
        message: error
      }))
    };
  }
  
  updateValidationState(errors) {
    const hasErrors = errors.length > 0;
    
    // Update ARIA attributes
    this.input.setAttribute('aria-invalid', hasErrors.toString());
    
    if (hasErrors) {
      // Show error
      this.showError(errors[0]); // Show first error
      this.hideSuccess();
      
      // Update aria-describedby to include error
      const currentDescribedBy = this.input.getAttribute('aria-describedby') || '';
      const errorId = `${this.input.id}-error`;
      
      if (!currentDescribedBy.includes(errorId)) {
        const newDescribedBy = currentDescribedBy ? 
          `${currentDescribedBy} ${errorId}` : errorId;
        this.input.setAttribute('aria-describedby', newDescribedBy);
      }
    } else if (this.input.value.trim()) {
      // Show success for non-empty valid fields
      this.showSuccess();
      this.hideError();
      
      // Remove error from aria-describedby
      const currentDescribedBy = this.input.getAttribute('aria-describedby') || '';
      const errorId = `${this.input.id}-error`;
      const newDescribedBy = currentDescribedBy
        .replace(errorId, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (newDescribedBy) {
        this.input.setAttribute('aria-describedby', newDescribedBy);
      } else {
        this.input.removeAttribute('aria-describedby');
      }
    } else {
      // Clear both error and success states
      this.hideError();
      this.hideSuccess();
    }
  }
  
  showError(message) {
    this.errorContainer.textContent = message;
    this.errorContainer.hidden = false;
    this.input.classList.add('error');
  }
  
  hideError() {
    this.errorContainer.textContent = '';
    this.errorContainer.hidden = true;
    this.input.classList.remove('error');
  }
  
  showSuccess() {
    this.successContainer.hidden = false;
    this.input.classList.add('valid');
  }
  
  hideSuccess() {
    this.successContainer.hidden = true;
    this.input.classList.remove('valid');
  }
  
  parseValidation() {
    const validationStr = this.input.dataset.validation;
    if (!validationStr) return [];
    
    return validationStr.split(',').map(rule => {
      const [type, ...params] = rule.split(':');
      return { type: type.trim(), params: params.join(':') };
    });
  }
  
  async runValidator(validator, value) {
    switch (validator.type) {
      case 'required':
        return this.validateRequired(value);
      case 'email':
        return this.validateEmail(value);
      case 'minlength':
        return this.validateMinLength(value, parseInt(validator.params));
      default:
        return { isValid: true };
    }
  }
  
  validateRequired(value) {
    return {
      isValid: value.length > 0,
      error: 'This field is required'
    };
  }
  
  validateEmail(value) {
    if (!value) return { isValid: true }; // Let required validator handle empty
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(value),
      error: 'Please enter a valid email address'
    };
  }
  
  validateMinLength(value, minLength) {
    if (!value) return { isValid: true }; // Let required validator handle empty
    
    return {
      isValid: value.length >= minLength,
      error: `Must be at least ${minLength} characters long`
    };
  }
}
```

## 7. Component Integration Testing

### 7.1 Accessibility Test Suite
```javascript
// component-accessibility.test.js
describe('LoginForm Accessibility', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-container"></div>
    `;
    
    // Load component HTML
    const container = document.getElementById('test-container');
    container.innerHTML = loginFormHTML;
    
    // Initialize component
    this.loginForm = new LoginFormController(
      container.querySelector('.login-form')
    );
  });
  
  describe('Keyboard Navigation', () => {
    it('should support tab navigation through all interactive elements', async () => {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      expect(focusableElements.length).toBeGreaterThan(0);
      
      // Test tab order
      for (let i = 0; i < focusableElements.length; i++) {
        focusableElements[i].focus();
        expect(document.activeElement).toBe(focusableElements[i]);
      }
    });
    
    it('should handle Enter key on submit button', async () => {
      const submitButton = container.querySelector('.submit-button');
      const submitSpy = jest.spyOn(this.loginForm, 'handleSubmit');
      
      submitButton.focus();
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      submitButton.dispatchEvent(enterEvent);
      
      expect(submitSpy).toHaveBeenCalled();
    });
  });
  
  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels and descriptions', () => {
      const form = container.querySelector('.login-form');
      expect(form).toHaveAttribute('role', 'form');
      expect(form).toHaveAttribute('aria-describedby');
      
      const emailField = container.querySelector('#email');
      expect(emailField).toHaveAttribute('aria-describedby');
      expect(emailField).toHaveAttribute('aria-invalid', 'false');
    });
    
    it('should announce errors to screen readers', async () => {
      const emailField = container.querySelector('#email');
      const errorContainer = container.querySelector('#email-error');
      
      // Trigger validation error
      emailField.value = 'invalid-email';
      emailField.dispatchEvent(new Event('blur'));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(errorContainer).not.toHaveAttribute('hidden');
      expect(errorContainer).toHaveAttribute('aria-live', 'polite');
      expect(emailField).toHaveAttribute('aria-invalid', 'true');
    });
  });
  
  describe('Color Contrast', () => {
    it('should meet WCAG AA contrast requirements', async () => {
      const elements = container.querySelectorAll('*');
      
      for (const element of elements) {
        const styles = window.getComputedStyle(element);
        const backgroundColor = styles.backgroundColor;
        const color = styles.color;
        
        if (backgroundColor !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)') {
          const contrastRatio = calculateContrastRatio(backgroundColor, color);
          expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  });
  
  describe('Focus Management', () => {
    it('should focus error summary when validation fails', async () => {
      const form = container.querySelector('.login-form');
      
      // Submit empty form
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const errorSummary = container.querySelector('#error-summary');
      expect(document.activeElement).toBe(errorSummary);
    });
    
    it('should maintain focus indicators', () => {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea'
      );
      
      focusableElements.forEach(element => {
        element.focus();
        const styles = window.getComputedStyle(element);
        expect(styles.outline).not.toBe('none');
      });
    });
  });
});
```

This comprehensive component specification provides a complete foundation for building WCAG 2.1 AA compliant login form components with proper accessibility patterns, progressive enhancement, and thorough testing coverage.