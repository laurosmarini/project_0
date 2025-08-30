/**
 * Color Contrast Analyzer for WCAG 2.1 Compliance
 * Validates color contrast ratios for accessibility
 */

class ColorContrastAnalyzer {
  constructor() {
    this.contrastResults = [];
    this.colorPalette = new Map();
    
    // WCAG 2.1 contrast requirements
    this.standards = {
      AA: {
        normal: 4.5,    // Normal text
        large: 3.0,     // Large text (18pt+ or 14pt+ bold)
        ui: 3.0         // UI components and graphics
      },
      AAA: {
        normal: 7.0,    // Enhanced contrast
        large: 4.5,     // Large text enhanced
        ui: 4.5         // UI components enhanced
      }
    };
  }

  /**
   * Analyze color contrast throughout the document
   */
  analyzeDocument(document) {
    console.log('🎨 Analyzing Color Contrast...\n');
    
    // Get all elements with text content
    const textElements = this.getTextElements(document);
    
    textElements.forEach((element, index) => {
      this.analyzeElementContrast(element, index);
    });
    
    // Analyze UI components
    this.analyzeUIComponents(document);
    
    return this.generateContrastReport();
  }

  getTextElements(document) {
    return Array.from(document.querySelectorAll('*')).filter(element => {
      // Has direct text content (not just from children)
      const hasDirectText = element.childNodes.length > 0 && 
        Array.from(element.childNodes).some(node => 
          node.nodeType === Node.TEXT_NODE && 
          node.textContent.trim().length > 0
        );
      
      return hasDirectText || 
             element.tagName.toLowerCase() === 'input' ||
             element.tagName.toLowerCase() === 'button' ||
             element.tagName.toLowerCase() === 'a';
    });
  }

  analyzeElementContrast(element, index) {
    try {
      const styles = getComputedStyle ? getComputedStyle(element) : this.getMockStyles(element);
      
      const foreground = this.parseColor(styles.color || '#000000');
      const background = this.getBackgroundColor(element, styles);
      
      if (!foreground || !background) {
        this.contrastResults.push({
          element: `${element.tagName.toLowerCase()} ${index + 1}`,
          issue: 'Could not determine colors',
          status: 'warning'
        });
        return;
      }

      const contrast = this.calculateContrast(foreground, background);
      const fontSize = parseFloat(styles.fontSize) || 16;
      const fontWeight = styles.fontWeight || 'normal';
      const isLarge = this.isLargeText(fontSize, fontWeight);
      
      this.evaluateContrast(element, index, contrast, isLarge, foreground, background);
      
    } catch (error) {
      this.contrastResults.push({
        element: `${element.tagName.toLowerCase()} ${index + 1}`,
        issue: `Analysis failed: ${error.message}`,
        status: 'error'
      });
    }
  }

  getMockStyles(element) {
    // Fallback for environments without getComputedStyle
    const tagName = element.tagName.toLowerCase();
    
    const defaultStyles = {
      'h1': { color: '#000000', fontSize: '32px', fontWeight: 'bold' },
      'h2': { color: '#000000', fontSize: '24px', fontWeight: 'bold' },
      'h3': { color: '#000000', fontSize: '20px', fontWeight: 'bold' },
      'p': { color: '#000000', fontSize: '16px', fontWeight: 'normal' },
      'a': { color: '#0000EE', fontSize: '16px', fontWeight: 'normal' },
      'button': { color: '#000000', fontSize: '16px', fontWeight: 'normal' },
      'input': { color: '#000000', fontSize: '16px', fontWeight: 'normal' }
    };
    
    return defaultStyles[tagName] || { color: '#000000', fontSize: '16px', fontWeight: 'normal' };
  }

  parseColor(colorString) {
    if (!colorString) return null;
    
    // Handle hex colors
    if (colorString.startsWith('#')) {
      return this.hexToRgb(colorString);
    }
    
    // Handle rgb/rgba colors
    const rgbMatch = colorString.match(/rgba?\(([^)]+)\)/);
    if (rgbMatch) {
      const values = rgbMatch[1].split(',').map(v => parseFloat(v.trim()));
      return {
        r: values[0],
        g: values[1],
        b: values[2],
        a: values[3] || 1
      };
    }
    
