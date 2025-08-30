# WCAG 2.1 Level AA Comprehensive Checklist for Login Forms

## Core Principles Summary
WCAG 2.1 is built on four foundational principles: **Perceivable**, **Operable**, **Understandable**, and **Robust** (POUR).

## Essential WCAG 2.1 Success Criteria for Login Forms

### 1. Perceivable Requirements

#### 1.4.3 Contrast (Minimum) - Level AA
- **Text**: Minimum 4.5:1 contrast ratio for normal text
- **Large Text**: Minimum 3:1 contrast ratio (18pt+ or 14pt+ bold)
- **UI Components**: 3:1 contrast for form borders and states
- **Error States**: Must maintain contrast requirements

#### 1.4.11 Non-text Contrast - Level AA
- User interface components must have 3:1 contrast against adjacent colors
- Visual focus indicators must meet 3:1 contrast ratio
- Form field borders in error states require 3:1 contrast

#### 1.3.1 Info and Relationships - Level A
- Form structure must be programmatically determinable
- Use semantic HTML elements (`<form>`, `<label>`, `<input>`)
- Associate labels with form controls using `for`/`id` attributes

### 2. Operable Requirements

#### 2.1.1 Keyboard - Level A
- All functionality must be available via keyboard
- Tab order must be logical and intuitive (left-to-right, top-to-bottom)
- No keyboard traps (except intentional modal focus traps with escape mechanisms)

#### 2.1.2 No Keyboard Trap - Level A
- Users must be able to move focus away from any element using keyboard alone
- Modal dialogs may trap focus but must provide escape mechanisms

#### 2.4.3 Focus Order - Level A
- Tab order follows logical sequence matching visual layout
- Avoid using `tabindex` values greater than 0

#### 2.4.7 Focus Visible - Level AA
- Clear visual focus indicators for all interactive elements
- Focus indicators must meet 3:1 contrast requirements

### 3. Understandable Requirements

#### 3.3.1 Error Identification - Level A
- Input errors must be identified and described in text
- Cannot rely solely on color to indicate errors
- Use icons, text, or other non-color indicators

#### 3.3.2 Labels or Instructions - Level A
- Labels or instructions provided when content requires user input
- Use `<label>` elements or ARIA labeling techniques
- Required field indicators must be accessible

#### 3.3.3 Error Suggestion - Level AA
- Provide suggestions for correcting input errors when known
- Error messages should be specific and actionable

#### 3.3.4 Error Prevention - Level AA
- For critical data, provide mechanisms to:
  - Reverse submissions
  - Check data for errors
  - Confirm before final submission

### 4. Robust Requirements

#### 4.1.2 Name, Role, Value - Level A
- All form controls must have accessible names
- Roles must be programmatically determinable
- States and properties must be programmatically set

#### 4.1.3 Status Messages - Level AA
- Status messages must be programmatically determinable
- Use ARIA live regions for dynamic feedback
- Error announcements must reach assistive technology

## Authentication-Specific Requirements (WCAG 2.2)

#### 3.3.8 Accessible Authentication (Minimum) - Level AA
- Cognitive function tests not required for authentication steps
- Support for password managers and paste functionality
- Alternative authentication methods where possible

## Form-Specific Implementation Checklist

### HTML Structure
- [ ] Use semantic `<form>` element
- [ ] Each input has associated `<label>` with `for`/`id` connection
- [ ] Form has accessible name (via `aria-label` or heading)
- [ ] Fieldset/legend used for related controls if applicable

### Input Fields
- [ ] Username field properly labeled
- [ ] Password field properly labeled
- [ ] Required fields clearly indicated
- [ ] Input types appropriate (`type="email"`, `type="password"`)
- [ ] Autocomplete attributes present for better UX

### Error Handling
- [ ] Error container present in DOM on page load
- [ ] Error messages use `aria-live` regions
- [ ] `aria-invalid="true"` added to fields with errors
- [ ] `aria-describedby` connects errors to fields
- [ ] Errors visible and programmatically available

### Focus Management
- [ ] Logical tab order maintained
- [ ] Focus indicators meet contrast requirements
- [ ] Focus returns appropriately after form submission
- [ ] Modal focus traps implemented correctly

### Color and Contrast
- [ ] Error states don't rely solely on color
- [ ] Text meets 4.5:1 contrast ratio
- [ ] UI elements meet 3:1 contrast ratio
- [ ] Focus indicators meet 3:1 contrast ratio

## Testing Requirements

### Manual Testing
- [ ] Navigate entire form using only keyboard
- [ ] Verify tab order matches visual layout
- [ ] Test with browser zoom to 200%
- [ ] Verify error messages are announced
- [ ] Test focus management during error states

### Automated Testing
- [ ] Run axe-core or similar accessibility scanner
- [ ] Validate HTML markup
- [ ] Check color contrast ratios
- [ ] Verify ARIA implementation

### Screen Reader Testing
- [ ] Test with NVDA + Chrome/Firefox
- [ ] Test with JAWS + Chrome (if available)
- [ ] Test with VoiceOver + Safari (on macOS)
- [ ] Verify all content is announced appropriately

## Legal Compliance Context
- ADA Title II requires WCAG 2.1 Level AA compliance (as of April 2024)
- Level AA includes all Level A and Level AA requirements
- Many organizations strive for Level AA as the standard benchmark