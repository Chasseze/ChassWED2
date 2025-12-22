/**
 * CommandManager - Modern replacement for document.execCommand
 * Uses Selection API for better control and future compatibility
 */
import { EventEmitter } from '../utils/EventEmitter.js';
import { DOMUtils } from '../utils/DOMUtils.js';

export class CommandManager extends EventEmitter {
    constructor(editorElement) {
        super();
        this.editor = editorElement;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 100;
    }

    /**
     * Execute a formatting command
     * @param {string} command - Command name
     * @param {string} value - Command value
     * @returns {boolean} Success status
     */
    executeCommand(command, value = null) {
        try {
            const selection = window.getSelection();
            if (!selection.rangeCount) {
                return false;
            }

            const range = selection.getRangeAt(0);
            const wasCollapsed = range.collapsed;

            // Save state before command
            this.saveState();

            // Execute command based on type
            const result = this.executeModernCommand(command, value, range, selection);

            // Focus editor
            this.editor.focus();

            // Emit command event
            this.emit('commandExecuted', { command, value, result });

            return result;
        } catch (error) {
            console.error(`Error executing command "${command}":`, error);
            this.emit('commandError', { command, error });
            return false;
        }
    }

    /**
     * Execute modern command using Selection API
     * @param {string} command - Command name
     * @param {string} value - Command value
     * @param {Range} range - Selection range
     * @param {Selection} selection - Window selection
     * @returns {boolean} Success status
     */
    executeModernCommand(command, value, range, selection) {
        switch (command) {
            case 'bold':
                return this.toggleFormatting('bold', range);
            case 'italic':
                return this.toggleFormatting('italic', range);
            case 'underline':
                return this.toggleFormatting('underline', range);
            case 'strikeThrough':
                return this.toggleFormatting('strikeThrough', range);
            case 'subscript':
                return this.toggleFormatting('subscript', range);
            case 'superscript':
                return this.toggleFormatting('superscript', range);
            case 'fontName':
                return this.applyFontFamily(value, range);
            case 'fontSize':
                return this.applyFontSize(value, range);
            case 'foreColor':
                return this.applyTextColor(value, range);
            case 'backColor':
                return this.applyBackgroundColor(value, range);
            case 'justifyLeft':
            case 'justifyCenter':
            case 'justifyRight':
            case 'justifyFull':
                return this.applyAlignment(command, range);
            case 'insertOrderedList':
                return this.toggleList('ordered', range);
            case 'insertUnorderedList':
                return this.toggleList('unordered', range);
            case 'indent':
                return this.indent(range);
            case 'outdent':
                return this.outdent(range);
            case 'formatBlock':
                return this.applyFormatBlock(value, range);
            case 'removeFormat':
                return this.removeFormatting(range);
            case 'insertHTML':
                return this.insertHTML(value, range);
            case 'insertText':
                return this.insertText(value, range);
            default:
                // Fallback to execCommand for unsupported commands
                return document.execCommand(command, false, value);
        }
    }

    /**
     * Toggle text formatting
     * @param {string} format - Format type
     * @param {Range} range - Selection range
     * @returns {boolean} Success status
     */
    toggleFormatting(format, range) {
        const isFormatted = this.isFormatted(format, range);
        
        if (isFormatted) {
            this.removeFormatting(format, range);
        } else {
            this.applyFormatting(format, range);
        }
        
        return true;
    }

    /**
     * Apply text formatting
     * @param {string} format - Format type
     * @param {Range} range - Selection range
     */
    applyFormatting(format, range) {
        const tagName = this.getTagNameForFormat(format);
        const element = document.createElement(tagName);
        
        try {
            range.surroundContents(element);
        } catch (error) {
            // Handle case where range crosses element boundaries
            this.applyFormattingToSelection(format, range);
        }
    }

    /**
     * Remove text formatting
     * @param {string} format - Format type
     * @param {Range} range - Selection range
     */
    removeFormatting(format, range) {
        const tagName = this.getTagNameForFormat(format);
        const elements = range.commonAncestorContainer.getElementsByTagName(tagName);
        
        Array.from(elements).forEach(element => {
            if (range.intersectsNode(element)) {
                this.unwrapElement(element);
            }
        });
    }

    /**
     * Apply font family
     * @param {string} fontFamily - Font family
     * @param {Range} range - Selection range
     * @returns {boolean} Success status
     */
    applyFontFamily(fontFamily, range) {
        this.applyStyleToSelection('fontFamily', fontFamily, range);
        return true;
    }

    /**
     * Apply font size
     * @param {string} fontSize - Font size
     * @param {Range} range - Selection range
     * @returns {boolean} Success status
     */
    applyFontSize(fontSize, range) {
        this.applyStyleToSelection('fontSize', fontSize, range);
        return true;
    }

    /**
     * Apply text color
     * @param {string} color - Text color
     * @param {Range} range - Selection range
     * @returns {boolean} Success status
     */
    applyTextColor(color, range) {
        this.applyStyleToSelection('color', color, range);
        return true;
    }

    /**
     * Apply background color
     * @param {string} color - Background color
     * @param {Range} range - Selection range
     * @returns {boolean} Success status
     */
    applyBackgroundColor(color, range) {
        this.applyStyleToSelection('backgroundColor', color, range);
        return true;
    }

    /**
     * Apply text alignment
     * @param {string} alignment - Alignment type
     * @param {Range} range - Selection range
     * @returns {boolean} Success status
     */
    applyAlignment(alignment, range) {
        let cssAlignment = 'left';
        
        switch (alignment) {
            case 'justifyCenter': cssAlignment = 'center'; break;
            case 'justifyRight': cssAlignment = 'right'; break;
            case 'justifyFull': cssAlignment = 'justify'; break;
            default: cssAlignment = 'left';
        }
        
        // Find block-level parent
        let blockElement = this.getBlockParent(range.startContainer);
        if (blockElement) {
            blockElement.style.textAlign = cssAlignment;
        }
        
        return true;
    }

