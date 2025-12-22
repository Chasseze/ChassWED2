/**
 * Editor - Main editor class that orchestrates all components
 */
import { EventEmitter } from '../utils/EventEmitter.js';
import { DOMUtils } from '../utils/DOMUtils.js';
import { CommandManager } from './CommandManager.js';
import { DocumentManager } from './DocumentManager.js';
import { AIService } from '../services/AIService.js';
import { AIAssistant } from '../ui/AIAssistant.js';
import { TemplatesService } from '../services/TemplatesService.js';
import { TemplatesUI } from '../ui/TemplatesUI.js';
import { AdvancedFormattingService } from '../services/AdvancedFormattingService.js';
import { AdvancedFormattingUI } from '../ui/AdvancedFormattingUI.js';
import { EmailSharingService } from '../services/EmailSharingService.js';

export class Editor extends EventEmitter {
    constructor(options = {}) {
        super();
        
        // Configuration
        this.config = {
            autoSave: true,
            autoSaveInterval: 10000,
            spellCheck: false,
            theme: 'light',
            maxUndoSteps: 50,
            ...options
        };
        
        // Core components
        this.documentManager = new DocumentManager();
        this.commandManager = null;
        this.aiService = new AIService();
        this.aiAssistant = null;
        this.templatesService = new TemplatesService();
        this.templatesUI = null;
        this.advancedFormattingService = null;
        this.advancedFormattingUI = null;
        this.emailSharingService = null;
        
        // DOM elements
        this.editorElement = null;
        this.pageElement = null;
        this.pageContainer = null;
        
        // State
        this.isInitialized = false;
        this.currentTheme = this.config.theme;
        this.zoomLevel = 100;
        
        // Auto-save timer
        this.autoSaveTimer = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    /**
     * Initialize the editor
     */
    async initialize() {
        try {
            // Find DOM elements
            this.editorElement = DOMUtils.query('#editor');
            this.pageElement = DOMUtils.query('#page');
            this.pageContainer = DOMUtils.query('#pageContainer');
            
            if (!this.editorElement) {
                throw new Error('Editor element not found');
            }
            
            // Initialize command manager
            this.commandManager = new CommandManager(this.editorElement);
            
            // Initialize AI assistant
            this.aiAssistant = new AIAssistant(this, this.aiService);
            
            // Initialize templates UI
            this.templatesUI = new TemplatesUI(this, this.templatesService);
            
            // Initialize advanced formatting
            this.advancedFormattingService = new AdvancedFormattingService(this.editorElement);
            this.advancedFormattingUI = new AdvancedFormattingUI(this, this.advancedFormattingService);
            
            // Initialize email sharing
            this.emailSharingService = new EmailSharingService(this);
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load theme
            this.loadTheme();
            
            // Setup auto-save
            if (this.config.autoSave) {
                this.startAutoSave();
            }
            
            // Create initial document if none exists
            if (this.documentManager.getAllDocuments().length === 0) {
                const documentId = this.documentManager.createDocument();
                this.loadDocument(documentId);
            }
            
            this.isInitialized = true;
            this.emit('initialized', { editor: this });
            
        } catch (error) {
            console.error('Failed to initialize editor:', error);
            this.emit('initializationError', { error });
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Editor input events
        DOMUtils.addEventListener(this.editorElement, 'input', 
            DOMUtils.debounce(() => this.handleEditorInput(), 300)
        );
        
        DOMUtils.addEventListener(this.editorElement, 'keyup', () => {
            this.updateWordCount();
        });
        
        // Document manager events
        this.documentManager.on('documentCreated', ({ documentId }) => {
            this.emit('documentCreated', { documentId });
        });
        
        this.documentManager.on('currentDocumentChanged', ({ documentId, document }) => {
            this.loadDocument(documentId);
        });
        
        this.documentManager.on('documentUpdated', ({ documentId, content }) => {
            if (documentId === this.documentManager.currentDocumentId) {
                this.editorElement.innerHTML = content;
            }
        });
        
        // Command manager events
        this.commandManager.on('commandExecuted', ({ command, value }) => {
            this.handleCommandExecuted(command, value);
        });
        
        // Keyboard shortcuts
        DOMUtils.addEventListener(document, 'keydown', (e) => {
            this.handleKeyboardShortcut(e);
        });
        
        // Theme toggle
        const themeToggle = DOMUtils.query('#themeToggle');
        if (themeToggle) {
            DOMUtils.addEventListener(themeToggle, 'click', () => {
                this.toggleTheme();
            });
        }
        
        // AI Assistant toggle
        const aiAssistantBtn = DOMUtils.query('#aiAssistantBtn');
        if (aiAssistantBtn) {
            DOMUtils.addEventListener(aiAssistantBtn, 'click', () => {
                this.aiAssistant.toggle();
            });
        }
        
        // Templates button
        const templatesBtn = DOMUtils.query('#templatesBtn');
        if (templatesBtn) {
            DOMUtils.addEventListener(templatesBtn, 'click', () => {
                this.templatesUI.toggle();
            });
        }
        
        // Advanced formatting button
        const advancedFormattingBtn = DOMUtils.query('#advancedFormattingBtn');
        if (advancedFormattingBtn) {
            DOMUtils.addEventListener(advancedFormattingBtn, 'click', () => {
                this.advancedFormattingUI.toggle();
            });
        }
        
        // Email sharing button
        const emailShareBtn = DOMUtils.query('#emailShareBtn');
        if (emailShareBtn) {
            DOMUtils.addEventListener(emailShareBtn, 'click', () => {
                this.emailSharingService.shareViaEmail();
            });
        }
        
        // Welcome screen
        const startBtn = DOMUtils.query('#startEditorBtn');
        if (startBtn) {
            DOMUtils.addEventListener(startBtn, 'click', () => {
                this.startEditor();
            });
        }
        
        // Auto-dismiss welcome screen
        setTimeout(() => {
            const welcomeScreen = DOMUtils.query('#welcomeScreen');
            if (welcomeScreen && welcomeScreen.classList.contains('active')) {
                this.startEditor();
            }
        }, 2000);
    }

    /**
     * Handle editor input
     */
    handleEditorInput() {
        const currentDocument = this.documentManager.getCurrentDocument();
        if (!currentDocument) return;
        
        const content = this.editorElement.innerHTML;
        this.documentManager.updateDocumentContent(currentDocument.id, content);
    }

    /**
     * Handle command execution
     * @param {string} command - Command name
     * @param {string} value - Command value
     */
    handleCommandExecuted(command, value) {
        // Save state after command
        const currentDocument = this.documentManager.getCurrentDocument();
        if (currentDocument) {
            this.documentManager.addToHistory(currentDocument.id, this.editorElement.innerHTML);
        }
        
        this.emit('commandExecuted', { command, value });
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcut(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    this.saveCurrentDocument();
                    break;
                case 'z':
                    e.preventDefault();
                    this.undo();
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    break;
                case 'n':
                    e.preventDefault();
                    this.createNewDocument();
                    break;
                case 'o':
                    e.preventDefault();
                    this.openDocument();
                    break;
                case 'p':
                    e.preventDefault();
                    this.printDocument();
                    break;
            }
        } else if (e.key === 'F2') {
            e.preventDefault();
            this.renameCurrentDocument();
        }
    }

    /**
     * Execute a command
     * @param {string} command - Command name
     * @param {string} value - Command value
     * @returns {boolean} Success status
     */
    executeCommand(command, value = null) {
        if (!this.commandManager) {
            return false;
        }
        
        return this.commandManager.executeCommand(command, value);
    }

    /**
     * Load document into editor
     * @param {string} documentId - Document ID
     * @returns {boolean} Success status
     */
    loadDocument(documentId) {
        const document = this.documentManager.getDocument(documentId);
        if (!document) {
            return false;
        }
        
        // Set as current document
        this.documentManager.setCurrentDocument(documentId);
        
        // Load content into editor
        this.editorElement.innerHTML = document.content;
        
        // Update UI
        this.updateWordCount();
        this.updateStatusBar();
        
        this.emit('documentLoaded', { documentId, document });
        
        return true;
    }

    /**
     * Create new document
     * @returns {string} New document ID
     */
    createNewDocument() {
        const documentId = this.documentManager.createDocument();
        this.loadDocument(documentId);
        return documentId;
    }

    /**
     * Save current document
     * @returns {boolean} Success status
     */
    saveCurrentDocument() {
        const currentDocument = this.documentManager.getCurrentDocument();
        if (!currentDocument) {
            return false;
        }
        
        const content = this.editorElement.innerHTML;
        this.documentManager.updateDocumentContent(currentDocument.id, content);
        
        this.emit('documentSaved', { documentId: currentDocument.id });
        
        return true;
    }

    /**
     * Rename current document
     * @param {string} newName - New document name
     * @returns {boolean} Success status
     */
    renameCurrentDocument(newName) {
        const currentDocument = this.documentManager.getCurrentDocument();
        if (!currentDocument) {
            return false;
        }
        
        return this.documentManager.renameDocument(currentDocument.id, newName);
    }

    /**
     * Undo last action
     * @returns {boolean} Success status
     */
    undo() {
        const currentDocument = this.documentManager.getCurrentDocument();
        if (!currentDocument) {
            return false;
        }
        
        const success = this.documentManager.undoDocument(currentDocument.id);
        if (success) {
            this.loadDocument(currentDocument.id);
        }
        
        return success;
    }

    /**
     * Redo last undone action
     * @returns {boolean} Success status
     */
    redo() {
        const currentDocument = this.documentManager.getCurrentDocument();
        if (!currentDocument) {
            return false;
        }
        
        const success = this.documentManager.redoDocument(currentDocument.id);
        if (success) {
            this.loadDocument(currentDocument.id);
        }
        
        return success;
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
    }

    /**
     * Apply theme
     */
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        const themeIcon = DOMUtils.query('#themeIcon');
        if (themeIcon) {
            themeIcon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        // Update editor page background
        if (this.pageElement) {
            if (this.currentTheme === 'dark') {
                this.pageElement.style.background = '#1e293b';
                this.pageElement.style.color = '#f8fafc';
            } else {
                this.pageElement.style.background = 'white';
                this.pageElement.style.color = 'black';
            }
        }
        
        this.emit('themeChanged', { theme: this.currentTheme });
    }

    /**
     * Load theme from storage
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('editor_theme') || this.config.theme;
        this.currentTheme = savedTheme;
        this.applyTheme();
    }

    /**
     * Save theme to storage
     */
    saveTheme() {
        localStorage.setItem('editor_theme', this.currentTheme);
    }

    /**
     * Set zoom level
     * @param {number} level - Zoom level (50-200)
     */
    setZoom(level) {
        this.zoomLevel = Math.max(50, Math.min(200, level));
        
        if (this.pageElement) {
            this.pageElement.style.transform = `scale(${this.zoomLevel / 100})`;
        }
        
        const zoomPercent = DOMUtils.query('#zoomPercent');
        if (zoomPercent) {
            zoomPercent.textContent = `${this.zoomLevel}%`;
        }
        
        this.emit('zoomChanged', { level: this.zoomLevel });
    }

    /**
     * Zoom in
     */
    zoomIn() {
        this.setZoom(this.zoomLevel + 10);
    }

    /**
     * Zoom out
     */
    zoomOut() {
        this.setZoom(this.zoomLevel - 10);
    }

    /**
     * Update word count
     */
    updateWordCount() {
        const currentDocument = this.documentManager.getCurrentDocument();
        if (!currentDocument) return;
        
        this.documentManager.updateDocumentMetadata(currentDocument.id);
        
        const wordCount = DOMUtils.query('#wordCount');
        const charCount = DOMUtils.query('#charCount');
        const readingTime = DOMUtils.query('#readingTime');
        
        if (wordCount) wordCount.textContent = currentDocument.metadata.wordCount;
        if (charCount) charCount.textContent = currentDocument.metadata.characterCount;
        if (readingTime) readingTime.textContent = `${currentDocument.metadata.readingTime} min`;
    }

    /**
     * Update status bar
     */
    updateStatusBar() {
        const currentDocument = this.documentManager.getCurrentDocument();
        if (!currentDocument) return;
        
        const currentFont = DOMUtils.query('#currentFont');
        if (currentFont) {
            const fontFamily = DOMUtils.query('#fontFamily')?.value || 'Arial';
            const fontSize = DOMUtils.query('#fontSize')?.value || '16pt';
            currentFont.textContent = `${fontFamily}, ${fontSize}`;
        }
    }

    /**
     * Start auto-save
     */
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            this.saveCurrentDocument();
        }, this.config.autoSaveInterval);
    }

    /**
     * Stop auto-save
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    /**
     * Start editor (hide welcome screen)
     */
    startEditor() {
        const welcomeScreen = DOMUtils.query('#welcomeScreen');
        const editorContainer = DOMUtils.query('#editorContainer');
        
        if (welcomeScreen) {
            welcomeScreen.classList.remove('active');
        }
        
        if (editorContainer) {
            editorContainer.style.display = 'flex';
        }
        
        if (this.editorElement) {
            this.editorElement.focus();
        }
        
        this.emit('editorStarted');
    }

    /**
     * Print document
     */
    printDocument() {
        window.print();
        this.emit('documentPrinted');
    }

    /**
     * Get editor state
     * @returns {Object} Editor state
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            currentTheme: this.currentTheme,
            zoomLevel: this.zoomLevel,
            currentDocumentId: this.documentManager.currentDocumentId,
            documentCount: this.documentManager.documents.size,
            config: { ...this.config }
        };
    }

    /**
     * Destroy editor and cleanup
     */
    destroy() {
        // Stop auto-save
        this.stopAutoSave();
        
        // Save current document
        this.saveCurrentDocument();
        
        // Remove event listeners
        this.removeAllListeners();
        
        // Cleanup components
        if (this.commandManager) {
            this.commandManager.removeAllListeners();
        }
        
        if (this.documentManager) {
            this.documentManager.removeAllListeners();
        }
        
        this.isInitialized = false;
        this.emit('destroyed');
    }
}