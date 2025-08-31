/**
 * AnimationManager - Handles smooth animations and transitions
 * Provides a comprehensive animation system with performance optimization
 */

export class AnimationManager {
    constructor(config = {}) {
        this.config = {
            duration: 300,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            useGPU: true,
            respectMotionPreferences: true,
            maxConcurrentAnimations: 10,
            ...config
        };

        this.animations = new Map();
        this.animationQueue = [];
        this.runningAnimations = 0;
        this.animationId = 0;
        this.isReducedMotion = false;
        
        this.initialized = false;

        // Pre-defined animation definitions
        this.animationDefinitions = {
            // Fade animations
            fadeIn: {
                from: { opacity: 0 },
                to: { opacity: 1 }
            },
            fadeOut: {
                from: { opacity: 1 },
                to: { opacity: 0 }
            },
            
            // Slide animations
            slideInLeft: {
                from: { transform: 'translateX(-100%)', opacity: 0 },
                to: { transform: 'translateX(0)', opacity: 1 }
            },
            slideInRight: {
                from: { transform: 'translateX(100%)', opacity: 0 },
                to: { transform: 'translateX(0)', opacity: 1 }
            },
            slideInDown: {
                from: { transform: 'translateY(-100%)', opacity: 0 },
                to: { transform: 'translateY(0)', opacity: 1 }
            },
            slideInUp: {
                from: { transform: 'translateY(100%)', opacity: 0 },
                to: { transform: 'translateY(0)', opacity: 1 }
            },
            slideOutLeft: {
                from: { transform: 'translateX(0)', opacity: 1 },
                to: { transform: 'translateX(-100%)', opacity: 0 }
            },
            slideOutRight: {
                from: { transform: 'translateX(0)', opacity: 1 },
                to: { transform: 'translateX(100%)', opacity: 0 }
            },
            slideOutUp: {
                from: { transform: 'translateY(0)', opacity: 1 },
                to: { transform: 'translateY(-100%)', opacity: 0 }
            },
            slideOutDown: {
                from: { transform: 'translateY(0)', opacity: 1 },
                to: { transform: 'translateY(100%)', opacity: 0 }
            },
            
            // Scale animations
            scaleIn: {
                from: { transform: 'scale(0)', opacity: 0 },
                to: { transform: 'scale(1)', opacity: 1 }
            },
            scaleOut: {
                from: { transform: 'scale(1)', opacity: 1 },
                to: { transform: 'scale(0)', opacity: 0 }
            },
            
            // Bounce animations
            bounce: {
                keyframes: [
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.1)' },
                    { transform: 'scale(0.9)' },
                    { transform: 'scale(1.05)' },
                    { transform: 'scale(1)' }
                ]
            },
            
            // Pulse animation
            pulse: {
                keyframes: [
                    { transform: 'scale(1)', opacity: 1 },
                    { transform: 'scale(1.05)', opacity: 0.8 },
                    { transform: 'scale(1)', opacity: 1 }
                ]
            },
            
            // Shake animation
            shake: {
                keyframes: [
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-10px)' },
                    { transform: 'translateX(10px)' },
                    { transform: 'translateX(-10px)' },
                    { transform: 'translateX(10px)' },
                    { transform: 'translateX(0)' }
                ]
            },
            
            // Flip animations
            flipInX: {
                from: { transform: 'perspective(400px) rotateX(-90deg)', opacity: 0 },
                to: { transform: 'perspective(400px) rotateX(0deg)', opacity: 1 }
            },
            flipOutX: {
                from: { transform: 'perspective(400px) rotateX(0deg)', opacity: 1 },
                to: { transform: 'perspective(400px) rotateX(90deg)', opacity: 0 }
            },
            
            // Rotate animations
            rotateIn: {
                from: { transform: 'rotate(-200deg)', opacity: 0 },
                to: { transform: 'rotate(0deg)', opacity: 1 }
            },
            rotateOut: {
                from: { transform: 'rotate(0deg)', opacity: 1 },
                to: { transform: 'rotate(200deg)', opacity: 0 }
            },
            
            // Zoom animations
            zoomIn: {
                from: { transform: 'scale(0.3)', opacity: 0 },
                to: { transform: 'scale(1)', opacity: 1 }
            },
            zoomOut: {
                from: { transform: 'scale(1)', opacity: 1 },
                to: { transform: 'scale(0.3)', opacity: 0 }
            },
            
            // Loading animations
            spin: {
                keyframes: [
                    { transform: 'rotate(0deg)' },
                    { transform: 'rotate(360deg)' }
                ],
                duration: 1000,
                iterationCount: 'infinite'
            },
            
