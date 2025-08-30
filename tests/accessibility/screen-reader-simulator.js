/**
 * Screen Reader Simulation and Testing Framework
 * Validates content accessibility for assistive technologies
 */

class ScreenReaderSimulator {
  constructor() {
    this.accessibilityTree = [];
    this.readingOrder = [];
    this.landmarks = [];
    this.headings = [];
    this.links = [];
    this.formElements = [];
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Simulate screen reader navigation and announce content
   */
  simulateScreenReader(document) {
    console.log('🔊 Simulating Screen Reader Experience...\n');
    
    // Build accessibility tree
    this.buildAccessibilityTree(document);
    
    // Test reading order
    this.testReadingOrder(document);
    
    // Test landmark navigation
    this.testLandmarkNavigation(document);
    
    // Test heading navigation
    this.testHeadingNavigation(document);
    
    // Test link navigation
    this.testLinkNavigation(document);
    
    // Test form navigation
    this.testFormNavigation(document);
    
    // Test ARIA live regions
    this.testLiveRegions(document);
    
    return this.generateScreenReaderReport();
  }

  buildAccessibilityTree(document) {
    console.log('🌳 Building Accessibility Tree...');
    
    const walker = document.createTreeWalker
      ? document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_ELEMENT,
          {
            acceptNode: (node) => {
              // Include elements that provide meaning to screen readers
              const meaningfulElements = [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'p', 'div', 'span', 'a', 'button', 'input', 'select', 'textarea',
                'img', 'figure', 'main', 'nav', 'header', 'footer', 'aside', 'section',
                'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'table', 'th', 'td'
              ];
              
              return meaningfulElements.includes(node.tagName.toLowerCase()) ||
                     node.hasAttribute('role') ||
                     node.hasAttribute('aria-label') ||
                     node.hasAttribute('aria-labelledby') ||
                     node.hasAttribute('aria-describedby')
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_SKIP;
            }
          }
        )
      : null;

    if (walker) {
      let node;
      while (node = walker.nextNode()) {
        this.processNodeForAccessibility(node);
      }
    } else {
      // Fallback for environments without TreeWalker
      this.processAllElements(document.body);
    }
    
    console.log(`   📊 Built tree with ${this.accessibilityTree.length} accessible elements`);
  }

  processAllElements(container) {
    const elements = container.querySelectorAll('*');
    elements.forEach(element => {
      this.processNodeForAccessibility(element);
    });
  }

  processNodeForAccessibility(node) {
    const accessibleName = this.getAccessibleName(node);
    const accessibleDescription = this.getAccessibleDescription(node);
    const role = this.getEffectiveRole(node);
    
    if (accessibleName || role || this.hasSemanticMeaning(node)) {
      this.accessibilityTree.push({
        element: node,
        tagName: node.tagName.toLowerCase(),
        role: role,
        name: accessibleName,
        description: accessibleDescription,
        level: this.getHeadingLevel(node),
        position: this.getElementPosition(node),
        states: this.getARIAStates(node),
        properties: this.getARIAProperties(node)
      });
    }
  }

  getAccessibleName(element) {
    // Priority order for accessible name calculation
    
    // 1. aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElements = labelledBy.split(' ')
        .map(id => document.getElementById(id))
        .filter(el => el);
      
      if (labelElements.length > 0) {
        return labelElements.map(el => el.textContent.trim()).join(' ');
      }
    }
    
