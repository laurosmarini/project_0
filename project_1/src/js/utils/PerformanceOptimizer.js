/**
 * PerformanceOptimizer - Performance monitoring and optimization utility
 * Provides performance tracking, bottleneck detection, and optimization techniques
 */

export class PerformanceOptimizer {
    constructor(config = {}) {
        this.config = {
            enableMetrics: true,
            enableOptimizations: true,
            debounceDelay: 100,
            throttleDelay: 200,
            maxCacheSize: 100,
            performanceBufferSize: 100,
            ...config
        };

        this.metrics = {
            domQueries: 0,
            animations: 0,
            eventHandlers: 0,
            memoryUsage: [],
            renderTimes: [],
            scriptExecutionTimes: []
        };

        this.cache = new Map();
        this.debounceTimers = new Map();
        this.throttleTimers = new Map();
        this.performanceObserver = null;
        this.isMonitoring = false;
        
        this.optimizations = {
            lazyLoading: new Set(),
            preloaded: new Set(),
            memoized: new Map()
        };

        // Bind methods
        this.measurePerformance = this.measurePerformance.bind(this);
        this.handlePerformanceEntry = this.handlePerformanceEntry.bind(this);
    }

    /**
     * Start performance monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) return;

        try {
            // Set up Performance Observer
            if ('PerformanceObserver' in window) {
                this.performanceObserver = new PerformanceObserver(this.handlePerformanceEntry);
                this.performanceObserver.observe({ 
                    entryTypes: ['measure', 'navigation', 'resource', 'paint'] 
                });
            }

            // Start periodic metrics collection
            this.metricsInterval = setInterval(() => {
                this.collectMetrics();
            }, 5000);

            this.isMonitoring = true;
            console.log('📊 Performance monitoring started');

        } catch (error) {
            console.warn('Failed to start performance monitoring:', error);
        }
    }

    /**
     * Stop performance monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;

        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
            this.performanceObserver = null;
        }

        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = null;
        }

        this.isMonitoring = false;
        console.log('⏹️ Performance monitoring stopped');
    }

    /**
     * Pause monitoring (for when tab is hidden)
     */
    pause() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = null;
        }
    }

    /**
     * Resume monitoring
     */
    resume() {
        if (this.isMonitoring && !this.metricsInterval) {
            this.metricsInterval = setInterval(() => {
                this.collectMetrics();
            }, 5000);
        }
    }

    /**
     * Handle performance entries from PerformanceObserver
     */
    handlePerformanceEntry(list) {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
            switch (entry.entryType) {
                case 'measure':
                    this.handleMeasureEntry(entry);
                    break;
                case 'navigation':
                    this.handleNavigationEntry(entry);
                    break;
                case 'resource':
                    this.handleResourceEntry(entry);
                    break;
                case 'paint':
                    this.handlePaintEntry(entry);
                    break;
            }
        });
    }

    /**
     * Handle measure entries
     */
    handleMeasureEntry(entry) {
        if (entry.name.startsWith('script-')) {
            this.metrics.scriptExecutionTimes.push({
                name: entry.name,
                duration: entry.duration,
                timestamp: entry.startTime
            });
            
            // Keep buffer size manageable
            if (this.metrics.scriptExecutionTimes.length > this.config.performanceBufferSize) {
                this.metrics.scriptExecutionTimes.shift();
            }
        }
    }

    /**
     * Handle navigation entries
     */
    handleNavigationEntry(entry) {
        this.metrics.navigation = {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            domInteractive: entry.domInteractive - entry.navigationStart,
            firstPaint: entry.responseEnd - entry.requestStart
        };
    }

    /**
     * Handle resource entries
     */
    handleResourceEntry(entry) {
        // Track slow resources
        if (entry.duration > 1000) { // Slower than 1 second
            console.warn(`Slow resource: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
        }
    }

    /**
     * Handle paint entries
     */
    handlePaintEntry(entry) {
        this.metrics.renderTimes.push({
            name: entry.name,
            startTime: entry.startTime,
            timestamp: Date.now()
        });
        
        if (this.metrics.renderTimes.length > this.config.performanceBufferSize) {
            this.metrics.renderTimes.shift();
        }
    }

    /**
     * Collect general performance metrics
     */
    collectMetrics() {
        if (!this.config.enableMetrics) return;

        // Memory usage (if available)
        if ('memory' in performance) {
            this.metrics.memoryUsage.push({
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                timestamp: Date.now()
            });

            // Keep buffer size manageable
            if (this.metrics.memoryUsage.length > this.config.performanceBufferSize) {
                this.metrics.memoryUsage.shift();
            }
        }

        // DOM complexity metrics
        this.metrics.domComplexity = {
            totalElements: document.querySelectorAll('*').length,
            depth: this.calculateDOMDepth(),
            eventListeners: this.estimateEventListeners()
        };
    }

    /**
     * Calculate DOM depth
     */
    calculateDOMDepth(element = document.body, depth = 0) {
        let maxDepth = depth;
        
        for (const child of element.children) {
            const childDepth = this.calculateDOMDepth(child, depth + 1);
            maxDepth = Math.max(maxDepth, childDepth);
        }
        
        return maxDepth;
    }

    /**
     * Estimate number of event listeners
     */
    estimateEventListeners() {
        // This is an approximation since we can't directly count listeners
        const interactiveElements = document.querySelectorAll(
            'button, input, select, textarea, a, [onclick], [onchange], [data-action]'
        );
        return interactiveElements.length;
    }

    /**
     * Measure execution time of a function
     */
    measurePerformance(name, fn, context = null) {
        if (!this.config.enableMetrics) {
            return context ? fn.call(context) : fn();
        }

        const measureName = `script-${name}`;
        const startMark = `${measureName}-start`;
        const endMark = `${measureName}-end`;

        performance.mark(startMark);
        
        try {
            const result = context ? fn.call(context) : fn();
            
            // Handle async functions
            if (result && typeof result.then === 'function') {
                return result.finally(() => {
                    performance.mark(endMark);
                    performance.measure(measureName, startMark, endMark);
                });
            } else {
                performance.mark(endMark);
                performance.measure(measureName, startMark, endMark);
                return result;
            }
        } catch (error) {
            performance.mark(endMark);
            performance.measure(measureName, startMark, endMark);
            throw error;
        }
    }

    /**
     * Debounce function execution
     */
    debounce(key, fn, delay = this.config.debounceDelay) {
        if (!this.config.enableOptimizations) {
            return fn();
        }

        // Clear existing timer
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }

        // Set new timer
        const timer = setTimeout(() => {
            this.debounceTimers.delete(key);
            fn();
        }, delay);

        this.debounceTimers.set(key, timer);
    }

    /**
     * Throttle function execution
     */
    throttle(key, fn, delay = this.config.throttleDelay) {
        if (!this.config.enableOptimizations) {
            return fn();
        }

        // Check if already throttled
        if (this.throttleTimers.has(key)) {
            return;
        }

        // Execute immediately and set timer
        fn();
        
        const timer = setTimeout(() => {
            this.throttleTimers.delete(key);
        }, delay);

        this.throttleTimers.set(key, timer);
    }

    /**
     * Memoization utility
     */
    memoize(key, fn, maxAge = 300000) { // 5 minutes default
        if (!this.config.enableOptimizations) {
            return fn();
        }

        const cached = this.optimizations.memoized.get(key);
        
        if (cached && Date.now() - cached.timestamp < maxAge) {
            return cached.value;
        }

        const result = fn();
        
        this.optimizations.memoized.set(key, {
            value: result,
            timestamp: Date.now()
        });

        // Clean up old entries
        this.cleanupMemoCache();

        return result;
    }

    /**
     * Clean up memoization cache
     */
    cleanupMemoCache() {
        const now = Date.now();
        const maxAge = 300000; // 5 minutes
        
        for (const [key, cached] of this.optimizations.memoized) {
            if (now - cached.timestamp > maxAge) {
                this.optimizations.memoized.delete(key);
            }
        }
    }

    /**
     * Optimized DOM query with caching
     */
    querySelector(selector, context = document, useCache = true) {
        if (!this.config.enableOptimizations || !useCache) {
            this.metrics.domQueries++;
            return context.querySelector(selector);
        }

        const cacheKey = `${selector}-${context === document ? 'document' : context.tagName}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        this.metrics.domQueries++;
        const result = context.querySelector(selector);
        
        // Cache the result
        this.cache.set(cacheKey, result);
        
        // Manage cache size
        if (this.cache.size > this.config.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        return result;
    }

    /**
     * Optimized querySelectorAll with caching
     */
    querySelectorAll(selector, context = document, useCache = true) {
        if (!this.config.enableOptimizations || !useCache) {
            this.metrics.domQueries++;
            return context.querySelectorAll(selector);
        }

        const cacheKey = `all-${selector}-${context === document ? 'document' : context.tagName}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        this.metrics.domQueries++;
        const result = Array.from(context.querySelectorAll(selector));
        
        this.cache.set(cacheKey, result);
        
        if (this.cache.size > this.config.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        return result;
    }

    /**
     * Clear DOM query cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Lazy load images
     */
    setupLazyLoading(selector = 'img[data-src]') {
        if (!this.config.enableOptimizations) return;

        const images = this.querySelectorAll(selector);
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                        this.optimizations.lazyLoading.delete(img);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            images.forEach(img => {
                observer.observe(img);
                this.optimizations.lazyLoading.add(img);
            });

        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.add('loaded');
            });
        }
    }

    /**
     * Preload critical resources
     */
    preloadResources(resources) {
        if (!this.config.enableOptimizations) return;

        resources.forEach(resource => {
            if (this.optimizations.preloaded.has(resource.href)) return;

            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as || 'fetch';
            
            if (resource.type) {
                link.type = resource.type;
            }
            
            if (resource.crossorigin) {
                link.crossOrigin = resource.crossorigin;
            }

            document.head.appendChild(link);
            this.optimizations.preloaded.add(resource.href);
        });
    }

    /**
     * Optimize event listeners using delegation
     */
    setupEventDelegation(container, selector, eventType, handler) {
        if (!this.config.enableOptimizations) {
            // Fallback to individual listeners
            this.querySelectorAll(selector, container).forEach(el => {
                el.addEventListener(eventType, handler);
                this.metrics.eventHandlers++;
            });
            return;
        }

        container.addEventListener(eventType, (event) => {
            if (event.target.matches(selector)) {
                handler.call(event.target, event);
            }
        });

        this.metrics.eventHandlers++;
    }

    /**
     * Virtual scrolling for large lists
     */
    createVirtualScrolling(container, items, renderItem, itemHeight = 50) {
        if (!this.config.enableOptimizations) return null;

        const scrollContainer = container.querySelector('.scroll-container') || container;
        const viewport = scrollContainer.parentElement || scrollContainer;
        
        let scrollTop = 0;
        let visibleStart = 0;
        let visibleEnd = 0;
        
        const updateView = this.throttle('virtual-scroll', () => {
            const viewportHeight = viewport.clientHeight;
            visibleStart = Math.floor(scrollTop / itemHeight);
            visibleEnd = Math.min(
                items.length - 1,
                visibleStart + Math.ceil(viewportHeight / itemHeight)
            );

            // Clear existing items
            scrollContainer.innerHTML = '';
            
            // Create spacers and visible items
            const topSpacer = document.createElement('div');
            topSpacer.style.height = `${visibleStart * itemHeight}px`;
            scrollContainer.appendChild(topSpacer);

            for (let i = visibleStart; i <= visibleEnd; i++) {
                const item = renderItem(items[i], i);
                item.style.height = `${itemHeight}px`;
                scrollContainer.appendChild(item);
            }

            const bottomSpacer = document.createElement('div');
            bottomSpacer.style.height = `${(items.length - visibleEnd - 1) * itemHeight}px`;
            scrollContainer.appendChild(bottomSpacer);
        }, 16); // 60fps

        viewport.addEventListener('scroll', (event) => {
            scrollTop = event.target.scrollTop;
            updateView();
        });

        // Initial render
        updateView();

        return {
            update: updateView,
            setItems: (newItems) => {
                items = newItems;
                updateView();
            }
        };
    }

    /**
     * Detect performance bottlenecks
     */
    analyzeBottlenecks() {
        const analysis = {
            slowQueries: this.metrics.domQueries > 100,
            memoryLeaks: false,
            slowAnimations: false,
            renderingIssues: false,
            recommendations: []
        };

        // Memory analysis
        if (this.metrics.memoryUsage.length > 1) {
            const recent = this.metrics.memoryUsage.slice(-10);
            const growth = recent[recent.length - 1].used - recent[0].used;
            
            if (growth > 50 * 1024 * 1024) { // 50MB growth
                analysis.memoryLeaks = true;
                analysis.recommendations.push('Potential memory leak detected. Check for unremoved event listeners or circular references.');
            }
        }

        // DOM query analysis
        if (this.metrics.domQueries > 200) {
            analysis.recommendations.push('High number of DOM queries detected. Consider caching selectors or using more efficient queries.');
        }

        // Animation analysis
        const slowAnimations = this.metrics.scriptExecutionTimes
            .filter(entry => entry.name.includes('animation') && entry.duration > 16)
            .length;
            
        if (slowAnimations > 5) {
            analysis.slowAnimations = true;
            analysis.recommendations.push('Slow animations detected. Consider using CSS animations or reducing animation complexity.');
        }

        // Rendering analysis
        const longRenderTimes = this.metrics.renderTimes
            .filter(entry => entry.startTime > 100)
            .length;
            
        if (longRenderTimes > 10) {
            analysis.renderingIssues = true;
            analysis.recommendations.push('Long rendering times detected. Consider reducing DOM complexity or using virtual scrolling.');
        }

        return analysis;
    }

    /**
     * Get performance statistics
     */
    getStats() {
        const memoryInfo = this.metrics.memoryUsage.length > 0 ? 
            this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1] : null;

        return {
            isMonitoring: this.isMonitoring,
            metrics: {
                domQueries: this.metrics.domQueries,
                eventHandlers: this.metrics.eventHandlers,
                cacheSize: this.cache.size,
                memoryUsage: memoryInfo ? {
                    used: Math.round(memoryInfo.used / 1024 / 1024) + ' MB',
                    total: Math.round(memoryInfo.total / 1024 / 1024) + ' MB'
                } : null,
                domComplexity: this.metrics.domComplexity
            },
            optimizations: {
                lazyLoadedImages: this.optimizations.lazyLoading.size,
                preloadedResources: this.optimizations.preloaded.size,
                memoizedCalls: this.optimizations.memoized.size
            }
        };
    }

    /**
     * Generate performance report
     */
    generateReport() {
        const stats = this.getStats();
        const bottlenecks = this.analyzeBottlenecks();
        
        return {
            timestamp: new Date().toISOString(),
            performance: stats,
            bottlenecks,
            navigation: this.metrics.navigation,
            recommendations: bottlenecks.recommendations
        };
    }

    /**
     * Start profiling session
     */
    startProfiling(name) {
        if ('performance' in window && 'mark' in performance) {
            performance.mark(`${name}-start`);
        }
    }

    /**
     * End profiling session
     */
    endProfiling(name) {
        if ('performance' in window && 'mark' in performance) {
            performance.mark(`${name}-end`);
            performance.measure(name, `${name}-start`, `${name}-end`);
            
            const measure = performance.getEntriesByName(name, 'measure')[0];
            if (measure) {
                console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
                return measure.duration;
            }
        }
        return 0;
    }

    /**
     * Stop performance optimization
     */
    stop() {
        this.stopMonitoring();
        
        // Clear all timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.throttleTimers.forEach(timer => clearTimeout(timer));
        
        this.debounceTimers.clear();
        this.throttleTimers.clear();
        this.cache.clear();
        
        // Clear optimizations
        this.optimizations.lazyLoading.clear();
        this.optimizations.preloaded.clear();
        this.optimizations.memoized.clear();
    }
}