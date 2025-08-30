# WCAG 2.1 Accessibility Testing Checklist

## Overview
This checklist provides a comprehensive guide for validating WCAG 2.1 compliance across Level A, AA, and AAA standards.

## Testing Status Legend
- ✅ **Pass** - Requirement fully met
- ⚠️ **Warning** - Potential issue or improvement needed  
- ❌ **Fail** - Critical issue that must be fixed
- 🔍 **Manual** - Requires manual testing
- 🤖 **Auto** - Can be automated

---

## 1. Perceivable

### 1.1 Text Alternatives

#### 1.1.1 Non-text Content (Level A) 🤖
- [ ] All images have appropriate alt text
- [ ] Decorative images have empty alt="" or role="presentation"
- [ ] Complex images (charts, graphs) have detailed descriptions
- [ ] Form images (input type="image") have alt attributes
- [ ] Image buttons have accessible names

**Testing:**
```javascript
// Check for missing alt text
const images = document.querySelectorAll('img:not([alt])');
console.log('Images without alt:', images.length);

// Check for poor alt text
const poorAlt = document.querySelectorAll('img[alt*="image"], img[alt*="picture"]');
console.log('Images with poor alt text:', poorAlt.length);
```

### 1.2 Time-based Media

#### 1.2.1 Audio-only and Video-only (Level A) 🔍
- [ ] Audio-only content has text transcripts
- [ ] Video-only content has audio descriptions or text alternatives
- [ ] Live audio has real-time captions

#### 1.2.2 Captions (Level A) 🔍
- [ ] Pre-recorded videos have captions
- [ ] Captions are accurate and synchronized
- [ ] Captions include sound effects and speaker identification

#### 1.2.3 Audio Description or Media Alternative (Level A) 🔍
- [ ] Pre-recorded video has audio descriptions
- [ ] Alternative: Full text transcript available

### 1.3 Adaptable

#### 1.3.1 Info and Relationships (Level A) 🤖
- [ ] Semantic HTML structure (headings, lists, tables)
- [ ] Form labels properly associated with inputs
- [ ] Data tables use th, caption, and scope attributes
- [ ] Reading order makes sense when CSS is disabled

**Testing:**
```javascript
// Check heading hierarchy
const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
let lastLevel = 0;
headings.forEach(h => {
  const level = parseInt(h.tagName[1]);
  if (level - lastLevel > 1) console.warn('Heading skip:', lastLevel, 'to', level);
  lastLevel = level;
});

// Check form labels
const inputs = document.querySelectorAll('input, select, textarea');
inputs.forEach(input => {
  const label = document.querySelector(`label[for="${input.id}"]`);
  const ariaLabel = input.getAttribute('aria-label');
  if (!label && !ariaLabel) console.warn('Unlabeled input:', input);
});
```

#### 1.3.2 Meaningful Sequence (Level A) 🔍
- [ ] Content order is logical when linearized
- [ ] Tab order follows visual order
- [ ] CSS doesn't break logical reading order

#### 1.3.3 Sensory Characteristics (Level A) 🔍
- [ ] Instructions don't rely only on color
- [ ] Instructions don't rely only on shape/position
- [ ] Instructions don't rely only on sound

### 1.4 Distinguishable

#### 1.4.1 Use of Color (Level A) 🔍
- [ ] Color is not the only way to convey information
- [ ] Links are distinguishable without color
- [ ] Form validation errors don't rely only on color

#### 1.4.2 Audio Control (Level A) 🔍
- [ ] Auto-playing audio can be stopped/controlled
- [ ] Auto-playing audio lasts less than 3 seconds

#### 1.4.3 Contrast (Minimum) (Level AA) 🤖
- [ ] Normal text: 4.5:1 contrast ratio
- [ ] Large text: 3:1 contrast ratio  
- [ ] UI components: 3:1 contrast ratio

**Testing:**
```javascript
// Use the ColorContrastAnalyzer class
const analyzer = new ColorContrastAnalyzer();
const report = analyzer.analyzeDocument(document);
```

#### 1.4.4 Resize Text (Level AA) 🔍
- [ ] Text can be resized up to 200% without horizontal scrolling
- [ ] No content is lost when zoomed
- [ ] Layout remains functional at 200% zoom

#### 1.4.5 Images of Text (Level AA) 🔍
- [ ] Text is used instead of images of text when possible
- [ ] Images of text are only used when customizable or essential

---

## 2. Operable

### 2.1 Keyboard Accessible

#### 2.1.1 Keyboard (Level A) 🤖
- [ ] All interactive elements are keyboard accessible
- [ ] No positive tabindex values
- [ ] Custom controls have keyboard support

