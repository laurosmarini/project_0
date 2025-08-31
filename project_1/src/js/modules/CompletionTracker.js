/**
 * CompletionTracker - Handles benchmark completion tracking with localStorage
 * Manages completion states, persistence, and progress statistics
 */

export class CompletionTracker {
    constructor(config = {}) {
        this.config = {
            storageKey: 'benchmark_completions',
            autoSave: true,
            trackTime: true,
            trackAttempts: true,
            maxAttempts: 3,
            ...config
        };

        this.completions = new Map();
        this.completionStats = {
            total: 0,
            completed: 0,
            inProgress: 0,
            timeSpent: 0,
            averageTime: 0,
            categories: {}
        };

        this.initialized = false;
        this.saveTimeout = null;

        // Bind methods
        this.handleCompletionToggle = this.handleCompletionToggle.bind(this);
        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    }

    /**
     * Initialize the completion tracker
     */
    async init() {
        try {
            await this.loadFromStorage();
            this.setupEventListeners();
            this.updateStats();
            this.initialized = true;
            
            console.log('✅ CompletionTracker initialized');
        } catch (error) {
            console.error('❌ CompletionTracker initialization failed:', error);
            throw error;
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for completion button clicks
        document.addEventListener('click', (event) => {
            if (event.target.matches('[data-action="toggle-completion"]')) {
                const benchmarkId = event.target.dataset.benchmarkId;
                if (benchmarkId) {
                    this.handleCompletionToggle(benchmarkId, event.target);
                }
            }
        });

        // Listen for completion requests from other modules
        document.addEventListener('completion:toggle', (event) => {
            const { benchmarkId } = event.detail;
            this.toggleCompletion(benchmarkId);
        });

        document.addEventListener('completion:set', (event) => {
            const { benchmarkId, completed, data = {} } = event.detail;
            this.setCompletion(benchmarkId, completed, data);
        });

        // Auto-save before page unload
        window.addEventListener('beforeunload', this.handleBeforeUnload);

        // Handle visibility change for time tracking
        if (this.config.trackTime) {
            document.addEventListener('visibilitychange', () => {
                this.handleVisibilityChange();
            });
        }
    }

    /**
     * Handle completion toggle button click
     */
    async handleCompletionToggle(benchmarkId, button) {
        try {
            // Show loading state
            button.disabled = true;
            button.classList.add('loading');

            const wasCompleted = this.isCompleted(benchmarkId);
            await this.toggleCompletion(benchmarkId);
            
            // Update button state
            this.updateCompletionButton(button, !wasCompleted);
            
            // Animate the change
            this.animateCompletionChange(button, !wasCompleted);

        } catch (error) {
            console.error('❌ Failed to toggle completion:', error);
            this.dispatchEvent('completion:error', { benchmarkId, error });
        } finally {
            button.disabled = false;
            button.classList.remove('loading');
        }
    }

    /**
     * Toggle completion status of a benchmark
     */
    async toggleCompletion(benchmarkId) {
        const currentStatus = this.getCompletion(benchmarkId);
        const newCompleted = !currentStatus.completed;
        
        await this.setCompletion(benchmarkId, newCompleted, {
            toggledAt: Date.now()
        });
    }

    /**
     * Set completion status for a benchmark
     */
    async setCompletion(benchmarkId, completed, additionalData = {}) {
        if (!benchmarkId) {
            throw new Error('Benchmark ID is required');
        }

        const previousData = this.completions.get(benchmarkId) || {};
        const now = Date.now();

        const completionData = {
            benchmarkId,
            completed,
            completedAt: completed ? now : null,
            startedAt: previousData.startedAt || (!previousData.completed ? now : previousData.startedAt),
            timeSpent: this.calculateTimeSpent(previousData, completed, now),
            attempts: completed ? (previousData.attempts || 0) + 1 : (previousData.attempts || 0),
            category: this.getBenchmarkCategory(benchmarkId),
            points: this.getBenchmarkPoints(benchmarkId),
            ...additionalData
        };

        // Validate attempts limit
        if (this.config.trackAttempts && completionData.attempts > this.config.maxAttempts) {
            throw new Error(`Maximum attempts (${this.config.maxAttempts}) exceeded`);
        }

        this.completions.set(benchmarkId, completionData);
        
        // Update statistics
        this.updateStats();
        
        // Save to storage if auto-save is enabled
        if (this.config.autoSave) {
            await this.saveToStorage();
        }

        // Dispatch completion change event
        this.dispatchEvent('completion:changed', {
            benchmarkId,
            completed,
            data: completionData,
            previousData
        });

        console.log(`${completed ? '✅' : '⏸️'} Benchmark ${benchmarkId} ${completed ? 'completed' : 'uncompleted'}`);
    }

    /**
     * Calculate time spent on a benchmark
     */
    calculateTimeSpent(previousData, completed, now) {
        if (!this.config.trackTime || !previousData.startedAt) {
            return previousData.timeSpent || 0;
        }

        const sessionTime = now - (previousData.lastActiveAt || previousData.startedAt);
        const totalTime = (previousData.timeSpent || 0) + sessionTime;

        return completed ? totalTime : totalTime;
    }

    /**
     * Get completion data for a benchmark
     */
    getCompletion(benchmarkId) {
        return this.completions.get(benchmarkId) || {
            benchmarkId,
            completed: false,
            completedAt: null,
            startedAt: null,
            timeSpent: 0,
            attempts: 0,
            category: null,
            points: 0
        };
    }

    /**
     * Check if a benchmark is completed
     */
    isCompleted(benchmarkId) {
        const completion = this.completions.get(benchmarkId);
        return completion ? completion.completed : false;
    }

    /**
     * Get all completions
     */
    getCompletions() {
        return Object.fromEntries(this.completions);
    }

    /**
     * Get completions for a specific category
     */
    getCompletionsByCategory(category) {
        const categoryCompletions = new Map();
        
        for (const [benchmarkId, completion] of this.completions) {
            if (completion.category === category) {
                categoryCompletions.set(benchmarkId, completion);
            }
        }
        
        return Object.fromEntries(categoryCompletions);
    }

    /**
     * Get completion statistics
     */
    getStats() {
        return { ...this.completionStats };
    }

    /**
     * Update completion statistics
     */
    updateStats() {
        const stats = {
            total: 0,
            completed: 0,
            inProgress: 0,
            timeSpent: 0,
            totalAttempts: 0,
            categories: {}
        };

        // Get total benchmarks from DOM
        const allBenchmarks = document.querySelectorAll('[data-benchmark-id]');
        stats.total = allBenchmarks.length;

        // Calculate stats from completions
        for (const completion of this.completions.values()) {
            if (completion.completed) {
                stats.completed++;
            } else if (completion.startedAt) {
                stats.inProgress++;
            }

            stats.timeSpent += completion.timeSpent || 0;
            stats.totalAttempts += completion.attempts || 0;

            // Category-specific stats
            const category = completion.category;
            if (category) {
                if (!stats.categories[category]) {
                    stats.categories[category] = {
                        total: 0,
                        completed: 0,
                        timeSpent: 0,
                        points: 0
                    };
                }
                
                stats.categories[category].completed += completion.completed ? 1 : 0;
                stats.categories[category].timeSpent += completion.timeSpent || 0;
                stats.categories[category].points += completion.completed ? (completion.points || 0) : 0;
            }
        }

        // Calculate category totals
        Object.keys(stats.categories).forEach(category => {
            const categoryBenchmarks = document.querySelectorAll(`[data-category="${category}"] [data-benchmark-id]`);
            stats.categories[category].total = categoryBenchmarks.length;
        });

        // Calculate averages
        stats.averageTime = stats.completed > 0 ? stats.timeSpent / stats.completed : 0;
        stats.completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

        this.completionStats = stats;

        // Dispatch stats update event
        this.dispatchEvent('stats:updated', { stats });
    }

    /**
     * Save completions to localStorage
     */
    async saveToStorage() {
        try {
            const data = {
                completions: Object.fromEntries(this.completions),
                stats: this.completionStats,
                savedAt: Date.now(),
                version: '1.0'
            };

            localStorage.setItem(this.config.storageKey, JSON.stringify(data));
            
            // Dispatch save event
            this.dispatchEvent('completion:saved', { data });
            
        } catch (error) {
            console.error('❌ Failed to save completions:', error);
            throw error;
        }
    }

    /**
     * Load completions from localStorage
     */
    async loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.config.storageKey);
            
