# Implementation Guidelines for Development Agents

## Overview for Development Team

This guide provides specific implementation instructions for each development agent (researcher, coder, tester, reviewer) based on the system architecture designed for the responsive pricing table component.

## Architecture Summary

### Key Design Decisions
- **Component-based modular architecture** with semantic HTML
- **CSS custom properties** for theming and responsive design
- **Mobile-first progressive enhancement** approach
- **JavaScript enhancement** with graceful degradation
- **WCAG 2.1 AA accessibility** compliance

### Technology Stack
- **HTML**: Semantic markup with proper ARIA roles
- **CSS**: Custom properties, Grid/Flexbox, ITCSS methodology
- **JavaScript**: ES6 modules, Progressive enhancement
- **Build**: Rollup, PostCSS, modern toolchain

## Researcher Agent Instructions

### Research Priorities
1. **Pricing Table UX Patterns**
   - Study successful pricing table implementations
   - Analyze mobile collapse patterns (accordion vs tabs vs carousel)
   - Research accessibility best practices for comparison tables

2. **Performance Benchmarks**
   - Investigate CSS custom property performance impact
   - Research intersection observer vs scroll event performance
   - Study mobile touch interaction patterns

3. **Browser Compatibility**
   - Verify CSS Grid support requirements
   - Test CSS custom properties in target browsers
   - Research ResizeObserver polyfill needs

### Memory Storage Keys
```bash
# Store findings using these memory keys:
research/pricing-table/ux-patterns
research/pricing-table/performance-data  
research/pricing-table/browser-support
research/pricing-table/accessibility-findings
```

### Deliverables
- Market analysis of pricing table patterns
- Performance benchmark recommendations
- Browser compatibility matrix
- Accessibility audit checklist

## Coder Agent Instructions

### Implementation Phases

#### Phase 1: Core HTML Structure
```html
<!-- Follow the semantic structure from component-structure.md -->
<section class="pricing-table" role="region" aria-labelledby="pricing-heading">
  <!-- Implement exact structure as specified -->
</section>
```

**Key Requirements:**
- Use exact BEM class names from architecture
- Implement all ARIA roles and labels
- Include data attributes for JavaScript hooks
- Follow progressive enhancement principles

#### Phase 2: CSS Implementation
```css
/* Implement CSS following the ITCSS layer order */
@import 'base/reset';
@import 'base/variables';
/* ... follow exact import order from file-organization.md */
```

**Critical Implementation Details:**
1. **Custom Properties**: Implement exact variable naming from `css-variables-system.md`
2. **Responsive Strategy**: Follow mobile-first breakpoints from `responsive-strategy.md`
3. **BEM Methodology**: Use consistent class naming patterns
4. **Performance**: Minimize layout shifts and reflows

#### Phase 3: JavaScript Enhancement
```javascript
// Follow the module pattern from javascript-patterns.md
import { PricingTable } from './core/pricing-table.js';

// Initialize with exact API as specified
document.addEventListener('DOMContentLoaded', () => {
  const pricingTables = document.querySelectorAll('.pricing-table');
  pricingTables.forEach(element => {
    new PricingTable(element, {
      mobileBreakpoint: 768,
      enableAnimations: true
    });
  });
});
```

**JavaScript Implementation Rules:**
- Follow ES6 module patterns exactly
- Implement progressive enhancement (HTML works without JS)
- Use event delegation for performance
- Include proper error handling and cleanup

#### Phase 4: Integration Hooks
```bash
# Execute these hooks at appropriate stages:
npx claude-flow@alpha hooks pre-task --description "Implementing pricing table core"
npx claude-flow@alpha hooks post-edit --file "src/styles/main.css" --memory-key "swarm/coder/css-complete"
npx claude-flow@alpha hooks post-task --task-id "pricing-table-implementation"
```

### Memory Coordination
Store implementation progress using these keys:
- `swarm/coder/html-structure-complete`
- `swarm/coder/css-implementation-complete` 
- `swarm/coder/javascript-enhancement-complete`
- `swarm/coder/integration-testing-complete`

### File Organization Requirements
```
src/
├── styles/
│   ├── base/
│   │   ├── _reset.css
│   │   ├── _variables.css
│   │   └── _typography.css
│   ├── components/
│   │   ├── _pricing-table.css
│   │   ├── _pricing-tier.css
│   │   └── _pricing-mobile.css
│   └── main.css
├── scripts/
│   ├── core/
│   │   └── pricing-table.js
│   ├── components/
│   │   └── mobile-controller.js
│   └── main.js
└── templates/
    └── pricing-table.html
```

## Tester Agent Instructions

### Testing Strategy

#### 1. Accessibility Testing (Priority 1)
```bash
# Use these testing tools and approaches:
npm install --save-dev @axe-core/cli jest-axe
npx axe-cli http://localhost:3000 --tags wcag2a,wcag2aa
```