    // Handle named colors
    const namedColors = {
      'black': { r: 0, g: 0, b: 0, a: 1 },
      'white': { r: 255, g: 255, b: 255, a: 1 },
      'red': { r: 255, g: 0, b: 0, a: 1 },
      'green': { r: 0, g: 128, b: 0, a: 1 },
      'blue': { r: 0, g: 0, b: 255, a: 1 },
      'transparent': { r: 0, g: 0, b: 0, a: 0 }
    };
    
    return namedColors[colorString.toLowerCase()] || { r: 0, g: 0, b: 0, a: 1 };
  }

  hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 1
    } : null;
  }

  getBackgroundColor(element, styles) {
    let backgroundColor = this.parseColor(styles.backgroundColor);
    
    // If transparent, walk up the DOM tree
    if (!backgroundColor || backgroundColor.a === 0) {
      let parent = element.parentElement;
      while (parent && parent !== document.body) {
        const parentStyles = getComputedStyle ? getComputedStyle(parent) : this.getMockStyles(parent);
        const parentBg = this.parseColor(parentStyles.backgroundColor);
        
        if (parentBg && parentBg.a > 0) {
          backgroundColor = parentBg;
          break;
        }
        parent = parent.parentElement;
      }
    }
    
    // Default to white if no background found
    return backgroundColor || { r: 255, g: 255, b: 255, a: 1 };
  }

  calculateContrast(color1, color2) {
    const luminance1 = this.getLuminance(color1);
    const luminance2 = this.getLuminance(color2);
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  getLuminance(color) {
    const { r, g, b } = color;
    
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    
    const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  }

  isLargeText(fontSize, fontWeight) {
    const bold = fontWeight === 'bold' || fontWeight === 'bolder' || parseInt(fontWeight) >= 700;
    return fontSize >= 18 || (fontSize >= 14 && bold);
  }

  evaluateContrast(element, index, contrast, isLarge, foreground, background) {
    const elementName = `${element.tagName.toLowerCase()} ${index + 1}`;
    const requirement = isLarge ? 'large' : 'normal';
    
    const aaThreshold = this.standards.AA[requirement];
    const aaaThreshold = this.standards.AAA[requirement];
    
    let status, level, issue;
    
    if (contrast >= aaaThreshold) {
      status = 'excellent';
      level = 'AAA';
      issue = null;
    } else if (contrast >= aaThreshold) {
      status = 'good';
      level = 'AA';
      issue = null;
    } else {
      status = 'fail';
      level = 'Below AA';
      issue = `Insufficient contrast ratio: ${contrast.toFixed(2)}:1 (need ${aaThreshold}:1)`;
    }
    
    this.contrastResults.push({
      element: elementName,
      contrast: parseFloat(contrast.toFixed(2)),
      requirement,
      level,
      status,
      issue,
      colors: {
        foreground: this.colorToHex(foreground),
        background: this.colorToHex(background)
      }
    });
  }

  colorToHex(color) {
    const toHex = (c) => {
      const hex = Math.round(c).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  }

  analyzeUIComponents(document) {
    console.log('🔧 Analyzing UI Components...');
    
    // Analyze form controls
    const formControls = document.querySelectorAll('input, button, select, textarea');
    formControls.forEach((control, index) => {
      this.analyzeFormControlContrast(control, index);
    });
    
    // Analyze interactive elements
    const interactiveElements = document.querySelectorAll('[role="button"], [role="tab"], [role="menuitem"]');
    interactiveElements.forEach((element, index) => {
      this.analyzeInteractiveElementContrast(element, index);
    });
  }

  analyzeFormControlContrast(control, index) {
    try {
      const styles = getComputedStyle ? getComputedStyle(control) : this.getMockStyles(control);
      
      // Analyze border contrast
      const borderColor = this.parseColor(styles.borderColor);
      const backgroundColor = this.parseColor(styles.backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
      
      if (borderColor && borderColor.a > 0) {
        const borderContrast = this.calculateContrast(borderColor, backgroundColor);
        
        if (borderContrast < this.standards.AA.ui) {
          this.contrastResults.push({
            element: `${control.tagName.toLowerCase()} border ${index + 1}`,
            contrast: parseFloat(borderContrast.toFixed(2)),
            requirement: 'ui',
            level: 'Below AA',
            status: 'fail',
            issue: `UI component border contrast insufficient: ${borderContrast.toFixed(2)}:1 (need ${this.standards.AA.ui}:1)`,
            colors: {
              foreground: this.colorToHex(borderColor),
              background: this.colorToHex(backgroundColor)
            }
          });
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Could not analyze form control ${index + 1}: ${error.message}`);
    }
  }

  analyzeInteractiveElementContrast(element, index) {
    // Similar to form control analysis but for custom interactive elements
    this.analyzeElementContrast(element, `interactive-${index}`);
  }

  generateContrastReport() {
    const totalElements = this.contrastResults.length;
    const excellent = this.contrastResults.filter(r => r.status === 'excellent').length;
    const good = this.contrastResults.filter(r => r.status === 'good').length;
    const failed = this.contrastResults.filter(r => r.status === 'fail').length;
    const warnings = this.contrastResults.filter(r => r.status === 'warning').length;
    const errors = this.contrastResults.filter(r => r.status === 'error').length;
    
    const report = {
      summary: {
        totalElements,
        excellent,
        good,
        failed,
        warnings,
        errors,
        aaCompliance: Math.round(((excellent + good) / totalElements) * 100) || 0,
        aaaCompliance: Math.round((excellent / totalElements) * 100) || 0
      },
      details: this.contrastResults
    };

    this.printContrastReport(report);
    return report;
  }

  printContrastReport(report) {
    console.log('\n📊 Color Contrast Analysis Report');
    console.log('=================================');
    console.log(`📊 Total Elements Analyzed: ${report.summary.totalElements}`);
    console.log(`✅ WCAG AA Compliance: ${report.summary.aaCompliance}%`);
    console.log(`⭐ WCAG AAA Compliance: ${report.summary.aaaCompliance}%`);
    console.log(`🌟 Excellent (AAA): ${report.summary.excellent}`);
    console.log(`✅ Good (AA): ${report.summary.good}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`💥 Errors: ${report.summary.errors}\n`);

    // Show failed contrasts
    const failures = report.details.filter(r => r.status === 'fail');
    if (failures.length > 0) {
      console.log('❌ CONTRAST FAILURES:');
      failures.forEach(failure => {
        console.log(`   ${failure.element}: ${failure.contrast}:1 ${failure.colors.foreground} on ${failure.colors.background}`);
        console.log(`   Issue: ${failure.issue}\n`);
      });
    }

    // Show excellent contrasts
    const excellentResults = report.details.filter(r => r.status === 'excellent');
    if (excellentResults.length > 0) {
      console.log('🌟 EXCELLENT CONTRAST (AAA):');
      excellentResults.slice(0, 5).forEach(result => {
        console.log(`   ${result.element}: ${result.contrast}:1 ${result.colors.foreground} on ${result.colors.background}`);
      });
      if (excellentResults.length > 5) {
        console.log(`   ... and ${excellentResults.length - 5} more\n`);
      }
    }
  }

  // Helper method to suggest better color combinations
  suggestBetterColors(foreground, background, targetRatio = 4.5) {
    const suggestions = [];
    
    // Try darkening foreground
    for (let factor = 0.8; factor >= 0.1; factor -= 0.1) {
      const darkerForeground = {
        r: Math.round(foreground.r * factor),
        g: Math.round(foreground.g * factor),
        b: Math.round(foreground.b * factor),
        a: foreground.a
      };
      
      const contrast = this.calculateContrast(darkerForeground, background);
      if (contrast >= targetRatio) {
        suggestions.push({
          type: 'darken foreground',
          foreground: this.colorToHex(darkerForeground),
          background: this.colorToHex(background),
          contrast: parseFloat(contrast.toFixed(2))
        });
        break;
      }
    }
    
    // Try lightening background
    for (let factor = 1.2; factor <= 2.0; factor += 0.1) {
      const lighterBackground = {
        r: Math.min(255, Math.round(background.r * factor)),
        g: Math.min(255, Math.round(background.g * factor)),
        b: Math.min(255, Math.round(background.b * factor)),
        a: background.a
      };
      
      const contrast = this.calculateContrast(foreground, lighterBackground);
      if (contrast >= targetRatio) {
        suggestions.push({
          type: 'lighten background',
          foreground: this.colorToHex(foreground),
          background: this.colorToHex(lighterBackground),
          contrast: parseFloat(contrast.toFixed(2))
        });
        break;
      }
    }
    
    return suggestions;
  }
}

module.exports = ColorContrastAnalyzer;