**Testing:**
```javascript
// Use the KeyboardNavigationTester class
const tester = new KeyboardNavigationTester();
const report = await tester.testBasicKeyboardNavigation(document);
```

#### 2.1.2 No Keyboard Trap (Level A) 🤖
- [ ] Focus can move away from any component
- [ ] Modal dialogs trap focus properly but allow escape
- [ ] Focus loops work correctly in components

#### 2.1.3 Keyboard (No Exception) (Level AAA) 🤖
- [ ] All functionality available via keyboard
- [ ] No exceptions for specific user interface components

### 2.2 Enough Time

#### 2.2.1 Timing Adjustable (Level A) 🔍
- [ ] Time limits can be extended/disabled
- [ ] User is warned before timeout
- [ ] Essential time limits are clearly communicated

#### 2.2.2 Pause, Stop, Hide (Level A) 🔍
- [ ] Auto-updating content can be paused
- [ ] Moving/blinking content can be stopped
- [ ] Auto-playing media can be controlled

### 2.3 Seizures and Physical Reactions

#### 2.3.1 Three Flashes or Below Threshold (Level A) 🔍
- [ ] No content flashes more than 3 times per second
- [ ] Flashing content is below general/red flash thresholds

### 2.4 Navigable

#### 2.4.1 Bypass Blocks (Level A) 🤖
- [ ] Skip navigation links are provided
- [ ] Skip links are functional and properly targeted
- [ ] Multiple ways to navigate (menus, search, etc.)

**Testing:**
```javascript
// Check for skip links
const skipLinks = document.querySelectorAll('a[href^="#"]');
const mainContent = skipLinks.filter(link => 
  link.textContent.toLowerCase().includes('skip') &&
  link.textContent.toLowerCase().includes('main')
);
console.log('Skip links found:', mainContent.length);
```

#### 2.4.2 Page Titled (Level A) 🤖
- [ ] Page has descriptive title
- [ ] Title identifies page content/purpose
- [ ] Title is unique within the site

#### 2.4.3 Focus Order (Level A) 🤖
- [ ] Focus order is logical and intuitive
- [ ] Tab sequence matches visual layout
- [ ] Focus order preserves meaning

#### 2.4.4 Link Purpose (Level A) 🤖
- [ ] Link text describes the link's purpose
- [ ] Links are understandable out of context
- [ ] Avoid "click here" or "read more" without context

#### 2.4.5 Multiple Ways (Level AA) 🔍
- [ ] More than one way to locate pages
- [ ] Site map, search, navigation menu provided
- [ ] Related links help users find content

#### 2.4.6 Headings and Labels (Level AA) 🤖
- [ ] Headings describe content sections
- [ ] Form labels describe purpose clearly
- [ ] Headings and labels are not empty

#### 2.4.7 Focus Visible (Level AA) 🤖
- [ ] Keyboard focus indicator is visible
- [ ] Focus indicators have sufficient contrast
- [ ] Focus indicators are not removed by CSS

---

## 3. Understandable

### 3.1 Readable

#### 3.1.1 Language of Page (Level A) 🤖
- [ ] Page language is specified in html lang attribute
- [ ] Language code is valid (e.g., "en", "es", "fr")

**Testing:**
```javascript
// Check page language
const html = document.documentElement;
const lang = html.getAttribute('lang');
console.log('Page language:', lang || 'Not specified');
```

#### 3.1.2 Language of Parts (Level AA) 🔍
- [ ] Changes in language are marked with lang attribute
- [ ] Foreign phrases are properly identified

### 3.2 Predictable

#### 3.2.1 On Focus (Level A) 🔍
- [ ] Focus doesn't trigger unexpected context changes
- [ ] Form submission requires explicit action
- [ ] Navigation remains consistent

#### 3.2.2 On Input (Level A) 🔍
- [ ] Input changes don't cause unexpected context changes
- [ ] Form auto-submission is avoided or clearly indicated
- [ ] Settings changes are confirmed

#### 3.2.3 Consistent Navigation (Level AA) 🔍
- [ ] Navigation appears in consistent locations
- [ ] Navigation order is consistent across pages
- [ ] Navigation mechanisms are predictable

#### 3.2.4 Consistent Identification (Level AA) 🔍
- [ ] Components with same functionality are identified consistently
- [ ] Icons and buttons have consistent meaning
- [ ] Similar elements have similar names

### 3.3 Input Assistance

#### 3.3.1 Error Identification (Level A) 🤖
- [ ] Form errors are clearly identified
- [ ] Error messages are descriptive
- [ ] Required fields are clearly marked

**Testing:**
```javascript
// Check for required field indicators
const required = document.querySelectorAll('[required], [aria-required="true"]');
required.forEach(field => {
  const label = document.querySelector(`label[for="${field.id}"]`);
  if (label && !label.textContent.includes('*') && !label.textContent.includes('required')) {
    console.warn('Required field not clearly marked:', field);
  }
});
```

