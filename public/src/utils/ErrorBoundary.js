/**
 * ErrorBoundary - Handles errors gracefully with fallback UI
 * Provides user-friendly error reporting and recovery options
 */
import { EventEmitter } from './EventEmitter.js';
import { DOMUtils } from './DOMUtils.js';

export class ErrorBoundary extends EventEmitter {
    constructor() {
        super();
        
        this.errors = [];
        this.maxErrors = 10;
        this.isShowingError = false;
        this.setupGlobalHandlers();
    }

    /**
     * Setup global error handlers
     */
    setupGlobalHandlers() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'unhandledrejection',
                message: event.reason?.message || 'Unknown promise rejection',
                source: event.reason,
                stack: event.reason?.stack,
                timestamp: new Date().toISOString(),
                context: 'global'
            });
        });

        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            if (event.error) {
                this.handleError({
                    type: 'javascript',
                    message: event.error.message || 'Unknown JavaScript error',
                    source: event.filename || 'unknown',
                    line: event.lineno || 0,
                    column: event.colno || 0,
                    stack: event.error?.stack,
                    timestamp: new Date().toISOString(),
                    context: 'global'
                });
            }
        });

        // Handle resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK' || event.target.tagName === 'IMG')) {
                this.handleError({
                    type: 'resource',
                    message: `Failed to load ${event.target.tagName.toLowerCase()}: ${event.target.src || event.target.href}`,
                    source: event.target.src || event.target.href,
                    timestamp: new Date().toISOString(),
                    context: 'resource-loading'
                });
            }
        }, true);
    }

    /**
     * Handle an error
     * @param {Object} errorData - Error information
     */
    handleError(errorData) {
        // Add to error log
        this.errors.unshift(errorData);
        
        // Limit error history
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(0, this.maxErrors);
        }
        
        // Save error to storage
        this.saveErrorToStorage(errorData);
        
        // Show user-friendly error message
        this.showErrorToUser(errorData);
        
        // Emit error event
        this.emit('error', errorData);
        
        // Log to console
        console.error('ErrorBoundary:', errorData);
    }

    /**
     * Show error to user
     * @param {Object} errorData - Error information
     */
    showErrorToUser(errorData) {
        if (this.isShowingError) {
            return; // Avoid spamming user with errors
        }

        // Create error notification
        const errorId = this.generateErrorId();
        this.isShowingError = true;

        // Determine error level and message
        const { level, message, action } = this.categorizeError(errorData);

        // Create error modal
        this.showErrorModal({
            id: errorId,
            title: 'Error Occurred',
            level,
            message,
            error: errorData,
            action
        });
    }

    /**
     * Show error modal
     * @param {Object} options - Modal options
     */
    showErrorModal(options) {
        const modal = this.createErrorModal(options);
        
        // Add to document
        document.body.appendChild(modal);
        
        // Auto-hide after timeout or user action
        const autoHideTime = this.getAutoHideTime(options.level);
        const hideTimeout = setTimeout(() => {
            this.hideErrorModal(options.id);
        }, autoHideTime);
        
        // Handle user actions
        const retryBtn = modal.querySelector('.error-retry-btn');
        const closeBtn = modal.querySelector('.error-close-btn');
        const reportBtn = modal.querySelector('.error-report-btn');
        
        if (retryBtn) {
            DOMUtils.addEventListener(retryBtn, 'click', () => {
                clearTimeout(hideTimeout);
                this.hideErrorModal(options.id);
                
                if (options.error.action && options.error.action.retry) {
                    options.error.action.retry();
                }
            });
        }
        
        if (closeBtn) {
            DOMUtils.addEventListener(closeBtn, 'click', () => {
                clearTimeout(hideTimeout);
                this.hideErrorModal(options.id);
            });
        }
        
        if (reportBtn) {
            DOMUtils.addEventListener(reportBtn, 'click', () => {
                clearTimeout(hideTimeout);
                this.reportError(options.error);
                this.hideErrorModal(options.id);
            });
        }
        
        // Remove from DOM when hidden
        this.setupModalCleanup(modal, hideTimeout);
    }

    /**
     * Categorize error and determine response
     * @param {Object} errorData - Error information
     * @returns {Object} Error categorization
     */
    categorizeError(errorData) {
        const type = errorData.type || 'unknown';
        
        // Determine severity level
        let level = 'error';
        let message = errorData.message || 'An unknown error occurred';
        let action = null;

        switch (type) {
            case 'unhandledrejection':
                level = 'warning';
                message = 'Operation was interrupted. Please try again.';
                action = {
                    text: 'Retry',
                    retry: () => {
                        // Retry the last operation
                        window.location.reload();
                    }
                };
                break;

            case 'javascript':
                if (errorData.source && errorData.source.includes('main.js')) {
                    level = 'critical';
                    message = 'Application error. Please refresh the page.';
                    action = {
                        text: 'Refresh',
                        retry: () => {
                            window.location.reload();
                        }
                    };
                } else {
                    level = 'error';
                    message = 'Script error occurred. Please check console for details.';
                }
                break;

            case 'resource':
                level = 'warning';
                if (errorData.source && errorData.source.includes('cdn')) {
                    message = 'External resource unavailable. Some features may be limited.';
                } else {
                    message = 'Resource failed to load. Please check your internet connection.';
                }
                action = {
                    text: 'Retry',
                    retry: () => {
                        // Retry loading the resource
                        if (errorData.source) {
                            const script = document.createElement('script');
                            script.src = errorData.source;
                            document.head.appendChild(script);
                        }
                    }
                };
                break;

            case 'network':
                level = 'warning';
                message = 'Network error. Please check your internet connection.';
                action = {
                    text: 'Retry',
                    retry: () => {
                        window.location.reload();
                    }
                };
                break;

            case 'storage':
                level = 'info';
                message = 'Storage error. Your data may not be saved properly.';
                break;

            case 'permission':
                level = 'error';
                message = 'Permission denied. Please check your settings.';
                break;

            default:
                level = 'error';
                if (errorData.message) {
                    message = errorData.message;
                }
        }

        return { level, message, action };
    }

    /**
     * Get auto-hide time based on error level
     * @param {string} level - Error level
     * @returns {number} Hide time in milliseconds
     */
    getAutoHideTime(level) {
        const times = {
            info: 3000,      // 3 seconds
            warning: 5000,   // 5 seconds
            error: 8000,     // 8 seconds
            critical: 12000   // 12 seconds
        };
        
        return times[level] || times.error;
    }

    /**
     * Create error modal element
     * @param {Object} options - Modal options
     * @returns {Element} Modal element
     */
    createErrorModal(options) {
        const modal = DOMUtils.createElement('div', {
            className: 'modal error-modal',
            id: options.id
        }, `
            <div class="modal-content">
                <div class="error-modal-header">
                    <div class="error-icon">
                        ${this.getErrorIcon(options.level)}
                    </div>
                    <div class="error-title">
                        <h3>${options.title}</h3>
                        <div class="error-level ${options.level}">${options.level.toUpperCase()}</div>
                    </div>
                </div>
                
                <div class="error-modal-body">
                    <p class="error-message">${options.message}</p>
                    
                    <div class="error-details" id="error-details-${options.id}">
                        <button class="error-toggle-btn" data-expanded="false">
                            <i class="fas fa-chevron-down"></i>
                            Show Details
                        </button>
                    </div>
                    
                    <div class="error-technical" id="error-technical-${options.id}" style="display: none;">
                        <strong>Error Type:</strong> ${options.error.type || 'Unknown'}<br>
                        <strong>Source:</strong> ${options.error.source || 'Not specified'}<br>
                        <strong>Time:</strong> ${options.error.timestamp || 'Unknown'}<br>
                        ${options.error.stack ? `<strong>Stack:</strong><pre>${options.error.stack}</pre>` : ''}
                    </div>
                </div>
            </div>
            
            <div class="modal-actions">
                ${this.createActionButtons(options.action)}
            </div>
        `);
        
        return modal;
    }

    /**
     * Get error icon based on level
     * @param {string} level - Error level
     * @returns {string} Icon HTML
     */
    getErrorIcon(level) {
        const icons = {
            info: '<i class="fas fa-info-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            error: '<i class="fas fa-times-circle"></i>',
            critical: '<i class="fas fa-bomb"></i>'
        };
        
        return icons[level] || icons.error;
    }

    /**
     * Create action buttons for error modal
     * @param {Object} action - Action configuration
     * @returns {string} Buttons HTML
     */
    createActionButtons(action) {
        if (!action) {
            return `
                <button class="error-close-btn btn btn-secondary">
                    <i class="fas fa-times"></i>
                    Close
                </button>
            `;
        }
        
        let buttons = `
            <button class="error-retry-btn btn btn-primary">
                <i class="fas fa-redo"></i>
                ${action.text}
            </button>
        `;
        
        if (action.action !== 'retry') {
            buttons += `
                <button class="error-report-btn btn btn-secondary">
                    <i class="fas fa-bug"></i>
                    Report Issue
                </button>
            `;
        }
        
        return buttons;
    }

    /**
     * Hide error modal
     * @param {string} modalId - Modal ID
     */
    hideErrorModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            this.isShowingError = false;
        }
    }

    /**
     * Setup modal cleanup
     * @param {Element} modal - Modal element
     * @param {number} timeout - Hide timeout
     */
    setupModalCleanup(modal, timeout) {
        const removeModal = () => {
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            clearTimeout(timeout);
        };
        
        // Auto-remove on modal hide
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' && 
                    !mutation.target.classList.contains('active')) {
                    removeModal();
                    observer.disconnect();
                }
            });
        });
        
        observer.observe(modal, { attributes: true });
    }

    /**
     * Report error for debugging
     * @param {Object} error - Error data
     */
    reportError(error) {
        // Create error report
        const report = {
            timestamp: new Date().toISOString(),
            error: {
                type: error.type,
                message: error.message,
                source: error.source,
                stack: error.stack,
                userAgent: navigator.userAgent,
                url: window.location.href
            },
            environment: {
                browser: this.getBrowserInfo(),
                screen: this.getScreenInfo(),
                memory: this.getMemoryInfo(),
                connection: this.getConnectionInfo()
            }
        };
        
        // Save to console for debugging
        console.groupCollapsed('Error Report');
        console.table(report);
        console.groupEnd();
        
        // Send to external service (in production)
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            this.sendErrorReport(report);
        }
        
        // Copy to clipboard for user
        this.copyErrorToClipboard(JSON.stringify(report, null, 2));
        
        this.emit('errorReported', { report, error });
    }

    /**
     * Get browser information
     * @returns {Object} Browser info
     */
    getBrowserInfo() {
        return {
            name: navigator.appName || 'Unknown',
            version: navigator.appVersion || 'Unknown',
            platform: navigator.platform || 'Unknown',
            cookieEnabled: navigator.cookieEnabled,
            language: navigator.language || 'Unknown',
            online: navigator.onLine
        };
    }

    /**
     * Get screen information
     * @returns {Object} Screen info
     */
    getScreenInfo() {
        return {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            orientation: screen.orientation?.type || 'Unknown'
        };
    }

    /**
     * Get memory information
     * @returns {Object} Memory info
     */
    getMemoryInfo() {
        if (performance.memory) {
            return {
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        
        return {
            message: 'Memory API not available'
        };
    }

    /**
     * Get connection information
     * @returns {Object} Connection info
     */
    getConnectionInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            return {
                effectiveType: connection.effectiveType || 'Unknown',
                downlink: connection.downlink || 'Unknown',
                rtt: connection.rtt || 'Unknown',
                saveData: connection.saveData || 'Unknown'
            };
        }
        
        return {
            message: 'Connection API not available'
        };
    }

    /**
     * Copy error report to clipboard
     * @param {string} text - Text to copy
     * @param {number} maxLength - Maximum length
     */
    copyErrorToClipboard(text, maxLength = 1000) {
        try {
            if (navigator.clipboard) {
                const textToCopy = text.length > maxLength ? 
                    text.substring(0, maxLength) + '...' : 
                    text;
                
                navigator.clipboard.writeText(textToCopy).then(() => {
                    this.emit('errorCopied', { text: textToCopy });
                    this.showToast('Error report copied to clipboard', 'success');
                }).catch(error => {
                    console.error('Failed to copy to clipboard:', error);
                });
            } else {
                console.warn('Clipboard API not available');
            }
        } catch (error) {
            console.error('Error copying to clipboard:', error);
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type
     */
    showToast(message, type = 'info') {
        const toast = DOMUtils.query('#toast') || this.createToast();
        
        const toastMessage = toast.querySelector('.toast-message');
        const toastElement = toast;
        
        if (toastMessage) {
            toastMessage.textContent = message;
        }
        
        toastElement.className = `toast ${type} show`;
        
        // Auto-hide
        setTimeout(() => {
            toastElement.classList.remove('show');
        }, 3000);
        
        this.emit('toastShown', { message, type });
    }

    /**
     * Create toast element
     * @returns {Element} Toast element
     */
    createToast() {
        const toast = DOMUtils.createElement('div', {
            className: 'toast',
            id: 'error-boundary-toast'
        }, `
            <i class="fas fa-info-circle"></i>
            <span class="toast-message"></span>
        `);
        
        document.body.appendChild(toast);
        return toast;
    }

    /**
     * Send error report to external service
     * @param {Object} report - Error report
     */
    sendErrorReport(report) {
        // In production, send to error tracking service
        // For now, just log to console
        console.log('Sending error report:', report);
        
        // Placeholder for external service integration
        // fetch('/api/error-reports', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(report)
        // }).catch(error => {
        //     console.error('Failed to send error report:', error);
        // });
    }

    /**
     * Get error history
     * @param {number} limit - Maximum errors to return
     * @returns {Array} Error history
     */
    getErrorHistory(limit = 10) {
        return this.errors.slice(0, limit);
    }

    /**
     * Clear error history
     */
    clearErrorHistory() {
        this.errors = [];
        this.emit('errorHistoryCleared');
    }

    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getErrorStatistics() {
        const levels = this.errors.reduce((acc, error) => {
            acc[error.level] = (acc[error.level] || 0) + 1;
            return acc;
        }, {});
        
        const recent = this.errors.slice(0, 5);
        
        return {
            total: this.errors.length,
            byLevel: levels,
            recent: recent,
            lastError: this.errors[0] || null
        };
    }

    /**
     * Save error to localStorage
     * @param {Object} errorData - Error data
     */
    saveErrorToStorage(errorData) {
        try {
            const existingErrors = JSON.parse(localStorage.getItem('charles_editor_errors') || '[]');
            existingErrors.unshift(errorData);
            
            // Limit stored errors
            const limitedErrors = existingErrors.slice(0, 50);
            localStorage.setItem('charles_editor_errors', JSON.stringify(limitedErrors));
            
        } catch (error) {
            console.error('Failed to save error to storage:', error);
        }
    }

    /**
     * Load errors from localStorage
     * @returns {Array} Error history
     */
    loadErrorsFromStorage() {
        try {
            return JSON.parse(localStorage.getItem('charles_editor_errors') || '[]');
        } catch (error) {
            console.error('Failed to load errors from storage:', error);
            return [];
        }
    }

    /**
     * Clear errors from localStorage
     */
    clearErrorsFromStorage() {
        try {
            localStorage.removeItem('charles_editor_errors');
            this.emit('storageErrorsCleared');
        } catch (error) {
            console.error('Failed to clear errors from storage:', error);
        }
    }

    /**
     * Check if system is in error state
     * @returns {boolean} Error state
     */
    isInErrorState() {
        return this.isShowingError;
    }

    /**
     * Recover from error state
     */
    recover() {
        this.hideErrorModal();
        this.isShowingError = false;
        this.emit('recovered');
    }

    /**
     * Destroy error boundary
     */
    destroy() {
        // Clear any active error modals
        const modals = document.querySelectorAll('.error-modal.active');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
        
        this.removeAllListeners();
        this.errors = [];
        this.isShowingError = false;
        
        this.emit('destroyed');
    }
}