**Test Requirements:**
- Screen reader navigation (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation testing
- High contrast mode compatibility
- Color contrast ratio validation (4.5:1 minimum)
- Focus management in mobile accordion/tabs

#### 2. Responsive Testing
**Breakpoint Testing:**
- Mobile: 320px, 375px, 414px
- Tablet: 768px, 1024px  
- Desktop: 1200px, 1440px, 1920px

**Cross-browser Testing:**
- Chrome 90+, Firefox 88+, Safari 14+
- Edge 90+, iOS Safari 14+, Chrome Android 90+

#### 3. Performance Testing
```javascript
// Performance metrics to measure:
const metrics = [
  'First Contentful Paint',
  'Largest Contentful Paint', 
  'Cumulative Layout Shift',
  'Time to Interactive'
];
```

#### 4. JavaScript Testing
```javascript
// Unit test structure:
describe('PricingTable', () => {
  test('initializes with default options', () => {});
  test('handles mobile layout changes', () => {});
  test('manages accordion state correctly', () => {});
  test('supports keyboard navigation', () => {});
});
```

### Memory Storage for Test Results
```bash
# Store test results using these keys:
tests/accessibility/wcag-compliance
tests/performance/lighthouse-scores
tests/responsive/breakpoint-results
tests/unit/coverage-report
```

### Test Deliverables
- Accessibility audit report (WCAG 2.1 AA)
- Performance benchmark results
- Cross-browser compatibility matrix
- Unit and integration test suite
- Visual regression test screenshots

## Reviewer Agent Instructions

### Code Review Checklist

#### 1. Architecture Compliance Review
- [ ] Components follow specified module patterns
- [ ] CSS custom properties use exact naming conventions
- [ ] HTML follows semantic structure requirements
- [ ] JavaScript implements progressive enhancement

#### 2. Performance Review
- [ ] CSS follows ITCSS methodology for optimal cascade
- [ ] JavaScript uses event delegation and proper cleanup
- [ ] Images and icons are optimized
- [ ] No layout shifts during responsive changes

#### 3. Accessibility Review
- [ ] All ARIA roles and labels implemented correctly
- [ ] Keyboard navigation works in all modes
- [ ] Focus management follows WCAG guidelines  
- [ ] Color contrast meets minimum requirements
- [ ] Screen reader announcements are appropriate

#### 4. Code Quality Review
- [ ] Follows established naming conventions
- [ ] Error handling and edge cases covered
- [ ] Memory leaks prevented (proper cleanup)
- [ ] Documentation matches implementation

#### 5. Integration Review
- [ ] Component works in framework integrations
- [ ] Build process produces correct outputs
- [ ] Package.json dependencies are minimal
- [ ] Bundle size is optimized

### Review Documentation Template
```markdown
## Code Review: Responsive Pricing Table

### Architecture Compliance: ✅/❌
- Component structure: ✅
- CSS organization: ✅  
- JavaScript patterns: ❌ (needs cleanup in mobile-controller.js)

### Performance Analysis: ✅/❌
- Bundle size: 15KB gzipped ✅
- Time to Interactive: 1.2s ✅
- Layout stability: CLS 0.05 ✅

### Accessibility Audit: ✅/❌
- WCAG 2.1 AA: ✅
- Screen reader: ✅
- Keyboard navigation: ❌ (tab trap issue in mobile mode)

### Recommendations:
1. Fix keyboard focus trap in mobile accordion
2. Optimize event listener cleanup
3. Add error boundary for JavaScript failures
```

## Coordination Protocols

### Inter-Agent Communication
1. **Researcher → Coder**: Store findings in memory before implementation begins
2. **Coder → Tester**: Implement hooks to notify when components are ready for testing  
3. **Tester → Reviewer**: Provide test results via memory storage for review analysis
4. **Reviewer → All**: Share review feedback and improvement recommendations

### Memory Keys for Coordination
```bash
# Status tracking:
coordination/pricing-table/research-complete
coordination/pricing-table/implementation-complete  
coordination/pricing-table/testing-complete
coordination/pricing-table/review-complete

# Issue tracking:
issues/pricing-table/accessibility-issues
issues/pricing-table/performance-issues
issues/pricing-table/browser-compatibility-issues
```

### Quality Gates
Each agent must verify these quality gates before marking their phase complete:

1. **Researcher**: All architectural decisions backed by research data
2. **Coder**: All components pass lint and build without warnings
3. **Tester**: All tests pass and accessibility audit is clean
4. **Reviewer**: All code review items addressed and documented

### Success Criteria
The implementation is complete when:
- [ ] WCAG 2.1 AA accessibility compliance verified
- [ ] Performance benchmarks met (< 2s Time to Interactive)
- [ ] Cross-browser compatibility confirmed
- [ ] All architectural requirements implemented
- [ ] Code review approved with no blocking issues
- [ ] Documentation updated and comprehensive

This implementation guide ensures all agents work cohesively toward the same architectural vision while maintaining high quality standards and proper coordination through the swarm memory system.