            if (!stored) {
                console.log('📝 No stored completions found');
                return;
            }

            const data = JSON.parse(stored);
            
            // Validate data structure
            if (!data.completions || typeof data.completions !== 'object') {
                throw new Error('Invalid completion data structure');
            }

            // Load completions
            this.completions = new Map(Object.entries(data.completions));
            
            // Load stats if available
            if (data.stats) {
                this.completionStats = { ...this.completionStats, ...data.stats };
            }

            console.log(`📝 Loaded ${this.completions.size} completions from storage`);
            
            // Dispatch load event
            this.dispatchEvent('completion:loaded', { 
                count: this.completions.size,
                data 
            });

        } catch (error) {
            console.error('❌ Failed to load completions:', error);
            // Reset to empty state on load error
            this.completions = new Map();
            this.completionStats = {
                total: 0,
                completed: 0,
                inProgress: 0,
                timeSpent: 0,
                averageTime: 0,
                categories: {}
            };
        }
    }

    /**
     * Restore completions from external data
     */
    async restoreCompletions(completionsData) {
        try {
            this.completions = new Map(Object.entries(completionsData));
            this.updateStats();
            
            if (this.config.autoSave) {
                await this.saveToStorage();
            }

            // Update UI to reflect restored state
            this.updateAllCompletionButtons();

            this.dispatchEvent('completion:restored', {
                count: this.completions.size
            });

        } catch (error) {
            console.error('❌ Failed to restore completions:', error);
            throw error;
        }
    }

    /**
     * Update all completion buttons in the UI
     */
    updateAllCompletionButtons() {
        const buttons = document.querySelectorAll('[data-action="toggle-completion"]');
        
        buttons.forEach(button => {
            const benchmarkId = button.dataset.benchmarkId;
            if (benchmarkId) {
                const isCompleted = this.isCompleted(benchmarkId);
                this.updateCompletionButton(button, isCompleted);
            }
        });
    }

    /**
     * Update a single completion button
     */
    updateCompletionButton(button, completed) {
        button.classList.toggle('completed', completed);
        button.textContent = completed ? '✅ Completed' : '⏸️ Mark Complete';
        button.setAttribute('aria-pressed', completed.toString());
        
        // Update parent benchmark item
        const benchmarkItem = button.closest('.benchmark-item');
        if (benchmarkItem) {
            benchmarkItem.classList.toggle('completed', completed);
        }
    }

    /**
     * Animate completion change
     */
    animateCompletionChange(button, completed) {
        this.dispatchEvent('animation:request', {
            element: button,
            animation: completed ? 'pulse' : 'shake',
            options: { duration: 300 }
        });
    }

    /**
     * Get benchmark category from DOM
     */
    getBenchmarkCategory(benchmarkId) {
        const element = document.querySelector(`[data-benchmark-id="${benchmarkId}"]`);
        return element?.closest('[data-category]')?.dataset.category || null;
    }

    /**
     * Get benchmark points from DOM
     */
    getBenchmarkPoints(benchmarkId) {
        const element = document.querySelector(`[data-benchmark-id="${benchmarkId}"]`);
        const pointsElement = element?.querySelector('.benchmark-points');
        return parseInt(pointsElement?.textContent?.replace(/\D/g, '') || '0', 10);
    }

    /**
     * Handle visibility change for time tracking
     */
    handleVisibilityChange() {
        const now = Date.now();
        
        if (document.hidden) {
            // Page hidden - pause time tracking
            for (const [benchmarkId, completion] of this.completions) {
                if (!completion.completed && completion.startedAt) {
                    completion.lastActiveAt = now;
                }
            }
        } else {
            // Page visible - resume time tracking
            for (const [benchmarkId, completion] of this.completions) {
                if (!completion.completed && completion.lastActiveAt) {
                    const pausedTime = now - completion.lastActiveAt;
                    completion.timeSpent = (completion.timeSpent || 0) + pausedTime;
                    completion.lastActiveAt = now;
                }
            }
        }
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload() {
        if (this.config.autoSave) {
            // Use synchronous localStorage for beforeunload
            try {
                const data = {
                    completions: Object.fromEntries(this.completions),
                    stats: this.completionStats,
                    savedAt: Date.now(),
                    version: '1.0'
                };
                localStorage.setItem(this.config.storageKey, JSON.stringify(data));
            } catch (error) {
                console.error('❌ Failed to save on unload:', error);
            }
        }
    }

    /**
     * Export completions data
     */
    exportData() {
        return {
            completions: Object.fromEntries(this.completions),
            stats: this.completionStats,
            exportedAt: Date.now(),
            version: '1.0'
        };
    }

    /**
     * Import completions data
     */
    async importData(data) {
        try {
            if (!data.completions) {
                throw new Error('Invalid import data');
            }

            this.completions = new Map(Object.entries(data.completions));
            this.updateStats();
            
            if (this.config.autoSave) {
                await this.saveToStorage();
            }

            this.updateAllCompletionButtons();

            this.dispatchEvent('completion:imported', {
                count: this.completions.size
            });

        } catch (error) {
            console.error('❌ Failed to import data:', error);
            throw error;
        }
    }

    /**
     * Clear all completions
     */
    async clearAll() {
        this.completions.clear();
        this.updateStats();
        
        if (this.config.autoSave) {
            await this.saveToStorage();
        }

        this.updateAllCompletionButtons();

        this.dispatchEvent('completion:cleared', {});
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(type, detail = {}) {
        const event = new CustomEvent(type, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Destroy the completion tracker
     */
    destroy() {
        // Clear timeout
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        // Remove event listeners
        window.removeEventListener('beforeunload', this.handleBeforeUnload);

        // Clear data
        this.completions.clear();
        this.initialized = false;
    }
}