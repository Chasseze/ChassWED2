/**
 * Advanced Formatting Service
 */
import { EventEmitter } from '../utils/EventEmitter.js';

export class AdvancedFormattingService extends EventEmitter {
    constructor(editorElement) {
        super();
        
        this.editorElement = editorElement;
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize advanced formatting service
     */
    initialize() {
        // Setup mutation observer for dynamic content
        this.setupMutationObserver();
    }
    
    /**
     * Setup mutation observer
     */
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    this.processNewContent(mutation.addedNodes);
                }
            });
        });
        
        observer.observe(this.editorElement, {
            childList: true,
            subtree: true
        });
        
        this.observer = observer;
    }
    
    /**
     * Process newly added content
     * @param {NodeList} nodes - Added nodes
     */
    processNewContent(nodes) {
        nodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Process footnotes
                this.processFootnotes(node);
                
                // Process column layouts
                this.processColumns(node);
            }
        });
    }
    
    /**
     * Insert multi-column layout
     * @param {number} columnCount - Number of columns
     * @param {Object} options - Column options
     */
    insertColumns(columnCount = 2, options = {}) {
        const {
            gap = '20px',
            rule = 'none',
            width = 'equal'
        } = options;
        
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // Create column container
        const columnContainer = document.createElement('div');
        columnContainer.className = 'advanced-columns';
        columnContainer.style.cssText = `
            column-count: ${columnCount};
            column-gap: ${gap};
            column-rule: ${rule};
            display: block;
            margin: 20px 0;
        `;
        
        // If width is not equal, create custom layout
        if (width !== 'equal') {
            columnContainer.style.columnCount = 'auto';
            columnContainer.style.display = 'flex';
            columnContainer.style.flexWrap = 'wrap';
            
            for (let i = 0; i < columnCount; i++) {
                const column = document.createElement('div');
                column.className = 'advanced-column';
                column.style.cssText = `
                    flex: 1;
                    min-width: 0;
                    padding: 0 10px;
                    box-sizing: border-box;
                `;
                
                if (i > 0) {
                    column.style.borderLeft = `1px solid var(--border-primary)`;
                    column.style.paddingLeft = '20px';
                }
                
                column.innerHTML = '<p>Column content here...</p>';
                columnContainer.appendChild(column);
            }
        } else {
            columnContainer.innerHTML = '<p>Your multi-column content will appear here...</p>';
        }
        
        // Insert into document
        range.deleteContents();
        range.insertNode(columnContainer);
        range.collapse(false);
        
        this.emit('columnsInserted', { columnCount, options });
    }
    
    /**
     * Insert footnote
     * @param {string} text - Footnote text
     * @param {Object} options - Footnote options
     */
    insertFootnote(text, options = {}) {
        const {
            number = this.getNextFootnoteNumber()
        } = options;
        
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // Create footnote reference
        const footnoteRef = document.createElement('sup');
        footnoteRef.className = 'footnote-reference';
        footnoteRef.innerHTML = `<a href="#footnote-${number}" id="footnote-ref-${number}">${number}</a>`;
        
        // Create footnote content
        const footnoteContent = document.createElement('div');
        footnoteContent.className = 'footnote-content';
        footnoteContent.id = `footnote-${number}`;
        footnoteContent.innerHTML = `
            <span class="footnote-number">${number}.</span> 
            <span class="footnote-text">${text}</span>
            <a href="#footnote-ref-${number}" class="footnote-backlink">↩</a>
        `;
        
        // Insert reference
        range.insertNode(footnoteRef);
        range.collapse(false);
        
        // Add footnote to footnotes section
        this.addFootnoteToSection(footnoteContent);
        
        this.emit('footnoteInserted', { number, text, options });
    }
    
    /**
     * Get next footnote number
     * @returns {number} Next footnote number
     */
    getNextFootnoteNumber() {
        const existingFootnotes = this.editorElement.querySelectorAll('.footnote-reference');
        return existingFootnotes.length + 1;
    }
    
    /**
     * Add footnote to footnotes section
     * @param {Element} footnoteContent - Footnote content element
     */
    addFootnoteToSection(footnoteContent) {
        let footnotesSection = this.editorElement.querySelector('.footnotes-section');
        
        if (!footnotesSection) {
            footnotesSection = document.createElement('div');
            footnotesSection.className = 'footnotes-section';
            footnotesSection.innerHTML = `
                <h4>Footnotes</h4>
                <div class="footnotes-list"></div>
            `;
            
            this.editorElement.appendChild(footnotesSection);
        }
        
        const footnotesList = footnotesSection.querySelector('.footnotes-list');
        footnotesList.appendChild(footnoteContent);
    }
    
    /**
     * Insert page break
     */
    insertPageBreak() {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        const pageBreak = document.createElement('div');
        pageBreak.className = 'page-break';
        pageBreak.setAttribute('contenteditable', 'false');
        pageBreak.innerHTML = `
            <div class="page-break-line"></div>
            <div class="page-break-label">Page Break</div>
        `;
        
        range.insertNode(pageBreak);
        range.collapse(false);
        
        this.emit('pageBreakInserted');
    }
    
    /**
     * Insert section break
     * @param {string} type - Break type
     */
    insertSectionBreak(type = 'continuous') {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        const sectionBreak = document.createElement('div');
        sectionBreak.className = `section-break section-break-${type}`;
        sectionBreak.setAttribute('contenteditable', 'false');
        
        if (type === 'next-page') {
            sectionBreak.innerHTML = '<div class="section-break-line next-page"></div>';
        } else if (type === 'odd-page') {
            sectionBreak.innerHTML = '<div class="section-break-line odd-page"></div>';
        } else {
            sectionBreak.innerHTML = '<div class="section-break-line continuous"></div>';
        }
        
        range.insertNode(sectionBreak);
        range.collapse(false);
        
        this.emit('sectionBreakInserted', { type });
    }
    
    /**
     * Insert table of contents
     * @param {Object} options - TOC options
     */
    insertTableOfContents(options = {}) {
        const {
            title = 'Table of Contents',
            maxLevel = 3,
            showPageNumbers = true
        } = options;
        
        // Find all headings in the document
        const headings = this.editorElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const tocEntries = [];
        
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.substring(1));
            if (level <= maxLevel) {
                const id = `toc-heading-${index}`;
                heading.id = id;
                
                tocEntries.push({
                    level,
                    text: heading.textContent,
                    id: id,
                    pageNumber: showPageNumbers ? index + 1 : null
                });
            }
        });
        
        // Create TOC
        const toc = document.createElement('div');
        toc.className = 'table-of-contents';
        toc.innerHTML = `
            <h2 class="toc-title">${title}</h2>
            <div class="toc-list">
                ${tocEntries.map(entry => `
                    <div class="toc-entry toc-level-${entry.level}">
                        <a href="#${entry.id}" class="toc-link">
                            <span class="toc-text">${entry.text}</span>
                            ${showPageNumbers ? `<span class="toc-page-number">${entry.pageNumber}</span>` : ''}
                        </a>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Insert at cursor position
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        range.insertNode(toc);
        range.collapse(false);
        
        this.emit('tableOfContentsInserted', { entries: tocEntries, options });
    }
    
    /**
     * Insert drop cap
     * @param {Object} options - Drop cap options
     */
    insertDropCap(options = {}) {
        const {
            fontSize = '3em',
            fontFamily = 'Georgia, serif',
            color = 'inherit'
        } = options;
        
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // Get the current paragraph
        let paragraph = range.startContainer;
        while (paragraph.nodeType !== Node.ELEMENT_NODE || paragraph.tagName !== 'P') {
            paragraph = paragraph.parentNode;
        }
        
        // Get the first character
        const text = paragraph.textContent;
        if (!text || text.trim().length === 0) return;
        
        const firstChar = text.charAt(0);
        const remainingText = text.substring(1);
        
        // Create drop cap
        const dropCap = document.createElement('span');
        dropCap.className = 'drop-cap';
        dropCap.textContent = firstChar;
        dropCap.style.cssText = `
            font-size: ${fontSize};
            line-height: 1;
            float: left;
            margin-right: 0.1em;
            margin-top: 0.1em;
            font-family: ${fontFamily};
            color: ${color};
            font-weight: bold;
        `;
        
        // Update paragraph content
        paragraph.textContent = remainingText;
        paragraph.insertBefore(dropCap, paragraph.firstChild);
        
        this.emit('dropCapInserted', { options });
    }
    
    /**
     * Process footnotes in new content
     * @param {Node} node - Node to process
     */
    processFootnotes(node) {
        const footnotes = node.querySelectorAll ? node.querySelectorAll('.footnote-reference') : [];
        footnotes.forEach(footnote => {
            // Add click handlers for footnote navigation
            const link = footnote.querySelector('a');
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const target = document.getElementById(targetId);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }
        });
    }
    
    /**
     * Process column layouts in new content
     * @param {Node} node - Node to process
     */
    processColumns(node) {
        const columnContainers = node.querySelectorAll ? node.querySelectorAll('.advanced-columns') : [];
        columnContainers.forEach(container => {
            // Add column-specific styling and behavior
            container.style.outline = '1px dashed var(--border-primary)';
            container.style.outlineOffset = '2px';
            
            // Add hover effects
            container.addEventListener('mouseenter', () => {
                container.style.outlineColor = 'var(--primary-color)';
            });
            
            container.addEventListener('mouseleave', () => {
                container.style.outlineColor = 'var(--border-primary)';
            });
        });
    }
    
    /**
     * Remove advanced formatting
     * @param {Element} element - Element to format
     * @param {string} type - Type of formatting to remove
     */
    removeAdvancedFormatting(element, type) {
        switch (type) {
            case 'columns':
                element.style.cssText = '';
                element.classList.remove('advanced-columns');
                break;
            case 'footnote':
                element.remove();
                break;
            case 'page-break':
                element.remove();
                break;
            case 'drop-cap':
                const parent = element.parentNode;
                if (parent) {
                    const text = element.textContent + parent.textContent;
                    parent.textContent = text;
                }
                break;
        }
        
        this.emit('formattingRemoved', { element, type });
    }
    
    /**
     * Get formatting statistics
     * @returns {Object} Formatting statistics
     */
    getFormattingStatistics() {
        const stats = {
            footnotes: this.editorElement.querySelectorAll('.footnote-reference').length,
            columns: this.editorElement.querySelectorAll('.advanced-columns').length,
            pageBreaks: this.editorElement.querySelectorAll('.page-break').length,
            dropCaps: this.editorElement.querySelectorAll('.drop-cap').length,
            tablesOfContents: this.editorElement.querySelectorAll('.table-of-contents').length
        };
        
        return stats;
    }
    
    /**
     * Destroy service
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        this.removeAllListeners();
        this.emit('destroyed');
    }
}