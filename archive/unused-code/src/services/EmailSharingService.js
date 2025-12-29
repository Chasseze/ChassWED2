/**
 * Email Sharing Service
 */
import { EventEmitter } from '../utils/EventEmitter.js';

export class EmailSharingService extends EventEmitter {
    constructor(editor) {
        super();
        
        this.editor = editor;
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize email sharing service
     */
    initialize() {
        // Setup service
    }
    
    /**
     * Share document via email
     * @param {Object} options - Email options
     */
    async shareViaEmail(options = {}) {
        const {
            to = '',
            subject = '',
            message = '',
            format = 'html'
        } = options;
        
        if (!to) {
            this.showEmailDialog();
            return;
        }
        
        try {
            const currentDocument = this.editor.documentManager.getCurrentDocument();
            if (!currentDocument) {
                throw new Error('No document to share');
            }
            
            // Prepare email content
            const emailData = await this.prepareEmailData(currentDocument, {
                to,
                subject: subject || `Document: ${currentDocument.name}`,
                message,
                format
            });
            
            // Send email
            await this.sendEmail(emailData);
            
            this.emit('emailShared', { to, subject, documentId: currentDocument.id });
            
        } catch (error) {
            console.error('Failed to share via email:', error);
            this.emit('emailShareError', { error });
        }
    }
    
    /**
     * Show email sharing dialog
     */
    showEmailDialog() {
        const currentDocument = this.editor.documentManager.getCurrentDocument();
        if (!currentDocument) {
            alert('No document to share');
            return;
        }
        
        const dialog = document.createElement('div');
        dialog.className = 'modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-envelope"></i> Share via Email</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="emailShareForm">
                        <div class="form-group">
                            <label for="emailTo">To: *</label>
                            <input type="email" id="emailTo" required class="form-input" placeholder="recipient@example.com" multiple>
                            <small>Enter multiple emails separated by commas</small>
                        </div>
                        <div class="form-group">
                            <label for="emailSubject">Subject:</label>
                            <input type="text" id="emailSubject" class="form-input" value="Document: ${currentDocument.name}">
                        </div>
                        <div class="form-group">
                            <label for="emailMessage">Message:</label>
                            <textarea id="emailMessage" rows="4" class="form-textarea" placeholder="Add a message (optional)">Hi,

I wanted to share this document with you: ${currentDocument.name}

Best regards</textarea>
                        </div>
                        <div class="form-group">
                            <label>Format:</label>
                            <div class="radio-group">
                                <label>
                                    <input type="radio" name="emailFormat" value="html" checked>
                                    HTML (formatted)
                                </label>
                                <label>
                                    <input type="radio" name="emailFormat" value="text">
                                    Plain Text
                                </label>
                                <label>
                                    <input type="radio" name="emailFormat" value="pdf">
                                    PDF Attachment
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="includeLink" checked>
                                Include editable link
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="cancelEmailBtn">Cancel</button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-paper-plane"></i> Send Email
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        dialog.classList.add('visible');
        
        // Add event handlers
        const form = document.getElementById('emailShareForm');
        const closeBtn = dialog.querySelector('.modal-close');
        const cancelBtn = document.getElementById('cancelEmailBtn');
        
        const closeDialog = () => {
            dialog.remove();
        };
        
        closeBtn.addEventListener('click', closeDialog);
        cancelBtn.addEventListener('click', closeDialog);
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) closeDialog();
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const options = {
                to: document.getElementById('emailTo').value,
                subject: document.getElementById('emailSubject').value,
                message: document.getElementById('emailMessage').value,
                format: document.querySelector('input[name="emailFormat"]:checked').value,
                includeLink: document.getElementById('includeLink').checked
            };
            
            // Disable form during sending
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            try {
                await this.shareViaEmail(options);
                closeDialog();
                this.showSuccessMessage('Email sent successfully!');
            } catch (error) {
                console.error('Failed to send email:', error);
                this.showErrorMessage('Failed to send email. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Email';
            }
        });
    }
    
    /**
     * Prepare email data
     * @param {Object} document - Document to share
     * @param {Object} options - Email options
     * @returns {Object} Email data
     */
    async prepareEmailData(document, options) {
        const { to, subject, message, format, includeLink } = options;
        
        let emailBody = message;
        let attachments = [];
        
        // Add document content based on format
        if (format === 'html') {
            emailBody += `\n\n--- Document Content ---\n${document.content}`;
        } else if (format === 'text') {
            // Strip HTML tags for plain text
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = document.content;
            emailBody += `\n\n--- Document Content ---\n${tempDiv.textContent || tempDiv.innerText || ''}`;
        } else if (format === 'pdf') {
            // Generate PDF attachment
            try {
                const pdfBlob = await this.generatePDF(document);
                attachments.push({
                    filename: `${document.name}.pdf`,
                    content: pdfBlob,
                    type: 'application/pdf'
                });
            } catch (error) {
                console.error('Failed to generate PDF:', error);
            }
        }
        
        // Add editable link if requested
        if (includeLink) {
            const shareableLink = this.generateShareableLink(document.id);
            emailBody += `\n\n--- Editable Link ---\nYou can edit this document here: ${shareableLink}`;
        }
        
        return {
            to: to.split(',').map(email => email.trim()),
            subject,
            body: emailBody,
            attachments
        };
    }
    
    /**
     * Send email
     * @param {Object} emailData - Email data
     */
    async sendEmail(emailData) {
        // For client-side email sending, we'll use mailto protocol
        // In a real application, this would integrate with an email service API
        
        const { to, subject, body, attachments } = emailData;
        
        if (attachments.length === 0) {
            // Use mailto for simple text emails
            const mailtoUrl = `mailto:${encodeURIComponent(to.join(','))}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.open(mailtoUrl, '_blank');
        } else {
            // For attachments, we need a server-side service
            // For demo, we'll show instructions
            alert(`Email with attachments requires server-side integration.\n\nTo: ${to.join(', ')}\nSubject: ${subject}\n\nPlease implement server-side email service for attachment support.`);
        }
    }
    
    /**
     * Generate PDF from document
     * @param {Object} document - Document
     * @returns {Promise<Blob>} PDF blob
     */
    async generatePDF(document) {
        return new Promise((resolve, reject) => {
            try {
                // Use browser's print functionality for PDF generation
                const printWindow = window.open('', '_blank');
                
                const htmlContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${document.name}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            @media print { body { margin: 0; } }
                        </style>
                    </head>
                    <body>
                        ${document.content}
                    </body>
                    </html>
                `;
                
                printWindow.document.open();
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                
                // Trigger print dialog
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                    resolve(new Blob()); // Placeholder
                }, 500);
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Generate shareable link
     * @param {string} documentId - Document ID
     * @returns {string} Shareable link
     */
    generateShareableLink(documentId) {
        const baseUrl = window.location.origin;
        return `${baseUrl}?doc=${documentId}&share=true`;
    }
    
    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        toast.classList.add('visible');
        
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    showErrorMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        toast.classList.add('visible');
        
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    /**
     * Get share statistics
     * @returns {Object} Share statistics
     */
    getShareStatistics() {
        const sharedEmails = JSON.parse(localStorage.getItem('shared_emails') || '[]');
        return {
            totalShared: sharedEmails.length,
            recentShares: sharedEmails.slice(-5)
        };
    }
    
    /**
     * Record share
     * @param {Object} shareData - Share data
     */
    recordShare(shareData) {
        const sharedEmails = JSON.parse(localStorage.getItem('shared_emails') || '[]');
        sharedEmails.push({
            ...shareData,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('shared_emails', JSON.stringify(sharedEmails));
    }
    
    /**
     * Destroy service
     */
    destroy() {
        this.removeAllListeners();
        this.emit('destroyed');
    }
}