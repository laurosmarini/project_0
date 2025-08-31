/**
 * ErrorHandler - Comprehensive error handling utility
 * Provides error reporting, logging, and recovery mechanisms
 */

export class ErrorHandler {
    constructor(config = {}) {
        this.config = {
            logLevel: 'error', // 'debug', 'info', 'warn', 'error'
            maxErrorHistory: 50,
            enableNotifications: true,
            enableConsoleLogging: true,
            enableRemoteLogging: false,
            remoteEndpoint: null,
            retryAttempts: 3,
            retryDelay: 1000,
            ...config
        };

        this.errorHistory = [];
        this.errorCounts = new Map();
        this.suppressedErrors = new Set();
        this.retryQueue = new Map();
        
        this.initialized = false;

        // Error type mappings
        this.errorTypes = {
            NETWORK: 'NETWORK_ERROR',
            VALIDATION: 'VALIDATION_ERROR',
            PERMISSION: 'PERMISSION_ERROR',
            NOT_FOUND: 'NOT_FOUND_ERROR',
            TIMEOUT: 'TIMEOUT_ERROR',
            STORAGE: 'STORAGE_ERROR',
            ANIMATION: 'ANIMATION_ERROR',
            UNKNOWN: 'UNKNOWN_ERROR'
        };

        // Bind methods
        this.handle = this.handle.bind(this);
        this.handleGlobalError = this.handleGlobalError.bind(this);
        this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this);
    }

    /**
     * Initialize error handler
     */
    init() {
        this.setupGlobalHandlers();
        this.initialized = true;
        console.log('✅ ErrorHandler initialized');
    }

    /**
     * Set up global error handlers
     */
    setupGlobalHandlers() {
        // Global error handler
        window.addEventListener('error', this.handleGlobalError);
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
        
        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleResourceError(event);
            }
        }, true);
    }

    /**
     * Main error handling method
     */
    handle(error, context = '', metadata = {}) {
        try {
            const errorInfo = this.processError(error, context, metadata);
            
            // Check if this error should be suppressed
            if (this.shouldSuppress(errorInfo)) {
                return errorInfo;
            }

            // Log the error
            this.logError(errorInfo);
            
            // Add to history
            this.addToHistory(errorInfo);
            
            // Show notification if enabled
            if (this.config.enableNotifications) {
                this.showErrorNotification(errorInfo);
            }
            
            // Report to remote service if configured
            if (this.config.enableRemoteLogging && this.config.remoteEndpoint) {
                this.reportToRemote(errorInfo);
            }
            
            // Attempt recovery
            this.attemptRecovery(errorInfo);
            
            // Dispatch error event
            this.dispatchErrorEvent(errorInfo);
            
            return errorInfo;
            
        } catch (handlerError) {
            console.error('Error handler failed:', handlerError);
            console.error('Original error:', error);
        }
    }

    /**
     * Process raw error into structured format
     */
    processError(error, context, metadata) {
        const timestamp = new Date().toISOString();
        const errorId = this.generateErrorId();
        
        let processedError = {
            id: errorId,
            timestamp,
            context,
            metadata,
            type: this.classifyError(error),
            severity: this.getSeverity(error),
            message: '',
            stack: '',
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: this.getSessionId()
        };

        if (error instanceof Error) {
            processedError.message = error.message;
            processedError.stack = error.stack;
            processedError.name = error.name;
        } else if (typeof error === 'string') {
            processedError.message = error;
            processedError.name = 'StringError';
        } else if (typeof error === 'object') {
            processedError.message = error.message || JSON.stringify(error);
            processedError.name = error.name || 'ObjectError';
            processedError.details = error;
        } else {
            processedError.message = String(error);
            processedError.name = 'UnknownError';
        }

        return processedError;
    }

    /**
     * Classify error type
     */
    classifyError(error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return this.errorTypes.NETWORK;
        }
        
        if (error instanceof Error) {
            if (error.name === 'ValidationError') return this.errorTypes.VALIDATION;
            if (error.name === 'PermissionError') return this.errorTypes.PERMISSION;
            if (error.name === 'NotFoundError') return this.errorTypes.NOT_FOUND;
            if (error.name === 'TimeoutError') return this.errorTypes.TIMEOUT;
            if (error.name === 'QuotaExceededError') return this.errorTypes.STORAGE;
            if (error.message.includes('animation')) return this.errorTypes.ANIMATION;
        }
        
        if (typeof error === 'string') {
            if (error.includes('network') || error.includes('fetch')) return this.errorTypes.NETWORK;
            if (error.includes('permission') || error.includes('access')) return this.errorTypes.PERMISSION;
            if (error.includes('not found') || error.includes('404')) return this.errorTypes.NOT_FOUND;
        }
        
        return this.errorTypes.UNKNOWN;
    }

    /**
     * Determine error severity
     */
    getSeverity(error) {
        if (error instanceof Error) {
            if (error.name === 'ValidationError') return 'warning';
            if (error.name === 'PermissionError') return 'error';
            if (error.name === 'NetworkError') return 'warning';
            if (error.message.includes('critical') || error.message.includes('fatal')) return 'critical';
        }
        
        return 'error';
    }

    /**
     * Check if error should be suppressed
     */
    shouldSuppress(errorInfo) {
        const errorKey = `${errorInfo.type}-${errorInfo.message}`;
        
        // Check if explicitly suppressed
        if (this.suppressedErrors.has(errorKey)) {
            return true;
        }
        
        // Check error frequency
        const count = this.errorCounts.get(errorKey) || 0;
        this.errorCounts.set(errorKey, count + 1);
        
        // Suppress if too frequent (more than 5 times in 1 minute)
        if (count > 5) {
            const recentErrors = this.errorHistory
                .filter(e => e.type === errorInfo.type && e.message === errorInfo.message)
                .filter(e => Date.now() - new Date(e.timestamp).getTime() < 60000);
                
            if (recentErrors.length >= 5) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Log error to console
     */
    logError(errorInfo) {
        if (!this.config.enableConsoleLogging) return;
        
        const logMethod = this.getLogMethod(errorInfo.severity);
        const message = `[${errorInfo.severity.toUpperCase()}] ${errorInfo.context}: ${errorInfo.message}`;
        
        logMethod.call(console, message);
        
        if (errorInfo.stack && this.config.logLevel === 'debug') {
            console.debug(errorInfo.stack);
        }
        
        if (Object.keys(errorInfo.metadata).length > 0) {
            console.debug('Metadata:', errorInfo.metadata);
        }
    }

    /**
     * Get appropriate console method for severity
     */
    getLogMethod(severity) {
        switch (severity) {
            case 'critical':
            case 'error':
                return console.error;
            case 'warning':
                return console.warn;
            case 'info':
                return console.info;
            default:
                return console.log;
        }
    }

    /**
     * Add error to history
     */
    addToHistory(errorInfo) {
        this.errorHistory.unshift(errorInfo);
        
        // Limit history size
        if (this.errorHistory.length > this.config.maxErrorHistory) {
            this.errorHistory = this.errorHistory.slice(0, this.config.maxErrorHistory);
        }
    }

    /**
     * Show error notification to user
     */
    showErrorNotification(errorInfo) {
        if (errorInfo.severity === 'critical' || errorInfo.severity === 'error') {
            this.createNotification(errorInfo);
        }
    }

    /**
     * Create error notification UI
     */
    createNotification(errorInfo) {
        // Remove existing notifications of same type
        const existing = document.querySelectorAll(`[data-error-type="${errorInfo.type}"]`);
        existing.forEach(el => el.remove());
        
        const notification = document.createElement('div');
        notification.className = `error-notification severity-${errorInfo.severity}`;
        notification.dataset.errorType = errorInfo.type;
        notification.dataset.errorId = errorInfo.id;
        
        const userMessage = this.getUserFriendlyMessage(errorInfo);
        
        notification.innerHTML = `
            <div class="error-notification-content">
                <div class="error-icon">${this.getErrorIcon(errorInfo.severity)}</div>
                <div class="error-message">
                    <strong>${this.getSeverityLabel(errorInfo.severity)}</strong>
                    <p>${userMessage}</p>
                </div>
                <div class="error-actions">
                    ${this.getRetryButton(errorInfo)}
                    <button class="error-dismiss" aria-label="Dismiss error">✕</button>
                </div>
            </div>
        `;
        
        // Add to DOM
        this.getNotificationContainer().appendChild(notification);
        
        // Set up event listeners
        this.setupNotificationListeners(notification, errorInfo);
        
        // Auto-dismiss after timeout (except for critical errors)
        if (errorInfo.severity !== 'critical') {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);
        }
    }

    /**
     * Get or create notification container
     */
    getNotificationContainer() {
        let container = document.getElementById('error-notifications');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'error-notifications';
            container.className = 'error-notifications-container';
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
            
            // Add styles
            this.injectNotificationStyles();
        }
        
        return container;
    }

    /**
     * Inject notification styles
     */
    injectNotificationStyles() {
        if (document.getElementById('error-handler-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'error-handler-styles';
        styles.textContent = `
            .error-notifications-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            }
            
            .error-notification {
                background: #1a1a1a;
                border: 2px solid;
                border-radius: 4px;
                margin-bottom: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.3s ease-out;
            }
            
            .error-notification.severity-error {
                border-color: #ff4444;
            }
            
            .error-notification.severity-warning {
                border-color: #ffaa00;
            }
            
            .error-notification.severity-critical {
                border-color: #ff0000;
                animation: pulse 1s infinite;
            }
            
            .error-notification-content {
                display: flex;
                align-items: flex-start;
                padding: 12px;
            }
            
            .error-icon {
                font-size: 20px;
                margin-right: 12px;
                flex-shrink: 0;
            }
            
            .error-message {
                flex-grow: 1;
                color: white;
            }
            
            .error-message strong {
                display: block;
                margin-bottom: 4px;
                font-size: 14px;
            }
            
            .error-message p {
                font-size: 13px;
                margin: 0;
                opacity: 0.9;
            }
            
            .error-actions {
                display: flex;
                gap: 8px;
                margin-left: 12px;
            }
            
            .error-actions button {
                background: none;
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 4px 8px;
                border-radius: 2px;
                cursor: pointer;
                font-size: 12px;
            }
            
            .error-actions button:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Set up notification event listeners
     */
    setupNotificationListeners(notification, errorInfo) {
        // Dismiss button
        const dismissBtn = notification.querySelector('.error-dismiss');
        dismissBtn?.addEventListener('click', () => {
            notification.remove();
        });
        
        // Retry button
        const retryBtn = notification.querySelector('.error-retry');
        retryBtn?.addEventListener('click', () => {
            this.retryFailedOperation(errorInfo);
            notification.remove();
        });
    }

    /**
     * Get user-friendly error message
     */
    getUserFriendlyMessage(errorInfo) {
        const messages = {
            [this.errorTypes.NETWORK]: 'Unable to connect. Please check your internet connection.',
            [this.errorTypes.VALIDATION]: 'Please check your input and try again.',
            [this.errorTypes.PERMISSION]: 'You don\'t have permission to perform this action.',
            [this.errorTypes.NOT_FOUND]: 'The requested resource was not found.',
            [this.errorTypes.TIMEOUT]: 'The operation timed out. Please try again.',
            [this.errorTypes.STORAGE]: 'Unable to save data. Storage may be full.',
            [this.errorTypes.ANIMATION]: 'Animation error occurred.',
            [this.errorTypes.UNKNOWN]: 'An unexpected error occurred.'
        };
        
        return messages[errorInfo.type] || errorInfo.message;
    }

    /**
     * Get error icon
     */
    getErrorIcon(severity) {
        const icons = {
            critical: '🚨',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        return icons[severity] || '❌';
    }

    /**
     * Get severity label
     */
    getSeverityLabel(severity) {
        const labels = {
            critical: 'Critical Error',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        
        return labels[severity] || 'Error';
    }

    /**
     * Get retry button HTML if applicable
     */
    getRetryButton(errorInfo) {
        const retryableTypes = [
            this.errorTypes.NETWORK,
            this.errorTypes.TIMEOUT,
            this.errorTypes.STORAGE
        ];
        
        if (retryableTypes.includes(errorInfo.type)) {
            return '<button class="error-retry">Retry</button>';
        }
        
        return '';
    }

    /**
     * Attempt error recovery
     */
    attemptRecovery(errorInfo) {
        switch (errorInfo.type) {
            case this.errorTypes.STORAGE:
                this.recoverFromStorageError();
                break;
            case this.errorTypes.NETWORK:
                this.scheduleRetry(errorInfo);
                break;
            case this.errorTypes.ANIMATION:
                this.recoverFromAnimationError(errorInfo);
                break;
        }
    }

    /**
     * Recover from storage errors
     */
    recoverFromStorageError() {
        try {
            // Clear some storage to make space
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('temp_') || key?.startsWith('cache_')) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            console.log('🔧 Recovered from storage error by clearing cache');
        } catch (error) {
            console.error('Failed to recover from storage error:', error);
        }
    }

    /**
     * Schedule retry for failed operations
     */
    scheduleRetry(errorInfo) {
        const retryKey = `${errorInfo.type}-${errorInfo.context}`;
        const currentAttempts = this.retryQueue.get(retryKey) || 0;
        
        if (currentAttempts < this.config.retryAttempts) {
            setTimeout(() => {
                this.retryFailedOperation(errorInfo);
            }, this.config.retryDelay * (currentAttempts + 1));
            
            this.retryQueue.set(retryKey, currentAttempts + 1);
        }
    }

    /**
     * Retry failed operation
     */
    retryFailedOperation(errorInfo) {
        this.dispatchEvent('error:retry', {
            errorInfo,
            context: errorInfo.context,
            metadata: errorInfo.metadata
        });
    }

    /**
     * Recover from animation errors
     */
    recoverFromAnimationError(errorInfo) {
        // Cancel any running animations and reset elements
        this.dispatchEvent('animation:reset', {
            element: errorInfo.metadata.element
        });
    }

    /**
     * Handle global JavaScript errors
     */
    handleGlobalError(event) {
        const error = {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        };
        
        this.handle(error, 'Global Error', { event: 'error' });
    }

    /**
     * Handle unhandled promise rejections
     */
    handleUnhandledRejection(event) {
        this.handle(event.reason, 'Unhandled Promise Rejection', { 
            promise: event.promise,
            event: 'unhandledrejection'
        });
    }

    /**
     * Handle resource loading errors
     */
    handleResourceError(event) {
        const resource = {
            tagName: event.target.tagName,
            src: event.target.src || event.target.href,
            message: `Failed to load resource: ${event.target.src || event.target.href}`
        };
        
        this.handle(resource, 'Resource Loading Error', { event: 'resource' });
    }

    /**
     * Report error to remote service
     */
    async reportToRemote(errorInfo) {
        if (!this.config.remoteEndpoint) return;
        
        try {
            await fetch(this.config.remoteEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(errorInfo)
            });
        } catch (error) {
            console.warn('Failed to report error to remote service:', error);
        }
    }

    /**
     * Suppress specific error type
     */
    suppressError(errorType, message) {
        const errorKey = `${errorType}-${message}`;
        this.suppressedErrors.add(errorKey);
    }

    /**
     * Unsuppress error type
     */
    unsuppressError(errorType, message) {
        const errorKey = `${errorType}-${message}`;
        this.suppressedErrors.delete(errorKey);
    }

    /**
     * Get error statistics
     */
    getStats() {
        const stats = {
            totalErrors: this.errorHistory.length,
            errorsByType: {},
            errorsBySeverity: {},
            recentErrors: this.errorHistory.slice(0, 10),
            suppressedErrorTypes: Array.from(this.suppressedErrors)
        };
        
        this.errorHistory.forEach(error => {
            stats.errorsByType[error.type] = (stats.errorsByType[error.type] || 0) + 1;
            stats.errorsBySeverity[error.severity] = (stats.errorsBySeverity[error.severity] || 0) + 1;
        });
        
        return stats;
    }

    /**
     * Clear error history
     */
    clearHistory() {
        this.errorHistory.length = 0;
        this.errorCounts.clear();
    }

    /**
     * Generate unique error ID
     */
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get session ID
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('error_session_id');
        
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('error_session_id', sessionId);
        }
        
        return sessionId;
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(type, detail = {}) {
        const event = new CustomEvent(type, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Dispatch error event
     */
    dispatchErrorEvent(errorInfo) {
        this.dispatchEvent('error:handled', { errorInfo });
    }

    /**
     * Destroy error handler
     */
    destroy() {
        // Remove global handlers
        window.removeEventListener('error', this.handleGlobalError);
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
        
        // Clear data
        this.errorHistory.length = 0;
        this.errorCounts.clear();
        this.suppressedErrors.clear();
        this.retryQueue.clear();
        
        // Remove notification styles
        const styles = document.getElementById('error-handler-styles');
        if (styles) {
            styles.remove();
        }
        
        // Remove notifications
        const container = document.getElementById('error-notifications');
        if (container) {
            container.remove();
        }
        
        this.initialized = false;
    }
}