    /**
     * Toggle list
     * @param {string} listType - List type ('ordered' or 'unordered')
     * @param {Range} range - Selection range
     * @returns {boolean} Success status
     */
    toggleList(listType, range) {
        const blockElement = this.getBlockParent(range.startContainer);
        const isInList = blockElement && (blockElement.tagName === 'OL' || blockElement.tagName === 'UL');
        
        if (isInList) {
            this.removeList(blockElement);
        } else {
            this.createList(listType, range);
        }
        
        return true;
    }

    /**
     * Apply format block
     * @param {string} format - Format type
     * @param {Range} range - Selection range
     * @returns {boolean} Success status
     */
    applyFormatBlock(format, range) {
        const tagName = format.replace(/[<>]/g, '');
        const blockElement = this.getBlockParent(range.startContainer);
        
        if (blockElement && blockElement.tagName !== tagName) {
            const newElement = document.createElement(tagName);
            newElement.innerHTML = blockElement.innerHTML;
            blockElement.parentNode.replaceChild(newElement, blockElement);
        }
        
        return true;
    }

    /**
     * Insert HTML content
     * @param {string} html - HTML content
     * @param {Range} range - Selection range
     * @returns {boolean} Success status
     */
    insertHTML(html, range) {
        const sanitizedHTML = DOMUtils.sanitizeHTML(html);
        const fragment = document.createDocumentFragment();
        const temp = document.createElement('div');
        temp.innerHTML = sanitizedHTML;
        
        while (temp.firstChild) {
            fragment.appendChild(temp.firstChild);
        }
        
        range.deleteContents();
        range.insertNode(fragment);
        
        return true;
    }

    /**
     * Insert text content
     * @param {string} text - Text content
     * @param {Range} range - Selection range
     * @returns {boolean} Success status
     */
    insertText(text, range) {
        const textNode = document.createTextNode(text);
        range.deleteContents();
        range.insertNode(textNode);
        
        return true;
    }

    /**
     * Save current state for undo/redo
     */
    saveState() {
        const content = this.editor.innerHTML;
        
        // Remove states after current index
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Add new state
        this.history.push(content);
        this.historyIndex++;
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.historyIndex--;
        }
        
        this.emit('stateSaved', { content, index: this.historyIndex });
    }

    /**
     * Undo last action
     * @returns {boolean} Success status
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
            this.emit('undo', { index: this.historyIndex });
            return true;
        }
        return false;
    }

    /**
     * Redo last undone action
     * @returns {boolean} Success status
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
            this.emit('redo', { index: this.historyIndex });
            return true;
        }
        return false;
    }

    /**
     * Restore editor state
     * @param {string} content - HTML content
     */
    restoreState(content) {
        this.editor.innerHTML = content;
    }

    /**
     * Check if selection has formatting
     * @param {string} format - Format type
     * @param {Range} range - Selection range
     * @returns {boolean} Formatting status
     */
    isFormatted(format, range) {
        const tagName = this.getTagNameForFormat(format);
        const elements = range.commonAncestorContainer.getElementsByTagName(tagName);
        
        return Array.from(elements).some(element => 
            range.intersectsNode(element)
        );
    }

    /**
     * Get tag name for format
     * @param {string} format - Format type
     * @returns {string} Tag name
     */
    getTagNameForFormat(format) {
        const formatMap = {
            bold: 'B',
            italic: 'I',
            underline: 'U',
            strikeThrough: 'S',
            subscript: 'SUB',
            superscript: 'SUP'
        };
        
        return formatMap[format] || format.toUpperCase();
    }

    /**
     * Get block-level parent element
     * @param {Node} node - Starting node
     * @returns {Element|null} Block element
     */
    getBlockParent(node) {
        let element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
        
        while (element && element !== this.editor) {
            const display = DOMUtils.getComputedStyle(element, 'display');
            if (display === 'block') {
                return element;
            }
            element = element.parentElement;
        }
        
        return null;
    }

    /**
     * Apply style to selection
     * @param {string} property - CSS property
     * @param {string} value - CSS value
     * @param {Range} range - Selection range
     */
    applyStyleToSelection(property, value, range) {
        const span = document.createElement('span');
        span.style[property] = value;
        
        try {
            range.surroundContents(span);
        } catch (error) {
            // Handle complex selections
            this.applyStyleToComplexSelection(property, value, range);
        }
    }

    /**
     * Unwrap element (remove tag but keep content)
     * @param {Element} element - Element to unwrap
     */
    unwrapElement(element) {
        const parent = element.parentNode;
        const fragment = document.createDocumentFragment();
        
        while (element.firstChild) {
            fragment.appendChild(element.firstChild);
        }
        
        parent.replaceChild(fragment, element);
    }

    /**
     * Get command state
     * @param {string} command - Command name
     * @returns {boolean} Command state
     */
    queryCommandState(command) {
        try {
            return document.queryCommandState(command);
        } catch (error) {
            return false;
        }
    }

    /**
     * Get command value
     * @param {string} command - Command name
     * @returns {string} Command value
     */
    queryCommandValue(command) {
        try {
            return document.queryCommandValue(command);
        } catch (error) {
            return '';
        }
    }

    /**
     * Check if command is supported
     * @param {string} command - Command name
     * @returns {boolean} Support status
     */
    queryCommandSupported(command) {
        try {
            return document.queryCommandSupported(command);
        } catch (error) {
            return false;
        }
    }
}