#### 3.3.2 Labels or Instructions (Level A) 🤖
- [ ] Form fields have clear labels
- [ ] Required information is indicated
- [ ] Format requirements are explained
- [ ] Examples are provided where helpful

#### 3.3.3 Error Suggestion (Level AA) 🔍
- [ ] Error messages suggest corrections
- [ ] Suggestions are specific and helpful
- [ ] Security-sensitive errors don't reveal details

#### 3.3.4 Error Prevention (Level AA) 🔍
- [ ] Legal/financial submissions can be reversed
- [ ] Data is checked for input errors
- [ ] User can review before final submission

---

## 4. Robust

### 4.1 Compatible

#### 4.1.1 Parsing (Level A) 🤖
- [ ] HTML is valid (no critical parse errors)
- [ ] Elements have unique IDs
- [ ] Required attributes are present

**Testing:**
```javascript
// Check for duplicate IDs
const ids = new Set();
const elements = document.querySelectorAll('[id]');
elements.forEach(el => {
  if (ids.has(el.id)) console.error('Duplicate ID:', el.id);
  ids.add(el.id);
});
```

#### 4.1.2 Name, Role, Value (Level A) 🤖
- [ ] Custom components have proper roles
- [ ] Interactive elements have accessible names
- [ ] State changes are programmatically determinable
- [ ] ARIA attributes are used correctly

**Testing:**
```javascript
// Use the WCAGValidator and ScreenReaderSimulator classes
const validator = new WCAGValidator();
const results = validator.validateARIA(document);
```

---

## Automated Testing Tools

### JavaScript Testing Framework
```javascript
// Run complete accessibility audit
const AccessibilityTestRunner = require('./accessibility-test-runner');
const runner = new AccessibilityTestRunner();

// Test a document
const results = await runner.runFullAccessibilityAudit(document);
console.log('Accessibility Score:', results.summary.overallCompliance + '%');

// Export results
const jsonReport = runner.exportResults('json');
const htmlReport = runner.exportResults('html');
```

### Manual Testing Procedures

#### Keyboard Navigation Testing
1. **Tab through all interactive elements**
   - Use Tab and Shift+Tab
   - Verify logical order
   - Check focus indicators

2. **Test keyboard shortcuts**
   - Arrow keys in menus/tabs
   - Enter/Space to activate
   - Escape to close modals

3. **Test without mouse**
   - Complete all tasks using only keyboard
   - Verify all functionality is accessible

#### Screen Reader Testing
1. **Test with screen reader**
   - NVDA (Windows, free)
   - JAWS (Windows, trial)
   - VoiceOver (Mac, built-in)

2. **Navigation patterns**
   - Browse by headings (H key)
   - Browse by landmarks (D key)  
   - Browse by links (K key)
   - Browse by form fields (F key)

#### Color and Visual Testing
1. **Color blindness simulation**
   - Use browser dev tools
   - Test with colorblinding.com
   - Verify information isn't color-dependent

2. **Zoom and resize testing**
   - Test at 200% zoom
   - Test at 400% zoom (Level AAA)
   - Verify horizontal scrolling not required

---

## Reporting Template

### Summary Report
```
ACCESSIBILITY AUDIT SUMMARY
===========================
Date: [Date]
URL: [URL]
WCAG Level: [A/AA/AAA]

Overall Score: [X]%
- WCAG Compliance: [X]%
- Keyboard Navigation: [X]%
- Color Contrast: [X]%
- Screen Reader: [X]%

Critical Issues: [X]
High Priority: [X]
Medium Priority: [X]
Low Priority: [X]

Status: [Pass/Fail/Needs Work]
```

### Issue Template
```
ISSUE #[X]: [Title]
Priority: [Critical/High/Medium/Low]
WCAG: [Guideline] (Level [A/AA/AAA])

Description: [What is the problem?]
Impact: [Who is affected and how?]
Steps to Reproduce: [How to find the issue]
Recommendation: [How to fix it]
Code Example: [Sample fix]
Test: [How to verify the fix]
```

---

## Resources

### WCAG 2.1 Guidelines
- [Official WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [WCAG Understanding](https://www.w3.org/WAI/WCAG21/Understanding/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse Accessibility](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Analyzers](https://www.tpgi.com/color-contrast-checker/)

### Screen Readers
- [NVDA (Free)](https://www.nvaccess.org/)
- [JAWS (Trial)](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver Guide](https://webaim.org/articles/voiceover/)

---

**Remember**: This checklist covers the most critical accessibility requirements. Always test with real users and assistive technologies when possible.