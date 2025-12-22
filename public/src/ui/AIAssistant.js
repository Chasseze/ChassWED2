/**
 * AI Assistant UI Component
 */
import { EventEmitter } from '../utils/EventEmitter.js';
import { DOMUtils } from '../utils/DOMUtils.js';

export class AIAssistant extends EventEmitter {
    constructor(editor, aiService) {
        super();
        
        this.editor = editor;
        this.aiService = aiService;
        
        // DOM elements
        this.assistantPanel = null;
        this.grammarIndicator = null;
        this.autoCompletePopup = null;
        this.summarizeBtn = null;
        
        // State
        this.isVisible = false;
        this.currentSuggestions = [];
        this.grammarResults = null;
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize AI assistant
     */
    initialize() {
        this.createUI();
        this.setupEventListeners();
        this.setupAIEventListeners();
    }
    
    /**
     * Create UI elements
     */
    createUI() {
        // Create AI assistant panel
        this.assistantPanel = DOMUtils.createElement('div', {
            id: 'aiAssistant',
            className: 'ai-assistant-panel'
        });
        
        this.assistantPanel.innerHTML = `
            <div class="ai-assistant-header">
                <h3><i class="fas fa-robot"></i> AI Assistant</h3>
                <button class="ai-close-btn" id="aiCloseBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="ai-assistant-content">
                <div class="ai-section">
                    <h4>Grammar & Style</h4>
                    <div class="grammar-status" id="grammarStatus">
                        <span class="status-indicator" id="grammarIndicator"></span>
                        <span class="status-text" id="grammarStatusText">Ready</span>
                    </div>
                    <div class="grammar-suggestions" id="grammarSuggestions"></div>
                </div>
                
                <div class="ai-section">
                    <h4>Content Summary</h4>
                    <button class="ai-btn" id="summarizeBtn">
                        <i class="fas fa-compress-alt"></i> Summarize
                    </button>
                    <div class="summary-result" id="summaryResult"></div>
                </div>
                
                <div class="ai-section">
                    <h4>AI Settings</h4>
                    <div class="ai-settings">
                        <div class="setting-group">
                            <label for="aiApiKey">API Key:</label>
                            <input type="password" id="aiApiKey" placeholder="Enter your API key">
                            <button class="ai-btn small" id="saveApiKeyBtn">Save</button>
                        </div>
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="autoGrammarCheck" checked>
                                Auto grammar check
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Create grammar indicator in toolbar
        this.grammarIndicator = DOMUtils.createElement('div', {
            id: 'grammarIndicator',
            className: 'grammar-indicator'
        });
        this.grammarIndicator.innerHTML = `
            <i class="fas fa-spell-check"></i>
            <span class="grammar-score">100</span>
        `;
        
        // Create auto-complete popup
        this.autoCompletePopup = DOMUtils.createElement('div', {
            id: 'autoCompletePopup',
            className: 'auto-complete-popup'
        });
        
        // Add to DOM
        document.body.appendChild(this.assistantPanel);
        document.body.appendChild(this.autoCompletePopup);
        
        // Add grammar indicator to toolbar
        const toolbar = DOMUtils.query('.toolbar');
        if (toolbar) {
            toolbar.appendChild(this.grammarIndicator);
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close button
        const closeBtn = DOMUtils.query('#aiCloseBtn');
        if (closeBtn) {
            DOMUtils.addEventListener(closeBtn, 'click', () => {
                this.hide();
            });
        }
        
        // Summarize button
        this.summarizeBtn = DOMUtils.query('#summarizeBtn');
        if (this.summarizeBtn) {
            DOMUtils.addEventListener(this.summarizeBtn, 'click', () => {
                this.summarizeContent();
            });
        }
        
        // Save API key button
        const saveApiKeyBtn = DOMUtils.query('#saveApiKeyBtn');
        if (saveApiKeyBtn) {
            DOMUtils.addEventListener(saveApiKeyBtn, 'click', () => {
                this.saveApiKey();
            });
        }
        
        // Auto grammar check checkbox
        const autoGrammarCheck = DOMUtils.query('#autoGrammarCheck');
        if (autoGrammarCheck) {
            DOMUtils.addEventListener(autoGrammarCheck, 'change', () => {
                this.toggleAutoGrammarCheck(autoGrammarCheck.checked);
            });
        }
        
        // Editor input events for auto-completion
        const editorElement = this.editor.editorElement;
        if (editorElement) {
            DOMUtils.addEventListener(editorElement, 'input', 
                DOMUtils.debounce((e) => this.handleEditorInput(e), 500)
            );
            
            DOMUtils.addEventListener(editorElement, 'keydown', (e) => {
                this.handleKeyDown(e);
            });
            
            DOMUtils.addEventListener(editorElement, 'click', () => {
                this.hideAutoComplete();
            });
        }
        
        // Auto-complete popup clicks
        DOMUtils.addEventListener(this.autoCompletePopup, 'click', (e) => {
            if (e.target.classList.contains('suggestion-item')) {
                this.applySuggestion(e.target.textContent);
            }
        });
        
        // Click outside to hide auto-complete
        DOMUtils.addEventListener(document, 'click', (e) => {
            if (!this.autoCompletePopup.contains(e.target)) {
                this.hideAutoComplete();
            }
        });
    }
    
    /**
     * Setup AI service event listeners
     */
    setupAIEventListeners() {
        this.aiService.on('grammarCheckCompleted', ({ result }) => {
            this.updateGrammarResults(result);
        });
        
        this.aiService.on('grammarCheckError', () => {
            this.updateGrammarStatus('Error', 'error');
        });
        
        this.aiService.on('autoCompleteCompleted', ({ suggestions }) => {
            this.showAutoComplete(suggestions);
        });
        
        this.aiService.on('summarizationCompleted', ({ summary }) => {
            this.displaySummary(summary);
        });
        
        this.aiService.on('enabled', () => {
            this.updateGrammarStatus('Enabled', 'success');
        });
        
        this.aiService.on('disabled', () => {
            this.updateGrammarStatus('Disabled', 'error');
        });
    }
    
    /**
     * Handle editor input
     * @param {Event} e - Input event
     */
    handleEditorInput(e) {
        if (!this.aiService.isEnabled) return;
        
        const editorElement = this.editor.editorElement;
        const text = editorElement.textContent || editorElement.innerText;
        const selection = window.getSelection();
        const cursorPosition = this.getCursorPosition(editorElement, selection);
        
        // Check grammar if enabled
        const autoGrammarCheck = DOMUtils.query('#autoGrammarCheck');
        if (autoGrammarCheck && autoGrammarCheck.checked) {
            this.checkGrammar(text);
        }
        
        // Get auto-completions
        this.getAutoCompletions(text, cursorPosition);
    }
    
    /**
     * Handle keyboard events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        if (!this.autoCompletePopup.classList.contains('visible')) return;
        
        const items = this.autoCompletePopup.querySelectorAll('.suggestion-item');
        if (items.length === 0) return;
        
        let selectedIndex = -1;
        items.forEach((item, index) => {
            if (item.classList.contains('selected')) {
                selectedIndex = index;
            }
        });
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                this.selectAutoCompleteItem(selectedIndex);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                this.selectAutoCompleteItem(selectedIndex);
                break;
                
            case 'Enter':
            case 'Tab':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    this.applySuggestion(items[selectedIndex].textContent);
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                this.hideAutoComplete();
                break;
        }
    }
    
    /**
     * Get cursor position in element
     * @param {Element} element - Editor element
     * @param {Selection} selection - Current selection
     * @returns {number} Cursor position
     */
    getCursorPosition(element, selection) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        return preCaretRange.toString().length;
    }
    
    /**
     * Check grammar
     * @param {string} text - Text to check
     */
    async checkGrammar(text) {
        this.updateGrammarStatus('Checking...', 'checking');
        
        try {
            const result = await this.aiService.checkGrammar(text);
            this.grammarResults = result;
            this.updateGrammarResults(result);
        } catch (error) {
            console.error('Grammar check failed:', error);
            this.updateGrammarStatus('Error', 'error');
        }
    }
    
    /**
     * Update grammar results
     * @param {Object} result - Grammar check results
     */
    updateGrammarResults(result) {
        // Update indicator
        const scoreElement = DOMUtils.query('.grammar-score', this.grammarIndicator);
        if (scoreElement) {
            scoreElement.textContent = result.score;
        }
        
        // Update status
        if (result.score >= 90) {
            this.updateGrammarStatus('Excellent', 'success');
        } else if (result.score >= 70) {
            this.updateGrammarStatus('Good', 'warning');
        } else {
            this.updateGrammarStatus('Needs Work', 'error');
        }
        
        // Update suggestions panel
        const suggestionsContainer = DOMUtils.query('#grammarSuggestions');
        if (suggestionsContainer) {
            if (result.suggestions.length === 0) {
                suggestionsContainer.innerHTML = '<p class="no-suggestions">No suggestions</p>';
            } else {
                suggestionsContainer.innerHTML = result.suggestions.map((suggestion, index) => `
                    <div class="grammar-suggestion" data-index="${index}">
                        <div class="suggestion-type ${suggestion.type}">
                            <i class="fas fa-${this.getSuggestionIcon(suggestion.type)}"></i>
                            ${suggestion.type}
                        </div>
                        <div class="suggestion-message">${suggestion.message}</div>
                        ${suggestion.replacement ? `
                            <button class="apply-suggestion-btn" data-replacement="${suggestion.replacement}">
                                Apply: "${suggestion.replacement}"
                            </button>
                        ` : ''}
                    </div>
                `).join('');
                
                // Add click handlers for suggestion buttons
                const buttons = suggestionsContainer.querySelectorAll('.apply-suggestion-btn');
                buttons.forEach(btn => {
                    DOMUtils.addEventListener(btn, 'click', (e) => {
                        const replacement = e.target.dataset.replacement;
                        this.applyGrammarSuggestion(replacement);
                    });
                });
            }
        }
    }
    
    /**
     * Get suggestion icon
     * @param {string} type - Suggestion type
     * @returns {string} Icon class
     */
    getSuggestionIcon(type) {
        const icons = {
            grammar: 'spell-check',
            spelling: 'font',
            style: 'pen-fancy'
        };
        return icons[type] || 'exclamation-triangle';
    }
    
    /**
     * Apply grammar suggestion
     * @param {string} replacement - Replacement text
     */
    applyGrammarSuggestion(replacement) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(replacement));
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        
        this.emit('suggestionApplied', { replacement });
    }
    
    /**
     * Update grammar status
     * @param {string} text - Status text
     * @param {string} type - Status type
     */
    updateGrammarStatus(text, type) {
        const statusText = DOMUtils.query('#grammarStatusText');
        const statusIndicator = DOMUtils.query('#grammarIndicator');
        
        if (statusText) statusText.textContent = text;
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${type}`;
        }
    }
    
