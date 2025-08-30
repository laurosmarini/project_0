/**
 * Comprehensive Accessibility Test Runner
 * Orchestrates all accessibility validation tests
 */

const WCAGValidator = require('./wcag-validator');
const KeyboardNavigationTester = require('./keyboard-navigation-test');
const ColorContrastAnalyzer = require('./color-contrast-analyzer');
const ScreenReaderSimulator = require('./screen-reader-simulator');

class AccessibilityTestRunner {
  constructor() {
    this.wcagValidator = new WCAGValidator();
    this.keyboardTester = new KeyboardNavigationTester();
    this.contrastAnalyzer = new ColorContrastAnalyzer();
    this.screenReaderSim = new ScreenReaderSimulator();
    
    this.overallResults = {
      timestamp: new Date().toISOString(),
      testSuite: 'WCAG 2.1 Accessibility Validation',
      results: {},
      summary: {},
      recommendations: []
    };
  }

  /**
   * Run complete accessibility test suite
   */
  async runFullAccessibilityAudit(document) {
    console.log('🚀 Starting Comprehensive Accessibility Audit...');
    console.log('==================================================\n');
    
    try {
      // Run WCAG validation
      console.log('1️⃣ Running WCAG 2.1 Compliance Tests...');
      const wcagResults = this.wcagValidator.validateAll(document);
      this.overallResults.results.wcag = wcagResults;
      
      console.log('\n' + '='.repeat(50) + '\n');
      
      // Run keyboard navigation tests
      console.log('2️⃣ Running Keyboard Navigation Tests...');
      const keyboardResults = await this.keyboardTester.testBasicKeyboardNavigation(document);
      this.overallResults.results.keyboard = keyboardResults;
      
      console.log('\n' + '='.repeat(50) + '\n');
      
      // Run color contrast analysis
      console.log('3️⃣ Running Color Contrast Analysis...');
      const contrastResults = this.contrastAnalyzer.analyzeDocument(document);
      this.overallResults.results.contrast = contrastResults;
      
      console.log('\n' + '='.repeat(50) + '\n');
      
      // Run screen reader simulation
      console.log('4️⃣ Running Screen Reader Simulation...');
      const screenReaderResults = this.screenReaderSim.simulateScreenReader(document);
      this.overallResults.results.screenReader = screenReaderResults;
      
      // Generate overall summary and recommendations
      this.generateOverallSummary();
      this.generateRecommendations();
      
      return this.overallResults;
      
    } catch (error) {
      console.error('❌ Error during accessibility audit:', error);
      throw error;
    }
  }

  generateOverallSummary() {
    const results = this.overallResults.results;
    
    // Calculate overall compliance scores
    const wcagCompliance = results.wcag?.summary.compliance || 0;
    const keyboardCompliance = results.keyboard?.summary.compliance || 0;
    const contrastAACompliance = results.contrast?.summary.aaCompliance || 0;
    const contrastAAACompliance = results.contrast?.summary.aaaCompliance || 0;
    
    // Calculate error counts
    const totalErrors = (results.wcag?.summary.totalErrors || 0) +
                       (results.keyboard?.summary.totalFailed || 0) +
                       (results.contrast?.summary.failed || 0) +
                       (results.screenReader?.summary.errors || 0);
    
    const totalWarnings = (results.wcag?.summary.totalWarnings || 0) +
                         (results.contrast?.summary.warnings || 0) +
                         (results.screenReader?.summary.warnings || 0);

    // Overall compliance calculation (weighted average)
    const overallCompliance = Math.round(
      (wcagCompliance * 0.4 + 
       keyboardCompliance * 0.25 + 
       contrastAACompliance * 0.25 + 
       (results.screenReader?.summary.errors === 0 ? 80 : 40) * 0.1)
    );

    this.overallResults.summary = {
      overallCompliance: overallCompliance,
      wcagLevel: this.determineWCAGLevel(overallCompliance, totalErrors),
      totalErrors: totalErrors,
      totalWarnings: totalWarnings,
      compliance: {
        wcag: wcagCompliance,
        keyboard: keyboardCompliance,
        contrastAA: contrastAACompliance,
        contrastAAA: contrastAAACompliance
      },
      testCounts: {
        wcagTests: (results.wcag?.summary.totalPasses || 0) + (results.wcag?.summary.totalErrors || 0),
        keyboardTests: (results.keyboard?.summary.totalPassed || 0) + (results.keyboard?.summary.totalFailed || 0),
        contrastTests: results.contrast?.summary.totalElements || 0,
        screenReaderElements: results.screenReader?.summary.totalElements || 0
      }
    };
  }

