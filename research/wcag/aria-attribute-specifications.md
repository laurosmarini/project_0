# ARIA Attribute Specifications for Login Form Elements

## Core ARIA Principles

### First Rule of ARIA
Use native HTML elements whenever possible instead of repurposing elements and adding ARIA attributes. ARIA should supplement, not replace, semantic HTML.

### Labeling Hierarchy
1. **Visible labels**: Use `<label>` elements with `for`/`id` association
2. **aria-labelledby**: When label text is visible but not in a `<label>` element
3. **aria-label**: Only when no visible label exists
4. **aria-describedby**: For additional descriptive text

## Login Form Element Specifications

### Form Container
```html
<form aria-label="Login" novalidate>
  <!-- Form content -->
</form>
```

**ARIA Attributes:**
- `aria-label="Login"`: Provides accessible name for the form
- `novalidate`: Allows custom error handling (optional)

**Alternative:**
```html
<form aria-labelledby="login-heading">
  <h2 id="login-heading">Sign In</h2>
  <!-- Form content -->
</form>
```

### Username/Email Input Field
```html
<label for="username">Username or Email</label>
<input 
  id="username" 
  name="username" 
  type="email"
  autocomplete="username"
  aria-required="true"
  aria-describedby="username-help username-error"
  aria-invalid="false"
>
<div id="username-help">Enter your username or email address</div>
<div id="username-error" aria-live="polite" role="alert" aria-atomic="true"></div>
```

**ARIA Attributes Explained:**
- `aria-required="true"`: Indicates field is mandatory
- `aria-describedby`: Links to help text and error container
- `aria-invalid="false"`: Initially false, set to "true" when validation fails
- `aria-live="polite"`: Error container for screen reader announcements
- `aria-atomic="true"`: Ensures entire error message is read

### Password Input Field
```html
<label for="password">Password</label>
<input 
  id="password" 
  name="password" 
  type="password"
  autocomplete="current-password"
  aria-required="true"
  aria-describedby="password-help password-error"
  aria-invalid="false"
>
<div id="password-help">Enter your account password</div>
<div id="password-error" aria-live="polite" role="alert" aria-atomic="true"></div>
```

### Password Toggle Button (Show/Hide)
```html
<button 
  type="button"
  aria-label="Show password"
  aria-pressed="false"
  aria-controls="password"
  id="password-toggle"
>
  <span aria-hidden="true">👁</span>
</button>
```

**ARIA Attributes Explained:**
- `aria-label="Show password"`: Accessible name (changes to "Hide password" when pressed)
- `aria-pressed="false"`: Indicates toggle state (true/false)
- `aria-controls="password"`: Links to controlled password field
- `aria-hidden="true"`: Hides decorative icon from screen readers

### Submit Button
```html
<button type="submit" aria-describedby="submit-help">
  Sign In
</button>
<div id="submit-help" class="sr-only">Press Enter to submit the form</div>
```

**Alternative with Loading State:**
```html
<button 
  type="submit" 
  aria-describedby="submit-help"
  aria-live="polite"
  disabled
>
  <span aria-hidden="true" class="spinner"></span>
  Signing in...
</button>
```

### Remember Me Checkbox
```html
<input 
  type="checkbox" 
  id="remember-me" 
  name="remember"
  aria-describedby="remember-help"
>
<label for="remember-me">Remember me on this device</label>
<div id="remember-help">Keep you signed in for 30 days</div>
```

### Forgot Password Link
```html
<a 
  href="/forgot-password" 
  aria-describedby="forgot-help"
>
  Forgot your password?
</a>
<div id="forgot-help" class="sr-only">Opens password recovery form</div>
```

## Error State Implementation

### Form-Level Error Summary
```html
<div 
  role="alert" 
  aria-live="assertive" 
  aria-atomic="true"
  id="form-errors"
  class="error-summary"
>
  <h3>Please correct the following errors:</h3>
  <ul>
    <li><a href="#username">Username is required</a></li>
    <li><a href="#password">Password must be at least 8 characters</a></li>
  </ul>
</div>
```

### Field-Level Error Messages
```html
<!-- Username with error -->
<label for="username">Username or Email</label>
<input 
  id="username" 
  name="username" 
  type="email"
  aria-required="true"
  aria-invalid="true"
  aria-describedby="username-error"
  class="error"
>
<div id="username-error" role="alert" aria-live="polite">
  Username is required
</div>
```

## Loading States

### Form in Loading State
```html
<form aria-label="Login" aria-busy="true">
  <div aria-live="polite" aria-atomic="true">
    Signing you in...
  </div>
  <!-- Disabled form fields -->
</form>
```

### Submit Button Loading
```html
<button 
  type="submit" 
  disabled
  aria-describedby="loading-status"
>
  <span aria-hidden="true" class="spinner"></span>
  Signing In...
</button>
<div id="loading-status" aria-live="polite" class="sr-only">
  Please wait while we sign you in
</div>
```

## Success State

### Successful Login Notification
```html
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  id="success-message"
>
  Successfully signed in. Redirecting...
</div>
```

## Advanced ARIA Patterns

### Progressive Enhancement
```html
<!-- Base HTML without ARIA -->
<form>
  <label for="username">Username</label>
  <input id="username" type="text" required>
</form>

<!-- Enhanced with ARIA via JavaScript -->
<script>
// Add ARIA attributes progressively
document.getElementById('username').setAttribute('aria-describedby', 'username-help');
</script>
```

### Dynamic ARIA Updates
```javascript
// Update ARIA states dynamically
function showError(fieldId, errorMessage) {
  const field = document.getElementById(fieldId);
  const errorContainer = document.getElementById(fieldId + '-error');
  
  // Update field state
  field.setAttribute('aria-invalid', 'true');
  field.classList.add('error');
  
  // Update error message
  errorContainer.textContent = errorMessage;
  errorContainer.setAttribute('aria-live', 'assertive');
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorContainer = document.getElementById(fieldId + '-error');
  
  // Clear field state
  field.setAttribute('aria-invalid', 'false');
  field.classList.remove('error');
  
  // Clear error message
  errorContainer.textContent = '';
  errorContainer.setAttribute('aria-live', 'off');
}
```

## Testing ARIA Implementation

### Screen Reader Announcements Expected:
1. **Form entry**: "Login form, Username or Email, edit text, required"
2. **Error state**: "Invalid entry. Username is required"
3. **Success**: "Successfully signed in"
4. **Button press**: "Sign In, button"

### Common ARIA Mistakes to Avoid:
- Don't use `aria-label` when visible text exists (use `aria-labelledby`)
- Don't add "button" to `aria-label` text (redundant with button role)
- Don't use `aria-live` on elements not present during page load
- Don't set `aria-invalid="true"` on fields without errors