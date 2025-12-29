/**
 * Templates UI Component
 */
import { EventEmitter } from '../utils/EventEmitter.js';
import { DOMUtils } from '../utils/DOMUtils.js';

export class TemplatesUI extends EventEmitter {
    constructor(editor, templatesService) {
        super();
        
        this.editor = editor;
        this.templatesService = templatesService;
        
        // DOM elements
        this.templatesModal = null;
        this.templatesGrid = null;
        this.searchInput = null;
        this.categoryFilter = null;
        this.createTemplateBtn = null;
        
        // State
        this.isVisible = false;
        this.currentCategory = 'All';
        this.searchQuery = '';
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize templates UI
     */
    initialize() {
        this.createModal();
        this.setupEventListeners();
        this.setupTemplatesServiceEvents();
    }
    
    /**
     * Create templates modal
     */
    createModal() {
        this.templatesModal = DOMUtils.createElement('div', {
            id: 'templatesModal',
            className: 'modal'
        });
        
        this.templatesModal.innerHTML = `
            <div class="modal-content templates-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-file-alt"></i> Document Templates</h2>
                    <button class="modal-close" id="templatesCloseBtn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="templates-controls">
                        <div class="templates-search">
                            <input type="text" id="templatesSearch" placeholder="Search templates..." class="search-input">
                            <i class="fas fa-search search-icon"></i>
                        </div>
                        <div class="templates-filters">
                            <select id="categoryFilter" class="filter-select">
                                <option value="All">All Categories</option>
                            </select>
                            <button class="btn-primary" id="createTemplateBtn">
                                <i class="fas fa-plus"></i> Create Template
                            </button>
                        </div>
                    </div>
                    <div class="templates-grid" id="templatesGrid">
                        <!-- Templates will be loaded here -->
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.templatesModal);
        
        // Get references
        this.templatesGrid = DOMUtils.query('#templatesGrid');
        this.searchInput = DOMUtils.query('#templatesSearch');
        this.categoryFilter = DOMUtils.query('#categoryFilter');
        this.createTemplateBtn = DOMUtils.query('#createTemplateBtn');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close button
        const closeBtn = DOMUtils.query('#templatesCloseBtn');
        if (closeBtn) {
            DOMUtils.addEventListener(closeBtn, 'click', () => {
                this.hide();
            });
        }
        
        // Search input
        if (this.searchInput) {
            DOMUtils.addEventListener(this.searchInput, 'input', 
                DOMUtils.debounce((e) => {
                    this.searchQuery = e.target.value;
                    this.renderTemplates();
                }, 300)
            );
        }
        
        // Category filter
        if (this.categoryFilter) {
            DOMUtils.addEventListener(this.categoryFilter, 'change', (e) => {
                this.currentCategory = e.target.value;
                this.renderTemplates();
            });
        }
        
        // Create template button
        if (this.createTemplateBtn) {
            DOMUtils.addEventListener(this.createTemplateBtn, 'click', () => {
                this.showCreateTemplateDialog();
            });
        }
        
        // Click outside modal to close
        DOMUtils.addEventListener(this.templatesModal, 'click', (e) => {
            if (e.target === this.templatesModal) {
                this.hide();
            }
        });
        
        // Keyboard shortcuts
        DOMUtils.addEventListener(document, 'keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }
    
    /**
     * Setup templates service event listeners
     */
    setupTemplatesServiceEvents() {
        this.templatesService.on('templateCreated', () => {
            this.renderTemplates();
        });
        
        this.templatesService.on('templateUpdated', () => {
            this.renderTemplates();
        });
        
        this.templatesService.on('templateDeleted', () => {
            this.renderTemplates();
        });
    }
    
    /**
     * Show templates modal
     */
    show() {
        this.templatesModal.classList.add('visible');
        this.isVisible = true;
        this.loadCategories();
        this.renderTemplates();
        this.emit('shown');
    }
    
    /**
     * Hide templates modal
     */
    hide() {
        this.templatesModal.classList.remove('visible');
        this.isVisible = false;
        this.emit('hidden');
    }
    
    /**
     * Toggle templates modal
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    /**
     * Load categories into filter
     */
    loadCategories() {
        if (!this.categoryFilter) return;
        
        const categories = this.templatesService.getCategories();
        const currentValue = this.categoryFilter.value;
        
        this.categoryFilter.innerHTML = '<option value="All">All Categories</option>';
        
        categories.forEach(category => {
            const option = DOMUtils.createElement('option', {
                value: category,
                text: category
            });
            this.categoryFilter.appendChild(option);
        });
        
        // Restore previous selection
        if (currentValue) {
            this.categoryFilter.value = currentValue;
        }
    }
    
    /**
     * Render templates grid
     */
    renderTemplates() {
        if (!this.templatesGrid) return;
        
        let templates = this.templatesService.getAllTemplates();
        
        // Apply category filter
        if (this.currentCategory !== 'All') {
            templates = templates.filter(template => template.category === this.currentCategory);
        }
        
        // Apply search filter
        if (this.searchQuery) {
            templates = this.templatesService.searchTemplates(this.searchQuery);
            if (this.currentCategory !== 'All') {
                templates = templates.filter(template => template.category === this.currentCategory);
            }
        }
        
        if (templates.length === 0) {
            this.templatesGrid.innerHTML = `
                <div class="no-templates">
                    <i class="fas fa-file-alt"></i>
                    <p>No templates found</p>
                    <button class="btn-primary" id="noTemplatesCreateBtn">
                        <i class="fas fa-plus"></i> Create Template
                    </button>
                </div>
            `;
            
            // Add click handler for create button
            const createBtn = DOMUtils.query('#noTemplatesCreateBtn');
            if (createBtn) {
                DOMUtils.addEventListener(createBtn, 'click', () => {
                    this.showCreateTemplateDialog();
                });
            }
        } else {
            this.templatesGrid.innerHTML = templates.map(template => `
                <div class="template-card" data-template-id="${template.id}">
                    <div class="template-preview">
                        <i class="fas ${template.icon}"></i>
                    </div>
                    <div class="template-info">
                        <h3 class="template-name">${template.name}</h3>
                        <p class="template-category">${template.category}</p>
                        <p class="template-description">${template.description}</p>
                    </div>
                    <div class="template-actions">
                        <button class="btn-primary apply-template-btn" data-template-id="${template.id}">
                            <i class="fas fa-plus"></i> Use Template
                        </button>
                        ${template.isCustom ? `
                            <div class="custom-template-actions">
                                <button class="btn-secondary edit-template-btn" data-template-id="${template.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-danger delete-template-btn" data-template-id="${template.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');
            
            // Add click handlers
            this.addTemplateCardHandlers();
        }
    }
    
    /**
     * Add event handlers to template cards
     */
    addTemplateCardHandlers() {
        // Apply template buttons
        const applyBtns = this.templatesGrid.querySelectorAll('.apply-template-btn');
        applyBtns.forEach(btn => {
            DOMUtils.addEventListener(btn, 'click', (e) => {
                const templateId = e.target.dataset.templateId;
                this.applyTemplate(templateId);
            });
        });
        
        // Edit template buttons
        const editBtns = this.templatesGrid.querySelectorAll('.edit-template-btn');
        editBtns.forEach(btn => {
            DOMUtils.addEventListener(btn, 'click', (e) => {
                const templateId = e.target.dataset.templateId;
                this.showEditTemplateDialog(templateId);
            });
        });
        
        // Delete template buttons
        const deleteBtns = this.templatesGrid.querySelectorAll('.delete-template-btn');
        deleteBtns.forEach(btn => {
            DOMUtils.addEventListener(btn, 'click', (e) => {
                const templateId = e.target.dataset.templateId;
                this.showDeleteTemplateDialog(templateId);
            });
        });
    }
    
    /**
     * Apply template to current document
     * @param {string} templateId - Template ID
     */
    applyTemplate(templateId) {
        const template = this.templatesService.getTemplate(templateId);
        if (!template) return;
        
        // Create new document from template
        const documentId = this.editor.createNewDocument();
        
        // Apply template content
        const editorElement = this.editor.editorElement;
        editorElement.innerHTML = template.content;
        
        // Save document
        this.editor.saveCurrentDocument();
        
        // Update document name
        this.editor.renameCurrentDocument(template.name);
        
        // Hide modal and emit event
        this.hide();
        this.emit('templateApplied', { template, documentId });
    }
    
    /**
     * Show create template dialog
     */
    showCreateTemplateDialog() {
        const dialog = DOMUtils.createElement('div', {
            className: 'modal'
        });
        
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-plus"></i> Create Template</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="createTemplateForm">
                        <div class="form-group">
                            <label for="templateName">Template Name *</label>
                            <input type="text" id="templateName" required class="form-input">
                        </div>
                        <div class="form-group">
                            <label for="templateCategory">Category *</label>
                            <select id="templateCategory" required class="form-select">
                                <option value="">Select category</option>
                                <option value="Business">Business</option>
                                <option value="Academic">Academic</option>
                                <option value="Personal">Personal</option>
                                <option value="Custom">Custom</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="templateDescription">Description</label>
                            <textarea id="templateDescription" rows="3" class="form-textarea"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="templateIcon">Icon</label>
                            <select id="templateIcon" class="form-select">
                                <option value="fa-file-alt">Document</option>
                                <option value="fa-envelope">Letter</option>
                                <option value="fa-graduation-cap">Academic</option>
                                <option value="fa-briefcase">Business</option>
                                <option value="fa-users">Meeting</option>
                                <option value="fa-clipboard-list">Proposal</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="cancelCreateBtn">Cancel</button>
                            <button type="submit" class="btn-primary">Create Template</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        dialog.classList.add('visible');
        
        // Add event handlers
        const form = DOMUtils.query('#createTemplateForm');
        const closeBtn = dialog.querySelector('.modal-close');
        const cancelBtn = DOMUtils.query('#cancelCreateBtn');
        
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
            this.createTemplate(form);
            closeDialog();
        });
    }
    
    /**
     * Create new template
     * @param {HTMLFormElement} form - Form element
     */
    createTemplate(form) {
        const formData = new FormData(form);
        const editorElement = this.editor.editorElement;
        
        const templateData = {
            name: formData.get('templateName') || DOMUtils.query('#templateName').value,
            category: formData.get('templateCategory') || DOMUtils.query('#templateCategory').value,
            description: formData.get('templateDescription') || DOMUtils.query('#templateDescription').value,
            icon: formData.get('templateIcon') || DOMUtils.query('#templateIcon').value,
            content: editorElement.innerHTML
        };
        
        this.templatesService.createCustomTemplate(templateData);
        this.emit('templateCreated', { template: templateData });
    }
    
    /**
     * Show edit template dialog
     * @param {string} templateId - Template ID
     */
    showEditTemplateDialog(templateId) {
        const template = this.templatesService.getTemplate(templateId);
        if (!template || !template.isCustom) return;
        
        const dialog = DOMUtils.createElement('div', {
            className: 'modal'
        });
        
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Template</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="editTemplateForm">
                        <div class="form-group">
                            <label for="editTemplateName">Template Name *</label>
                            <input type="text" id="editTemplateName" required class="form-input" value="${template.name}">
                        </div>
                        <div class="form-group">
                            <label for="editTemplateCategory">Category *</label>
                            <select id="editTemplateCategory" required class="form-select">
                                <option value="Business" ${template.category === 'Business' ? 'selected' : ''}>Business</option>
                                <option value="Academic" ${template.category === 'Academic' ? 'selected' : ''}>Academic</option>
                                <option value="Personal" ${template.category === 'Personal' ? 'selected' : ''}>Personal</option>
                                <option value="Custom" ${template.category === 'Custom' ? 'selected' : ''}>Custom</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editTemplateDescription">Description</label>
                            <textarea id="editTemplateDescription" rows="3" class="form-textarea">${template.description}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="editTemplateIcon">Icon</label>
                            <select id="editTemplateIcon" class="form-select">
                                <option value="fa-file-alt" ${template.icon === 'fa-file-alt' ? 'selected' : ''}>Document</option>
                                <option value="fa-envelope" ${template.icon === 'fa-envelope' ? 'selected' : ''}>Letter</option>
                                <option value="fa-graduation-cap" ${template.icon === 'fa-graduation-cap' ? 'selected' : ''}>Academic</option>
                                <option value="fa-briefcase" ${template.icon === 'fa-briefcase' ? 'selected' : ''}>Business</option>
                                <option value="fa-users" ${template.icon === 'fa-users' ? 'selected' : ''}>Meeting</option>
                                <option value="fa-clipboard-list" ${template.icon === 'fa-clipboard-list' ? 'selected' : ''}>Proposal</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="cancelEditBtn">Cancel</button>
                            <button type="submit" class="btn-primary">Update Template</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        dialog.classList.add('visible');
        
        // Add event handlers
        const form = DOMUtils.query('#editTemplateForm');
        const closeBtn = dialog.querySelector('.modal-close');
        const cancelBtn = DOMUtils.query('#cancelEditBtn');
        
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
            this.updateTemplate(templateId);
            closeDialog();
        });
    }
    
    /**
     * Update template
     * @param {string} templateId - Template ID
     */
    updateTemplate(templateId) {
        const updates = {
            name: DOMUtils.query('#editTemplateName').value,
            category: DOMUtils.query('#editTemplateCategory').value,
            description: DOMUtils.query('#editTemplateDescription').value,
            icon: DOMUtils.query('#editTemplateIcon').value
        };
        
        this.templatesService.updateCustomTemplate(templateId, updates);
        this.emit('templateUpdated', { templateId, updates });
    }
    
    /**
     * Show delete template dialog
     * @param {string} templateId - Template ID
     */
    showDeleteTemplateDialog(templateId) {
        const template = this.templatesService.getTemplate(templateId);
        if (!template || !template.isCustom) return;
        
        const dialog = DOMUtils.createElement('div', {
            className: 'modal'
        });
        
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-trash"></i> Delete Template</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete the template "<strong>${template.name}</strong>"?</p>
                    <p>This action cannot be undone.</p>
                    <div class="form-actions">
                        <button class="btn-secondary" id="cancelDeleteBtn">Cancel</button>
                        <button class="btn-danger" id="confirmDeleteBtn">Delete Template</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        dialog.classList.add('visible');
        
        // Add event handlers
        const closeBtn = dialog.querySelector('.modal-close');
        const cancelBtn = DOMUtils.query('#cancelDeleteBtn');
        const confirmBtn = DOMUtils.query('#confirmDeleteBtn');
        
        const closeDialog = () => {
            dialog.remove();
        };
        
        DOMUtils.addEventListener(closeBtn, 'click', closeDialog);
        DOMUtils.addEventListener(cancelBtn, 'click', closeDialog);
        DOMUtils.addEventListener(dialog, 'click', (e) => {
            if (e.target === dialog) closeDialog();
        });
        
        DOMUtils.addEventListener(confirmBtn, 'click', () => {
            this.deleteTemplate(templateId);
            closeDialog();
        });
    }
    
    /**
     * Delete template
     * @param {string} templateId - Template ID
     */
    deleteTemplate(templateId) {
        this.templatesService.deleteCustomTemplate(templateId);
        this.emit('templateDeleted', { templateId });
    }
    
    /**
     * Destroy templates UI
     */
    destroy() {
        // Remove modal
        if (this.templatesModal) {
            this.templatesModal.remove();
        }
        
        // Remove event listeners
        this.removeAllListeners();
        
        this.isVisible = false;
        this.emit('destroyed');
    }
}