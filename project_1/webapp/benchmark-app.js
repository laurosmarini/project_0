// AI/ML BENCHMARK WEBAPP - INTERACTIVE FUNCTIONALITY

class BenchmarkApp {
  constructor() {
    this.benchmarks = [];
    this.currentCategory = 'easy';
    this.completedBenchmarks = this.loadProgress();
    this.searchTerm = '';
    
    this.init();
  }

  init() {
    this.loadBenchmarks();
    this.bindEvents();
    this.updateProgress();
    this.showCategory('easy');
    this.setupKeyboardNavigation();
  }

  loadBenchmarks() {
    // Easy Benchmarks (32)
    this.benchmarks = [
      // EASY
      { id: 1, title: 'Hello World Translation', difficulty: 'easy', category: 'language', description: 'Translate "Artificial Intelligence is fascinating" to Japanese.', type: 'translation', estimatedTime: '2 min' },
      { id: 2, title: 'Climate Change Causes', difficulty: 'easy', category: 'knowledge', description: 'List three causes for climate change.', type: 'general-knowledge', estimatedTime: '3 min' },
      { id: 3, title: 'Python vs JavaScript', difficulty: 'easy', category: 'programming', description: 'Explain the main difference between Python and JavaScript.', type: 'comparison', estimatedTime: '3 min' },
      { id: 4, title: 'Geography Question', difficulty: 'easy', category: 'knowledge', description: 'What is the capital of Mongolia?', type: 'factual', estimatedTime: '1 min' },
      { id: 5, title: 'Cybersecurity Haiku', difficulty: 'easy', category: 'creative', description: 'Write a haiku about cybersecurity.', type: 'poetry', estimatedTime: '5 min' },
      { id: 6, title: 'Grammar Correction', difficulty: 'easy', category: 'language', description: 'Correct the grammar: "She go to school every morning."', type: 'editing', estimatedTime: '2 min' },
      { id: 7, title: 'Basic Math Problem', difficulty: 'easy', category: 'math', description: 'Solve: What is 17 × 23?', type: 'arithmetic', estimatedTime: '2 min' },
      { id: 8, title: 'Chain of Thought Math', difficulty: 'easy', category: 'reasoning', description: 'Explain chain-of-thought reasoning for 15 + 37.', type: 'explanation', estimatedTime: '5 min' },
      { id: 9, title: 'Animal Biology', difficulty: 'easy', category: 'knowledge', description: 'List four mammals that lay eggs.', type: 'factual', estimatedTime: '3 min' },
      { id: 10, title: 'HTML Red Button', difficulty: 'easy', category: 'web-dev', description: 'Create HTML for a red button that alerts "Button Clicked".', type: 'coding', estimatedTime: '5 min' },
      { id: 11, title: 'Email Validation Regex', difficulty: 'easy', category: 'programming', description: 'Generate a regular expression to validate email addresses.', type: 'regex', estimatedTime: '10 min' },
      { id: 12, title: 'Fibonacci Python', difficulty: 'easy', category: 'programming', description: 'Write Python code for Fibonacci sequence up to 10th term.', type: 'algorithm', estimatedTime: '8 min' },
      { id: 13, title: 'Palindrome Check', difficulty: 'easy', category: 'programming', description: 'JavaScript function to check if "radar" is a palindrome.', type: 'string-manipulation', estimatedTime: '6 min' },
      { id: 14, title: 'SQL Select Query', difficulty: 'easy', category: 'database', description: 'SQL query: select users where age > 25.', type: 'sql', estimatedTime: '3 min' },
      { id: 15, title: 'Circle Area Python', difficulty: 'easy', category: 'math', description: 'Calculate area of circle with radius 7 in Python.', type: 'geometry', estimatedTime: '5 min' },
      { id: 16, title: 'Prime Numbers 1-50', difficulty: 'easy', category: 'programming', description: 'Find prime numbers between 1 and 50 in Python.', type: 'algorithm', estimatedTime: '10 min' },
      { id: 17, title: 'CSS Centered Div', difficulty: 'easy', category: 'web-dev', description: 'CSS for centered blue div with "AI Benchmark Level 1".', type: 'styling', estimatedTime: '5 min' },
      { id: 18, title: 'JavaScript Sum Function', difficulty: 'easy', category: 'programming', description: 'Function to calculate sum of 5 + 7, log to console.', type: 'basic-js', estimatedTime: '4 min' },
      { id: 19, title: 'HTML Form Creation', difficulty: 'easy', category: 'web-dev', description: 'HTML form with name, email inputs and submit button.', type: 'forms', estimatedTime: '7 min' },
      { id: 20, title: 'Array Sorting', difficulty: 'easy', category: 'programming', description: 'Sort array [3,1,4,1,5] in ascending order with JavaScript.', type: 'sorting', estimatedTime: '5 min' },

      // MEDIUM
      { id: 21, title: 'Express Login Route', difficulty: 'medium', category: 'web-dev', description: 'Secure Express.js login route with rate limiting and CSRF protection.', type: 'backend', estimatedTime: '45 min' },
      { id: 22, title: 'React Performance Optimization', difficulty: 'medium', category: 'web-dev', description: 'Identify and fix unnecessary re-renders in React components.', type: 'optimization', estimatedTime: '60 min' },
      { id: 23, title: 'SQL Injection Prevention', difficulty: 'medium', category: 'security', description: 'Explain SQL injection and provide prevention methods.', type: 'security-analysis', estimatedTime: '30 min' },
      { id: 24, title: 'API Rate Limiting', difficulty: 'medium', category: 'backend', description: 'Implement rate limiting for REST API endpoints.', type: 'middleware', estimatedTime: '40 min' },
      { id: 25, title: 'Binary Search Algorithm', difficulty: 'medium', category: 'algorithms', description: 'Implement binary search on sorted array [1,3,5,7,9] for value 5.', type: 'search', estimatedTime: '25 min' },
      { id: 26, title: 'Database Indexing Strategy', difficulty: 'medium', category: 'database', description: 'Design indexing strategy for high-traffic e-commerce queries.', type: 'optimization', estimatedTime: '50 min' },
      { id: 27, title: 'JWT Authentication System', difficulty: 'medium', category: 'security', description: 'Implement JWT-based authentication with refresh tokens.', type: 'auth', estimatedTime: '90 min' },
      { id: 28, title: 'Responsive CSS Grid', difficulty: 'medium', category: 'web-dev', description: 'Create responsive photo gallery with CSS Grid and lightbox.', type: 'layout', estimatedTime: '120 min' },
      { id: 29, title: 'Python Async Concurrency', difficulty: 'medium', category: 'programming', description: 'Handle concurrent API requests with asyncio and aiohttp.', type: 'async', estimatedTime: '75 min' },
      { id: 30, title: 'Testing Strategy Design', difficulty: 'medium', category: 'testing', description: 'Create comprehensive testing strategy for microservices.', type: 'test-planning', estimatedTime: '60 min' },
      { id: 31, title: 'WebGL 3D Scene', difficulty: 'medium', category: 'graphics', description: 'Create 3D rotating cube using WebGL basics.', type: '3d-graphics', estimatedTime: '180 min' },
      { id: 32, title: 'Real-time Chat System', difficulty: 'medium', category: 'web-dev', description: 'Build real-time chat with WebSocket connections.', type: 'websockets', estimatedTime: '150 min' },
      { id: 33, title: 'Machine Learning Pipeline', difficulty: 'medium', category: 'ai-ml', description: 'Create data preprocessing pipeline for ML model training.', type: 'ml-pipeline', estimatedTime: '120 min' },
      { id: 34, title: 'Docker Container Orchestration', difficulty: 'medium', category: 'devops', description: 'Set up multi-container application with Docker Compose.', type: 'containerization', estimatedTime: '90 min' },
      { id: 35, title: 'GraphQL API Design', difficulty: 'medium', category: 'backend', description: 'Design and implement GraphQL API with subscriptions.', type: 'api-design', estimatedTime: '180 min' },

      // HARD
      { id: 36, title: 'Distributed System Architecture', difficulty: 'hard', category: 'system-design', description: 'Design scalable microservices architecture for 1M+ users.', type: 'architecture', estimatedTime: '4 hours' },
      { id: 37, title: 'Advanced Physics Simulation', difficulty: 'hard', category: 'simulation', description: 'Implement soft body physics with collision detection in Three.js.', type: 'physics', estimatedTime: '6 hours' },
      { id: 38, title: 'Neural Network from Scratch', difficulty: 'hard', category: 'ai-ml', description: 'Build and train neural network without frameworks.', type: 'deep-learning', estimatedTime: '8 hours' },
      { id: 39, title: 'Real-time Ray Tracing', difficulty: 'hard', category: 'graphics', description: 'Implement ray tracing renderer with global illumination.', type: 'rendering', estimatedTime: '10 hours' },
      { id: 40, title: 'Blockchain Implementation', difficulty: 'hard', category: 'blockchain', description: 'Build proof-of-work blockchain with smart contracts.', type: 'cryptocurrency', estimatedTime: '12 hours' },
      { id: 41, title: 'Operating System Kernel', difficulty: 'hard', category: 'systems', description: 'Implement basic OS kernel with process scheduling.', type: 'kernel-dev', estimatedTime: '20 hours' },
      { id: 42, title: 'Compiler Construction', difficulty: 'hard', category: 'compilers', description: 'Build compiler for custom programming language.', type: 'language-design', estimatedTime: '30 hours' },
      { id: 43, title: 'Advanced Cryptography', difficulty: 'hard', category: 'security', description: 'Implement zero-knowledge proof system.', type: 'cryptography', estimatedTime: '15 hours' },
      { id: 44, title: 'Game Engine Architecture', difficulty: 'hard', category: 'games', description: 'Build 3D game engine with advanced rendering pipeline.', type: 'engine-dev', estimatedTime: '40 hours' },
      { id: 45, title: 'Quantum Computing Algorithm', difficulty: 'hard', category: 'quantum', description: 'Implement Shor\'s algorithm for integer factorization.', type: 'quantum-computing', estimatedTime: '25 hours' }
    ];
  }