    /**
     * Get auto-completions
     * @param {string} text - Current text
     * @param {number} cursorPosition - Cursor position
     */
    async getAutoCompletions(text, cursorPosition) {
        try {
            const suggestions = await this.aiService.getAutoCompletions(text, cursorPosition);
            this.currentSuggestions = suggestions;
            
            if (suggestions.length > 0) {
                this.showAutoComplete(suggestions);
            }
        } catch (error) {
            console.error('Auto-completion failed:', error);
        }
    }
    
    /**
     * Show auto-complete popup
     * @param {Array} suggestions - Suggestions array
     */
    showAutoComplete(suggestions) {
        if (suggestions.length === 0) {
            this.hideAutoComplete();
            return;
        }
        
        this.autoCompletePopup.innerHTML = suggestions.map((suggestion, index) => `
            <div class="suggestion-item ${index === 0 ? 'selected' : ''}" data-index="${index}">
                ${suggestion}
            </div>
        `).join('');
        
        // Position popup near cursor
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            this.autoCompletePopup.style.left = `${rect.left}px`;
            this.autoCompletePopup.style.top = `${rect.bottom + 5}px`;
        }
        
        this.autoCompletePopup.classList.add('visible');
    }
    
    /**
     * Hide auto-complete popup
     */
    hideAutoComplete() {
        this.autoCompletePopup.classList.remove('visible');
    }
    
    /**
     * Select auto-complete item
     * @param {number} index - Item index
     */
    selectAutoCompleteItem(index) {
        const items = this.autoCompletePopup.querySelectorAll('.suggestion-item');
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === index);
        });
    }
    
    /**
     * Apply suggestion
     * @param {string} suggestion - Suggestion to apply
     */
    applySuggestion(suggestion) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(suggestion));
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        
        this.hideAutoComplete();
        this.emit('suggestionApplied', { suggestion });
    }
    
    /**
     * Summarize content
     */
    async summarizeContent() {
        const editorElement = this.editor.editorElement;
        const text = editorElement.textContent || editorElement.innerText;
        
        if (!text.trim()) {
            this.displaySummary('No content to summarize');
            return;
        }
        
        if (this.summarizeBtn) {
            this.summarizeBtn.disabled = true;
            this.summarizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Summarizing...';
        }
        
        try {
            const summary = await this.aiService.summarizeContent(text);
            this.displaySummary(summary);
        } catch (error) {
            console.error('Summarization failed:', error);
            this.displaySummary('Failed to summarize content');
        } finally {
            if (this.summarizeBtn) {
                this.summarizeBtn.disabled = false;
                this.summarizeBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Summarize';
            }
        }
    }
    
    /**
     * Display summary
     * @param {string} summary - Summary text
     */
    displaySummary(summary) {
        const summaryResult = DOMUtils.query('#summaryResult');
        if (summaryResult) {
            summaryResult.innerHTML = `
                <div class="summary-content">
                    ${summary}
                </div>
                <div class="summary-actions">
                    <button class="ai-btn small" id="insertSummaryBtn">
                        <i class="fas fa-plus"></i> Insert
                    </button>
                    <button class="ai-btn small" id="copySummaryBtn">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            `;
            
            // Add action handlers
            const insertBtn = DOMUtils.query('#insertSummaryBtn');
            if (insertBtn) {
                DOMUtils.addEventListener(insertBtn, 'click', () => {
                    this.insertSummary(summary);
                });
            }
            
            const copyBtn = DOMUtils.query('#copySummaryBtn');
            if (copyBtn) {
                DOMUtils.addEventListener(copyBtn, 'click', () => {
                    this.copyToClipboard(summary);
                });
            }
        }
    }
    
    /**
     * Insert summary into document
     * @param {string} summary - Summary text
     */
    insertSummary(summary) {
        const editorElement = this.editor.editorElement;
        const selection = window.getSelection();
        
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const summaryNode = document.createElement('div');
            summaryNode.className = 'content-summary';
            summaryNode.textContent = summary;
            
            range.insertNode(summaryNode);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            // Append to end if no selection
            const summaryNode = document.createElement('div');
            summaryNode.className = 'content-summary';
            summaryNode.textContent = summary;
            editorElement.appendChild(summaryNode);
        }
        
        this.emit('summaryInserted', { summary });
    }
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.emit('copiedToClipboard', { text });
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    }
    
    /**
     * Save API key
     */
    saveApiKey() {
        const apiKeyInput = DOMUtils.query('#aiApiKey');
        if (apiKeyInput) {
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                this.aiService.configure({ apiKey });
                this.updateGrammarStatus('API Key Saved', 'success');
                apiKeyInput.value = '';
            }
        }
    }
    
    /**
     * Toggle auto grammar check
     * @param {boolean} enabled - Whether to enable
     */
    toggleAutoGrammarCheck(enabled) {
        localStorage.setItem('autoGrammarCheck', enabled.toString());
        this.emit('autoGrammarCheckToggled', { enabled });
    }
    
    /**
     * Show AI assistant panel
     */
    show() {
        this.assistantPanel.classList.add('visible');
        this.isVisible = true;
        this.emit('shown');
    }
    
    /**
     * Hide AI assistant panel
     */
    hide() {
        this.assistantPanel.classList.remove('visible');
        this.isVisible = false;
        this.emit('hidden');
    }
    
    /**
     * Toggle AI assistant panel
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    /**
     * Destroy AI assistant
     */
    destroy() {
        // Remove DOM elements
        if (this.assistantPanel) {
            this.assistantPanel.remove();
        }
        if (this.autoCompletePopup) {
            this.autoCompletePopup.remove();
        }
        if (this.grammarIndicator) {
            this.grammarIndicator.remove();
        }
        
        // Remove event listeners
        this.removeAllListeners();
        
        this.isVisible = false;
        this.emit('destroyed');
    }
}