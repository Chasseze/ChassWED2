/**
 * AutoSaveService - Handles automatic document saving
 * Configurable intervals and smart save strategies
 */
import { EventEmitter } from '../utils/EventEmitter.js';

export class AutoSaveService extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            interval: 10000, // 10 seconds default
            minChangesBeforeSave: 1,
            maxHistorySize: 50,
            debounceDelay: 2000,
            ...options
        };
        
        this.isRunning = false;
        this.timer = null;
        this.documentManager = null;
        this.lastSavedContent = null;
        this.changeCount = 0;
        this.isModified = false;
        
        this.setupEventListeners();
    }

    /**
     * Set document manager
     * @param {Object} documentManager - Document manager instance
     */
    setDocumentManager(documentManager) {
        this.documentManager = documentManager;
        
        if (documentManager) {
            documentManager.on('documentUpdated', ({ documentId, content }) => {
                this.handleDocumentChange(documentId, content);
            });
            
            documentManager.on('currentDocumentChanged', ({ documentId, document }) => {
                this.switchDocument(documentId, document);
            });
        }
    }

    /**
     * Start auto-save service
     */
    start() {
        if (this.isRunning) {
            return;
        }
        
        this.isRunning = true;
        this.timer = setInterval(() => {
            this.performAutoSave();
        }, this.config.interval);
        
        this.emit('started', { interval: this.config.interval });
    }

    /**
     * Stop auto-save service
     */
    stop() {
        if (!this.isRunning) {
            return;
        }
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.isRunning = false;
        this.emit('stopped');
    }

    /**
     * Handle document content changes
     * @param {string} documentId - Document ID
     * @param {string} content - Document content
     */
    handleDocumentChange(documentId, content) {
        const currentDocument = this.documentManager?.getCurrentDocument();
        
        if (currentDocument && currentDocument.id === documentId) {
            this.isModified = content !== this.lastSavedContent;
            
            if (this.isModified) {
                this.changeCount++;
                this.emit('contentChanged', { documentId, changeCount: this.changeCount });
            }
        }
    }

    /**
     * Handle document switch
     * @param {string} documentId - Document ID
     * @param {Object} document - Document object
     */
    switchDocument(documentId, document) {
        // Reset state for new document
        this.lastSavedContent = document.content;
        this.changeCount = 0;
        this.isModified = false;
        
        this.emit('documentSwitched', { documentId, document });
    }

    /**
     * Perform auto-save if needed
     */
    performAutoSave() {
        const currentDocument = this.documentManager?.getCurrentDocument();
        
        if (!currentDocument) {
            return;
        }
        
        // Check if auto-save is needed
        if (!this.shouldAutoSave(currentDocument)) {
            return;
        }
        
        this.saveDocument(currentDocument);
    }

    /**
     * Check if auto-save should be performed
     * @param {Object} document - Document to check
     * @returns {boolean} Should save
     */
    shouldAutoSave(document) {
        // Don't save if no changes
        if (!this.isModified || this.changeCount < this.config.minChangesBeforeSave) {
            return false;
        }
        
        // Don't save if content is empty
        if (!document.content || document.content.trim().length === 0) {
            return false;
        }
        
        // Don't save if recently saved (to avoid excessive saves)
        const timeSinceLastSave = Date.now() - (document.lastModified ? new Date(document.lastModified).getTime() : 0);
        if (timeSinceLastSave < this.config.interval) {
            return false;
        }
        
        return true;
    }

    /**
     * Save document immediately
     * @param {Object} document - Document to save
     * @returns {Promise<boolean>} Save result
     */
    async saveDocument(document) {
        try {
            this.emit('saving', { documentId: document.id });
            
            // Save to document manager
            const success = this.documentManager.updateDocumentContent(document.id, document.content);
            
            if (success) {
                this.lastSavedContent = document.content;
                this.changeCount = 0;
                this.isModified = false;
                
                // Update document metadata
                document.lastModified = new Date().toISOString();
                
                this.emit('saved', { 
                    documentId: document.id, 
                    timestamp: document.lastModified,
                    size: document.content.length 
                });
            }
            
            return success;
            
        } catch (error) {
            this.emit('saveError', { documentId: document.id, error });
            console.error(`Auto-save failed for document ${document.id}:`, error);
            return false;
        }
    }

    /**
     * Force save regardless of conditions
     * @param {Object} document - Document to save
     * @returns {Promise<boolean>} Save result
     */
    async forceSave(document) {
        // Temporarily bypass conditions
        const wasModified = this.isModified;
        const changeCount = this.changeCount;
        
        this.changeCount = this.config.minChangesBeforeSave;
        this.isModified = true;
        
        const result = await this.saveDocument(document);
        
        // Restore original state
        this.isModified = wasModified;
        this.changeCount = changeCount;
        
        return result;
    }

    /**
     * Get service status
     * @returns {Object} Service status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            interval: this.config.interval,
            changeCount: this.changeCount,
            isModified: this.isModified,
            lastSavedContent: this.lastSavedContent,
            currentDocument: this.documentManager?.getCurrentDocument()
        };
    }

    /**
     * Get auto-save statistics
     * @returns {Object} Statistics
     */
    getStatistics() {
        return {
            totalAutoSaves: this.getStatisticFromStorage('totalAutoSaves'),
            lastAutoSaveTime: this.getStatisticFromStorage('lastAutoSaveTime'),
            averageSaveInterval: this.getStatisticFromStorage('averageSaveInterval'),
            errorCount: this.getStatisticFromStorage('errorCount')
        };
    }

    /**
     * Get statistic from localStorage
     * @param {string} key - Statistic key
     * @returns {*} Statistic value
     */
    getStatisticFromStorage(key) {
        try {
            const value = localStorage.getItem(`autosave_stats_${key}`);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`Failed to get statistic ${key}:`, error);
            return null;
        }
    }

    /**
     * Save statistic to localStorage
     * @param {string} key - Statistic key
     * @param {*} value - Statistic value
     */
    setStatisticToStorage(key, value) {
        try {
            localStorage.setItem(`autosave_stats_${key}`, JSON.stringify(value));
        } catch (error) {
            console.error(`Failed to set statistic ${key}:`, error);
        }
    }

    /**
     * Update statistics
     * @param {string} event - Event type
     * @param {Object} data - Event data
     */
    updateStatistics(event, data) {
        switch (event) {
            case 'saved':
                const totalSaves = (this.getStatisticFromStorage('totalAutoSaves') || 0) + 1;
                this.setStatisticToStorage('totalAutoSaves', totalSaves);
                this.setStatisticToStorage('lastAutoSaveTime', new Date().toISOString());
                break;
                
            case 'saveError':
                const errorCount = (this.getStatisticFromStorage('errorCount') || 0) + 1;
                this.setStatisticToStorage('errorCount', errorCount);
                break;
        }
    }

    /**
     * Reset statistics
     */
    resetStatistics() {
        try {
            const keys = Object.keys(localStorage).filter(key => 
                key.startsWith('autosave_stats_')
            );
            
            keys.forEach(key => {
                localStorage.removeItem(key);
            });
            
            this.emit('statisticsReset');
            
        } catch (error) {
            console.error('Failed to reset statistics:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page hidden - save current state
                this.emit('pageHidden');
            } else {
                // Page visible - check if save needed
                this.emit('pageVisible');
            }
        });
        
        // Handle page unload
        window.addEventListener('beforeunload', () => {
            const currentDocument = this.documentManager?.getCurrentDocument();
            if (currentDocument && this.isModified) {
                // Sync save before unload
                this.saveDocument(currentDocument);
            }
        });
    }

    /**
     * Update configuration
     * @param {Object} newConfig - New configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Restart timer if interval changed
        if (this.isRunning && newConfig.interval !== this.config.interval) {
            this.stop();
            this.start();
        }
        
        this.emit('configUpdated', { config: this.config });
    }

    /**
     * Destroy service
     */
    destroy() {
        this.stop();
        this.removeAllListeners();
        
        this.lastSavedContent = null;
        this.changeCount = 0;
        this.isModified = false;
        this.documentManager = null;
        
        this.emit('destroyed');
    }
}