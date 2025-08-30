#!/usr/bin/env node

/**
 * QA Test Suite Runner
 * Orchestrates all pricing table tests with reporting and coordination
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config/test.config');

class QATestRunner {
  constructor() {
    this.results = {
      visual: null,
      accessibility: null,
      crossBrowser: null,
      mobile: null,
      performance: null
    };
    
    this.startTime = Date.now();
    this.reportDir = path.join(__dirname, '../test-results');
    
    // Ensure report directory exists
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async run() {
    console.log('🚀 Starting Comprehensive Pricing Table QA Suite');
    console.log('=' .repeat(60));
    
    try {
      // Hook: Initialize coordination
      await this.runHook('pre-task', 'Comprehensive QA Suite Execution');
      
      // Run test suites in parallel for efficiency
      await this.runTestSuites();
      
      // Generate comprehensive report
      await this.generateReport();
      
      // Hook: Store results in memory for coordination
      await this.storeResultsInMemory();
      
      // Hook: Notify completion
      await this.runHook('post-task', 'QA Suite completed');
      
      console.log('✅ QA Suite completed successfully!');
      return this.results;
      
    } catch (error) {
      console.error('❌ QA Suite failed:', error.message);
      process.exit(1);
    }
  }

  async runTestSuites() {
    const suites = [
      {
        name: 'Visual Regression',
        file: 'pricing-table.visual-regression.test.js',
        key: 'visual',
        priority: 1
      },
      {
        name: 'Accessibility',
        file: 'pricing-table.accessibility.test.js',
        key: 'accessibility',
        priority: 1
      },
      {
        name: 'Cross-Browser',
        file: 'pricing-table.cross-browser.test.js',
        key: 'crossBrowser',
        priority: 2
      },
      {
        name: 'Mobile Interactions',
        file: 'pricing-table.mobile-interactions.test.js',
        key: 'mobile',
        priority: 2
      },
      {
        name: 'Performance',
        file: 'pricing-table.performance.test.js',
        key: 'performance',
        priority: 3
      }
    ];

    console.log('🧪 Executing test suites...');
    
    // Run high priority tests first
    const highPriority = suites.filter(s => s.priority === 1);
    const mediumPriority = suites.filter(s => s.priority === 2);
    const lowPriority = suites.filter(s => s.priority === 3);
    
    // Execute in priority order
    await this.executeTestBatch(highPriority, 'High Priority');
    await this.executeTestBatch(mediumPriority, 'Medium Priority');
    await this.executeTestBatch(lowPriority, 'Low Priority');
  }

  async executeTestBatch(suites, batchName) {
    console.log(`\n📋 Executing ${batchName} Tests:`);
    
    const promises = suites.map(suite => this.runTestSuite(suite));
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      const suite = suites[index];
      if (result.status === 'fulfilled') {
        this.results[suite.key] = result.value;
        console.log(`✅ ${suite.name}: PASSED`);
      } else {
        this.results[suite.key] = { status: 'failed', error: result.reason };
        console.log(`❌ ${suite.name}: FAILED - ${result.reason.message}`);
      }
    });
  }

  async runTestSuite(suite) {
    return new Promise((resolve, reject) => {
      const testFile = path.join(__dirname, '../tests', suite.file);
      const outputFile = path.join(this.reportDir, `${suite.key}-results.json`);
      
      console.log(`  🔍 Running ${suite.name}...`);
      
      const jest = spawn('npx', ['jest', testFile, '--json', '--outputFile', outputFile], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let stdout = '';
      let stderr = '';

      jest.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      jest.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      jest.on('close', (code) => {
        try {
          let results = {};
          
          if (fs.existsSync(outputFile)) {
            results = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
          }
          
          const suiteResult = {
            status: code === 0 ? 'passed' : 'failed',
            exitCode: code,
            results,
            stdout,
            stderr,
            timestamp: new Date().toISOString()
          };
          
          if (code === 0) {
            resolve(suiteResult);
          } else {
            reject(new Error(`${suite.name} tests failed with exit code ${code}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse results for ${suite.name}: ${error.message}`));
        }
      });

      jest.on('error', (error) => {
        reject(new Error(`Failed to start ${suite.name} tests: ${error.message}`));
      });
    });
  }

  async generateReport() {
    console.log('\n📊 Generating comprehensive test report...');
    
    const summary = this.generateSummary();
    const detailedReport = this.generateDetailedReport();
    
    // Write reports
    fs.writeFileSync(
      path.join(this.reportDir, 'summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    fs.writeFileSync(
      path.join(this.reportDir, 'detailed-report.json'),
      JSON.stringify(detailedReport, null, 2)
    );
    
    // Generate HTML report
    const htmlReport = this.generateHtmlReport(summary, detailedReport);
    fs.writeFileSync(
      path.join(this.reportDir, 'qa-report.html'),
      htmlReport
    );
    
    console.log(`📄 Reports generated in: ${this.reportDir}`);
    
    // Print summary to console
    this.printSummary(summary);
  }

  generateSummary() {
    const totalTime = Date.now() - this.startTime;
    const suites = Object.keys(this.results);
    const passed = suites.filter(key => this.results[key]?.status === 'passed').length;
    const failed = suites.filter(key => this.results[key]?.status === 'failed').length;
    
    return {
      timestamp: new Date().toISOString(),
      duration: totalTime,
      total: suites.length,
      passed,
      failed,
      success: failed === 0,
      coverage: {
        visual: this.results.visual?.status === 'passed',
        accessibility: this.results.accessibility?.status === 'passed',
        crossBrowser: this.results.crossBrowser?.status === 'passed',
        mobile: this.results.mobile?.status === 'passed',
        performance: this.results.performance?.status === 'passed'
      },
      quality: {
        score: Math.round((passed / suites.length) * 100),
        grade: this.calculateGrade(passed, suites.length)
      }
    };
  }

  generateDetailedReport() {
    return {
      meta: {
        timestamp: new Date().toISOString(),
        duration: Date.now() - this.startTime,
        environment: process.env.NODE_ENV || 'test',
        baseUrl: config.testEnvironment.baseUrl
      },
      results: this.results,
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps()
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Analyze results and provide recommendations
    if (this.results.accessibility?.status === 'failed') {
      recommendations.push({
        type: 'accessibility',
        priority: 'high',
        description: 'Address accessibility compliance issues',
        action: 'Review WCAG 2.1 violations and implement fixes'
      });
    }
    
    if (this.results.performance?.status === 'failed') {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        description: 'Optimize page performance',
        action: 'Review Core Web Vitals and implement optimizations'
      });
    }
    
    if (this.results.visual?.status === 'failed') {
      recommendations.push({
        type: 'visual',
        priority: 'medium',
        description: 'Fix visual regression issues',
        action: 'Update baselines or fix layout inconsistencies'
      });
    }
    
    return recommendations;
  }

  generateNextSteps() {
    const steps = [];
    
    if (this.results.accessibility?.status === 'passed') {
      steps.push('✅ Accessibility compliance verified');
    }
    
    if (this.results.performance?.status === 'passed') {
      steps.push('✅ Performance benchmarks met');
    }
    
    if (this.results.crossBrowser?.status === 'passed') {
      steps.push('✅ Cross-browser compatibility confirmed');
    }
    
    steps.push('📋 Review detailed test results');
    steps.push('🚀 Deploy to staging for final validation');
    steps.push('📊 Monitor production metrics');
    
    return steps;
  }

  generateHtmlReport(summary, detailed) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pricing Table QA Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; border: 1px solid #e1e4e8; border-radius: 6px; padding: 15px; }
        .passed { border-left: 4px solid #28a745; }
        .failed { border-left: 4px solid #dc3545; }
        .score { font-size: 2em; font-weight: bold; color: #28a745; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeeba; border-radius: 4px; padding: 15px; margin: 20px 0; }
        pre { background: #f6f8fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Pricing Table QA Report</h1>
        <p><strong>Generated:</strong> ${summary.timestamp}</p>
        <p><strong>Duration:</strong> ${Math.round(summary.duration / 1000)}s</p>
        <p><strong>Quality Score:</strong> <span class="score">${summary.quality.score}%</span> (${summary.quality.grade})</p>
    </div>

    <div class="summary">
        <div class="card ${summary.coverage.visual ? 'passed' : 'failed'}">
            <h3>Visual Regression</h3>
            <p>Status: ${summary.coverage.visual ? '✅ PASSED' : '❌ FAILED'}</p>
        </div>
        <div class="card ${summary.coverage.accessibility ? 'passed' : 'failed'}">
            <h3>Accessibility</h3>
            <p>Status: ${summary.coverage.accessibility ? '✅ PASSED' : '❌ FAILED'}</p>
        </div>
        <div class="card ${summary.coverage.crossBrowser ? 'passed' : 'failed'}">
            <h3>Cross-Browser</h3>
            <p>Status: ${summary.coverage.crossBrowser ? '✅ PASSED' : '❌ FAILED'}</p>
        </div>
        <div class="card ${summary.coverage.mobile ? 'passed' : 'failed'}">
            <h3>Mobile</h3>
            <p>Status: ${summary.coverage.mobile ? '✅ PASSED' : '❌ FAILED'}</p>
        </div>
        <div class="card ${summary.coverage.performance ? 'passed' : 'failed'}">
            <h3>Performance</h3>
            <p>Status: ${summary.coverage.performance ? '✅ PASSED' : '❌ FAILED'}</p>
        </div>
    </div>

    ${detailed.recommendations.length > 0 ? `
    <div class="recommendations">
        <h3>🔍 Recommendations</h3>
        <ul>
            ${detailed.recommendations.map(rec => `
                <li><strong>${rec.type}</strong> (${rec.priority}): ${rec.description} - ${rec.action}</li>
            `).join('')}
        </ul>
    </div>
    ` : ''}

    <h3>📋 Next Steps</h3>
    <ul>
        ${detailed.nextSteps.map(step => `<li>${step}</li>`).join('')}
    </ul>

    <h3>📊 Detailed Results</h3>
    <pre>${JSON.stringify(detailed.results, null, 2)}</pre>
</body>
</html>`;
  }

  printSummary(summary) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 QA SUITE SUMMARY');
    console.log('='.repeat(60));
    console.log(`⏱️  Duration: ${Math.round(summary.duration / 1000)}s`);
    console.log(`📈 Quality Score: ${summary.quality.score}% (${summary.quality.grade})`);
    console.log(`✅ Passed: ${summary.passed}/${summary.total}`);
    console.log(`❌ Failed: ${summary.failed}/${summary.total}`);
    console.log('');
    console.log('Coverage:');
    console.log(`  Visual Regression: ${summary.coverage.visual ? '✅' : '❌'}`);
    console.log(`  Accessibility: ${summary.coverage.accessibility ? '✅' : '❌'}`);
    console.log(`  Cross-Browser: ${summary.coverage.crossBrowser ? '✅' : '❌'}`);
    console.log(`  Mobile: ${summary.coverage.mobile ? '✅' : '❌'}`);
    console.log(`  Performance: ${summary.coverage.performance ? '✅' : '❌'}`);
    console.log('='.repeat(60));
  }

  calculateGrade(passed, total) {
    const percentage = (passed / total) * 100;
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'B+';
    if (percentage >= 80) return 'B';
    if (percentage >= 75) return 'C+';
    if (percentage >= 70) return 'C';
    if (percentage >= 65) return 'D+';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  async runHook(hookType, description) {
    try {
      const { spawn } = require('child_process');
      const hook = spawn('npx', ['claude-flow@alpha', 'hooks', hookType, '--description', description], {
        stdio: 'inherit'
      });
      
      return new Promise((resolve) => {
        hook.on('close', () => resolve());
        hook.on('error', () => resolve()); // Don't fail if hooks don't work
      });
    } catch (error) {
      console.log(`⚠️  Hook ${hookType} failed:`, error.message);
    }
  }

  async storeResultsInMemory() {
    try {
      const memoryData = {
        qaResults: this.results,
        summary: this.generateSummary(),
        timestamp: new Date().toISOString()
      };
      
      const { spawn } = require('child_process');
      const storeMemory = spawn('npx', [
        'claude-flow@alpha', 
        'hooks', 
        'post-edit', 
        '--memory-key', 
        'swarm/qa/pricing-table-results',
        '--data', 
        JSON.stringify(memoryData)
      ], {
        stdio: 'inherit'
      });
      
      return new Promise((resolve) => {
        storeMemory.on('close', () => resolve());
        storeMemory.on('error', () => resolve());
      });
    } catch (error) {
      console.log('⚠️  Failed to store results in memory:', error.message);
    }
  }
}

// CLI execution
if (require.main === module) {
  const runner = new QATestRunner();
  runner.run().catch(error => {
    console.error('❌ QA Runner failed:', error);
    process.exit(1);
  });
}

module.exports = QATestRunner;