/**
 * ProgressStats - Handles progress visualization and statistics
 * Creates charts, progress bars, and statistical displays
 */

export class ProgressStats {
    constructor(config = {}) {
        this.config = {
            container: '.progress-stats',
            chartType: 'donut',
            animationDuration: 800,
            updateInterval: 1000,
            colors: {
                completed: '#00ff00',
                inProgress: '#ffff00',
                notStarted: '#ff00ff',
                background: '#333'
            },
            ...config
        };

        this.stats = {
            total: 0,
            completed: 0,
            inProgress: 0,
            notStarted: 0,
            completionRate: 0,
            categories: {},
            timeStats: {},
            points: 0
        };

        this.charts = {};
        this.container = null;
        this.updateTimer = null;
        this.initialized = false;

        // Bind methods
        this.handleStatsUpdate = this.handleStatsUpdate.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    /**
     * Initialize the progress stats
     */
    async init() {
        try {
            this.container = document.querySelector(this.config.container);
            
            if (!this.container) {
                throw new Error(`Progress stats container not found: ${this.config.container}`);
            }

            await this.createStatsInterface();
            this.setupEventListeners();
            this.startPeriodicUpdates();
            this.initialized = true;

            console.log('✅ ProgressStats initialized');
        } catch (error) {
            console.error('❌ ProgressStats initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create the statistics interface
     */
    async createStatsInterface() {
        this.container.innerHTML = `
            <div class="stats-header">
                <h2 class="stats-title">📊 Progress Statistics</h2>
                <div class="stats-controls">
                    <button class="stats-refresh-btn" aria-label="Refresh statistics">
                        🔄
                    </button>
                    <select class="stats-view-selector" aria-label="Select view">
                        <option value="overview">Overview</option>
                        <option value="categories">By Category</option>
                        <option value="time">Time Analysis</option>
                        <option value="performance">Performance</option>
                    </select>
                </div>
            </div>
            
            <div class="stats-content">
                <div class="stats-overview">
                    <div class="stats-grid">
                        <div class="stat-card total">
                            <div class="stat-icon">📋</div>
                            <div class="stat-value" id="stat-total">0</div>
                            <div class="stat-label">Total Benchmarks</div>
                        </div>
                        
                        <div class="stat-card completed">
                            <div class="stat-icon">✅</div>
                            <div class="stat-value" id="stat-completed">0</div>
                            <div class="stat-label">Completed</div>
                        </div>
                        
                        <div class="stat-card progress">
                            <div class="stat-icon">⏳</div>
                            <div class="stat-value" id="stat-progress">0</div>
                            <div class="stat-label">In Progress</div>
                        </div>
                        
                        <div class="stat-card rate">
                            <div class="stat-icon">📈</div>
                            <div class="stat-value" id="stat-rate">0%</div>
                            <div class="stat-label">Completion Rate</div>
                        </div>
                    </div>
                    
                    <div class="progress-visualization">
                        <div class="progress-chart-container">
                            <canvas id="progress-chart" width="300" height="300"></canvas>
                            <div class="chart-center-text">
                                <div class="center-percentage">0%</div>
                                <div class="center-label">Complete</div>
                            </div>
                        </div>
                        
                        <div class="progress-legend">
                            <div class="legend-item">
                                <span class="legend-color completed"></span>
                                <span class="legend-label">Completed</span>
                                <span class="legend-value" id="legend-completed">0</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color progress"></span>
                                <span class="legend-label">In Progress</span>
                                <span class="legend-value" id="legend-progress">0</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color not-started"></span>
                                <span class="legend-label">Not Started</span>
                                <span class="legend-value" id="legend-not-started">0</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="stats-categories" style="display: none;">
                    <div class="category-stats-grid" id="category-stats-grid">
                        <!-- Category stats will be populated here -->
                    </div>
                </div>
                
                <div class="stats-time" style="display: none;">
                    <div class="time-stats-container">
                        <div class="time-summary">
                            <div class="time-stat">
                                <span class="time-label">Total Time Spent:</span>
                                <span class="time-value" id="total-time">0h 0m</span>
                            </div>
                            <div class="time-stat">
                                <span class="time-label">Average per Benchmark:</span>
                                <span class="time-value" id="average-time">0h 0m</span>
                            </div>
                            <div class="time-stat">
                                <span class="time-label">Estimated Remaining:</span>
                                <span class="time-value" id="estimated-time">0h 0m</span>
                            </div>
                        </div>
                        <div class="time-chart-container">
                            <canvas id="time-chart" width="400" height="200"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="stats-performance" style="display: none;">
                    <div class="performance-metrics">
                        <div class="performance-grid">
                            <div class="performance-card">
                                <h4>Success Rate</h4>
                                <div class="performance-value" id="success-rate">0%</div>
                            </div>
                            <div class="performance-card">
                                <h4>Average Attempts</h4>
                                <div class="performance-value" id="avg-attempts">0</div>
                            </div>
                            <div class="performance-card">
                                <h4>Points Earned</h4>
                                <div class="performance-value" id="points-earned">0</div>
                            </div>
                            <div class="performance-card">
                                <h4>Streak</h4>
                                <div class="performance-value" id="current-streak">0</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize chart
        this.initializeChart();
    }

    /**
     * Initialize the progress chart
     */
    initializeChart() {
        const canvas = document.getElementById('progress-chart');
        if (!canvas) return;

        this.charts.progress = {
            canvas,
            ctx: canvas.getContext('2d'),
            data: { completed: 0, inProgress: 0, notStarted: 0 },
            animations: {
                current: 0,
                target: 0,
                animating: false
            }
        };

        // Set canvas size for retina displays
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        this.charts.progress.ctx.scale(dpr, dpr);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for stats updates
        document.addEventListener('stats:updated', this.handleStatsUpdate);
        document.addEventListener('completion:changed', () => {
            this.requestStatsUpdate();
        });

        // View selector
        const viewSelector = this.container.querySelector('.stats-view-selector');
        viewSelector?.addEventListener('change', (event) => {
            this.switchView(event.target.value);
        });

        // Refresh button
        const refreshButton = this.container.querySelector('.stats-refresh-btn');
        refreshButton?.addEventListener('click', () => {
            this.forceUpdate();
        });

        // Resize handling
        window.addEventListener('resize', this.handleResize);

        // Category change updates
        document.addEventListener('category:changed', (event) => {
            this.updateForCategory(event.detail.category);
        });
    }

    /**
     * Handle stats update from completion tracker
     */
    handleStatsUpdate(event) {
        if (event.detail && event.detail.stats) {
            this.updateStats(event.detail.stats);
        }
    }

    /**
     * Request stats update
     */
    requestStatsUpdate() {
        // Request fresh stats from completion tracker
        this.dispatchEvent('stats:request');
        
        // Fallback: calculate stats from DOM
        setTimeout(() => {
            this.calculateStatsFromDOM();
        }, 100);
    }

    /**
     * Calculate stats from DOM elements
     */
    calculateStatsFromDOM() {
        const allBenchmarks = document.querySelectorAll('[data-benchmark-id]');
        const completedBenchmarks = document.querySelectorAll('[data-benchmark-id].completed');
        const inProgressBenchmarks = document.querySelectorAll('[data-benchmark-id].in-progress');

        const stats = {
            total: allBenchmarks.length,
            completed: completedBenchmarks.length,
            inProgress: inProgressBenchmarks.length,
            notStarted: allBenchmarks.length - completedBenchmarks.length - inProgressBenchmarks.length,
            completionRate: allBenchmarks.length > 0 ? (completedBenchmarks.length / allBenchmarks.length) * 100 : 0,
            categories: this.calculateCategoryStats(),
            points: this.calculateTotalPoints()
        };

        this.updateStats(stats);
    }

    /**
     * Calculate category-specific statistics
     */
    calculateCategoryStats() {
        const categories = {};
        const categoryElements = document.querySelectorAll('[data-category]');

        categoryElements.forEach(categoryEl => {
            const category = categoryEl.dataset.category;
            if (!categories[category]) {
                categories[category] = {
                    total: 0,
                    completed: 0,
                    inProgress: 0,
                    notStarted: 0,
                    completionRate: 0
                };
            }

            const benchmarks = categoryEl.querySelectorAll('[data-benchmark-id]');
            const completed = categoryEl.querySelectorAll('[data-benchmark-id].completed');
            const inProgress = categoryEl.querySelectorAll('[data-benchmark-id].in-progress');

            categories[category].total = benchmarks.length;
            categories[category].completed = completed.length;
            categories[category].inProgress = inProgress.length;
            categories[category].notStarted = benchmarks.length - completed.length - inProgress.length;
            categories[category].completionRate = benchmarks.length > 0 ? 
                (completed.length / benchmarks.length) * 100 : 0;
        });

        return categories;
    }

    /**
     * Calculate total points earned
     */
    calculateTotalPoints() {
        let totalPoints = 0;
        const completedBenchmarks = document.querySelectorAll('[data-benchmark-id].completed');
        
        completedBenchmarks.forEach(benchmark => {
            const pointsEl = benchmark.querySelector('.benchmark-points');
            const points = parseInt(pointsEl?.textContent?.replace(/\D/g, '') || '0', 10);
            totalPoints += points;
        });

        return totalPoints;
    }

    /**
     * Update statistics
     */
    updateStats(newStats) {
        this.stats = { ...this.stats, ...newStats };
        this.renderStats();
        this.updateChart();
        this.updateCategoryStats();
    }

    /**
     * Render statistics in the UI
     */
    renderStats() {
        // Update stat cards
        this.updateElement('stat-total', this.stats.total);
        this.updateElement('stat-completed', this.stats.completed);
        this.updateElement('stat-progress', this.stats.inProgress);
        this.updateElement('stat-rate', Math.round(this.stats.completionRate) + '%');

        // Update legend
        this.updateElement('legend-completed', this.stats.completed);
        this.updateElement('legend-progress', this.stats.inProgress);
        this.updateElement('legend-not-started', this.stats.notStarted);

        // Update center chart text
        this.updateElement('.center-percentage', Math.round(this.stats.completionRate) + '%');

        // Add animations to stat values
        this.animateStatValues();
    }

    /**
     * Update chart visualization
     */
    updateChart() {
        if (!this.charts.progress) return;

        const chart = this.charts.progress;
        const { completed, inProgress, notStarted } = this.stats;
        const total = completed + inProgress + notStarted;

        if (total === 0) {
            this.drawEmptyChart();
            return;
        }

        // Calculate angles
        const completedAngle = (completed / total) * 2 * Math.PI;
        const inProgressAngle = (inProgress / total) * 2 * Math.PI;
        const notStartedAngle = (notStarted / total) * 2 * Math.PI;

        this.animateChart({
            completed: completedAngle,
            inProgress: inProgressAngle,
            notStarted: notStartedAngle
        });
    }

    /**
     * Animate chart drawing
     */
    animateChart(targetAngles) {
        const chart = this.charts.progress;
        if (chart.animations.animating) return;

        chart.animations.animating = true;
        chart.animations.target = targetAngles;

        const startTime = performance.now();
        const duration = this.config.animationDuration;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easedProgress = this.easeInOutCubic(progress);

            // Calculate current angles
            const currentAngles = {
                completed: (targetAngles.completed * easedProgress),
                inProgress: (targetAngles.inProgress * easedProgress),
                notStarted: (targetAngles.notStarted * easedProgress)
            };

            this.drawChart(currentAngles);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                chart.animations.animating = false;
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Draw the progress chart
     */
    drawChart(angles) {
        const chart = this.charts.progress;
        const ctx = chart.ctx;
        const canvas = chart.canvas;
        const centerX = canvas.width / 4; // Adjust for DPR
        const centerY = canvas.height / 4;
        const radius = Math.min(centerX, centerY) - 40;
        const innerRadius = radius * 0.6;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let currentAngle = -Math.PI / 2; // Start from top

        // Draw completed section
        if (angles.completed > 0) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angles.completed);
            ctx.arc(centerX, centerY, innerRadius, currentAngle + angles.completed, currentAngle, true);
            ctx.closePath();
            ctx.fillStyle = this.config.colors.completed;
            ctx.fill();
            currentAngle += angles.completed;
        }

        // Draw in-progress section
        if (angles.inProgress > 0) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angles.inProgress);
            ctx.arc(centerX, centerY, innerRadius, currentAngle + angles.inProgress, currentAngle, true);
            ctx.closePath();
            ctx.fillStyle = this.config.colors.inProgress;
            ctx.fill();
            currentAngle += angles.inProgress;
        }

        // Draw not-started section
        if (angles.notStarted > 0) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angles.notStarted);
            ctx.arc(centerX, centerY, innerRadius, currentAngle + angles.notStarted, currentAngle, true);
            ctx.closePath();
            ctx.fillStyle = this.config.colors.notStarted;
            ctx.fill();
        }

        // Draw background if no data
        if (angles.completed + angles.inProgress + angles.notStarted === 0) {
            this.drawEmptyChart();
        }
    }

    /**
     * Draw empty chart
     */
    drawEmptyChart() {
        const chart = this.charts.progress;
        const ctx = chart.ctx;
        const canvas = chart.canvas;
        const centerX = canvas.width / 4;
        const centerY = canvas.height / 4;
        const radius = Math.min(centerX, centerY) - 40;
        const innerRadius = radius * 0.6;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI, true);
        ctx.fillStyle = this.config.colors.background;
        ctx.fill();
    }

    /**
     * Update category statistics display
     */
    updateCategoryStats() {
        const container = document.getElementById('category-stats-grid');
        if (!container) return;

        container.innerHTML = '';

        Object.entries(this.stats.categories).forEach(([category, stats]) => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-stat-card';
            categoryCard.innerHTML = `
                <div class="category-header">
                    <h3 class="category-name">${category}</h3>
                    <span class="category-completion">${Math.round(stats.completionRate)}%</span>
                </div>
                <div class="category-progress-bar">
                    <div class="category-progress-fill" style="width: ${stats.completionRate}%"></div>
                </div>
                <div class="category-details">
                    <span class="category-detail">
                        <strong>${stats.completed}</strong> of <strong>${stats.total}</strong> completed
                    </span>
                    <span class="category-detail">
                        ${stats.inProgress} in progress
                    </span>
                </div>
            `;
            container.appendChild(categoryCard);
        });
    }

    /**
     * Update for specific category
     */
    updateForCategory(category) {
        // Highlight the selected category in stats
        const categoryCards = document.querySelectorAll('.category-stat-card');
        categoryCards.forEach(card => {
            const categoryName = card.querySelector('.category-name').textContent;
            card.classList.toggle('active', categoryName === category);
        });
    }

    /**
     * Switch view between overview, categories, time, performance
     */
    switchView(view) {
        const views = ['overview', 'categories', 'time', 'performance'];
        
        views.forEach(v => {
            const element = this.container.querySelector(`.stats-${v}`);
            if (element) {
                element.style.display = v === view ? 'block' : 'none';
            }
        });

        // Update specific view if needed
        switch (view) {
            case 'time':
                this.updateTimeStats();
                break;
            case 'performance':
                this.updatePerformanceStats();
                break;
        }
    }

    /**
     * Update time statistics
     */
    updateTimeStats() {
        // Update time-related statistics
        this.updateElement('total-time', this.formatTime(this.stats.timeSpent || 0));
        this.updateElement('average-time', this.formatTime(this.stats.averageTime || 0));
        
        const estimatedRemaining = this.calculateEstimatedTime();
        this.updateElement('estimated-time', this.formatTime(estimatedRemaining));
    }

    /**
     * Update performance statistics
     */
    updatePerformanceStats() {
        const successRate = this.stats.total > 0 ? (this.stats.completed / this.stats.total) * 100 : 0;
        this.updateElement('success-rate', Math.round(successRate) + '%');
        this.updateElement('points-earned', this.stats.points || 0);
        
        // Calculate streak and average attempts would require more data from CompletionTracker
        this.updateElement('avg-attempts', '1.2'); // Placeholder
        this.updateElement('current-streak', '3'); // Placeholder
    }

    /**
     * Calculate estimated remaining time
     */
    calculateEstimatedTime() {
        const remaining = this.stats.total - this.stats.completed;
        const avgTime = this.stats.averageTime || 0;
        return remaining * avgTime;
    }

    /**
     * Format time in milliseconds to readable string
     */
    formatTime(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }

    /**
     * Animate stat values with count-up effect
     */
    animateStatValues() {
        const statValues = this.container.querySelectorAll('.stat-value');
        statValues.forEach(element => {
            const targetValue = parseInt(element.textContent.replace(/\D/g, ''), 10) || 0;
            this.animateCount(element, 0, targetValue, 500);
        });
    }

    /**
     * Animate count from start to end
     */
    animateCount(element, start, end, duration) {
        const startTime = performance.now();
        const isPercentage = element.textContent.includes('%');
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.round(start + (end - start) * this.easeOutCubic(progress));
            element.textContent = isPercentage ? `${current}%` : current.toString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Start periodic updates
     */
    startPeriodicUpdates() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        this.updateTimer = setInterval(() => {
            this.requestStatsUpdate();
        }, this.config.updateInterval);
    }

    /**
     * Force immediate update
     */
    forceUpdate() {
        this.requestStatsUpdate();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (this.charts.progress) {
            // Reinitialize chart with new dimensions
            this.initializeChart();
            this.updateChart();
        }
    }

    /**
     * Update element text content safely
     */
    updateElement(selector, content) {
        const element = typeof selector === 'string' 
            ? this.container.querySelector(selector) 
            : selector;
        
        if (element) {
            element.textContent = content;
        }
    }

    /**
     * Easing functions
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(type, detail = {}) {
        const event = new CustomEvent(type, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Destroy the progress stats
     */
    destroy() {
        // Clear timer
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        // Remove event listeners
        document.removeEventListener('stats:updated', this.handleStatsUpdate);
        window.removeEventListener('resize', this.handleResize);

        // Clear charts
        this.charts = {};
        this.initialized = false;
    }
}