    // 2. aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return ariaLabel.trim();
    }
    
    // 3. Associated label element
    const id = element.getAttribute('id');
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) {
        return label.textContent.trim();
      }
    }
    
    // 4. Placeholder (for inputs)
    const placeholder = element.getAttribute('placeholder');
    if (placeholder && element.tagName.toLowerCase() === 'input') {
      return placeholder.trim();
    }
    
    // 5. alt attribute (for images)
    const alt = element.getAttribute('alt');
    if (alt !== null && ['img', 'area', 'input'].includes(element.tagName.toLowerCase())) {
      return alt.trim();
    }
    
    // 6. title attribute
    const title = element.getAttribute('title');
    if (title && title.trim()) {
      return title.trim();
    }
    
    // 7. Text content (for certain elements)
    if (['button', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(element.tagName.toLowerCase())) {
      const textContent = element.textContent.trim();
      if (textContent) {
        return textContent;
      }
    }
    
    return null;
  }

  getAccessibleDescription(element) {
    const describedBy = element.getAttribute('aria-describedby');
    if (describedBy) {
      const descElements = describedBy.split(' ')
        .map(id => document.getElementById(id))
        .filter(el => el);
      
      if (descElements.length > 0) {
        return descElements.map(el => el.textContent.trim()).join(' ');
      }
    }
    
    return null;
  }

  getEffectiveRole(element) {
    const explicitRole = element.getAttribute('role');
    if (explicitRole) {
      return explicitRole;
    }
    
    // Implicit roles based on tag names
    const implicitRoles = {
      'button': 'button',
      'a': element.hasAttribute('href') ? 'link' : null,
      'input': this.getInputRole(element),
      'h1': 'heading',
      'h2': 'heading',
      'h3': 'heading',
      'h4': 'heading',
      'h5': 'heading',
      'h6': 'heading',
      'main': 'main',
      'nav': 'navigation',
      'header': 'banner',
      'footer': 'contentinfo',
      'aside': 'complementary',
      'section': 'region',
      'article': 'article',
      'form': 'form',
      'img': 'img',
      'ul': 'list',
      'ol': 'list',
      'li': 'listitem',
      'table': 'table',
      'tr': 'row',
      'th': 'columnheader',
      'td': 'cell'
    };
    
    return implicitRoles[element.tagName.toLowerCase()] || null;
  }

  getInputRole(inputElement) {
    const type = inputElement.getAttribute('type') || 'text';
    const roleMap = {
      'button': 'button',
      'submit': 'button',
      'reset': 'button',
      'checkbox': 'checkbox',
      'radio': 'radio',
      'range': 'slider',
      'text': 'textbox',
      'email': 'textbox',
      'password': 'textbox',
      'search': 'searchbox',
      'url': 'textbox',
      'tel': 'textbox'
    };
    
    return roleMap[type] || 'textbox';
  }

  hasSemanticMeaning(element) {
    return element.tagName.toLowerCase() === 'img' ||
           element.hasAttribute('role') ||
           element.hasAttribute('aria-label') ||
           element.hasAttribute('aria-labelledby') ||
           ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'a', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase());
  }

  getHeadingLevel(element) {
    if (element.tagName.match(/^h[1-6]$/i)) {
      return parseInt(element.tagName.charAt(1));
    }
    
    const role = element.getAttribute('role');
    if (role === 'heading') {
      const level = element.getAttribute('aria-level');
      return level ? parseInt(level) : 2; // Default heading level
    }
    
    return null;
  }

  getElementPosition(element) {
    const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : null;
    return rect ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height } : null;
  }

  getARIAStates(element) {
    const states = {};
    
    // Boolean states
    const booleanStates = ['aria-checked', 'aria-disabled', 'aria-expanded', 'aria-hidden', 'aria-invalid', 'aria-pressed', 'aria-readonly', 'aria-required', 'aria-selected'];
    
    booleanStates.forEach(state => {
      const value = element.getAttribute(state);
      if (value !== null) {
        states[state] = value === 'true';
      }
    });
    
    return states;
  }

  getARIAProperties(element) {
    const properties = {};
    
    // Common ARIA properties
    const ariaProperties = ['aria-controls', 'aria-describedby', 'aria-flowto', 'aria-label', 'aria-labelledby', 'aria-owns', 'aria-activedescendant', 'aria-atomic', 'aria-live', 'aria-relevant', 'aria-dropeffect', 'aria-grabbed'];
    
    ariaProperties.forEach(prop => {
      const value = element.getAttribute(prop);
      if (value !== null) {
        properties[prop] = value;
      }
    });
    
    return properties;
  }

  testReadingOrder(document) {
    console.log('\n📖 Testing Reading Order...');
    
    // Simulate screen reader reading order (document order)
    const readableElements = this.accessibilityTree.filter(item => 
      item.name || 
      ['heading', 'link', 'button', 'textbox', 'img'].includes(item.role) ||
      item.element.textContent.trim()
    );
    
    this.readingOrder = readableElements.map((item, index) => {
      const announcement = this.generateAnnouncement(item);
      return {
        order: index + 1,
        element: item.element,
        announcement: announcement,
        role: item.role,
        name: item.name
      };
    });
    
    // Check for logical reading order
    const orderIssues = this.checkReadingOrderLogic();
    
    if (orderIssues.length === 0) {
      console.log(`✅ Reading order is logical (${this.readingOrder.length} announcements)`);
    } else {
      console.log(`⚠️  Reading order issues found: ${orderIssues.length}`);
      orderIssues.forEach(issue => console.log(`   ❌ ${issue}`));
    }
  }

  generateAnnouncement(item) {
    const { role, name, description, level, states } = item;
    
    let announcement = '';
    
    // Add name first
    if (name) {
      announcement += name;
    }
    
    // Add role information
    if (role) {
      switch (role) {
        case 'heading':
          announcement += `, heading level ${level || 1}`;
          break;
        case 'link':
          if (states['aria-visited']) {
            announcement += ', visited link';
          } else {
            announcement += ', link';
          }
          break;
        case 'button':
          announcement += ', button';
          if (states['aria-pressed'] !== undefined) {
            announcement += states['aria-pressed'] ? ', pressed' : ', not pressed';
          }
          break;
        case 'textbox':
          announcement += ', edit text';
          if (states['aria-required']) {
            announcement += ', required';
          }
          break;
        case 'checkbox':
          announcement += ', checkbox';
          if (states['aria-checked'] !== undefined) {
            announcement += states['aria-checked'] ? ', checked' : ', not checked';
          }
          break;
        case 'img':
          announcement += ', image';
          break;
        default:
          announcement += `, ${role}`;
      }
    }
    
    // Add state information
    if (states['aria-expanded'] !== undefined) {
      announcement += states['aria-expanded'] ? ', expanded' : ', collapsed';
    }
    
    if (states['aria-disabled']) {
      announcement += ', unavailable';
    }
    
    // Add description
    if (description) {
      announcement += `, ${description}`;
    }
    
    return announcement.trim().replace(/^,\s*/, '');
  }

  checkReadingOrderLogic() {
    const issues = [];
    
    // Check heading hierarchy in reading order
    let lastHeadingLevel = 0;
    this.readingOrder.forEach((item, index) => {
      if (item.role === 'heading') {
        const currentLevel = this.getHeadingLevel(item.element);
        if (currentLevel && currentLevel - lastHeadingLevel > 1) {
          issues.push(`Heading hierarchy skip at position ${index + 1}: h${lastHeadingLevel} to h${currentLevel}`);
        }
        lastHeadingLevel = currentLevel || lastHeadingLevel;
      }
    });
    
    return issues;
  }

  testLandmarkNavigation(document) {
    console.log('\n🗺️  Testing Landmark Navigation...');
    
    const landmarkSelectors = [
      '[role="banner"], header',
      '[role="navigation"], nav',
      '[role="main"], main',
      '[role="complementary"], aside',
      '[role="contentinfo"], footer',
      '[role="search"]',
      '[role="form"], form',
      '[role="region"]'
    ];
    
    landmarkSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element, index) => {
        const role = this.getEffectiveRole(element);
        const name = this.getAccessibleName(element);
        
        this.landmarks.push({
          role: role,
          name: name || `${role} ${index + 1}`,
          element: element
        });
      });
    });
    
    if (this.landmarks.length === 0) {
      this.errors.push('No landmarks found - users cannot navigate page structure');
      console.log('❌ No landmarks found');
    } else {
      console.log(`✅ Found ${this.landmarks.length} landmarks:`);
      this.landmarks.forEach(landmark => {
        console.log(`   • ${landmark.name} (${landmark.role})`);
      });
    }
  }

  testHeadingNavigation(document) {
    console.log('\n📋 Testing Heading Navigation...');
    
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
    
    headingElements.forEach((heading, index) => {
      const level = this.getHeadingLevel(heading);
      const name = this.getAccessibleName(heading) || heading.textContent.trim();
      
      if (name) {
        this.headings.push({
          level: level,
          name: name,
          element: heading,
          announcement: `${name}, heading level ${level}`
        });
      } else {
        this.errors.push(`Heading ${index + 1} has no accessible text`);
      }
    });
    
    if (this.headings.length === 0) {
      this.warnings.push('No headings found - users cannot navigate content structure');
      console.log('⚠️  No headings found');
    } else {
      console.log(`✅ Found ${this.headings.length} headings:`);
      this.headings.forEach(heading => {
        console.log(`   • Level ${heading.level}: ${heading.name}`);
      });
    }
  }

  testLinkNavigation(document) {
    console.log('\n🔗 Testing Link Navigation...');
    
    const linkElements = document.querySelectorAll('a[href], [role="link"]');
    
    linkElements.forEach((link, index) => {
      const name = this.getAccessibleName(link);
      const href = link.getAttribute('href');
      
      if (!name) {
        this.errors.push(`Link ${index + 1} has no accessible name`);
      } else if (name.toLowerCase().match(/^(click here|here|link|read more)$/)) {
        this.warnings.push(`Link ${index + 1} has ambiguous text: "${name}"`);
      } else {
        this.links.push({
          name: name,
          href: href,
          element: link,
          announcement: href && href.startsWith('http') ? `${name}, link` : `${name}, internal link`
        });
      }
    });
    
    console.log(`✅ Found ${this.links.length} accessible links`);
    if (this.warnings.length > 0) {
      console.log(`⚠️  Link warnings: ${this.warnings.filter(w => w.includes('ambiguous')).length}`);
    }
  }

  testFormNavigation(document) {
    console.log('\n📝 Testing Form Navigation...');
    
    const formElements = document.querySelectorAll('input, select, textarea, button[type="submit"], button[type="button"]');
    
    formElements.forEach((element, index) => {
      const name = this.getAccessibleName(element);
      const role = this.getEffectiveRole(element);
      const required = element.hasAttribute('required') || element.getAttribute('aria-required') === 'true';
      const invalid = element.getAttribute('aria-invalid') === 'true';
      
      if (!name) {
        this.errors.push(`Form element ${index + 1} (${element.tagName.toLowerCase()}) has no accessible name`);
      } else {
        let announcement = `${name}, ${role}`;
        if (required) announcement += ', required';
        if (invalid) announcement += ', invalid';
        
        this.formElements.push({
          name: name,
          role: role,
          required: required,
          invalid: invalid,
          element: element,
          announcement: announcement
        });
      }
    });
    
    console.log(`✅ Found ${this.formElements.length} accessible form elements`);
  }

  testLiveRegions(document) {
    console.log('\n📢 Testing Live Regions...');
    
    const liveRegions = document.querySelectorAll('[aria-live], [role="status"], [role="alert"], [role="log"]');
    
    if (liveRegions.length === 0) {
      this.warnings.push('No live regions found - dynamic content updates may not be announced');
      console.log('⚠️  No live regions found');
    } else {
      console.log(`✅ Found ${liveRegions.length} live regions`);
      liveRegions.forEach((region, index) => {
        const politeness = region.getAttribute('aria-live') || 
                          (region.getAttribute('role') === 'alert' ? 'assertive' : 'polite');
        console.log(`   • Live region ${index + 1}: ${politeness}`);
      });
    }
  }

  generateScreenReaderReport() {
    const report = {
      summary: {
        totalElements: this.accessibilityTree.length,
        readingOrder: this.readingOrder.length,
        landmarks: this.landmarks.length,
        headings: this.headings.length,
        links: this.links.length,
        formElements: this.formElements.length,
        errors: this.errors.length,
        warnings: this.warnings.length
      },
      details: {
        accessibilityTree: this.accessibilityTree,
        readingOrder: this.readingOrder,
        landmarks: this.landmarks,
        headings: this.headings,
        links: this.links,
        formElements: this.formElements,
        errors: this.errors,
        warnings: this.warnings
      }
    };

    this.printScreenReaderReport(report);
    return report;
  }

  printScreenReaderReport(report) {
    console.log('\n📊 Screen Reader Simulation Report');
    console.log('===================================');
    console.log(`🔊 Total Accessible Elements: ${report.summary.totalElements}`);
    console.log(`📖 Reading Order Items: ${report.summary.readingOrder}`);
    console.log(`🗺️  Landmarks: ${report.summary.landmarks}`);
    console.log(`📋 Headings: ${report.summary.headings}`);
    console.log(`🔗 Links: ${report.summary.links}`);
    console.log(`📝 Form Elements: ${report.summary.formElements}`);
    console.log(`❌ Errors: ${report.summary.errors}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}\n`);

    if (report.details.errors.length > 0) {
      console.log('❌ SCREEN READER ERRORS:');
      report.details.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
      console.log();
    }

    if (report.details.warnings.length > 0) {
      console.log('⚠️  SCREEN READER WARNINGS:');
      report.details.warnings.forEach(warning => {
        console.log(`   • ${warning}`);
      });
      console.log();
    }

    // Show sample announcements
    if (report.details.readingOrder.length > 0) {
      console.log('🔊 SAMPLE SCREEN READER ANNOUNCEMENTS:');
      report.details.readingOrder.slice(0, 10).forEach((item, index) => {
        console.log(`   ${index + 1}. "${item.announcement}"`);
      });
      if (report.details.readingOrder.length > 10) {
        console.log(`   ... and ${report.details.readingOrder.length - 10} more announcements\n`);
      }
    }
  }
}

module.exports = ScreenReaderSimulator;