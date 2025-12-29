/**
 * Advanced Formatting UI Component
 */
import { EventEmitter } from '../utils/EventEmitter.js';
import { DOMUtils } from '../utils/DOMUtils.js';

export class AdvancedFormattingUI extends EventEmitter {
    constructor(editor, formattingService) {
        super();
        
        this.editor = editor;
        this.formattingService = formattingService;
        
        // DOM elements
        this.formattingPanel = null;
        
        // State
        this.isVisible = false;
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize advanced formatting UI
     */
    initialize() {
        this.createUI();
        this.setupEventListeners();
    }
    
    /**
     * Create UI elements
     */
    createUI() {
        // Create advanced formatting panel
        this.formattingPanel = DOMUtils.createElement('div', {
            id: 'advancedFormattingPanel',
            className: 'advanced-formatting-panel'
        });
        
        this.formattingPanel.innerHTML = `
            <div class="formatting-panel-header">
                <h3><i class="fas fa-magic"></i> Advanced Formatting</h3>
                <button class="panel-close-btn" id="formattingCloseBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="formatting-panel-content">
                <!-- Columns Section -->
                <div class="formatting-section">
                    <h4>Columns</h4>
                    <div class="formatting-buttons">
                        <button class="format-btn" id="insert2ColumnsBtn" title="Insert 2 Columns">
                            <i class="fas fa-columns"></i>
                            <span>2 Columns</span>
                        </button>
                        <button class="format-btn" id="insert3ColumnsBtn" title="Insert 3 Columns">
                            <i class="fas fa-th"></i>
                            <span>3 Columns</span>
                        </button>
                        <button class="format-btn" id="customColumnsBtn" title="Custom Columns">
                            <i class="fas fa-sliders-h"></i>
                            <span>Custom</span>
                        </button>
                    </div>
                </div>
                
                <!-- Footnotes Section -->
                <div class="formatting-section">
                    <h4>Footnotes</h4>
                    <div class="formatting-controls">
                        <div class="input-group">
                            <input type="text" id="footnoteText" placeholder="Enter footnote text..." class="format-input">
                            <button class="format-btn primary" id="insertFootnoteBtn">
                                <i class="fas fa-superscript"></i> Insert
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Breaks Section -->
                <div class="formatting-section">
                    <h4>Breaks</h4>
                    <div class="formatting-buttons">
                        <button class="format-btn" id="insertPageBreakBtn" title="Insert Page Break">
                            <i class="fas fa-file"></i>
                            <span>Page Break</span>
                        </button>
                        <button class="format-btn" id="insertSectionBreakBtn" title="Insert Section Break">
                            <i class="fas fa-cut"></i>
                            <span>Section</span>
                        </button>
                    </div>
                </div>
                
                <!-- Text Effects Section -->
                <div class="formatting-section">
                    <h4>Text Effects</h4>
                    <div class="formatting-buttons">
                        <button class="format-btn" id="insertDropCapBtn" title="Insert Drop Cap">
                            <span class="drop-cap-preview">A</span>
                            <span>Drop Cap</span>
                        </button>
                        <button class="format-btn" id="insertTOCBtn" title="Insert Table of Contents">
                            <i class="fas fa-list"></i>
                            <span>TOC</span>
                        </button>
                    </div>
                </div>
                
                <!-- Statistics Section -->
                <div class="formatting-section">
                    <h4>Statistics</h4>
                    <div class="formatting-stats" id="formattingStats">
                        <div class="stat-item">
                            <i class="fas fa-superscript"></i>
                            <span class="stat-label">Footnotes:</span>
                            <span class="stat-value" id="footnotesCount">0</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-columns"></i>
                            <span class="stat-label">Columns:</span>
                            <span class="stat-value" id="columnsCount">0</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-file"></i>
                            <span class="stat-label">Breaks:</span>
                            <span class="stat-value" id="breaksCount">0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(this.formattingPanel);
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close button
        const closeBtn = DOMUtils.query('#formattingCloseBtn');
        if (closeBtn) {
            DOMUtils.addEventListener(closeBtn, 'click', () => {
                this.hide();
            });
        }
        
        // Column buttons
        const twoColumnsBtn = DOMUtils.query('#insert2ColumnsBtn');
        if (twoColumnsBtn) {
            DOMUtils.addEventListener(twoColumnsBtn, 'click', () => {
                this.formattingService.insertColumns(2);
            });
        }
        
        const threeColumnsBtn = DOMUtils.query('#insert3ColumnsBtn');
        if (threeColumnsBtn) {
            DOMUtils.addEventListener(threeColumnsBtn, 'click', () => {
                this.formattingService.insertColumns(3);
            });
        }
        
        const customColumnsBtn = DOMUtils.query('#customColumnsBtn');
        if (customColumnsBtn) {
            DOMUtils.addEventListener(customColumnsBtn, 'click', () => {
                this.showCustomColumnsDialog();
            });
        }
        
        // Footnote controls
        const footnoteText = DOMUtils.query('#footnoteText');
        const insertFootnoteBtn = DOMUtils.query('#insertFootnoteBtn');
        if (insertFootnoteBtn) {
            DOMUtils.addEventListener(insertFootnoteBtn, 'click', () => {
                const text = footnoteText.value.trim();
                if (text) {
                    this.formattingService.insertFootnote(text);
                    footnoteText.value = '';
                }
            });
        }
        
        // Break buttons
        const pageBreakBtn = DOMUtils.query('#insertPageBreakBtn');
        if (pageBreakBtn) {
            DOMUtils.addEventListener(pageBreakBtn, 'click', () => {
                this.formattingService.insertPageBreak();
            });
        }
        
        const sectionBreakBtn = DOMUtils.query('#insertSectionBreakBtn');
        if (sectionBreakBtn) {
            DOMUtils.addEventListener(sectionBreakBtn, 'click', () => {
                this.showSectionBreakDialog();
            });
        }
        
        // Text effect buttons
        const dropCapBtn = DOMUtils.query('#insertDropCapBtn');
        if (dropCapBtn) {
            DOMUtils.addEventListener(dropCapBtn, 'click', () => {
                this.showDropCapDialog();
            });
        }
        
        const tocBtn = DOMUtils.query('#insertTOCBtn');
        if (tocBtn) {
            DOMUtils.addEventListener(tocBtn, 'click', () => {
                this.showTOCDialog();
            });
        }
        
        // Setup formatting service events
        this.setupFormattingServiceEvents();
        
        // Update stats periodically
        setInterval(() => {
            this.updateStatistics();
        }, 1000);
    }
    
    /**
     * Setup formatting service event listeners
     */
    setupFormattingServiceEvents() {
        this.formattingService.on('columnsInserted', () => {
            this.updateStatistics();
        });
        
        this.formattingService.on('footnoteInserted', () => {
            this.updateStatistics();
        });
        
        this.formattingService.on('pageBreakInserted', () => {
            this.updateStatistics();
        });
        
        this.formattingService.on('sectionBreakInserted', () => {
            this.updateStatistics();
        });
    }
    
    /**
     * Show custom columns dialog
     */
    showCustomColumnsDialog() {
        const dialog = DOMUtils.createElement('div', {
            className: 'modal'
        });
        
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-columns"></i> Custom Columns</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="customColumnsForm">
                        <div class="form-group">
                            <label for="columnCount">Number of Columns:</label>
                            <input type="number" id="columnCount" min="2" max="6" value="2" class="form-input">
                        </div>
                        <div class="form-group">
                            <label for="columnGap">Column Gap:</label>
                            <select id="columnGap" class="form-select">
                                <option value="10px">10px</option>
                                <option value="20px" selected>20px</option>
                                <option value="30px">30px</option>
                                <option value="40px">40px</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="columnRule">Column Rule:</label>
                            <select id="columnRule" class="form-select">
                                <option value="none">None</option>
                                <option value="1px solid #ccc">Thin</option>
                                <option value="2px solid #ccc">Medium</option>
                                <option value="3px solid #ccc">Thick</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="cancelColumnsBtn">Cancel</button>
                            <button type="submit" class="btn-primary">Insert Columns</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        dialog.classList.add('visible');
        
        // Add event handlers
        const form = DOMUtils.query('#customColumnsForm');
        const closeBtn = dialog.querySelector('.modal-close');
        const cancelBtn = DOMUtils.query('#cancelColumnsBtn');
        
        const closeDialog = () => {
            dialog.remove();
        };
        
        DOMUtils.addEventListener(closeBtn, 'click', closeDialog);
        DOMUtils.addEventListener(cancelBtn, 'click', closeDialog);
        DOMUtils.addEventListener(dialog, 'click', (e) => {
            if (e.target === dialog) closeDialog();
        });
        
        DOMUtils.addEventListener(form, 'submit', (e) => {
            e.preventDefault();
            const columnCount = parseInt(DOMUtils.query('#columnCount').value);
            const gap = DOMUtils.query('#columnGap').value;
            const rule = DOMUtils.query('#columnRule').value;
            
            this.formattingService.insertColumns(columnCount, { gap, rule });
            closeDialog();
        });
    }
    
    /**
     * Show section break dialog
     */
    showSectionBreakDialog() {
        const dialog = DOMUtils.createElement('div', {
            className: 'modal'
        });
        
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-cut"></i> Section Break</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="sectionBreakForm">
                        <div class="form-group">
                            <label for="breakType">Break Type:</label>
                            <select id="breakType" class="form-select">
                                <option value="continuous">Continuous</option>
                                <option value="next-page">Next Page</option>
                                <option value="odd-page">Odd Page</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="cancelBreakBtn">Cancel</button>
                            <button type="submit" class="btn-primary">Insert Break</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        dialog.classList.add('visible');
        
        // Add event handlers
        const form = DOMUtils.query('#sectionBreakForm');
        const closeBtn = dialog.querySelector('.modal-close');
        const cancelBtn = DOMUtils.query('#cancelBreakBtn');
        
        const closeDialog = () => {
            dialog.remove();
        };
        
        DOMUtils.addEventListener(closeBtn, 'click', closeDialog);
        DOMUtils.addEventListener(cancelBtn, 'click', closeDialog);
        DOMUtils.addEventListener(dialog, 'click', (e) => {
            if (e.target === dialog) closeDialog();
        });
        
        DOMUtils.addEventListener(form, 'submit', (e) => {
            e.preventDefault();
            const breakType = DOMUtils.query('#breakType').value;
            
            this.formattingService.insertSectionBreak(breakType);
            closeDialog();
        });
    }
    
    /**
     * Show drop cap dialog
     */
    showDropCapDialog() {
        const dialog = DOMUtils.createElement('div', {
            className: 'modal'
        });
        
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-font"></i> Drop Cap</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="dropCapForm">
                        <div class="form-group">
                            <label for="dropCapSize">Size:</label>
                            <select id="dropCapSize" class="form-select">
                                <option value="2em">Small</option>
                                <option value="3em" selected>Medium</option>
                                <option value="4em">Large</option>
                                <option value="5em">Extra Large</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="dropCapFont">Font:</label>
                            <select id="dropCapFont" class="form-select">
                                <option value="Georgia, serif" selected>Georgia</option>
                                <option value="Times New Roman, serif">Times New Roman</option>
                                <option value="Arial, sans-serif">Arial</option>
                                <option value="Courier New, monospace">Courier New</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="dropCapColor">Color:</label>
                            <input type="color" id="dropCapColor" value="#000000" class="form-input">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="cancelDropCapBtn">Cancel</button>
                            <button type="submit" class="btn-primary">Insert Drop Cap</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        dialog.classList.add('visible');
        
        // Add event handlers
        const form = DOMUtils.query('#dropCapForm');
        const closeBtn = dialog.querySelector('.modal-close');
        const cancelBtn = DOMUtils.query('#cancelDropCapBtn');
        
        const closeDialog = () => {
            dialog.remove();
        };
        
        DOMUtils.addEventListener(closeBtn, 'click', closeDialog);
        DOMUtils.addEventListener(cancelBtn, 'click', closeDialog);
        DOMUtils.addEventListener(dialog, 'click', (e) => {
            if (e.target === dialog) closeDialog();
        });
        
        DOMUtils.addEventListener(form, 'submit', (e) => {
            e.preventDefault();
            const fontSize = DOMUtils.query('#dropCapSize').value;
            const fontFamily = DOMUtils.query('#dropCapFont').value;
            const color = DOMUtils.query('#dropCapColor').value;
            
            this.formattingService.insertDropCap({ fontSize, fontFamily, color });
            closeDialog();
        });
    }
    
    /**
     * Show table of contents dialog
     */
    showTOCDialog() {
        const dialog = DOMUtils.createElement('div', {
            className: 'modal'
        });
        
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-list"></i> Table of Contents</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="tocForm">
                        <div class="form-group">
                            <label for="tocTitle">Title:</label>
                            <input type="text" id="tocTitle" value="Table of Contents" class="form-input">
                        </div>
                        <div class="form-group">
                            <label for="tocMaxLevel">Max Heading Level:</label>
                            <select id="tocMaxLevel" class="form-select">
                                <option value="2">H1-H2</option>
                                <option value="3" selected>H1-H3</option>
                                <option value="4">H1-H4</option>
                                <option value="5">H1-H5</option>
                                <option value="6">H1-H6</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="tocShowPages" checked>
                                Show Page Numbers
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="cancelTOCBtn">Cancel</button>
                            <button type="submit" class="btn-primary">Insert TOC</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        dialog.classList.add('visible');
        
        // Add event handlers
        const form = DOMUtils.query('#tocForm');
        const closeBtn = dialog.querySelector('.modal-close');
        const cancelBtn = DOMUtils.query('#cancelTOCBtn');
        
        const closeDialog = () => {
            dialog.remove();
        };
        
        DOMUtils.addEventListener(closeBtn, 'click', closeDialog);
        DOMUtils.addEventListener(cancelBtn, 'click', closeDialog);
        DOMUtils.addEventListener(dialog, 'click', (e) => {
            if (e.target === dialog) closeDialog();
        });
        
        DOMUtils.addEventListener(form, 'submit', (e) => {
            e.preventDefault();
            const title = DOMUtils.query('#tocTitle').value;
            const maxLevel = parseInt(DOMUtils.query('#tocMaxLevel').value);
            const showPageNumbers = DOMUtils.query('#tocShowPages').checked;
            
            this.formattingService.insertTableOfContents({ title, maxLevel, showPageNumbers });
            closeDialog();
        });
    }
    
    /**
     * Update formatting statistics
     */
    updateStatistics() {
        const stats = this.formattingService.getFormattingStatistics();
        
        const footnotesCount = DOMUtils.query('#footnotesCount');
        const columnsCount = DOMUtils.query('#columnsCount');
        const breaksCount = DOMUtils.query('#breaksCount');
        
        if (footnotesCount) footnotesCount.textContent = stats.footnotes;
        if (columnsCount) columnsCount.textContent = stats.columns;
        if (breaksCount) breaksCount.textContent = stats.pageBreaks + stats.sectionBreaks;
    }
    
    /**
     * Show advanced formatting panel
     */
    show() {
        this.formattingPanel.classList.add('visible');
        this.isVisible = true;
        this.updateStatistics();
        this.emit('shown');
    }
    
    /**
     * Hide advanced formatting panel
     */
    hide() {
        this.formattingPanel.classList.remove('visible');
        this.isVisible = false;
        this.emit('hidden');
    }
    
    /**
     * Toggle advanced formatting panel
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    /**
     * Destroy advanced formatting UI
     */
    destroy() {
        // Remove panel
        if (this.formattingPanel) {
            this.formattingPanel.remove();
        }
        
        // Remove event listeners
        this.removeAllListeners();
        
        this.isVisible = false;
        this.emit('destroyed');
    }
}