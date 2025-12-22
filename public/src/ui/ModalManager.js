/**
 * ModalManager - Handles all modal dialogs
 */
import { EventEmitter } from '../utils/EventEmitter.js';
import { DOMUtils } from '../utils/DOMUtils.js';

export class ModalManager extends EventEmitter {
    constructor() {
        super();
        this.modals = new Map();
        this.activeModal = null;
        this.setupGlobalListeners();
    }

    /**
     * Register a modal
     * @param {string} id - Modal ID
     * @param {Element} element - Modal element
     */
    registerModal(id, element) {
        this.modals.set(id, element);
        
        // Add close listeners
        const closeBtn = element.querySelector('.modal-close');
        if (closeBtn) {
            DOMUtils.addEventListener(closeBtn, 'click', () => {
                this.close(id);
            });
        }
        
        // Close on background click
        DOMUtils.addEventListener(element, 'click', (e) => {
            if (e.target === element) {
                this.close(id);
            }
        });
    }

    /**
     * Show modal
     * @param {string} id - Modal ID
     * @param {Object} options - Modal options
     */
    show(id, options = {}) {
        const modal = this.modals.get(id);
        if (!modal) {
            console.error(`Modal "${id}" not found`);
            return;
        }
        
        // Close any active modal first
        if (this.activeModal && this.activeModal !== id) {
            this.close(this.activeModal);
        }
        
        // Apply options
        if (options.title) {
            const titleElement = modal.querySelector('.modal-title');
            if (titleElement) {
                titleElement.textContent = options.title;
            }
        }
        
        if (options.content) {
            const contentElement = modal.querySelector('.modal-content');
            if (contentElement) {
                contentElement.innerHTML = options.content;
            }
        }
        
        // Show modal
        modal.classList.add('active');
        this.activeModal = id;
        
        // Focus first input
        if (options.autoFocus !== false) {
            const firstInput = modal.querySelector('input, textarea, select, button');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
        
        // Emit event
        this.emit('modalShown', { id, modal, options });
        
        // Handle escape key
        this.handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                this.close(id);
            }
        };
        
        DOMUtils.addEventListener(document, 'keydown', this.handleEscapeKey);
    }

    /**
     * Hide modal
     * @param {string} id - Modal ID
     */
    close(id) {
        const modal = this.modals.get(id);
        if (!modal) {
            return;
        }
        
        modal.classList.remove('active');
        
        if (this.activeModal === id) {
            this.activeModal = null;
        }
        
        // Remove escape key listener
        if (this.handleEscapeKey) {
            DOMUtils.removeEventListener(document, 'keydown', this.handleEscapeKey);
            this.handleEscapeKey = null;
        }
        
        // Emit event
        this.emit('modalClosed', { id, modal });
    }

    /**
     * Check if modal is open
     * @param {string} id - Modal ID
     * @returns {boolean} Open status
     */
    isOpen(id) {
        const modal = this.modals.get(id);
        return modal ? modal.classList.contains('active') : false;
    }

    /**
     * Get active modal ID
     * @returns {string|null} Active modal ID
     */
    getActiveModal() {
        return this.activeModal;
    }

    /**
     * Close all modals
     */
    closeAll() {
        this.modals.forEach((modal, id) => {
            this.close(id);
        });
    }

    /**
     * Setup global listeners
     */
    setupGlobalListeners() {
        // Auto-register modals when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.autoRegisterModals();
            });
        } else {
            this.autoRegisterModals();
        }
    }

    /**
     * Auto-register existing modals
     */
    autoRegisterModals() {
        const modalElements = DOMUtils.queryAll('.modal');
        modalElements.forEach(modal => {
            const id = modal.id || `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            if (!modal.id) {
                modal.id = id;
            }
            this.registerModal(id, modal);
        });
    }

    /**
     * Create and show a simple alert modal
     * @param {string} message - Alert message
     * @param {string} title - Alert title
     * @param {Function} callback - Callback function
     */
    alert(message, title = 'Alert', callback = null) {
        const modalId = 'alert_modal';
        let modal = this.modals.get(modalId);
        
        if (!modal) {
            modal = this.createAlertModal();
            this.registerModal(modalId, modal);
        }
        
        this.show(modalId, {
            title,
            content: `
                <div class="form-group">
                    <p>${message}</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" id="alertOkBtn">OK</button>
                </div>
            `
        });
        
        // Handle OK button
        const okBtn = modal.querySelector('#alertOkBtn');
        if (okBtn) {
            const handleOk = () => {
                this.close(modalId);
                if (callback) callback();
            };
            
            // Remove existing listeners
            const newOkBtn = okBtn.cloneNode(true);
            okBtn.parentNode.replaceChild(newOkBtn, okBtn);
            
            DOMUtils.addEventListener(newOkBtn, 'click', handleOk);
        }
    }

    /**
     * Create and show a confirm modal
     * @param {string} message - Confirm message
     * @param {string} title - Confirm title
     * @param {Function} callback - Callback function (result: boolean)
     */
    confirm(message, title = 'Confirm', callback = null) {
        const modalId = 'confirm_modal';
        let modal = this.modals.get(modalId);
        
        if (!modal) {
            modal = this.createConfirmModal();
            this.registerModal(modalId, modal);
        }
        
        this.show(modalId, {
            title,
            content: `
                <div class="form-group">
                    <p>${message}</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" id="confirmCancelBtn">Cancel</button>
                    <button class="btn btn-primary" id="confirmOkBtn">OK</button>
                </div>
            `
        });
        
        // Handle buttons
        const okBtn = modal.querySelector('#confirmOkBtn');
        const cancelBtn = modal.querySelector('#confirmCancelBtn');
        
        if (okBtn && cancelBtn) {
            const handleOk = () => {
                this.close(modalId);
                if (callback) callback(true);
            };
            
            const handleCancel = () => {
                this.close(modalId);
                if (callback) callback(false);
            };
            
            // Remove existing listeners
            const newOkBtn = okBtn.cloneNode(true);
            const newCancelBtn = cancelBtn.cloneNode(true);
            okBtn.parentNode.replaceChild(newOkBtn, okBtn);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            
            DOMUtils.addEventListener(newOkBtn, 'click', handleOk);
            DOMUtils.addEventListener(newCancelBtn, 'click', handleCancel);
        }
    }

    /**
     * Create alert modal element
     * @returns {Element} Modal element
     */
    createAlertModal() {
        const modal = DOMUtils.createElement('div', {
            className: 'modal',
            id: 'alert_modal'
        }, `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">Alert</div>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <!-- Content will be inserted here -->
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
        return modal;
    }

    /**
     * Create confirm modal element
     * @returns {Element} Modal element
     */
    createConfirmModal() {
        const modal = DOMUtils.createElement('div', {
            className: 'modal',
            id: 'confirm_modal'
        }, `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">Confirm</div>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <!-- Content will be inserted here -->
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
        return modal;
    }

    /**
     * Destroy modal manager
     */
    destroy() {
        this.closeAll();
        this.removeAllListeners();
        this.modals.clear();
    }
}