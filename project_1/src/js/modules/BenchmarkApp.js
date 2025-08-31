/**
 * BenchmarkApp - Main application controller
 * Handles initialization, state management, and coordination between modules
 */

import { CategoryManager } from './CategoryManager.js';
import { CompletionTracker } from './CompletionTracker.js';
import { ProgressStats } from './ProgressStats.js';
import { SearchFilter } from './SearchFilter.js';
import { CollapsibleSections } from './CollapsibleSections.js';
import { KeyboardNavigation } from './KeyboardNavigation.js';
import { AnimationManager } from './AnimationManager.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';
import { PerformanceOptimizer } from '../utils/PerformanceOptimizer.js';
import { StateManager } from '../utils/StateManager.js';

export class BenchmarkApp {
    constructor(config = {}) {
        this.config = {
            storagePrefix: 'benchmark_app_',
            animationDuration: 300,
            debounceDelay: 250,
            autoSave: true,
            ...config
        };

        this.state = new StateManager(this.config.storagePrefix);
        this.errorHandler = new ErrorHandler();
        this.performanceOptimizer = new PerformanceOptimizer();
        
        this.modules = {};
        this.isInitialized = false;
        
        // Bind methods
        this.handleError = this.handleError.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🚀 Initializing BenchmarkApp...');
            
            // Check if DOM is ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize performance monitoring
            this.performanceOptimizer.startMonitoring();

            // Initialize modules in correct order
            await this.initializeModules();
            
            // Set up global event listeners
            this.setupGlobalListeners();
            
            // Restore application state
            await this.restoreState();
            
            this.isInitialized = true;
            console.log('✅ BenchmarkApp initialized successfully');
            
            // Dispatch initialization complete event
            this.dispatchEvent('app:initialized');
            
        } catch (error) {
            this.handleError('Failed to initialize application', error);
        }
    }

    /**
     * Initialize all application modules
     */
    async initializeModules() {
        const moduleConfigs = {
            categoryManager: {
                container: '.categories-container',
                categories: ['Easy', 'Medium', 'Hard'],
                defaultCategory: 'Easy'
            },
            completionTracker: {
                storageKey: `${this.config.storagePrefix}completions`,
                autoSave: this.config.autoSave
            },
            progressStats: {
                container: '.progress-stats',
                chartType: 'donut'
            },
            searchFilter: {
                searchInput: '.search-input',
                filterContainer: '.filter-container',
                debounceDelay: this.config.debounceDelay
            },
            collapsibleSections: {
                sectionSelector: '.benchmark-section',
                animationDuration: this.config.animationDuration
            },
            keyboardNavigation: {
                focusableElements: [
                    '.tab-btn',
                    '.benchmark-item',
                    '.search-input',
                    '.filter-btn',
                    '.completion-btn'
                ]
            },
            animationManager: {
                duration: this.config.animationDuration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }
        };

        // Initialize modules
        this.modules.categoryManager = new CategoryManager(moduleConfigs.categoryManager);
        this.modules.completionTracker = new CompletionTracker(moduleConfigs.completionTracker);
        this.modules.progressStats = new ProgressStats(moduleConfigs.progressStats);
        this.modules.searchFilter = new SearchFilter(moduleConfigs.searchFilter);
        this.modules.collapsibleSections = new CollapsibleSections(moduleConfigs.collapsibleSections);
        this.modules.keyboardNavigation = new KeyboardNavigation(moduleConfigs.keyboardNavigation);
        this.modules.animationManager = new AnimationManager(moduleConfigs.animationManager);

        // Initialize each module
        for (const [name, module] of Object.entries(this.modules)) {
            try {
                await module.init();
                console.log(`✅ ${name} initialized`);
            } catch (error) {
                console.error(`❌ Failed to initialize ${name}:`, error);
                this.handleError(`Failed to initialize ${name}`, error);
            }
        }

        // Set up inter-module communication
        this.setupModuleCommunication();
    }

    /**
     * Set up communication between modules
     */
    setupModuleCommunication() {
        // Category changes should update search filter and progress stats
        document.addEventListener('category:changed', (event) => {
            const { category } = event.detail;
            this.modules.searchFilter.filterByCategory(category);
            this.modules.progressStats.updateForCategory(category);
        });

        // Completion changes should update progress stats
        document.addEventListener('completion:changed', (event) => {
            const { benchmarkId, completed } = event.detail;
            this.modules.progressStats.updateCompletion(benchmarkId, completed);
            
            // Auto-save state if enabled
            if (this.config.autoSave) {
                this.saveState();
            }
        });

        // Search changes should update collapsible sections
        document.addEventListener('search:filtered', (event) => {
            const { results } = event.detail;
            this.modules.collapsibleSections.updateVisibleSections(results);
        });

        // Animation requests from other modules
        document.addEventListener('animation:request', (event) => {
            const { element, animation, options } = event.detail;
            this.modules.animationManager.animate(element, animation, options);
        });
    }

    /**
     * Set up global event listeners
     */
    setupGlobalListeners() {
        // Handle visibility change for performance optimization
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.performanceOptimizer.pause();
            } else {
                this.performanceOptimizer.resume();
            }
        });

        // Handle errors globally
        window.addEventListener('error', (event) => {
            this.handleError('Global error', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('Unhandled promise rejection', event.reason);
        });

        // Auto-save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });

        // Handle resize for responsive updates
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 100);
        });
    }

    /**
     * Handle application resize
     */
    handleResize() {
        // Notify modules about resize
        this.dispatchEvent('app:resize', {
            width: window.innerWidth,
            height: window.innerHeight
        });
    }

    /**
     * Save current application state
     */
    saveState() {
        try {
            const state = {
                timestamp: Date.now(),
                category: this.modules.categoryManager?.getCurrentCategory(),
                completions: this.modules.completionTracker?.getCompletions(),
                searchQuery: this.modules.searchFilter?.getCurrentQuery(),
                expandedSections: this.modules.collapsibleSections?.getExpandedSections()
            };

            this.state.save('app_state', state);
        } catch (error) {
            this.handleError('Failed to save state', error);
        }
    }

    /**
     * Restore application state
     */
    async restoreState() {
        try {
            const state = this.state.load('app_state');
            
            if (state) {
                // Restore category
                if (state.category && this.modules.categoryManager) {
                    await this.modules.categoryManager.setCategory(state.category);
                }

                // Restore completions
                if (state.completions && this.modules.completionTracker) {
                    await this.modules.completionTracker.restoreCompletions(state.completions);
                }

                // Restore search query
                if (state.searchQuery && this.modules.searchFilter) {
                    await this.modules.searchFilter.setQuery(state.searchQuery);
                }

                // Restore expanded sections
                if (state.expandedSections && this.modules.collapsibleSections) {
                    await this.modules.collapsibleSections.restoreExpandedSections(state.expandedSections);
                }

                console.log('✅ Application state restored');
            }
        } catch (error) {
            console.warn('⚠️ Failed to restore state:', error);
        }
    }

    /**
     * Handle state changes
     */
    handleStateChange(key, value, oldValue) {
        // Auto-save on state changes if enabled
        if (this.config.autoSave) {
            this.performanceOptimizer.throttle('saveState', () => {
                this.saveState();
            }, 1000);
        }

        // Dispatch state change event
        this.dispatchEvent('state:changed', { key, value, oldValue });
    }

    /**
     * Handle errors
     */
    handleError(message, error) {
        this.errorHandler.handle(error, message);
        
        // Dispatch error event for modules to handle
        this.dispatchEvent('app:error', { message, error });
    }

    /**
     * Get module instance
     */
    getModule(name) {
        return this.modules[name];
    }

    /**
     * Get current application state
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            modules: Object.keys(this.modules),
            performance: this.performanceOptimizer.getStats()
        };
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(type, detail = {}) {
        const event = new CustomEvent(type, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Destroy the application
     */
    destroy() {
        try {
            // Save final state
            this.saveState();

            // Destroy all modules
            for (const module of Object.values(this.modules)) {
                if (typeof module.destroy === 'function') {
                    module.destroy();
                }
            }

            // Stop performance monitoring
            this.performanceOptimizer.stop();

            // Clear state
            this.modules = {};
            this.isInitialized = false;

            console.log('✅ BenchmarkApp destroyed');
        } catch (error) {
            console.error('❌ Error destroying app:', error);
        }
    }
}

// Export singleton instance
let appInstance;

export const createApp = (config) => {
    if (appInstance) {
        console.warn('BenchmarkApp instance already exists');
        return appInstance;
    }
    
    appInstance = new BenchmarkApp(config);
    return appInstance;
};

export const getApp = () => {
    if (!appInstance) {
        throw new Error('BenchmarkApp not initialized. Call createApp() first.');
    }
    return appInstance;
};