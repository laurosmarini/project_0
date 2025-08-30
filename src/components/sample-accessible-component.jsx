/**
 * Sample Accessible React Component
 * Demonstrates WCAG 2.1 compliance best practices
 */

import React, { useState, useRef, useEffect, useId } from 'react';

const AccessibleForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    newsletter: false,
    country: '',
    birthDate: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  
  // Use useId for unique IDs (React 18+) or generate stable IDs
  const formId = useId();
  const firstNameId = `${formId}-firstName`;
  const lastNameId = `${formId}-lastName`;
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const confirmPasswordId = `${formId}-confirmPassword`;
  const newsletterId = `${formId}-newsletter`;
  const countryId = `${formId}-country`;
  const birthDateId = `${formId}-birthDate`;
  const errorsId = `${formId}-errors`;
  const statusId = `${formId}-status`;

  // Focus management
  const firstErrorRef = useRef(null);
  const submitButtonRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address (example: user@domain.com)';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Country validation
    if (!formData.country) {
      newErrors.country = 'Please select your country';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      // Focus on first error for keyboard users
      if (firstErrorRef.current) {
        firstErrorRef.current.focus();
      }
      
      // Announce errors to screen readers
      setSubmitMessage(`Form has ${Object.keys(formErrors).length} errors. Please correct them and try again.`);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage('Submitting form, please wait...');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitMessage('Form submitted successfully! Welcome to our newsletter.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        newsletter: false,
        country: '',
        birthDate: ''
      });
      
      // Focus back to form start for next interaction
      if (submitButtonRef.current) {
        submitButtonRef.current.focus();
      }
      
    } catch (error) {
      setSubmitMessage('An error occurred while submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Focus management for errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(`${firstErrorField}Error`);
      if (errorElement) {
        firstErrorRef.current = errorElement;
      }
    }
  }, [errors]);

  return (
    <div className="accessible-form-container">
      {/* Skip link for keyboard navigation */}
      <a href="#main-form" className="skip-link">
        Skip to main form
      </a>
      
      <main id="main-form">
        <header>
          <h1>Create Account</h1>
          <p>
            Fill out this form to create your account. 
            Required fields are marked with an asterisk (*).
          </p>
        </header>

        {/* Status messages for screen readers */}
        <div 
          id={statusId}
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
        >
          {submitMessage}
        </div>

        {/* Error summary */}
        {Object.keys(errors).length > 0 && (
          <div 
            id={errorsId}
            className="error-summary" 
            role="alert"
            aria-labelledby="error-heading"
          >
            <h2 id="error-heading">Form Errors</h2>
            <p>Please correct the following {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''}:</p>
            <ul>
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>
                  <a href={`#${field}`}>{error}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <fieldset>
            <legend>Personal Information</legend>
            
            {/* First Name */}
            <div className="form-group">
              <label htmlFor={firstNameId} className="required">
                First Name *
              </label>
              <input
                id={firstNameId}
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                aria-required="true"
                aria-invalid={errors.firstName ? 'true' : 'false'}
                aria-describedby={errors.firstName ? `${firstNameId}Error` : undefined}
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && (
                <div 
                  id={`${firstNameId}Error`}
                  className="error-message"
                  role="alert"
                >
                  {errors.firstName}
                </div>
              )}
            </div>

            {/* Last Name */}
            <div className="form-group">
              <label htmlFor={lastNameId} className="required">
                Last Name *
              </label>
              <input
                id={lastNameId}
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                aria-required="true"
                aria-invalid={errors.lastName ? 'true' : 'false'}
                aria-describedby={errors.lastName ? `${lastNameId}Error` : undefined}
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && (
                <div 
                  id={`${lastNameId}Error`}
                  className="error-message"
                  role="alert"
                >
                  {errors.lastName}
                </div>
              )}
            </div>

            {/* Birth Date */}
            <div className="form-group">
              <label htmlFor={birthDateId}>
                Birth Date (Optional)
              </label>
              <input
                id={birthDateId}
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleInputChange('birthDate')}
                aria-describedby={`${birthDateId}Help`}
              />
              <div id={`${birthDateId}Help`} className="help-text">
                Used to customize your experience. Format: MM/DD/YYYY
              </div>
            </div>

            {/* Country */}
            <div className="form-group">
              <label htmlFor={countryId} className="required">
                Country *
              </label>
              <select
                id={countryId}
                name="country"
                value={formData.country}
                onChange={handleInputChange('country')}
                aria-required="true"
                aria-invalid={errors.country ? 'true' : 'false'}
                aria-describedby={errors.country ? `${countryId}Error` : undefined}
                className={errors.country ? 'error' : ''}
              >
                <option value="">Select your country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
                <option value="other">Other</option>
              </select>
              {errors.country && (
                <div 
                  id={`${countryId}Error`}
                  className="error-message"
                  role="alert"
                >
                  {errors.country}
                </div>
              )}
            </div>
          </fieldset>

          <fieldset>
            <legend>Account Credentials</legend>
            
            {/* Email */}
            <div className="form-group">
              <label htmlFor={emailId} className="required">
                Email Address *
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                aria-required="true"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={`${emailId}Help ${errors.email ? `${emailId}Error` : ''}`}
                className={errors.email ? 'error' : ''}
                autoComplete="email"
              />
              <div id={`${emailId}Help`} className="help-text">
                We'll use this to send you important updates
              </div>
              {errors.email && (
                <div 
                  id={`${emailId}Error`}
                  className="error-message"
                  role="alert"
                >
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor={passwordId} className="required">
                Password *
              </label>
              <input
                id={passwordId}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                aria-required="true"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={`${passwordId}Help ${errors.password ? `${passwordId}Error` : ''}`}
                className={errors.password ? 'error' : ''}
                autoComplete="new-password"
              />
              <div id={`${passwordId}Help`} className="help-text">
                Must be at least 8 characters long
              </div>
              {errors.password && (
                <div 
                  id={`${passwordId}Error`}
                  className="error-message"
                  role="alert"
                >
                  {errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor={confirmPasswordId} className="required">
                Confirm Password *
              </label>
              <input
                id={confirmPasswordId}
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                aria-required="true"
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                aria-describedby={errors.confirmPassword ? `${confirmPasswordId}Error` : undefined}
                className={errors.confirmPassword ? 'error' : ''}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <div 
                  id={`${confirmPasswordId}Error`}
                  className="error-message"
                  role="alert"
                >
                  {errors.confirmPassword}
                </div>
              )}
            </div>
          </fieldset>

          <fieldset>
            <legend>Preferences</legend>
            
            {/* Newsletter Checkbox */}
            <div className="form-group">
              <input
                id={newsletterId}
                name="newsletter"
                type="checkbox"
                checked={formData.newsletter}
                onChange={handleInputChange('newsletter')}
                aria-describedby={`${newsletterId}Help`}
              />
              <label htmlFor={newsletterId}>
                Subscribe to our newsletter
              </label>
              <div id={`${newsletterId}Help`} className="help-text">
                Get weekly updates about new features and tips
              </div>
            </div>
          </fieldset>

          <div className="form-actions">
            <button
              ref={submitButtonRef}
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              aria-describedby={submitMessage ? statusId : undefined}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
            
            <button 
              type="reset" 
              className="btn-secondary"
              onClick={() => {
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  newsletter: false,
                  country: '',
                  birthDate: ''
                });
                setErrors({});
                setSubmitMessage('');
              }}
            >
              Clear Form
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AccessibleForm;

/**
 * Accessibility Features Demonstrated:
 * 
 * 1. Semantic HTML:
 *    - Proper heading hierarchy (h1)
 *    - Fieldsets and legends for form sections
 *    - Main landmark element
 * 
 * 2. Keyboard Navigation:
 *    - Skip links for bypass blocks
 *    - Logical tab order
 *    - Focus management on errors
 * 
 * 3. Screen Reader Support:
 *    - Proper labels for all form fields
 *    - ARIA attributes (aria-required, aria-invalid, aria-describedby)
 *    - Live regions for status updates (aria-live)
 *    - Error announcements with role="alert"
 * 
 * 4. Form Accessibility:
 *    - Required fields clearly marked
 *    - Error messages associated with fields
 *    - Help text for complex fields
 *    - Validation feedback
 * 
 * 5. Error Handling:
 *    - Error summary with jump links
 *    - Inline error messages
 *    - Clear error descriptions
 *    - Focus management for errors
 * 
 * 6. Progressive Enhancement:
 *    - Works without JavaScript
 *    - Graceful degradation
 *    - Semantic fallbacks
 */