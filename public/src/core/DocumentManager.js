/**
 * DocumentManager - Manages document lifecycle and state
 */
import { EventEmitter } from '../utils/EventEmitter.js';
import { DOMUtils } from '../utils/DOMUtils.js';

export class DocumentManager extends EventEmitter {
    constructor() {
        super();
        this.documents = new Map();
        this.currentDocumentId = null;
        this.maxDocuments = 50;
        this.documentCounter = 0;
        
        // Load documents from localStorage
        this.loadFromStorage();
    }

    /**
     * Create a new document
     * @param {Object} options - Document options
     * @returns {string} Document ID
     */
    createDocument(options = {}) {
        const documentId = this.generateDocumentId();
        const documentName = options.name || this.generateDocumentName();
        
        const document = {
            id: documentId,
            name: documentName,
            content: options.content || '<p>Start typing here...</p>',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            history: [],
            historyIndex: -1,
            metadata: {
                wordCount: 0,
                characterCount: 0,
                readingTime: 0
            },
            settings: {
                autoSave: true,
                spellCheck: false
            }
        };
        
        this.documents.set(documentId, document);
        this.saveToStorage(documentId);
        
        this.emit('documentCreated', { documentId, document });
        
        return documentId;
    }

    /**
     * Get document by ID
     * @param {string} documentId - Document ID
     * @returns {Object|null} Document object
     */
    getDocument(documentId) {
        return this.documents.get(documentId) || null;
    }

    /**
     * Get current document
     * @returns {Object|null} Current document
     */
    getCurrentDocument() {
        return this.currentDocumentId ? 
            this.documents.get(this.currentDocumentId) : null;
    }

    /**
     * Set current document
     * @param {string} documentId - Document ID
     * @returns {boolean} Success status
     */
    setCurrentDocument(documentId) {
        const document = this.documents.get(documentId);
        if (!document) {
            return false;
        }
        
        // Save previous document
        if (this.currentDocumentId) {
            this.saveDocument(this.currentDocumentId);
        }
        
        this.currentDocumentId = documentId;
        document.lastModified = new Date().toISOString();
        
        this.emit('currentDocumentChanged', { documentId, document });
        
        return true;
    }

    /**
     * Update document content
     * @param {string} documentId - Document ID
     * @param {string} content - Document content
     * @returns {boolean} Success status
     */
    updateDocumentContent(documentId, content) {
        const document = this.documents.get(documentId);
        if (!document) {
            return false;
        }
        
        // Add to history
        this.addToHistory(documentId, document.content);
        
        // Update content
        document.content = content;
        document.lastModified = new Date().toISOString();
        
        // Update metadata
        this.updateDocumentMetadata(documentId);
        
        // Save to storage
        this.saveToStorage(documentId);
        
        this.emit('documentUpdated', { documentId, content, document });
        
        return true;
    }

    /**
     * Rename document
     * @param {string} documentId - Document ID
     * @param {string} newName - New document name
     * @returns {boolean} Success status
     */
    renameDocument(documentId, newName) {
        const document = this.documents.get(documentId);
        if (!document) {
            return false;
        }
        
        const oldName = document.name;
        document.name = newName;
        document.lastModified = new Date().toISOString();
        
        this.saveToStorage(documentId);
        
        this.emit('documentRenamed', { documentId, oldName, newName, document });
        
        return true;
    }

    /**
     * Delete document
     * @param {string} documentId - Document ID
     * @returns {boolean} Success status
     */
    deleteDocument(documentId) {
        const document = this.documents.get(documentId);
        if (!document) {
            return false;
        }
        
        this.documents.delete(documentId);
        this.removeFromStorage(documentId);
        
        // Handle current document deletion
        if (this.currentDocumentId === documentId) {
            this.currentDocumentId = null;
            this.emit('currentDocumentDeleted', { documentId });
        }
        
        this.emit('documentDeleted', { documentId, document });
        
        return true;
    }

    /**
     * Duplicate document
     * @param {string} documentId - Source document ID
     * @returns {string|null} New document ID
     */
    duplicateDocument(documentId) {
        const sourceDocument = this.documents.get(documentId);
        if (!sourceDocument) {
            return null;
        }
        
        const newDocumentId = this.createDocument({
            name: `${sourceDocument.name} (Copy)`,
            content: sourceDocument.content
        });
        
        // Copy history
        const newDocument = this.documents.get(newDocumentId);
        newDocument.history = [...sourceDocument.history];
        newDocument.historyIndex = sourceDocument.historyIndex;
        
        this.saveToStorage(newDocumentId);
        
        this.emit('documentDuplicated', { 
            sourceDocumentId: documentId, 
            newDocumentId, 
            newDocument 
        });
        
        return newDocumentId;
    }