  determineWCAGLevel(compliance, errors) {
    if (errors === 0 && compliance >= 95) return 'AAA';
    if (errors === 0 && compliance >= 85) return 'AA';
    if (errors <= 2 && compliance >= 75) return 'AA (Minor Issues)';
    if (compliance >= 60) return 'A (Needs Improvement)';
    return 'Below A (Major Issues)';
  }

  generateRecommendations() {
    const results = this.overallResults.results;
    const recommendations = [];
    
    // WCAG recommendations
    if (results.wcag?.details.errors.length > 0) {
      recommendations.push({
        priority: 'Critical',
        category: 'WCAG Compliance',
        issue: `${results.wcag.details.errors.length} WCAG violations found`,
        action: 'Fix all WCAG Level A and AA violations immediately',
        impact: 'High - Blocks basic accessibility',
        effort: 'Medium',
        guidelines: results.wcag.details.errors.map(e => e.guideline)
      });
    }
    
    // Keyboard navigation recommendations
    if (results.keyboard?.summary.totalFailed > 0) {
      recommendations.push({
        priority: 'High',
        category: 'Keyboard Navigation',
        issue: `${results.keyboard.summary.totalFailed} keyboard navigation issues`,
        action: 'Implement proper keyboard navigation and focus management',
        impact: 'High - Essential for keyboard-only users',
        effort: 'Medium',
        details: results.keyboard.details
      });
    }
    
    // Color contrast recommendations
    if (results.contrast?.summary.failed > 0) {
      const contrastIssues = results.contrast.summary.failed;
      recommendations.push({
        priority: contrastIssues > 5 ? 'High' : 'Medium',
        category: 'Color Contrast',
        issue: `${contrastIssues} color contrast failures`,
        action: 'Adjust colors to meet WCAG AA contrast ratios (4.5:1 normal, 3:1 large)',
        impact: 'Medium - Affects users with visual impairments',
        effort: 'Low',
        suggestions: 'Use color contrast tools to find compliant color combinations'
      });
    }
    
    // Screen reader recommendations
    if (results.screenReader?.summary.errors > 0) {
      recommendations.push({
        priority: 'High',
        category: 'Screen Reader',
        issue: `${results.screenReader.summary.errors} screen reader accessibility issues`,
        action: 'Fix missing alt text, labels, and semantic structure',
        impact: 'Critical - Blocks screen reader users',
        effort: 'Medium'
      });
    }
    
    // Semantic structure recommendations
    if (results.screenReader?.summary.landmarks === 0) {
      recommendations.push({
        priority: 'Medium',
        category: 'Semantic Structure',
        issue: 'No landmarks found',
        action: 'Add semantic HTML5 elements (main, nav, header, footer) or ARIA landmarks',
        impact: 'Medium - Improves navigation for assistive technology users',
        effort: 'Low'
      });
    }
    
    // Enhancement recommendations
    if (results.contrast?.summary.aaaCompliance < 50) {
      recommendations.push({
        priority: 'Low',
        category: 'Enhancement',
        issue: 'Low AAA contrast compliance',
        action: 'Consider enhancing color contrast to meet AAA standards (7:1 normal, 4.5:1 large)',
        impact: 'Low - Benefits users with more severe visual impairments',
        effort: 'Low'
      });
    }
    
    this.overallResults.recommendations = recommendations.sort((a, b) => {
      const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  printOverallReport() {
    const summary = this.overallResults.summary;
    const recommendations = this.overallResults.recommendations;
    
    console.log('\n🏆 COMPREHENSIVE ACCESSIBILITY AUDIT REPORT');
    console.log('============================================');
    console.log(`📅 Date: ${new Date(this.overallResults.timestamp).toLocaleString()}`);
    console.log(`🎯 Overall Compliance: ${summary.overallCompliance}%`);
    console.log(`🏅 WCAG Level: ${summary.wcagLevel}`);
    console.log(`❌ Total Errors: ${summary.totalErrors}`);
    console.log(`⚠️  Total Warnings: ${summary.totalWarnings}\n`);
    
    console.log('📊 COMPLIANCE BREAKDOWN:');
    console.log(`   • WCAG 2.1: ${summary.compliance.wcag}%`);
    console.log(`   • Keyboard Navigation: ${summary.compliance.keyboard}%`);
    console.log(`   • Color Contrast (AA): ${summary.compliance.contrastAA}%`);
    console.log(`   • Color Contrast (AAA): ${summary.compliance.contrastAAA}%\n`);
    
    console.log('🧪 TEST COVERAGE:');
    console.log(`   • WCAG Tests: ${summary.testCounts.wcagTests}`);
    console.log(`   • Keyboard Tests: ${summary.testCounts.keyboardTests}`);
    console.log(`   • Contrast Tests: ${summary.testCounts.contrastTests}`);
    console.log(`   • Screen Reader Elements: ${summary.testCounts.screenReaderElements}\n`);
    
    if (recommendations.length > 0) {
      console.log('🎯 PRIORITIZED RECOMMENDATIONS:');
      recommendations.forEach((rec, index) => {
        const priorityEmoji = {
          'Critical': '🔥',
          'High': '🚨',
          'Medium': '⚠️',
          'Low': 'ℹ️'
        };
        
        console.log(`\n${index + 1}. ${priorityEmoji[rec.priority]} ${rec.priority} Priority - ${rec.category}`);
        console.log(`   Issue: ${rec.issue}`);
        console.log(`   Action: ${rec.action}`);
        console.log(`   Impact: ${rec.impact}`);
        console.log(`   Effort: ${rec.effort}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(this.getAccessibilityGrade(summary.overallCompliance));
    console.log('='.repeat(50));
  }

  getAccessibilityGrade(compliance) {
    if (compliance >= 95) return '🏆 EXCELLENT - Your site is highly accessible!';
    if (compliance >= 85) return '✅ GOOD - Minor improvements needed';
    if (compliance >= 75) return '⚠️  FAIR - Several issues need attention';
    if (compliance >= 60) return '❌ POOR - Major accessibility barriers exist';
    return '💥 CRITICAL - Site has serious accessibility problems';
  }

  exportResults(format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(this.overallResults, null, 2);
      
      case 'csv':
        return this.generateCSVReport();
      
      case 'html':
        return this.generateHTMLReport();
      
      default:
        return this.overallResults;
    }
  }

  generateCSVReport() {
    const csv = [];
    csv.push('Test Type,Status,Details,Priority');
    
    // Add WCAG results
    this.overallResults.results.wcag?.details.errors.forEach(error => {
      csv.push(`WCAG ${error.guideline},Error,"${error.message}",Critical`);
    });
    
    this.overallResults.results.wcag?.details.warnings.forEach(warning => {
      csv.push(`WCAG ${warning.guideline},Warning,"${warning.message}",Medium`);
    });
    
    return csv.join('\n');
  }

  generateHTMLReport() {
    // This would generate a comprehensive HTML report
    // For now, return a basic structure
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Audit Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .error { color: #d32f2f; }
        .warning { color: #f57c00; }
        .success { color: #388e3c; }
    </style>
</head>
<body>
    <h1>Accessibility Audit Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Overall Compliance: <strong>${this.overallResults.summary.overallCompliance}%</strong></p>
        <p>WCAG Level: <strong>${this.overallResults.summary.wcagLevel}</strong></p>
        <p class="error">Errors: ${this.overallResults.summary.totalErrors}</p>
        <p class="warning">Warnings: ${this.overallResults.summary.totalWarnings}</p>
    </div>
    <h2>Detailed Results</h2>
    <p>See full JSON output for complete details.</p>
</body>
</html>
    `;
  }
}

module.exports = AccessibilityTestRunner;