            // Progress animations
            progressFill: {
                from: { width: '0%' },
                to: { width: 'var(--progress-width, 100%)' }
            }
        };

        // Bind methods
        this.animate = this.animate.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }

    /**
     * Initialize animation manager
     */
    async init() {
        try {
            this.checkMotionPreferences();
            this.setupEventListeners();
            this.injectCSS();
            this.initialized = true;

            console.log('✅ AnimationManager initialized');
        } catch (error) {
            console.error('❌ AnimationManager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Check user's motion preferences
     */
    checkMotionPreferences() {
        if (this.config.respectMotionPreferences) {
            this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            // Listen for changes
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            mediaQuery.addListener((e) => {
                this.isReducedMotion = e.matches;
                this.dispatchEvent('animation:motion-preference-changed', { reducedMotion: e.matches });
            });
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        // Listen for animation requests
        document.addEventListener('animation:request', (event) => {
            const { element, animation, options } = event.detail;
            this.animate(element, animation, options);
        });

        // Listen for batch animation requests
        document.addEventListener('animation:batch', (event) => {
            this.animateBatch(event.detail.animations);
        });

        // Listen for animation cancellations
        document.addEventListener('animation:cancel', (event) => {
            this.cancelAnimation(event.detail.animationId || event.detail.element);
        });
    }

    /**
     * Inject CSS for animations
     */
    injectCSS() {
        if (document.getElementById('animation-manager-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'animation-manager-styles';
        styles.textContent = `
            .animate-gpu {
                transform: translateZ(0);
                backface-visibility: hidden;
                perspective: 1000px;
            }
            
            .animate-will-change {
                will-change: transform, opacity;
            }
            
            .animate-smooth {
                transition: all ${this.config.duration}ms ${this.config.easing};
            }
            
            @media (prefers-reduced-motion: reduce) {
                .animate-respect-motion,
                .animate-respect-motion * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            }
            
            /* Hide elements during animation setup */
            .animate-preparing {
                visibility: hidden;
            }
            
            /* Loading spinner */
            .animate-spin {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Main animate method
     */
    async animate(element, animationName, options = {}) {
        if (!element || !animationName) {
            throw new Error('Element and animation name are required');
        }

        // Handle element selector
        if (typeof element === 'string') {
            element = document.querySelector(element);
            if (!element) {
                throw new Error(`Element not found: ${element}`);
            }
        }

        // Skip animation if reduced motion is preferred
        if (this.isReducedMotion && this.config.respectMotionPreferences) {
            return this.skipAnimation(element, options);
        }

        const animationId = this.generateAnimationId();
        
        const config = {
            duration: options.duration || this.config.duration,
            easing: options.easing || this.config.easing,
            delay: options.delay || 0,
            fill: options.fill || 'forwards',
            iterationCount: options.iterationCount || 1,
            direction: options.direction || 'normal',
            useGPU: options.useGPU !== undefined ? options.useGPU : this.config.useGPU,
            onComplete: options.onComplete,
            onStart: options.onStart,
            ...options
        };

        // Check if we can run the animation immediately
        if (this.runningAnimations >= this.config.maxConcurrentAnimations) {
            return this.queueAnimation(element, animationName, config, animationId);
        }

        return this.executeAnimation(element, animationName, config, animationId);
    }

    /**
     * Execute animation
     */
    async executeAnimation(element, animationName, config, animationId) {
        this.runningAnimations++;
        
        const animationData = {
            id: animationId,
            element,
            animationName,
            config,
            startTime: performance.now(),
            promise: null
        };

        this.animations.set(animationId, animationData);

        try {
            // Prepare element for animation
            this.prepareElement(element, config);
            
            // Get animation definition
            const definition = this.getAnimationDefinition(animationName);
            
            if (config.onStart) {
                config.onStart(element);
            }

            // Execute the animation
            const result = await this.runAnimation(element, definition, config);
            
            // Clean up
            this.cleanupElement(element, config);
            
            if (config.onComplete) {
                config.onComplete(element);
            }

            this.dispatchEvent('animation:complete', {
                animationId,
                element,
                animationName,
                duration: performance.now() - animationData.startTime
            });

            return result;

        } catch (error) {
            console.error('Animation failed:', error);
            this.cleanupElement(element, config);
            
            this.dispatchEvent('animation:error', {
                animationId,
                element,
                animationName,
                error
            });
            
            throw error;

        } finally {
            this.animations.delete(animationId);
            this.runningAnimations--;
            this.processQueue();
        }
    }

    /**
     * Prepare element for animation
     */
    prepareElement(element, config) {
        // Add performance optimization classes
        if (config.useGPU) {
            element.classList.add('animate-gpu');
        }
        
        element.classList.add('animate-will-change');
        
        if (this.config.respectMotionPreferences) {
            element.classList.add('animate-respect-motion');
        }

        // Store original styles
        const originalStyles = {
            transform: element.style.transform,
            opacity: element.style.opacity,
            visibility: element.style.visibility,
            willChange: element.style.willChange
        };
        
        element._originalStyles = originalStyles;
    }

    /**
     * Clean up element after animation
     */
    cleanupElement(element, config) {
        // Remove performance optimization classes
        element.classList.remove('animate-gpu', 'animate-will-change', 'animate-respect-motion', 'animate-preparing');

        // Restore will-change property
        if (element._originalStyles) {
            element.style.willChange = element._originalStyles.willChange || '';
        }

        delete element._originalStyles;
    }

    /**
     * Get animation definition
     */
    getAnimationDefinition(animationName) {
        const definition = this.animationDefinitions[animationName];
        
        if (!definition) {
            throw new Error(`Unknown animation: ${animationName}`);
        }

        return { ...definition };
    }

    /**
     * Run the actual animation
     */
    async runAnimation(element, definition, config) {
        // Handle keyframe animations
        if (definition.keyframes) {
            return this.runKeyframeAnimation(element, definition, config);
        }

        // Handle transition animations
        if (definition.from && definition.to) {
            return this.runTransitionAnimation(element, definition, config);
        }

        throw new Error('Invalid animation definition');
    }

    /**
     * Run keyframe animation using Web Animations API
     */
    async runKeyframeAnimation(element, definition, config) {
        const keyframes = Array.isArray(definition.keyframes) ? definition.keyframes : [definition.keyframes];
        
        const animationConfig = {
            duration: definition.duration || config.duration,
            easing: definition.easing || config.easing,
            delay: config.delay,
            fill: config.fill,
            iterations: definition.iterationCount || config.iterationCount,
            direction: config.direction
        };

        if (element.animate) {
            // Use Web Animations API
            const animation = element.animate(keyframes, animationConfig);
            
            return new Promise((resolve, reject) => {
                animation.addEventListener('finish', () => resolve(animation));
                animation.addEventListener('cancel', () => reject(new Error('Animation cancelled')));
            });
        } else {
            // Fallback to CSS animations
            return this.runCSSKeyframeAnimation(element, keyframes, animationConfig);
        }
    }

    /**
     * Run transition animation
     */
    async runTransitionAnimation(element, definition, config) {
        return new Promise((resolve, reject) => {
            // Set initial state
            this.applyStyles(element, definition.from);
            
            // Force reflow
            element.offsetHeight;
            
            // Set up transition
            element.style.transition = `all ${config.duration}ms ${config.easing}`;
            
            // Apply final state
            setTimeout(() => {
                this.applyStyles(element, definition.to);
            }, config.delay);

            // Clean up after animation
            const cleanup = () => {
                element.style.transition = '';
                element.removeEventListener('transitionend', onEnd);
                element.removeEventListener('transitioncancel', onCancel);
            };

            const onEnd = (event) => {
                if (event.target === element) {
                    cleanup();
                    resolve();
                }
            };

            const onCancel = () => {
                cleanup();
                reject(new Error('Animation cancelled'));
            };

            element.addEventListener('transitionend', onEnd);
            element.addEventListener('transitioncancel', onCancel);

            // Timeout fallback
            setTimeout(() => {
                cleanup();
                resolve();
            }, config.duration + config.delay + 100);
        });
    }

    /**
     * Fallback CSS keyframe animation
     */
    async runCSSKeyframeAnimation(element, keyframes, config) {
        return new Promise((resolve) => {
            const animationName = `anim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Create CSS keyframes
            const css = this.createKeyframeCSS(animationName, keyframes);
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);

            // Apply animation
            element.style.animation = `${animationName} ${config.duration}ms ${config.easing} ${config.delay}ms ${config.iterations} ${config.direction} ${config.fill}`;

            // Clean up
            const cleanup = () => {
                element.style.animation = '';
                style.remove();
            };

            element.addEventListener('animationend', () => {
                cleanup();
                resolve();
            }, { once: true });

            element.addEventListener('animationcancel', () => {
                cleanup();
                resolve();
            }, { once: true });

            // Timeout fallback
            setTimeout(() => {
                cleanup();
                resolve();
            }, config.duration + config.delay + 100);
        });
    }

    /**
     * Create CSS keyframes rule
     */
    createKeyframeCSS(animationName, keyframes) {
        let css = `@keyframes ${animationName} {\n`;
        
        keyframes.forEach((frame, index) => {
            const percentage = keyframes.length === 1 ? 100 : (index / (keyframes.length - 1)) * 100;
            css += `  ${percentage}% {\n`;
            
            Object.entries(frame).forEach(([property, value]) => {
                css += `    ${this.camelToKebab(property)}: ${value};\n`;
            });
            
            css += `  }\n`;
        });
        
        css += '}\n';
        return css;
    }

    /**
     * Apply styles to element
     */
    applyStyles(element, styles) {
        Object.entries(styles).forEach(([property, value]) => {
            element.style[property] = value;
        });
    }

    /**
     * Convert camelCase to kebab-case
     */
    camelToKebab(str) {
        return str.replace(/([A-Z])/g, '-$1').toLowerCase();
    }

    /**
     * Skip animation for reduced motion
     */
    async skipAnimation(element, options) {
        if (options.onStart) {
            options.onStart(element);
        }
        
        // Apply final state immediately
        if (options.finalState) {
            this.applyStyles(element, options.finalState);
        }
        
        if (options.onComplete) {
            options.onComplete(element);
        }

        return Promise.resolve();
    }

    /**
     * Queue animation for later execution
     */
    queueAnimation(element, animationName, config, animationId) {
        return new Promise((resolve, reject) => {
            this.animationQueue.push({
                element,
                animationName,
                config,
                animationId,
                resolve,
                reject
            });
        });
    }

    /**
     * Process animation queue
     */
    processQueue() {
        if (this.animationQueue.length > 0 && this.runningAnimations < this.config.maxConcurrentAnimations) {
            const next = this.animationQueue.shift();
            
            this.executeAnimation(next.element, next.animationName, next.config, next.animationId)
                .then(next.resolve)
                .catch(next.reject);
        }
    }

    /**
     * Animate multiple elements
     */
    async animateBatch(animations) {
        const promises = animations.map(({ element, animation, options }) => 
            this.animate(element, animation, options)
        );
        
        return Promise.all(promises);
    }

    /**
     * Cancel animation
     */
    cancelAnimation(animationIdOrElement) {
        let animationToCancel;
        
        if (typeof animationIdOrElement === 'string' || typeof animationIdOrElement === 'number') {
            animationToCancel = this.animations.get(animationIdOrElement);
        } else {
            // Find animation by element
            for (const [id, animation] of this.animations) {
                if (animation.element === animationIdOrElement) {
                    animationToCancel = animation;
                    break;
                }
            }
        }

        if (animationToCancel) {
            // Cancel Web Animation API animation
            if (animationToCancel.webAnimation) {
                animationToCancel.webAnimation.cancel();
            }

            // Clean up element
            this.cleanupElement(animationToCancel.element, animationToCancel.config);
            
            // Remove from tracking
            this.animations.delete(animationToCancel.id);
            this.runningAnimations--;
            
            this.processQueue();
            
            return true;
        }
        
        return false;
    }

    /**
     * Cancel all animations
     */
    cancelAllAnimations() {
        const animationIds = Array.from(this.animations.keys());
        let cancelledCount = 0;
        
        animationIds.forEach(id => {
            if (this.cancelAnimation(id)) {
                cancelledCount++;
            }
        });
        
        // Clear queue
        this.animationQueue.length = 0;
        
        return cancelledCount;
    }

    /**
     * Pause all animations
     */
    pauseAllAnimations() {
        this.animations.forEach(({ webAnimation }) => {
            if (webAnimation && webAnimation.pause) {
                webAnimation.pause();
            }
        });
    }

    /**
     * Resume all animations
     */
    resumeAllAnimations() {
        this.animations.forEach(({ webAnimation }) => {
            if (webAnimation && webAnimation.play) {
                webAnimation.play();
            }
        });
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseAllAnimations();
        } else {
            this.resumeAllAnimations();
        }
    }

    /**
     * Add custom animation definition
     */
    addAnimation(name, definition) {
        this.animationDefinitions[name] = definition;
    }

    /**
     * Remove custom animation definition
     */
    removeAnimation(name) {
        delete this.animationDefinitions[name];
    }

    /**
     * Generate unique animation ID
     */
    generateAnimationId() {
        return `anim_${++this.animationId}_${Date.now()}`;
    }

    /**
     * Get animation statistics
     */
    getStats() {
        return {
            runningAnimations: this.runningAnimations,
            queuedAnimations: this.animationQueue.length,
            totalAnimations: this.animations.size,
            isReducedMotion: this.isReducedMotion,
            availableAnimations: Object.keys(this.animationDefinitions)
        };
    }

    /**
     * Performance optimization: use requestAnimationFrame for smooth animations
     */
    requestFrame(callback) {
        return requestAnimationFrame(callback);
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(type, detail = {}) {
        const event = new CustomEvent(type, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Destroy animation manager
     */
    destroy() {
        // Cancel all running animations
        this.cancelAllAnimations();

        // Remove event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);

        // Remove CSS
        const styles = document.getElementById('animation-manager-styles');
        if (styles) {
            styles.remove();
        }

        // Clear data
        this.animations.clear();
        this.animationQueue.length = 0;
        this.initialized = false;
    }
}