  bindEvents() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const category = e.target.dataset.category;
        this.showCategory(category);
      });
    });

    // Search functionality
    const searchInput = document.getElementById('search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.filterBenchmarks();
      });
    }

    // Benchmark actions
    document.addEventListener('click', (e) => {
      if (e.target.matches('.btn-start')) {
        const benchmarkId = parseInt(e.target.dataset.benchmarkId);
        this.startBenchmark(benchmarkId);
      } else if (e.target.matches('.btn-complete')) {
        const benchmarkId = parseInt(e.target.dataset.benchmarkId);
        this.completeBenchmark(benchmarkId);
      } else if (e.target.matches('.btn-reset')) {
        const benchmarkId = parseInt(e.target.dataset.benchmarkId);
        this.resetBenchmark(benchmarkId);
      }
    });
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case '1':
            e.preventDefault();
            this.showCategory('easy');
            break;
          case '2':
            e.preventDefault();
            this.showCategory('medium');
            break;
          case '3':
            e.preventDefault();
            this.showCategory('hard');
            break;
        }
      }
    });
  }

  showCategory(category) {
    this.currentCategory = category;
    
    // Update tab states
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.category === category) {
        tab.classList.add('active');
      }
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${category}-content`).classList.add('active');

    this.renderBenchmarks(category);
    this.updateProgress();
  }

  renderBenchmarks(category) {
    const container = document.querySelector(`#${category}-content .benchmark-grid`);
    const benchmarks = this.benchmarks.filter(b => b.difficulty === category);
    
    container.innerHTML = benchmarks.map(benchmark => {
      const status = this.getBenchmarkStatus(benchmark.id);
      const statusClass = `status-${status}`;
      const statusText = status.charAt(0).toUpperCase() + status.slice(1);
      
      return `
        <div class="benchmark-card difficulty-${benchmark.difficulty}" data-benchmark-id="${benchmark.id}">
          <div class="benchmark-meta">
            <span class="status-badge ${statusClass}">
              ${this.getStatusIcon(status)} ${statusText}
            </span>
            <span class="difficulty-indicator difficulty-${benchmark.difficulty}">
              ${benchmark.difficulty.toUpperCase()}
            </span>
          </div>
          
          <h3 class="benchmark-title">${benchmark.title}</h3>
          <p class="benchmark-description">${benchmark.description}</p>
          
          <div class="benchmark-details">
            <div class="detail-item">
              <strong>Category:</strong> ${benchmark.category}
            </div>
            <div class="detail-item">
              <strong>Type:</strong> ${benchmark.type}
            </div>
            <div class="detail-item">
              <strong>Estimated Time:</strong> ${benchmark.estimatedTime}
            </div>
          </div>
          
          <div class="benchmark-actions">
            ${this.renderActionButtons(benchmark.id, status)}
          </div>
        </div>
      `;
    }).join('');
  }

  renderActionButtons(benchmarkId, status) {
    switch(status) {
      case 'pending':
        return `<button class="btn btn-primary btn-start" data-benchmark-id="${benchmarkId}">Start Benchmark</button>`;
      case 'running':
        return `
          <button class="btn btn-success btn-complete" data-benchmark-id="${benchmarkId}">Mark Complete</button>
          <button class="btn btn-danger btn-reset" data-benchmark-id="${benchmarkId}">Reset</button>
        `;
      case 'completed':
        return `
          <button class="btn btn-success" disabled>✓ Completed</button>
          <button class="btn btn-reset" data-benchmark-id="${benchmarkId}">Reset</button>
        `;
      case 'failed':
        return `
          <button class="btn btn-primary btn-start" data-benchmark-id="${benchmarkId}">Retry</button>
          <button class="btn btn-reset" data-benchmark-id="${benchmarkId}">Reset</button>
        `;
      default:
        return '';
    }
  }

  getBenchmarkStatus(benchmarkId) {
    const progress = this.completedBenchmarks[benchmarkId];
    if (!progress) return 'pending';
    return progress.status;
  }

  getStatusIcon(status) {
    const icons = {
      pending: '⏸️',
      running: '🔄',
      completed: '✅',
      failed: '❌'
    };
    return icons[status] || '⏸️';
  }

  startBenchmark(benchmarkId) {
    this.completedBenchmarks[benchmarkId] = {
      status: 'running',
      startTime: Date.now(),
      attempts: (this.completedBenchmarks[benchmarkId]?.attempts || 0) + 1
    };
    
    this.saveProgress();
    this.renderBenchmarks(this.currentCategory);
    this.updateProgress();
    
    // Show notification
    this.showNotification(`Started benchmark: ${this.getBenchmark(benchmarkId).title}`, 'info');
  }

  completeBenchmark(benchmarkId) {
    const existing = this.completedBenchmarks[benchmarkId] || {};
    this.completedBenchmarks[benchmarkId] = {
      ...existing,
      status: 'completed',
      completedTime: Date.now(),
      duration: Date.now() - (existing.startTime || Date.now())
    };
    
    this.saveProgress();
    this.renderBenchmarks(this.currentCategory);
    this.updateProgress();
    
    // Show notification
    this.showNotification(`Completed benchmark: ${this.getBenchmark(benchmarkId).title}`, 'success');
  }

  resetBenchmark(benchmarkId) {
    delete this.completedBenchmarks[benchmarkId];
    this.saveProgress();
    this.renderBenchmarks(this.currentCategory);
    this.updateProgress();
    
    // Show notification
    this.showNotification(`Reset benchmark: ${this.getBenchmark(benchmarkId).title}`, 'warning');
  }

  filterBenchmarks() {
    if (!this.searchTerm) {
      document.querySelectorAll('.benchmark-card').forEach(card => {
        card.style.display = 'block';
      });
      return;
    }

    document.querySelectorAll('.benchmark-card').forEach(card => {
      const title = card.querySelector('.benchmark-title').textContent.toLowerCase();
      const description = card.querySelector('.benchmark-description').textContent.toLowerCase();
      const category = card.querySelector('.detail-item').textContent.toLowerCase();
      
      const matches = title.includes(this.searchTerm) || 
                     description.includes(this.searchTerm) || 
                     category.includes(this.searchTerm);
      
      card.style.display = matches ? 'block' : 'none';
    });
  }

  updateProgress() {
    const totalBenchmarks = this.benchmarks.length;
    const completed = Object.values(this.completedBenchmarks).filter(b => b.status === 'completed').length;
    const running = Object.values(this.completedBenchmarks).filter(b => b.status === 'running').length;
    const failed = Object.values(this.completedBenchmarks).filter(b => b.status === 'failed').length;
    
    const percentage = Math.round((completed / totalBenchmarks) * 100);
    
    // Update progress bar
    const progressBar = document.querySelector('.progress-bar-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${completed}/${totalBenchmarks} Completed (${percentage}%)`;
    }
    
    // Update stats
    document.querySelector('.stat-completed .stat-number').textContent = completed;
    document.querySelector('.stat-running .stat-number').textContent = running;
    document.querySelector('.stat-total .stat-number').textContent = totalBenchmarks;
    
    // Update tab counts
    ['easy', 'medium', 'hard'].forEach(difficulty => {
      const categoryBenchmarks = this.benchmarks.filter(b => b.difficulty === difficulty);
      const categoryCompleted = categoryBenchmarks.filter(b => 
        this.completedBenchmarks[b.id]?.status === 'completed'
      ).length;
      
      const tabCount = document.querySelector(`.nav-tab[data-category="${difficulty}"] .tab-count`);
      if (tabCount) {
        tabCount.textContent = `${categoryCompleted}/${categoryBenchmarks.length}`;
      }
    });
  }

  getBenchmark(id) {
    return this.benchmarks.find(b => b.id === id);
  }

  saveProgress() {
    localStorage.setItem('ai-benchmark-progress', JSON.stringify(this.completedBenchmarks));
  }

  loadProgress() {
    const saved = localStorage.getItem('ai-benchmark-progress');
    return saved ? JSON.parse(saved) : {};
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--black);
      color: var(--white);
      border: var(--border-med) var(--cyan);
      padding: var(--space-sm) var(--space-md);
      box-shadow: var(--shadow-harsh) var(--cyan);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.benchmarkApp = new BenchmarkApp();
});

// Add global styles for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .notification-success { border-color: var(--easy) !important; }
  .notification-warning { border-color: var(--medium) !important; }
  .notification-error { border-color: var(--hard) !important; }
`;
document.head.appendChild(notificationStyles);