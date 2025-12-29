/**
 * Document Templates Service
 */
import { EventEmitter } from '../utils/EventEmitter.js';

export class TemplatesService extends EventEmitter {
    constructor() {
        super();
        
        // Built-in templates
        this.templates = new Map();
        
        // User custom templates
        this.customTemplates = new Map();
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize templates service
     */
    initialize() {
        this.loadBuiltInTemplates();
        this.loadCustomTemplates();
    }
    
    /**
     * Load built-in templates
     */
    loadBuiltInTemplates() {
        // Business Letter Template
        this.templates.set('business-letter', {
            id: 'business-letter',
            name: 'Business Letter',
            category: 'Business',
            description: 'Professional business letter format',
            icon: 'fa-envelope',
            content: `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                    <div style="text-align: right; margin-bottom: 40px;">
                        <p><strong>Your Name</strong></p>
                        <p>Your Address</p>
                        <p>City, State ZIP</p>
                        <p>Your Email</p>
                        <p>Your Phone</p>
                        <p style="margin-top: 20px;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <div style="margin-bottom: 40px;">
                        <p><strong>Recipient Name</strong></p>
                        <p>Recipient Title</p>
                        <p>Company Name</p>
                        <p>Company Address</p>
                        <p>City, State ZIP</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <p><strong>Subject:</strong> [Enter subject here]</p>
                    </div>
                    
                    <div style="line-height: 1.6;">
                        <p>Dear [Recipient Name],</p>
                        <br>
                        <p>[Start your letter here. Introduce yourself and state the purpose of your letter.]</p>
                        <br>
                        <p>[Provide additional details and information in the body of your letter.]</p>
                        <br>
                        <p>[Conclude your letter with a call to action or next steps.]</p>
                        <br>
                        <p>Sincerely,</p>
                        <br>
                        <p>[Your Signature]</p>
                        <p>[Your Typed Name]</p>
                    </div>
                </div>
            `
        });
        
        // Resume Template
        this.templates.set('resume', {
            id: 'resume',
            name: 'Resume',
            category: 'Career',
            description: 'Professional resume template',
            icon: 'fa-file-alt',
            content: `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <header style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
                        <h1 style="margin: 0; font-size: 28px;">[Your Name]</h1>
                        <p style="margin: 5px 0;">[Your Address] | [City, State ZIP] | [Your Email] | [Your Phone]</p>
                        <p style="margin: 5px 0;">[LinkedIn Profile URL] | [Portfolio URL]</p>
                    </header>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Professional Summary</h2>
                        <p style="line-height: 1.5;">[Write a 2-3 sentence summary of your professional experience and key skills]</p>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Work Experience</h2>
                        <div style="margin-bottom: 20px;">
                            <h3 style="margin: 0;">[Job Title]</h3>
                            <p style="margin: 0; font-style: italic;">[Company Name] | [City, State] | [Start Date] - [End Date]</p>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>[Achievement or responsibility 1]</li>
                                <li>[Achievement or responsibility 2]</li>
                                <li>[Achievement or responsibility 3]</li>
                            </ul>
                        </div>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Education</h2>
                        <div>
                            <h3 style="margin: 0;">[Degree Name]</h3>
                            <p style="margin: 0; font-style: italic;">[University Name] | [City, State] | [Graduation Year]</p>
                            <p style="margin: 10px 0;">[GPA if applicable, relevant coursework, honors]</p>
                        </div>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Skills</h2>
                        <div>
                            <h4 style="margin: 10px 0 5px 0;">Technical Skills:</h4>
                            <p>[Skill 1], [Skill 2], [Skill 3], [Skill 4]</p>
                            <h4 style="margin: 10px 0 5px 0;">Soft Skills:</h4>
                            <p>[Skill 1], [Skill 2], [Skill 3], [Skill 4]</p>
                        </div>
                    </section>
                </div>
            `
        });
        
        // Meeting Minutes Template
        this.templates.set('meeting-minutes', {
            id: 'meeting-minutes',
            name: 'Meeting Minutes',
            category: 'Business',
            description: 'Structured meeting minutes template',
            icon: 'fa-users',
            content: `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <header style="text-align: center; margin-bottom: 30px;">
                        <h1 style="margin: 0;">Meeting Minutes</h1>
                        <p style="margin: 5px 0;">[Meeting Title/Project Name]</p>
                    </header>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Meeting Information</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px; font-weight: bold; width: 150px;">Date:</td>
                                <td style="padding: 8px;">[Meeting Date]</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; font-weight: bold;">Time:</td>
                                <td style="padding: 8px;">[Start Time] - [End Time]</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; font-weight: bold;">Location:</td>
                                <td style="padding: 8px;">[Meeting Location/Virtual Platform]</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; font-weight: bold;">Called by:</td>
                                <td style="padding: 8px;">[Meeting Organizer]</td>
                            </tr>
                        </table>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Attendees</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ccc;">Name</th>
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ccc;">Role/Department</th>
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ccc;">Present</th>
                            </tr>
                            <tr>
                                <td style="padding: 8px;">[Name 1]</td>
                                <td style="padding: 8px;">[Role]</td>
                                <td style="padding: 8px;">✓</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px;">[Name 2]</td>
                                <td style="padding: 8px;">[Role]</td>
                                <td style="padding: 8px;">✓</td>
                            </tr>
                        </table>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Agenda</h2>
                        <ol style="padding-left: 20px;">
                            <li style="margin-bottom: 10px;">[Agenda Item 1]</li>
                            <li style="margin-bottom: 10px;">[Agenda Item 2]</li>
                            <li style="margin-bottom: 10px;">[Agenda Item 3]</li>
                        </ol>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Discussion & Decisions</h2>
                        <div style="margin-bottom: 20px;">
                            <h3 style="margin: 0;">[Agenda Item 1]</h3>
                            <p style="margin: 10px 0; line-height: 1.5;">[Summary of discussion and key points]</p>
                            <p><strong>Decision:</strong> [Decision made, if any]</p>
                        </div>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Action Items</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ccc;">Action</th>
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ccc;">Responsible</th>
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ccc;">Due Date</th>
                            </tr>
                            <tr>
                                <td style="padding: 8px;">[Action item 1]</td>
                                <td style="padding: 8px;">[Person responsible]</td>
                                <td style="padding: 8px;">[Due date]</td>
                            </tr>
                        </table>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Next Meeting</h2>
                        <p><strong>Date:</strong> [Next meeting date]</p>
                        <p><strong>Time:</strong> [Next meeting time]</p>
                        <p><strong>Location:</strong> [Next meeting location]</p>
                    </section>
                </div>
            `
        });
        
        // Sales Invoice Template
        this.templates.set('sales-invoice', {
            id: 'sales-invoice',
            name: 'Sales Invoice',
            category: 'Business',
            description: 'Professional sales invoice template',
            icon: 'fa-file-invoice',
            content: `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <header style="margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <h1 style="margin: 0; font-size: 28px; color: #333;">INVOICE</h1>
                                <p style="margin: 5px 0; font-size: 14px; color: #666;">Invoice #: [Invoice Number]</p>
                            </div>
                            <div style="text-align: right;">
                                <p style="margin: 0; font-weight: bold;">[Your Company Name]</p>
                                <p style="margin: 2px 0; font-size: 14px;">[Your Address]</p>
                                <p style="margin: 2px 0; font-size: 14px;">[City, State ZIP]</p>
                                <p style="margin: 2px 0; font-size: 14px;">[Your Phone]</p>
                                <p style="margin: 2px 0; font-size: 14px;">[Your Email]</p>
                            </div>
                        </div>
                    </header>
                    
                    <section style="margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                            <div style="width: 48%;">
                                <h3 style="margin: 0 0 10px 0; color: #333;">Bill To:</h3>
                                <p style="margin: 2px 0; font-size: 14px;">[Client Name]</p>
                                <p style="margin: 2px 0; font-size: 14px;">[Client Company]</p>
                                <p style="margin: 2px 0; font-size: 14px;">[Client Address]</p>
                                <p style="margin: 2px 0; font-size: 14px;">[City, State ZIP]</p>
                            </div>
                            <div style="width: 48%; text-align: right;">
                                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                                <p style="margin: 5px 0;"><strong>Due Date:</strong> [Due Date]</p>
                                <p style="margin: 5px 0;"><strong>P.O. #:</strong> [Purchase Order]</p>
                            </div>
                        </div>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f5f5f5; border-bottom: 2px solid #333;">
                                    <th style="padding: 12px; text-align: left; font-weight: bold;">Item/Description</th>
                                    <th style="padding: 12px; text-align: center; font-weight: bold;">Quantity</th>
                                    <th style="padding: 12px; text-align: right; font-weight: bold;">Unit Price</th>
                                    <th style="padding: 12px; text-align: right; font-weight: bold;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom: 1px solid #ddd;">
                                    <td style="padding: 12px;">[Product/Service Description]</td>
                                    <td style="padding: 12px; text-align: center;">[Qty]</td>
                                    <td style="padding: 12px; text-align: right;">$[Price]</td>
                                    <td style="padding: 12px; text-align: right;">$[Total]</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #ddd;">
                                    <td style="padding: 12px;">[Product/Service Description]</td>
                                    <td style="padding: 12px; text-align: center;">[Qty]</td>
                                    <td style="padding: 12px; text-align: right;">$[Price]</td>
                                    <td style="padding: 12px; text-align: right;">$[Total]</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <div style="display: flex; justify-content: flex-end;">
                            <div style="width: 300px;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px; text-align: right;">Subtotal:</td>
                                        <td style="padding: 8px; text-align: right;">$[Subtotal]</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px; text-align: right;">Tax ([Tax Rate]%):</td>
                                        <td style="padding: 8px; text-align: right;">$[Tax Amount]</td>
                                    </tr>
                                    <tr style="border-top: 2px solid #333; font-weight: bold;">
                                        <td style="padding: 12px 8px; text-align: right;">TOTAL:</td>
                                        <td style="padding: 12px 8px; text-align: right; font-size: 18px;">$[Grand Total]</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h3 style="margin: 0 0 10px 0; color: #333;">Notes</h3>
                        <p style="font-size: 14px; line-height: 1.5;">[Payment terms, late fees, or other important information]</p>
                    </section>
                    
                    <section style="margin-bottom: 20px;">
                        <h3 style="margin: 0 0 10px 0; color: #333;">Payment Instructions</h3>
                        <p style="font-size: 14px; line-height: 1.5;">Please make payment to: [Bank Name], Account #: [Account Number]</p>
                        <p style="font-size: 14px; line-height: 1.5;">Thank you for your business!</p>
                    </section>
                </div>
            `
        });
        
        // Sales Receipt Template
        this.templates.set('sales-receipt', {
            id: 'sales-receipt',
            name: 'Sales Receipt',
            category: 'Business',
            description: 'Sales receipt template for completed transactions',
            icon: 'fa-receipt',
            content: `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <header style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
                        <h1 style="margin: 0; font-size: 28px; color: #333;">SALES RECEIPT</h1>
                        <p style="margin: 5px 0; font-size: 14px; color: #666;">Receipt #: [Receipt Number]</p>
                        <p style="margin: 5px 0; font-size: 14px; color: #666;">Date: ${new Date().toLocaleDateString()}</p>
                    </header>
                    
                    <section style="margin-bottom: 30px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <p style="margin: 0; font-weight: bold; font-size: 16px;">[Your Company Name]</p>
                            <p style="margin: 2px 0; font-size: 14px;">[Your Address]</p>
                            <p style="margin: 2px 0; font-size: 14px;">[City, State ZIP]</p>
                            <p style="margin: 2px 0; font-size: 14px;">[Your Phone]</p>
                            <p style="margin: 2px 0; font-size: 14px;">[Your Email]</p>
                        </div>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                            <div style="width: 48%;">
                                <h3 style="margin: 0 0 10px 0; color: #333;">Sold To:</h3>
                                <p style="margin: 2px 0; font-size: 14px;">[Customer Name]</p>
                                <p style="margin: 2px 0; font-size: 14px;">[Customer Address]</p>
                                <p style="margin: 2px 0; font-size: 14px;">[City, State ZIP]</p>
                            </div>
                            <div style="width: 48%; text-align: right;">
                                <p style="margin: 5px 0;"><strong>Payment Method:</strong> [Cash/Card/Check]</p>
                                <p style="margin: 5px 0;"><strong>Transaction ID:</strong> [Transaction ID]</p>
                                <p style="margin: 5px 0;"><strong>Salesperson:</strong> [Salesperson Name]</p>
                            </div>
                        </div>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f5f5f5; border-bottom: 2px solid #333;">
                                    <th style="padding: 12px; text-align: left; font-weight: bold;">Item/Description</th>
                                    <th style="padding: 12px; text-align: center; font-weight: bold;">Qty</th>
                                    <th style="padding: 12px; text-align: right; font-weight: bold;">Unit Price</th>
                                    <th style="padding: 12px; text-align: right; font-weight: bold;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom: 1px solid #ddd;">
                                    <td style="padding: 12px;">[Item Description]</td>
                                    <td style="padding: 12px; text-align: center;">[Qty]</td>
                                    <td style="padding: 12px; text-align: right;">$[Price]</td>
                                    <td style="padding: 12px; text-align: right;">$[Total]</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #ddd;">
                                    <td style="padding: 12px;">[Item Description]</td>
                                    <td style="padding: 12px; text-align: center;">[Qty]</td>
                                    <td style="padding: 12px; text-align: right;">$[Price]</td>
                                    <td style="padding: 12px; text-align: right;">$[Total]</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <div style="display: flex; justify-content: flex-end;">
                            <div style="width: 300px;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px; text-align: right;">Subtotal:</td>
                                        <td style="padding: 8px; text-align: right;">$[Subtotal]</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px; text-align: right;">Tax:</td>
                                        <td style="padding: 8px; text-align: right;">$[Tax]</td>
                                    </tr>
                                    <tr style="border-top: 2px solid #333; font-weight: bold;">
                                        <td style="padding: 12px 8px; text-align: right;">TOTAL PAID:</td>
                                        <td style="padding: 12px 8px; text-align: right; font-size: 18px;">$[Total]</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <div style="text-align: center;">
                            <p style="font-size: 14px; font-weight: bold;">PAYMENT RECEIVED - THANK YOU!</p>
                            <p style="font-size: 12px; margin: 10px 0;">This serves as your official receipt for this transaction.</p>
                            <p style="font-size: 12px;">Please keep for your records.</p>
                        </div>
                    </section>
                    
                    <section style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
                            <div style="width: 45%; text-align: center;">
                                <div style="border-top: 1px solid #333; padding-top: 5px;">
                                    <p style="font-size: 12px; margin: 0;">Customer Signature</p>
                                </div>
                            </div>
                            <div style="width: 45%; text-align: center;">
                                <div style="border-top: 1px solid #333; padding-top: 5px;">
                                    <p style="font-size: 12px; margin: 0;">Authorized Signature</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            `
        });
        
        // Memo Reminder Template
        this.templates.set('memo-reminder', {
            id: 'memo-reminder',
            name: 'Memo Reminder',
            category: 'Business',
            description: 'Internal memo and reminder template',
            icon: 'fa-sticky-note',
            content: `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <header style="margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h1 style="margin: 0; font-size: 32px; color: #333; text-transform: uppercase;">MEMORANDUM</h1>
                            <div style="text-align: right;">
                                <p style="margin: 0; font-weight: bold; color: #d32f2f; font-size: 18px;">REMINDER</p>
                                <p style="margin: 5px 0; font-size: 14px;">Priority: [High/Medium/Low]</p>
                            </div>
                        </div>
                    </header>
                    
                    <section style="margin-bottom: 30px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px; font-weight: bold; width: 120px; background: #f5f5f5;">TO:</td>
                                <td style="padding: 8px;">[Recipient Name/Department]</td>
                                <td style="padding: 8px; font-weight: bold; width: 120px; background: #f5f5f5;">DATE:</td>
                                <td style="padding: 8px;">${new Date().toLocaleDateString()}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">FROM:</td>
                                <td style="padding: 8px;">[Your Name/Department]</td>
                                <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">DUE BY:</td>
                                <td style="padding: 8px; color: #d32f2f; font-weight: bold;">[Due Date/Time]</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">SUBJECT:</td>
                                <td colspan="3" style="padding: 8px; font-weight: bold; color: #333;">[Memo Subject - Action Required]</td>
                            </tr>
                        </table>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-left: 4px solid #f39c12; padding: 15px; margin-bottom: 20px;">
                            <h3 style="margin: 0 0 10px 0; color: #856404; display: flex; align-items: center;">
                                <span style="font-size: 20px; margin-right: 10px;">⚠️</span>
                                REMINDER NOTICE
                            </h3>
                            <p style="margin: 0; line-height: 1.5; color: #856404;">This is a reminder regarding the following item(s) that require your attention. Please review and take appropriate action by the specified deadline.</p>
                        </div>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 15px;">Background/Context</h2>
                        <p style="line-height: 1.6; margin-bottom: 15px;">[Provide background information about why this reminder is necessary. Include any relevant context, previous communications, or history related to this matter.]</p>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 15px;">Action Required</h2>
                        <div style="background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; margin-bottom: 15px;">
                            <ol style="margin: 0; padding-left: 20px;">
                                <li style="margin-bottom: 10px;"><strong>[Action Item 1]</strong> - [Specific details and requirements]</li>
                                <li style="margin-bottom: 10px;"><strong>[Action Item 2]</strong> - [Specific details and requirements]</li>
                                <li style="margin-bottom: 10px;"><strong>[Action Item 3]</strong> - [Specific details and requirements]</li>
                            </ol>
                        </div>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 15px;">Important Details</h2>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                            <tr>
                                <td style="padding: 10px; font-weight: bold; width: 150px; background: #f5f5f5;">Reference #:</td>
                                <td style="padding: 10px;">[Reference Number]</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-weight: bold; background: #f5f5f5;">Project/Case:</td>
                                <td style="padding: 10px;">[Project or Case Name]</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-weight: bold; background: #f5f5f5;">Contact Person:</td>
                                <td style="padding: 10px;">[Contact Name and Information]</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-weight: bold; background: #f5f5f5;">Location:</td>
                                <td style="padding: 10px;">[Location or Meeting Room]</td>
                            </tr>
                        </table>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 15px;">Consequences of Non-Compliance</h2>
                        <p style="line-height: 1.6; color: #d32f2f; font-weight: 500;">[Clearly state what will happen if the required action is not taken by the deadline. Include any penalties, delays, or impacts.]</p>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 15px;">Support/Resources</h2>
                        <p style="line-height: 1.6;">[Information about where to get help, resources available, or who to contact with questions.]</p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Help Desk: [Phone Number/Email]</li>
                            <li>Documentation: [Link or Location]</li>
                            <li>Training: [Schedule or Contact]</li>
                        </ul>
                    </section>
                    
                    <section style="margin-bottom: 20px;">
                        <div style="background: #e8f5e8; border: 1px solid #c8e6c9; padding: 15px;">
                            <p style="margin: 0; font-weight: bold; color: #2e7d32;">Please confirm receipt of this reminder and acknowledge the required actions.</p>
                        </div>
                    </section>
                    
                    <footer style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px;">
                        <div style="display: flex; justify-content: space-between;">
                            <div>
                                <p style="margin: 0; font-size: 12px;">This memorandum is confidential and intended solely for the addressee.</p>
                            </div>
                            <div style="text-align: right;">
                                <p style="margin: 0; font-size: 12px;">[Your Name/Department]</p>
                                <p style="margin: 0; font-size: 12px;">[Your Title]</p>
                                <p style="margin: 0; font-size: 12px;">[Your Contact Information]</p>
                            </div>
                        </div>
                    </footer>
                </div>
            `
        });
        
        // Essay Template
        this.templates.set('essay', {
            id: 'essay',
            name: 'Essay',
            category: 'Academic',
            description: 'Five-paragraph essay structure',
            icon: 'fa-graduation-cap',
            content: `
                <div style="font-family: Times New Roman, serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6;">
                    <header style="text-align: center; margin-bottom: 40px;">
                        <h1 style="margin: 0; font-size: 24px;">[Essay Title]</h1>
                        <p style="margin: 20px 0 0 0;">[Your Name]</p>
                        <p style="margin: 5px 0;">[Course Name]</p>
                        <p style="margin: 5px 0;">[Instructor Name]</p>
                        <p style="margin: 5px 0;">[Date]</p>
                    </header>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="font-size: 20px; margin-bottom: 15px;">Introduction</h2>
                        <p>[Start with a hook to grab the reader's attention. This could be a surprising fact, a question, or a brief story.]</p>
                        <p>[Provide background information on your topic to help the reader understand the context.]</p>
                        <p>[End with your thesis statement - the main argument or point of your essay.]</p>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="font-size: 20px; margin-bottom: 15px;">Body Paragraph 1</h2>
                        <p>[Start with a topic sentence that introduces your first main point supporting the thesis.]</p>
                        <p>[Provide evidence, examples, or explanations to support your point.]</p>
                        <p>[Include analysis of how your evidence supports your thesis.]</p>
                        <p>[End with a transition sentence to the next paragraph.]</p>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="font-size: 20px; margin-bottom: 15px;">Body Paragraph 2</h2>
                        <p>[Start with a topic sentence that introduces your second main point supporting the thesis.]</p>
                        <p>[Provide evidence, examples, or explanations to support your point.]</p>
                        <p>[Include analysis of how your evidence supports your thesis.]</p>
                        <p>[End with a transition sentence to the next paragraph.]</p>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="font-size: 20px; margin-bottom: 15px;">Body Paragraph 3</h2>
                        <p>[Start with a topic sentence that introduces your third main point supporting the thesis.]</p>
                        <p>[Provide evidence, examples, or explanations to support your point.]</p>
                        <p>[Include analysis of how your evidence supports your thesis.]</p>
                        <p>[End with a transition sentence to the conclusion.]</p>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="font-size: 20px; margin-bottom: 15px;">Conclusion</h2>
                        <p>[Restate your thesis in a new way, reminding the reader of your main argument.]</p>
                        <p>[Summarize your main points from the body paragraphs.]</p>
                        <p>[End with a final thought, call to action, or implication of your argument.]</p>
                    </section>
                </div>
            `
        });
        
        // Project Proposal Template
        this.templates.set('project-proposal', {
            id: 'project-proposal',
            name: 'Project Proposal',
            category: 'Business',
            description: 'Comprehensive project proposal template',
            icon: 'fa-clipboard-list',
            content: `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <header style="text-align: center; margin-bottom: 40px;">
                        <h1 style="margin: 0; font-size: 28px; color: #333;">Project Proposal</h1>
                        <h2 style="margin: 10px 0; font-size: 22px; color: #666;">[Project Name]</h2>
                        <p style="margin: 5px 0;">Prepared by: [Your Name/Team]</p>
                        <p style="margin: 5px 0;">Date: ${new Date().toLocaleDateString()}</p>
                    </header>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 5px;">Executive Summary</h2>
                        <p style="line-height: 1.6;">[Provide a concise overview of the entire proposal. Include the problem, solution, expected outcomes, and requested resources. This should be written last but placed first.]</p>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 5px;">Problem Statement</h2>
                        <p style="line-height: 1.6;">[Clearly describe the problem or opportunity that this project addresses. Include relevant data, context, and why this problem needs to be solved.]</p>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 5px;">Project Goals & Objectives</h2>
                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #666;">Primary Goal:</h3>
                            <p>[State the main goal of the project]</p>
                        </div>
                        <div>
                            <h3 style="color: #666;">Specific Objectives:</h3>
                            <ul style="padding-left: 20px;">
                                <li>[Objective 1 - make it SMART: Specific, Measurable, Achievable, Relevant, Time-bound]</li>
                                <li>[Objective 2]</li>
                                <li>[Objective 3]</li>
                            </ul>
                        </div>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 5px;">Methodology & Approach</h2>
                        <p style="line-height: 1.6;">[Describe how you plan to achieve the project goals. Include the methods, tools, and approaches you will use.]</p>
                        <div style="margin-top: 20px;">
                            <h3 style="color: #666;">Project Phases:</h3>
                            <ol style="padding-left: 20px;">
                                <li><strong>Phase 1:</strong> [Description of first phase]</li>
                                <li><strong>Phase 2:</strong> [Description of second phase]</li>
                                <li><strong>Phase 3:</strong> [Description of third phase]</li>
                            </ol>
                        </div>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 5px;">Timeline & Milestones</h2>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                            <tr>
                                <th style="padding: 10px; text-align: left; border: 1px solid #ddd; background: #f5f5f5;">Milestone</th>
                                <th style="padding: 10px; text-align: left; border: 1px solid #ddd; background: #f5f5f5;">Target Date</th>
                                <th style="padding: 10px; text-align: left; border: 1px solid #ddd; background: #f5f5f5;">Deliverable</th>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">[Milestone 1]</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">[Date]</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">[Deliverable]</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">[Milestone 2]</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">[Date]</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">[Deliverable]</td>
                            </tr>
                        </table>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 5px;">Budget & Resources</h2>
                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #666;">Required Resources:</h3>
                            <ul style="padding-left: 20px;">
                                <li>[Personnel/Team members needed]</li>
                                <li>[Equipment and tools]</li>
                                <li>[Software or technology]</li>
                                <li>[Other resources]</li>
                            </ul>
                        </div>
                        <div>
                            <h3 style="color: #666;">Budget Breakdown:</h3>
                            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                                <tr>
                                    <th style="padding: 8px; text-align: left; border: 1px solid #ddd; background: #f5f5f5;">Category</th>
                                    <th style="padding: 8px; text-align: right; border: 1px solid #ddd; background: #f5f5f5;">Amount</th>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; border: 1px solid #ddd;">[Category 1]</td>
                                    <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">$[Amount]</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total</strong></td>
                                    <td style="padding: 8px; text-align: right; border: 1px solid #ddd;"><strong>$[Total]</strong></td>
                                </tr>
                            </table>
                        </div>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 5px;">Risk Assessment</h2>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                            <tr>
                                <th style="padding: 10px; text-align: left; border: 1px solid #ddd; background: #f5f5f5;">Risk</th>
                                <th style="padding: 10px; text-align: left; border: 1px solid #ddd; background: #f5f5f5;">Probability</th>
                                <th style="padding: 10px; text-align: left; border: 1px solid #ddd; background: #f5f5f5;">Impact</th>
                                <th style="padding: 10px; text-align: left; border: 1px solid #ddd; background: #f5f5f5;">Mitigation Strategy</th>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">[Risk 1]</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">[High/Medium/Low]</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">[High/Medium/Low]</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">[Strategy]</td>
                            </tr>
                        </table>
                    </section>
                    
                    <section style="margin-bottom: 30px;">
                        <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 5px;">Success Criteria</h2>
                        <p style="line-height: 1.6;">[Define how you will measure the success of this project. Include specific metrics and outcomes.]</p>
                        <ul style="padding-left: 20px; margin-top: 15px;">
                            <li>[Success criterion 1 with measurable metric]</li>
                            <li>[Success criterion 2 with measurable metric]</li>
                            <li>[Success criterion 3 with measurable metric]</li>
                        </ul>
                    </section>
                </div>
            `
        });
    }
    
    /**
     * Load custom templates from storage
     */
    loadCustomTemplates() {
        const saved = localStorage.getItem('custom_templates');
        if (saved) {
            try {
                const templates = JSON.parse(saved);
                templates.forEach(template => {
                    this.customTemplates.set(template.id, template);
                });
            } catch (error) {
                console.error('Failed to load custom templates:', error);
            }
        }
    }
    
    /**
     * Save custom templates to storage
     */
    saveCustomTemplates() {
        const templates = Array.from(this.customTemplates.values());
        localStorage.setItem('custom_templates', JSON.stringify(templates));
    }
    
    /**
     * Get all templates
     * @returns {Array} All templates
     */
    getAllTemplates() {
        const builtIn = Array.from(this.templates.values());
        const custom = Array.from(this.customTemplates.values());
        return [...builtIn, ...custom];
    }
    
    /**
     * Get template by ID
     * @param {string} id - Template ID
     * @returns {Object|null} Template
     */
    getTemplate(id) {
        return this.templates.get(id) || this.customTemplates.get(id) || null;
    }
    
    /**
     * Get templates by category
     * @param {string} category - Category name
     * @returns {Array} Templates in category
     */
    getTemplatesByCategory(category) {
        return this.getAllTemplates().filter(template => template.category === category);
    }
    
    /**
     * Get all categories
     * @returns {Array} Category names
     */
    getCategories() {
        const categories = new Set();
        this.getAllTemplates().forEach(template => {
            categories.add(template.category);
        });
        return Array.from(categories).sort();
    }
    
    /**
     * Create custom template
     * @param {Object} templateData - Template data
     * @returns {string} Template ID
     */
    createCustomTemplate(templateData) {
        const id = `custom_${Date.now()}`;
        const template = {
            id,
            name: templateData.name,
            category: templateData.category || 'Custom',
            description: templateData.description,
            icon: templateData.icon || 'fa-file',
            content: templateData.content,
            createdAt: new Date().toISOString(),
            isCustom: true
        };
        
        this.customTemplates.set(id, template);
        this.saveCustomTemplates();
        
        this.emit('templateCreated', { template });
        return id;
    }
    
    /**
     * Update custom template
     * @param {string} id - Template ID
     * @param {Object} updates - Updates to apply
     * @returns {boolean} Success status
     */
    updateCustomTemplate(id, updates) {
        const template = this.customTemplates.get(id);
        if (!template) {
            return false;
        }
        
        const updatedTemplate = { ...template, ...updates };
        this.customTemplates.set(id, updatedTemplate);
        this.saveCustomTemplates();
        
        this.emit('templateUpdated', { template: updatedTemplate });
        return true;
    }
    
    /**
     * Delete custom template
     * @param {string} id - Template ID
     * @returns {boolean} Success status
     */
    deleteCustomTemplate(id) {
        const template = this.customTemplates.get(id);
        if (!template) {
            return false;
        }
        
        this.customTemplates.delete(id);
        this.saveCustomTemplates();
        
        this.emit('templateDeleted', { template });
        return true;
    }
    
    /**
     * Search templates
     * @param {string} query - Search query
     * @returns {Array} Matching templates
     */
    searchTemplates(query) {
        const searchTerm = query.toLowerCase();
        return this.getAllTemplates().filter(template => 
            template.name.toLowerCase().includes(searchTerm) ||
            template.description.toLowerCase().includes(searchTerm) ||
            template.category.toLowerCase().includes(searchTerm)
        );
    }
    
    /**
     * Apply template to document
     * @param {string} templateId - Template ID
     * @param {string} documentId - Document ID
     * @returns {boolean} Success status
     */
    applyTemplate(templateId, documentId) {
        const template = this.getTemplate(templateId);
        if (!template) {
            return false;
        }
        
        this.emit('templateApplied', { template, documentId });
        return true;
    }
    
    /**
     * Export template
     * @param {string} templateId - Template ID
     * @returns {Object} Template data for export
     */
    exportTemplate(templateId) {
        const template = this.getTemplate(templateId);
        if (!template) {
            return null;
        }
        
        return {
            ...template,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    }
    
    /**
     * Import template
     * @param {Object} templateData - Template data to import
     * @returns {string|null} New template ID
     */
    importTemplate(templateData) {
        try {
            // Generate new ID to avoid conflicts
            const newId = `imported_${Date.now()}`;
            const template = {
                ...templateData,
                id: newId,
                isCustom: true,
                importedAt: new Date().toISOString()
            };
            
            this.customTemplates.set(newId, template);
            this.saveCustomTemplates();
            
            this.emit('templateImported', { template });
            return newId;
        } catch (error) {
            console.error('Failed to import template:', error);
            return null;
        }
    }
}