    /**
     * Get all documents
     * @returns {Array} Array of documents
     */
    getAllDocuments() {
        return Array.from(this.documents.values());
    }

    /**
     * Get document list for UI
     * @returns {Array} Array of document info
     */
    getDocumentList() {
        return this.getAllDocuments().map(doc => ({
            id: doc.id,
            name: doc.name,
            lastModified: doc.lastModified,
            wordCount: doc.metadata.wordCount,
            preview: this.getDocumentPreview(doc.content)
        }));
    }

    /**
     * Search documents
     * @param {string} query - Search query
     * @returns {Array} Matching documents
     */
    searchDocuments(query) {
        const searchTerm = query.toLowerCase();
        
        return this.getAllDocuments().filter(doc => {
            const nameMatch = doc.name.toLowerCase().includes(searchTerm);
            const contentMatch = doc.content.toLowerCase().includes(searchTerm);
            return nameMatch || contentMatch;
        });
    }

    /**
     * Add document to history
     * @param {string} documentId - Document ID
     * @param {string} content - Content to save
     */
    addToHistory(documentId, content) {
        const document = this.documents.get(documentId);
        if (!document) {
            return;
        }
        
        // Remove states after current index
        document.history = document.history.slice(0, document.historyIndex + 1);
        
        // Add new state
        document.history.push(content);
        document.historyIndex++;
        
        // Limit history size
        const maxHistorySize = 50;
        if (document.history.length > maxHistorySize) {
            document.history.shift();
            document.historyIndex--;
        }
    }

    /**
     * Undo document change
     * @param {string} documentId - Document ID
     * @returns {boolean} Success status
     */
    undoDocument(documentId) {
        const document = this.documents.get(documentId);
        if (!document || document.historyIndex <= 0) {
            return false;
        }
        
        document.historyIndex--;
        document.content = document.history[document.historyIndex];
        document.lastModified = new Date().toISOString();
        
        this.updateDocumentMetadata(documentId);
        this.saveToStorage(documentId);
        
        this.emit('documentUndone', { documentId, document });
        
        return true;
    }

    /**
     * Redo document change
     * @param {string} documentId - Document ID
     * @returns {boolean} Success status
     */
    redoDocument(documentId) {
        const document = this.documents.get(documentId);
        if (!document || document.historyIndex >= document.history.length - 1) {
            return false;
        }
        
        document.historyIndex++;
        document.content = document.history[document.historyIndex];
        document.lastModified = new Date().toISOString();
        
        this.updateDocumentMetadata(documentId);
        this.saveToStorage(documentId);
        
        this.emit('documentRedone', { documentId, document });
        
        return true;
    }

    /**
     * Update document metadata
     * @param {string} documentId - Document ID
     */
    updateDocumentMetadata(documentId) {
        const document = this.documents.get(documentId);
        if (!document) {
            return;
        }
        
        const textContent = this.extractTextContent(document.content);
        const words = this.countWords(textContent);
        const characters = textContent.length;
        const readingTime = Math.max(1, Math.ceil(words / 200));
        
        document.metadata = {
            wordCount: words,
            characterCount: characters,
            readingTime: readingTime
        };
    }

    /**
     * Extract plain text content from HTML
     * @param {string} html - HTML content
     * @returns {string} Plain text
     */
    extractTextContent(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }

    /**
     * Count words in text
     * @param {string} text - Text content
     * @returns {number} Word count
     */
    countWords(text) {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    }

    /**
     * Get document preview
     * @param {string} content - Document content
     * @param {number} maxLength - Maximum preview length
     * @returns {string} Document preview
     */
    getDocumentPreview(content, maxLength = 100) {
        const textContent = this.extractTextContent(content);
        return textContent.length > maxLength ? 
            textContent.substring(0, maxLength) + '...' : 
            textContent;
    }

    /**
     * Generate unique document ID
     * @returns {string} Document ID
     */
    generateDocumentId() {
        return `doc_${Date.now()}_${++this.documentCounter}`;
    }

