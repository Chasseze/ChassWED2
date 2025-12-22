/**
 * AI Service - Provides AI-powered features for the editor
 */
import { EventEmitter } from '../utils/EventEmitter.js';

export class AIService extends EventEmitter {
    constructor() {
        super();
        
        // Configuration
        this.config = {
            apiKey: null,
            endpoint: 'https://api.openai.com/v1/chat/completions',
            model: 'gpt-3.5-turbo',
            maxTokens: 1000,
            temperature: 0.3,
            debounceDelay: 1000
        };
        
        // State
        this.isEnabled = false;
        this.isProcessing = false;
        this.debounceTimer = null;
        
        // Cache for suggestions
        this.suggestionCache = new Map();
        this.grammarCache = new Map();
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize AI service
     */
    async initialize() {
        // Load configuration from localStorage
        this.loadConfiguration();
        
        // Check if API key is available
        if (this.config.apiKey) {
            this.isEnabled = true;
            this.emit('enabled');
        } else {
            this.emit('disabled', { reason: 'No API key configured' });
        }
    }
    
    /**
     * Load configuration from storage
     */
    loadConfiguration() {
        const savedConfig = localStorage.getItem('ai_service_config');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                this.config = { ...this.config, ...config };
            } catch (error) {
                console.error('Failed to load AI configuration:', error);
            }
        }
    }
    
    /**
     * Save configuration to storage
     */
    saveConfiguration() {
        localStorage.setItem('ai_service_config', JSON.stringify(this.config));
    }
    
    /**
     * Configure AI service
     * @param {Object} config - Configuration options
     */
    configure(config) {
        this.config = { ...this.config, ...config };
        this.saveConfiguration();
        
        // Update enabled state
        const wasEnabled = this.isEnabled;
        this.isEnabled = !!this.config.apiKey;
        
        if (!wasEnabled && this.isEnabled) {
            this.emit('enabled');
        } else if (wasEnabled && !this.isEnabled) {
            this.emit('disabled', { reason: 'API key removed' });
        }
        
        this.emit('configured', { config: this.config });
    }
    
    /**
     * Check grammar and style
     * @param {string} text - Text to check
     * @returns {Promise<Object>} Grammar check results
     */
    async checkGrammar(text) {
        if (!this.isEnabled || !text.trim()) {
            return { suggestions: [], score: 100 };
        }
        
        // Check cache first
        const cacheKey = this.generateCacheKey(text);
        if (this.grammarCache.has(cacheKey)) {
            return this.grammarCache.get(cacheKey);
        }
        
        try {
            this.isProcessing = true;
            this.emit('grammarCheckStarted');
            
            const prompt = `Please analyze the following text for grammar, spelling, and style issues. Provide suggestions in JSON format:
            
            Text: "${text}"
            
            Return JSON with:
            {
                "score": 0-100,
                "suggestions": [
                    {
                        "type": "grammar|spelling|style",
                        "message": "Description of the issue",
                        "replacement": "Suggested replacement",
                        "position": {
                            "start": number,
                            "end": number
                        }
                    }
                ]
            }`;
            
            const response = await this.makeAPIRequest(prompt);
            const result = this.parseGrammarResponse(response);
            
            // Cache result
            this.grammarCache.set(cacheKey, result);
            
            this.emit('grammarCheckCompleted', { result });
            return result;
            
        } catch (error) {
            console.error('Grammar check failed:', error);
            this.emit('grammarCheckError', { error });
            return { suggestions: [], score: 100 };
        } finally {
            this.isProcessing = false;
        }
    }
    
    /**
     * Get auto-completion suggestions
     * @param {string} text - Current text
     * @param {number} cursorPosition - Cursor position
     * @returns {Promise<Array>} Suggestions array
     */
    async getAutoCompletions(text, cursorPosition) {
        if (!this.isEnabled || !text.trim()) {
            return [];
        }
        
        try {
            this.isProcessing = true;
            this.emit('autoCompleteStarted');
            
            // Get context around cursor
            const context = this.getContext(text, cursorPosition, 200);
            const lastWords = this.getLastWords(context, 3);
            
            // Check cache first
            const cacheKey = `auto_${lastWords.join('_')}`;
            if (this.suggestionCache.has(cacheKey)) {
                return this.suggestionCache.get(cacheKey);
            }
            
            const prompt = `Based on the following context, provide 5 auto-completion suggestions for the last word(s):
            
            Context: "...${context}..."
            
            Return JSON array of suggestions: ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"]`;
            
            const response = await this.makeAPIRequest(prompt);
            const suggestions = this.parseAutoCompleteResponse(response);
            
            // Cache suggestions
            this.suggestionCache.set(cacheKey, suggestions);
            
            this.emit('autoCompleteCompleted', { suggestions });
            return suggestions;
            
        } catch (error) {
            console.error('Auto-completion failed:', error);
            this.emit('autoCompleteError', { error });
            return [];
        } finally {
            this.isProcessing = false;
        }
    }
    
    /**
     * Summarize content
     * @param {string} text - Text to summarize
     * @param {number} maxLength - Maximum summary length
     * @returns {Promise<string>} Summary
     */
    async summarizeContent(text, maxLength = 150) {
        if (!this.isEnabled || !text.trim()) {
            return '';
        }
        
        try {
            this.isProcessing = true;
            this.emit('summarizationStarted');
            
            const prompt = `Please summarize the following text in ${maxLength} words or less:
            
            Text: "${text}"
            
            Provide a concise summary that captures the main points.`;
            
            const response = await this.makeAPIRequest(prompt);
            const summary = this.parseSummarizationResponse(response);
            
            this.emit('summarizationCompleted', { summary });
            return summary;
            
        } catch (error) {
            console.error('Summarization failed:', error);
            this.emit('summarizationError', { error });
            return '';
        } finally {
            this.isProcessing = false;
        }
    }
    
    /**
     * Make API request to AI service
     * @param {string} prompt - Prompt to send
     * @returns {Promise<string>} API response
     */
    async makeAPIRequest(prompt) {
        const response = await fetch(this.config.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    /**
     * Parse grammar check response
     * @param {string} response - API response
     * @returns {Object} Parsed result
     */
    parseGrammarResponse(response) {
        try {
            const parsed = JSON.parse(response);
            return {
                score: parsed.score || 100,
                suggestions: parsed.suggestions || []
            };
        } catch (error) {
            console.error('Failed to parse grammar response:', error);
            return { suggestions: [], score: 100 };
        }
    }
    
    /**
     * Parse auto-completion response
     * @param {string} response - API response
     * @returns {Array} Suggestions array
     */
    parseAutoCompleteResponse(response) {
        try {
            const parsed = JSON.parse(response);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Failed to parse auto-completion response:', error);
            return [];
        }
    }
    
    /**
     * Parse summarization response
     * @param {string} response - API response
     * @returns {string} Summary
     */
    parseSummarizationResponse(response) {
        return response.trim().replace(/^["']|["']$/g, '');
    }
    
    /**
     * Get context around cursor
     * @param {string} text - Full text
     * @param {number} cursorPosition - Cursor position
     * @param {number} windowSize - Context window size
     * @returns {string} Context
     */
    getContext(text, cursorPosition, windowSize) {
        const start = Math.max(0, cursorPosition - windowSize);
        const end = Math.min(text.length, cursorPosition + windowSize);
        return text.substring(start, end);
    }
    
    /**
     * Get last words from text
     * @param {string} text - Text to analyze
     * @param {number} count - Number of words to get
     * @returns {Array} Last words
     */
    getLastWords(text, count) {
        const words = text.trim().split(/\s+/);
        return words.slice(-count);
    }
    
    /**
     * Generate cache key
     * @param {string} text - Text to cache
     * @returns {string} Cache key
     */
    generateCacheKey(text) {
        // Simple hash function for cache key
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }
    
    /**
     * Clear caches
     */
    clearCaches() {
        this.suggestionCache.clear();
        this.grammarCache.clear();
        this.emit('cachesCleared');
    }
    
    /**
     * Get service status
     * @returns {Object} Service status
     */
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            isProcessing: this.isProcessing,
            hasApiKey: !!this.config.apiKey,
            cacheSize: {
                suggestions: this.suggestionCache.size,
                grammar: this.grammarCache.size
            }
        };
    }
    
    /**
     * Destroy service and cleanup
     */
    destroy() {
        // Clear timers
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // Clear caches
        this.clearCaches();
        
        // Remove listeners
        this.removeAllListeners();
        
        this.isEnabled = false;
        this.emit('destroyed');
    }
}