    /**
     * Generate document name
     * @returns {string} Document name
     */
    generateDocumentName() {
        const existingNames = this.getAllDocuments()
            .map(doc => doc.name)
            .filter(name => name.startsWith('Document'));
        
        let counter = 1;
        let name = 'Document';
        
        while (existingNames.includes(name)) {
            counter++;
            name = `Document ${counter}`;
        }
        
        return name;
    }

    /**
     * Save document to localStorage
     * @param {string} documentId - Document ID
     */
    saveToStorage(documentId) {
        const document = this.documents.get(documentId);
        if (!document) {
            return;
        }
        
        try {
            localStorage.setItem(`charles_editor_doc_${documentId}`, document.content);
            localStorage.setItem(`charles_editor_doc_${documentId}_name`, document.name);
            localStorage.setItem(`charles_editor_doc_${documentId}_meta`, JSON.stringify(document.metadata));
            localStorage.setItem(`charles_editor_doc_${documentId}_history`, JSON.stringify(document.history));
            localStorage.setItem(`charles_editor_doc_${documentId}_history_index`, document.historyIndex.toString());
        } catch (error) {
            console.error(`Failed to save document ${documentId} to storage:`, error);
            this.emit('storageError', { documentId, error });
        }
    }

    /**
     * Load documents from localStorage
     */
    loadFromStorage() {
        try {
            // Load all document keys
            const keys = Object.keys(localStorage).filter(key => 
                key.startsWith('charles_editor_doc_') && key.endsWith('_name')
            );
            
            keys.forEach(key => {
                const documentId = key.replace('_name', '');
                const content = localStorage.getItem(documentId) || '<p>Empty document</p>';
                const name = localStorage.getItem(key) || 'Untitled Document';
                const metadataStr = localStorage.getItem(`${documentId}_meta`);
                const historyStr = localStorage.getItem(`${documentId}_history`);
                const historyIndexStr = localStorage.getItem(`${documentId}_history_index`);
                
                const metadata = metadataStr ? JSON.parse(metadataStr) : {
                    wordCount: 0,
                    characterCount: 0,
                    readingTime: 0
                };
                
                const history = historyStr ? JSON.parse(historyStr) : [];
                const historyIndex = historyIndexStr ? parseInt(historyIndexStr) : -1;
                
                const document = {
                    id: documentId,
                    name: name,
                    content: content,
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    history: history,
                    historyIndex: historyIndex,
                    metadata: metadata,
                    settings: {
                        autoSave: true,
                        spellCheck: false
                    }
                };
                
                this.documents.set(documentId, document);
            });
            
            this.emit('documentsLoaded', { count: this.documents.size });
            
        } catch (error) {
            console.error('Failed to load documents from storage:', error);
            this.emit('storageError', { error });
        }
    }

    /**
     * Remove document from localStorage
     * @param {string} documentId - Document ID
     */
    removeFromStorage(documentId) {
        try {
            localStorage.removeItem(`charles_editor_doc_${documentId}`);
            localStorage.removeItem(`charles_editor_doc_${documentId}_name`);
            localStorage.removeItem(`charles_editor_doc_${documentId}_meta`);
            localStorage.removeItem(`charles_editor_doc_${documentId}_history`);
            localStorage.removeItem(`charles_editor_doc_${documentId}_history_index`);
        } catch (error) {
            console.error(`Failed to remove document ${documentId} from storage:`, error);
        }
    }

    /**
     * Clear all documents
     */
    clearAllDocuments() {
        this.documents.forEach((doc, id) => {
            this.removeFromStorage(id);
        });
        
        this.documents.clear();
        this.currentDocumentId = null;
        
        this.emit('allDocumentsCleared');
    }

    /**
     * Get storage usage info
     * @returns {Object} Storage usage information
     */
    getStorageInfo() {
        const keys = Object.keys(localStorage).filter(key => 
            key.startsWith('charles_editor_doc_')
        );
        
        let totalSize = 0;
        keys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                totalSize += value.length;
            }
        });
        
        return {
            documentCount: this.documents.size,
            storageKeys: keys.length,
            estimatedSize: totalSize,
            maxStorage: 5 * 1024 * 1024, // 5MB estimated localStorage limit
            usagePercentage: Math.round((totalSize / (5 * 1024 * 1024)) * 100)
        };
    }
}