/**
 * CharlesWebEditor - Working version with all existing functionality
 */

class CharlesWebEditor {
  constructor() {
    // Version information
    this.version = "1.1.0";
    this.releaseDate = "2024";

    // State variables
    this.currentDocId = "doc1";
    this.documents = {
      doc1: {
        id: "doc1",
        name: "Document 1",
        content: "",
        history: [],
        historyIndex: -1,
        lastSave: null,
      },
    };
    this.currentDoc = this.documents["doc1"];

    // Editor DOM elements
    this.editor = document.getElementById("editor");
    this.page = document.getElementById("page");
    this.pageContainer = document.getElementById("pageContainer");

    // State variables
    this.zoomLevel = 100;
    this.currentTheme = localStorage.getItem("editor_theme") || "light";
    this.spellCheckEnabled = false;
    this.selectedImage = null;
    this.recentDocuments = [];

    // Templates - Merged old and new templates
    this.templates = [
      {
        id: "blank",
        name: "Blank Document",
        description: "Start with a clean slate",
        icon: "fas fa-file",
        content: "<p>Start typing here...</p>",
      },
      {
        id: "resume",
        name: "Professional Resume",
        description: "Modern resume template",
        icon: "fas fa-user-tie",
        content: `
                    <h1>John Doe</h1>
                    <p><strong>Email:</strong> john.doe@email.com | <strong>Phone:</strong> (555) 123-4567 | <strong>LinkedIn:</strong> linkedin.com/in/johndoe</p>

                    <h2>Professional Summary</h2>
                    <p>Results-driven professional with 5+ years of experience in [industry]. Proven track record of [key achievement]. Seeking to leverage skills in [area] to drive success at [company].</p>

                    <h2>Experience</h2>
                    <p><strong>Senior Position</strong> - Company Name (2020-Present)</p>
                    <ul>
                        <li>Achievement 1 with measurable results</li>
                        <li>Achievement 2 that improved processes</li>
                        <li>Achievement 3 demonstrating leadership</li>
                    </ul>

                    <p><strong>Previous Position</strong> - Company Name (2018-2020)</p>
                    <ul>
                        <li>Relevant responsibility and accomplishment</li>
                        <li>Another key achievement</li>
                    </ul>

                    <h2>Education</h2>
                    <p><strong>Bachelor's Degree</strong> - University Name (2014-2018)</p>
                    <p>Major: [Field of Study] | GPA: 3.8</p>

                    <h2>Skills</h2>
                    <p><strong>Technical:</strong> Skill 1, Skill 2, Skill 3, Skill 4</p>
                    <p><strong>Soft:</strong> Communication, Leadership, Problem-solving, Teamwork</p>
                `,
      },
      {
        id: "letter",
        name: "Business Letter",
        description: "Professional letter format",
        icon: "fas fa-envelope",
        content: `
                    <p style="text-align: right; margin-bottom: 20px;">
                        Your Name<br>
                        Your Address<br>
                        City, State ZIP Code<br>
                        Your Email<br>
                        Your Phone Number<br>
                        Date
                    </p>

                    <p style="margin-bottom: 20px;">
                        Recipient Name<br>
                        Recipient Title<br>
                        Company Name<br>
                        Company Address<br>
                        City, State ZIP Code
                    </p>

                    <p>Dear [Recipient Name],</p>

                    <p>I am writing to [purpose of letter]. [Opening paragraph explaining the context and main point].</p>

                    <p>[Second paragraph with supporting details, evidence, or additional information relevant to your purpose].</p>

                    <p>[Third paragraph for further explanation, next steps, or call to action].</p>

                    <p>Thank you for your time and consideration. I look forward to [expected outcome or next step].</p>

                    <p style="margin-top: 30px;">Sincerely,</p>

                    <p style="margin-top: 20px;">Your Name</p>
                    <p style="margin-top: 20px;">Your Title (if applicable)</p>
                `,
      },
      {
        id: "report",
        name: "Project Report",
        description: "Structured report format",
        icon: "fas fa-chart-bar",
        content: `
                    <h1>Project Report: [Project Title]</h1>

                    <p><strong>Date:</strong> [Date]<br>
                    <strong>Prepared by:</strong> [Your Name]<br>
                    <strong>Department:</strong> [Department]</p>

                    <h2>Executive Summary</h2>
                    <p>[Brief overview of the project, objectives, methodology, and key findings. This section should provide a complete picture in 2-3 paragraphs.]</p>

                    <h2>Introduction</h2>
                    <p>[Background information, project scope, and objectives. Explain why this project was initiated and what it aims to achieve.]</p>

                    <h2>Findings</h2>
                    <ul>
                        <li>Key finding 1 with supporting data</li>
                        <li>Key finding 2 with supporting data</li>
                        <li>Key finding 3 with supporting data</li>
                    </ul>

                    <h2>Recommendations</h2>
                    <ol>
                        <li>Recommendation 1 with implementation details</li>
                        <li>Recommendation 2 with implementation details</li>
                        <li>Recommendation 3 with implementation details</li>
                    </ol>

                    <h2>Conclusion</h2>
                    <p>[Summary of the project and its significance. Reiterate the most important points and future implications.]</p>
                `,
      },
      {
        id: "sales-invoice",
        name: "Sales Invoice",
        description: "Professional sales invoice template",
        icon: "fas fa-file-invoice",
        content: `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <header style="margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <h1 style="margin: 0; font-size: 28px; color: #333;">INVOICE</h1>
                                <p style="margin: 5px 0; font-size: 14px; color: #666;">Invoice #: [Invoice Number]</p>
                                <p style="margin: 5px 0; font-size: 14px; color: #666;">Date: ${new Date().toLocaleDateString()}</p>
                                <p style="margin: 5px 0; font-size: 14px; color: #666;">Due Date: [Due Date]</p>
                            </div>
                            <div style="text-align: right;">
                                <p style="margin: 0; font-weight: bold; font-size: 16px;">[Your Company Name]</p>
                                <p style="margin: 5px 0; font-size: 14px;">[Your Company Address]</p>
                                <p style="margin: 5px 0; font-size: 14px;">[City, State ZIP]</p>
                                <p style="margin: 5px 0; font-size: 14px;">Phone: [Your Phone]</p>
                                <p style="margin: 5px 0; font-size: 14px;">Email: [Your Email]</p>
                            </div>
                        </div>
                    </header>

                    <div style="margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between;">
                            <div style="width: 48%;">
                                <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">Bill To:</h3>
                                <p style="margin: 5px 0; font-weight: bold;">[Client Name]</p>
                                <p style="margin: 5px 0;">[Client Company]</p>
                                <p style="margin: 5px 0;">[Client Address]</p>
                                <p style="margin: 5px 0;">[City, State ZIP]</p>
                                <p style="margin: 5px 0;">Phone: [Client Phone]</p>
                                <p style="margin: 5px 0;">Email: [Client Email]</p>
                            </div>
                            <div style="width: 48%;">
                                <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">Ship To:</h3>
                                <p style="margin: 5px 0; font-weight: bold;">[Ship To Name]</p>
                                <p style="margin: 5px 0;">[Ship To Company]</p>
                                <p style="margin: 5px 0;">[Ship To Address]</p>
                                <p style="margin: 5px 0;">[City, State ZIP]</p>
                                <p style="margin: 5px 0;">Phone: [Ship To Phone]</p>
                            </div>
                        </div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <thead>
                            <tr style="background: #f5f5f5;">
                                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Description</th>
                                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Quantity</th>
                                <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Unit Price</th>
                                <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 12px; border: 1px solid #ddd;">[Item 1 Description]</td>
                                <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">[Qty]</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">$[Price]</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">$[Amount]</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border: 1px solid #ddd;">[Item 2 Description]</td>
                                <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">[Qty]</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">$[Price]</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">$[Amount]</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border: 1px solid #ddd;">[Item 3 Description]</td>
                                <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">[Qty]</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">$[Price]</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">$[Amount]</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="display: flex; justify-content: flex-end;">
                        <div style="width: 300px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Subtotal:</span>
                                <span>$[Subtotal]</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Tax (0%):</span>
                                <span>$[Tax]</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Shipping:</span>
                                <span>$[Shipping]</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px;">
                                <span>Total:</span>
                                <span>$[Total]</span>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 40px; padding: 20px; background: #f9f9f9; border-radius: 5px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px;">Payment Instructions:</h3>
                        <p style="margin: 5px 0; font-size: 14px;">Please make payment to: [Your Company Name]</p>
                        <p style="margin: 5px 0; font-size: 14px;">Bank: [Bank Name] | Account: [Account Number] | Routing: [Routing Number]</p>
                        <p style="margin: 5px 0; font-size: 14px;">PayPal: [PayPal Email] | Venmo: [Venmo Handle]</p>
                        <p style="margin: 10px 0 0 0; font-size: 14px; font-weight: bold;">Thank you for your business!</p>
                    </div>
                </div>
            `,
      },
      {
        id: "sales-receipt",
        name: "Sales Receipt",
        description: "Sales receipt template for completed transactions",
        icon: "fas fa-receipt",
        content: `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <header style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
                        <h1 style="margin: 0; font-size: 28px; color: #333;">SALES RECEIPT</h1>
                        <p style="margin: 5px 0; font-size: 14px; color: #666;">Receipt #: [Receipt Number]</p>
                        <p style="margin: 5px 0; font-size: 14px; color: #666;">Date: ${new Date().toLocaleDateString()}</p>
                        <p style="margin: 5px 0; font-size: 14px; color: #666;">Time: ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </header>

                    <div style="margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between;">
                            <div style="width: 48%;">
                                <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">From:</h3>
                                <p style="margin: 5px 0; font-weight: bold;">[Business Name]</p>
                                <p style="margin: 5px 0;">[Business Address]</p>
                                <p style="margin: 5px 0;">[City, State ZIP]</p>
                                <p style="margin: 5px 0;">Phone: [Business Phone]</p>
                                <p style="margin: 5px 0;">Email: [Business Email]</p>
                            </div>
                            <div style="width: 48%;">
                                <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">To:</h3>
                                <p style="margin: 5px 0; font-weight: bold;">[Customer Name]</p>
                                <p style="margin: 5px 0;">[Customer Address]</p>
                                <p style="margin: 5px 0;">[City, State ZIP]</p>
                                <p style="margin: 5px 0;">Phone: [Customer Phone]</p>
                                <p style="margin: 5px 0;">Email: [Customer Email]</p>
                            </div>
                        </div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <thead>
                            <tr style="background: #f5f5f5;">
                                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Item</th>
                                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Qty</th>
                                <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Price</th>
                                <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 12px; border: 1px solid #ddd;">[Item 1 Description]</td>
                                <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">[Qty]</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">$[Price]</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">$[Total]</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border: 1px solid #ddd;">[Item 2 Description]</td>
                                <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">[Qty]</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">$[Price]</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">$[Total]</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border: 1px solid #ddd;">[Item 3 Description]</td>
                                <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">[Qty]</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">$[Price]</td>
                                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">$[Total]</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="display: flex; justify-content: flex-end;">
                        <div style="width: 300px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Subtotal:</span>
                                <span>$[Subtotal]</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Tax:</span>
                                <span>$[Tax]</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Discount:</span>
                                <span>-$[Discount]</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px;">
                                <span>Total Paid:</span>
                                <span>$[Total Paid]</span>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 30px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">Payment Details:</h3>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Payment Method:</span>
                            <span style="font-weight: bold;">[Cash/Credit Card/Check/Digital]</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Reference/Check #:</span>
                            <span>[Reference Number]</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Amount Received:</span>
                            <span>$[Amount Received]</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Change Given:</span>
                            <span>$[Change]</span>
                        </div>
                    </div>

                    <div style="margin-top: 40px; text-align: center; padding: 20px; background: #e8f5e8; border: 1px solid #c8e6c9; border-radius: 5px;">
                        <p style="margin: 0; font-weight: bold; color: #2e7d32;">PAYMENT RECEIVED - THANK YOU!</p>
                        <p style="margin: 10px 0 0 0; font-size: 12px;">This serves as your official receipt for this transaction.</p>
                        <p style="margin: 5px 0; font-size: 12px;">Please keep for your records.</p>
                    </div>
                </div>
            `,
      },
      {
        id: "memo-reminder",
        name: "Memo Reminder",
        description: "Internal memo and reminder template",
        icon: "fas fa-sticky-note",
        content: `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <header style="margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h1 style="margin: 0; font-size: 32px; color: #333; text-transform: uppercase;">MEMORANDUM</h1>
                            <div style="text-align: right;">
                                <p style="margin: 0; font-weight: bold; font-size: 14px;">Date: ${new Date().toLocaleDateString()}</p>
                                <p style="margin: 5px 0 0 0; font-size: 14px;">Memo #: [Memo Number]</p>
                            </div>
                        </div>
                    </header>

                    <div style="margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between;">
                            <div style="width: 48%;">
                                <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">TO:</h3>
                                <p style="margin: 5px 0; font-weight: bold;">[Recipient Name(s)]</p>
                                <p style="margin: 5px 0;">[Department/Team]</p>
                                <p style="margin: 5px 0;">[Company/Organization]</p>
                            </div>
                            <div style="width: 48%;">
                                <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">FROM:</h3>
                                <p style="margin: 5px 0; font-weight: bold;">[Your Name]</p>
                                <p style="margin: 5px 0;">[Your Department/Title]</p>
                                <p style="margin: 5px 0;">[Your Contact Information]</p>
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">SUBJECT:</h3>
                        <p style="margin: 0; font-weight: bold; font-size: 18px; color: #333;">[Memo Subject/Title]</p>
                    </div>

                    <div style="margin-bottom: 30px; line-height: 1.6;">
                        <p>[Begin your memo with a clear statement of purpose. Explain why this memo is being written and what it aims to communicate.]</p>
                        <br>
                        <p>[Provide background information or context that recipients need to understand the memo's content.]</p>
                        <br>
                        <p>[Present the main information, announcements, updates, or instructions. Use clear, concise language.]</p>
                        <br>
                        <p>[Include any specific details, deadlines, or requirements that recipients need to know.]</p>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">ACTION REQUIRED:</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li style="margin-bottom: 10px;">[Action item 1 with deadline: [Date/Time]]</li>
                            <li style="margin-bottom: 10px;">[Action item 2 with deadline: [Date/Time]]</li>
                            <li style="margin-bottom: 10px;">[Action item 3 with deadline: [Date/Time]]</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">IMPORTANT REMINDERS:</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li style="margin-bottom: 10px;">[Reminder 1 - Important information to remember]</li>
                            <li style="margin-bottom: 10px;">[Reminder 2 - Critical dates or deadlines]</li>
                            <li style="margin-bottom: 10px;">[Reminder 3 - Key contacts or resources]</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">ATTACHMENTS:</h3>
                        <p style="margin: 0;">[List any attached documents or files, if applicable]</p>
                    </div>

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #333;">
                        <p style="margin: 0; font-weight: bold;">Sincerely,</p>
                        <p style="margin: 20px 0 0 0; font-weight: bold;">[Your Signature]</p>
                        <p style="margin: 5px 0;">[Your Typed Name]</p>
                        <p style="margin: 5px 0;">[Your Title]</p>
                        <p style="margin: 5px 0;">[Your Department]</p>
                    </div>

                    <div style="margin-top: 30px; background: #e8f5e8; border: 1px solid #c8e6c9; padding: 15px;">
                        <p style="margin: 0; font-weight: bold; color: #2e7d32;">Please confirm receipt of this reminder and acknowledge the required actions.</p>
                    </div>
                </div>
            `,
      },
      {
        id: "meeting-minutes",
        name: "Meeting Minutes",
        description: "Formal meeting minutes template",
        icon: "fas fa-clipboard",
        content: `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <header style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
                        <h1 style="margin: 0; font-size: 28px; color: #333;">MEETING MINUTES</h1>
                        <p style="margin: 5px 0; font-size: 14px; color: #666;">Meeting of: [Committee/Team Name]</p>
                        <p style="margin: 5px 0; font-size: 14px; color: #666;">Date: ${new Date().toLocaleDateString()}</p>
                        <p style="margin: 5px 0; font-size: 14px; color: #666;">Time: [Start Time] - [End Time]</p>
                        <p style="margin: 5px 0; font-size: 14px; color: #666;">Location: [Meeting Location/Virtual Platform]</p>
                    </header>

                    <div style="margin-bottom: 30px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">ATTENDEES:</h3>
                        <div style="display: flex; justify-content: space-between;">
                            <div style="width: 48%;">
                                <p style="margin: 5px 0; font-weight: bold;">Present:</p>
                                <ul style="margin: 0; padding-left: 20px;">
                                    <li>[Attendee 1 Name] - [Role]</li>
                                    <li>[Attendee 2 Name] - [Role]</li>
                                    <li>[Attendee 3 Name] - [Role]</li>
                                    <li>[Attendee 4 Name] - [Role]</li>
                                </ul>
                            </div>
                            <div style="width: 48%;">
                                <p style="margin: 5px 0; font-weight: bold;">Absent:</p>
                                <ul style="margin: 0; padding-left: 20px;">
                                    <li>[Absentee 1 Name] - [Role]</li>
                                    <li>[Absentee 2 Name] - [Role]</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">AGENDA ITEMS:</h3>
                        <ol style="margin: 0; padding-left: 20px;">
                            <li style="margin-bottom: 10px;">
                                <strong>[Agenda Item 1]</strong><br>
                                Discussion: [Summary of discussion]<br>
                                Decision/Action: [Decision made or action required]
                            </li>
                            <li style="margin-bottom: 10px;">
                                <strong>[Agenda Item 2]</strong><br>
                                Discussion: [Summary of discussion]<br>
                                Decision/Action: [Decision made or action required]
                            </li>
                            <li style="margin-bottom: 10px;">
                                <strong>[Agenda Item 3]</strong><br>
                                Discussion: [Summary of discussion]<br>
                                Decision/Action: [Decision made or action required]
                            </li>
                        </ol>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">ACTION ITEMS:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f5f5f5;">
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Task</th>
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Responsible</th>
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Deadline</th>
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Task 1 Description]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Person Responsible]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Due Date]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Pending/In Progress/Completed]</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Task 2 Description]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Person Responsible]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Due Date]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Pending/In Progress/Completed]</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Task 3 Description]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Person Responsible]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Due Date]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Pending/In Progress/Completed]</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">NEXT MEETING:</h3>
                        <p style="margin: 5px 0;">Date: [Next Meeting Date]</p>
                        <p style="margin: 5px 0;">Time: [Next Meeting Time]</p>
                        <p style="margin: 5px 0;">Location: [Next Meeting Location]</p>
                        <p style="margin: 5px 0;">Agenda Items: [Brief description of topics for next meeting]</p>
                    </div>

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #333;">
                        <p style="margin: 0; font-weight: bold;">Prepared by:</p>
                        <p style="margin: 10px 0; font-weight: bold;">[Your Name]</p>
                        <p style="margin: 5px 0;">[Your Title/Role]</p>
                        <p style="margin: 5px 0;">Date Prepared: ${new Date().toLocaleDateString()}</p>
                    </div>

                    <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px;">
                        <p style="margin: 0; font-size: 12px; color: #666;">These minutes were approved at the meeting on [Approval Date].</p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Distributed to: [List of distribution recipients]</p>
                    </div>
                </div>
            `,
      },
      {
        id: "essay",
        name: "Essay",
        description: "Five-paragraph essay structure",
        icon: "fas fa-graduation-cap",
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
            `,
      },
      {
        id: "project-proposal",
        name: "Project Proposal",
        description: "Comprehensive project proposal template",
        icon: "fas fa-clipboard-list",
        content: `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <header style="text-align: center; margin-bottom: 40px;">
                        <h1 style="margin: 0; font-size: 28px; color: #333;">Project Proposal</h1>
                        <h2 style="margin: 10px 0; font-size: 22px; color: #666;">[Project Name]</h2>
                        <p style="margin: 5px 0;">Prepared by: [Your Name/Team]</p>
                        <p style="margin: 5px 0;">Date: ${new Date().toLocaleDateString()}</p>
                        <p style="margin: 5px 0;">Version: [Proposal Version]</p>
                    </header>

                    <div style="margin-bottom: 30px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">EXECUTIVE SUMMARY</h3>
                        <p style="line-height: 1.6;">[Provide a concise overview of the project, including its purpose, key objectives, expected outcomes, and why it should be approved. This section should be 1-2 paragraphs and give readers a complete understanding of the proposal.]</p>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">BACKGROUND & PROBLEM STATEMENT</h3>
                        <p style="line-height: 1.6;">[Describe the current situation, the problem or opportunity being addressed, and why this project is necessary. Include relevant background information and context.]</p>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">PROJECT OBJECTIVES</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li style="margin-bottom: 10px;">[Objective 1: Specific, measurable, achievable, relevant, and time-bound]</li>
                            <li style="margin-bottom: 10px;">[Objective 2: Specific, measurable, achievable, relevant, and time-bound]</li>
                            <li style="margin-bottom: 10px;">[Objective 3: Specific, measurable, achievable, relevant, and time-bound]</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">METHODOLOGY & APPROACH</h3>
                        <p style="line-height: 1.6;">[Describe how the project will be executed. Include the approach, methods, tools, and techniques that will be used. Explain why this approach is appropriate for achieving the project objectives.]</p>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">DELIVERABLES</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li style="margin-bottom: 10px;">[Deliverable 1: Description and expected completion date]</li>
                            <li style="margin-bottom: 10px;">[Deliverable 2: Description and expected completion date]</li>
                            <li style="margin-bottom: 10px;">[Deliverable 3: Description and expected completion date]</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">TIMELINE</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f5f5f5;">
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Phase/Task</th>
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Start Date</th>
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">End Date</th>
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Phase 1: Planning]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Start Date]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[End Date]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Duration]</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Phase 2: Execution]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Start Date]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[End Date]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Duration]</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Phase 3: Review]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Start Date]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[End Date]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Duration]</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">BUDGET & RESOURCES</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f5f5f5;">
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
                                    <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Resource 1]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Description]</td>
                                    <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$[Cost]</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Resource 2]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Description]</td>
                                    <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$[Cost]</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Resource 3]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Description]</td>
                                    <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$[Cost]</td>
                                </tr>
                            </tbody>
                        </table>
                        <p style="margin-top: 10px; font-weight: bold;">Total Estimated Budget: $[Total Budget]</p>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">RISK ASSESSMENT</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f5f5f5;">
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Risk</th>
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Likelihood</th>
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Impact</th>
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Mitigation Strategy</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Risk 1]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Low/Medium/High]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Low/Medium/High]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Mitigation strategy]</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Risk 2]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Low/Medium/High]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Low/Medium/High]</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">[Mitigation strategy]</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #333;">
                        <p style="margin: 0; font-weight: bold;">APPROVAL</p>
                        <p style="margin: 20px 0 0 0;">Approved by: _________________________</p>
                        <p style="margin: 5px 0;">Name: [Approver Name]</p>
                        <p style="margin: 5px 0;">Title: [Approver Title]</p>
                        <p style="margin: 5px 0;">Date: _________________________</p>
                    </div>
                </div>
            `,
      },
    ];

    // Initialize
    this.loadFromLocalStorage();
    this.loadRecentDocuments();
    this.updateWordCount();
    this.updateStatusBar();
    this.setTheme(this.currentTheme);
    this.updateRecentDocumentsList();
    this.updateTemplatesList();

    // Setup event listeners
    this.setupEventListeners();

    // Auto-save interval
    setInterval(() => this.autoSave(), 10000);

    // Auto-start editor after 5 seconds for better UX
    setTimeout(() => {
      const welcomeScreen = document.getElementById("welcomeScreen");
      if (welcomeScreen && welcomeScreen.classList.contains("active")) {
        this.startEditor();
      }
    }, 5000);

    // Log version info
    console.info(
      `CharlesWebEditor v${this.version} initialized - ${this.releaseDate}`,
    );
  }

  setupEventListeners() {
    // Welcome screen buttons
    const startEditorBtn = document.getElementById("startEditorBtn");

    if (startEditorBtn) {
      startEditorBtn.addEventListener("click", () => {
        this.startEditor();
      });
    } else {
      console.error("❌ Start Editor button not found!");
    }

    const tourBtn = document.getElementById("tourBtn");
    if (tourBtn) {
      tourBtn.addEventListener("click", () => {
        this.showTour();
      });
    }

    // Theme toggle
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => this.toggleTheme());
    }

    // Language select
    const languageSelect = document.getElementById("languageSelect");
    if (languageSelect) {
      languageSelect.addEventListener("change", (e) => {
        this.changeLanguage(e.target.value);
      });
    }

    // Sidebar tabs
    document.querySelectorAll(".sidebar-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        this.switchSidebarTab(e.target.dataset.tab);
      });
    });

    // Quick styles
    document.querySelectorAll("[data-style]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.applyStyle(e.target.closest("[data-style]").dataset.style);
      });
    });

    // Text color and highlight
    const textColor = document.getElementById("textColor");
    if (textColor) {
      textColor.addEventListener("input", (e) => {
        this.executeCommand("foreColor", e.target.value);
      });
    }

    const highlightColor = document.getElementById("highlightColor");
    if (highlightColor) {
      highlightColor.addEventListener("input", (e) => {
        this.executeCommand("backColor", e.target.value);
      });
    }

    // Formatting buttons with data-command
    document.querySelectorAll("[data-command]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const command = e.target.closest("[data-command]").dataset.command;
        this.executeCommand(command);
        this.saveDocumentState();
      });
    });

    // Font controls
    const fontFamily = document.getElementById("fontFamily");
    if (fontFamily) {
      fontFamily.addEventListener("change", (e) => {
        this.executeCommand("fontName", e.target.value);
      });
    }

    const fontSize = document.getElementById("fontSize");
    if (fontSize) {
      fontSize.addEventListener("change", (e) => {
        this.executeCommand("fontSize", e.target.value);
      });
    }

    // Undo/Redo
    const undoBtn = document.getElementById("undoBtn");
    if (undoBtn) {
      undoBtn.addEventListener("click", () => this.undo());
    }

    const redoBtn = document.getElementById("redoBtn");
    if (redoBtn) {
      redoBtn.addEventListener("click", () => this.redo());
    }

    // Insert buttons
    const insertImageBtn = document.getElementById("insertImageBtn");
    if (insertImageBtn) {
      insertImageBtn.addEventListener("click", () => this.insertImage());
    }

    const insertTableBtn = document.getElementById("insertTableBtn");
    if (insertTableBtn) {
      insertTableBtn.addEventListener("click", () => this.insertTable());
    }

    const insertLinkBtn = document.getElementById("insertLinkBtn");
    if (insertLinkBtn) {
      insertLinkBtn.addEventListener("click", () => this.insertLink());
    }

    // Find and replace
    const findBtn = document.getElementById("findBtn");
    if (findBtn) {
      findBtn.addEventListener("click", () => this.showFindModal());
    }

    const replaceBtn = document.getElementById("replaceBtn");
    if (replaceBtn) {
      replaceBtn.addEventListener("click", () => this.showReplaceModal());
    }

    // Page layout
    const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
    if (toggleSidebarBtn) {
      toggleSidebarBtn.addEventListener("click", () => this.toggleSidebar());
    }

    const pageSize = document.getElementById("pageSize");
    if (pageSize) {
      pageSize.addEventListener("change", (e) => {
        this.setPageSize(e.target.value);
      });
    }

    const pageSizeSelect = document.getElementById("pageSizeSelect");
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener("change", (e) => {
        this.setPageSize(e.target.value);
      });
    }

    const pageOrientation = document.getElementById("pageOrientation");
    if (pageOrientation) {
      pageOrientation.addEventListener("change", (e) => {
        this.setPageOrientation(e.target.value);
      });
    }

    // Document tabs
    const addTabBtn = document.getElementById("addTabBtn");
    if (addTabBtn) {
      addTabBtn.addEventListener("click", () => this.addNewDocument());
    }

    // Document management
    const newDocBtn = document.getElementById("newDocBtn");
    if (newDocBtn) {
      newDocBtn.addEventListener("click", () => this.addNewDocument());
    }

    const saveDocBtn = document.getElementById("saveDocBtn");
    if (saveDocBtn) {
      saveDocBtn.addEventListener("click", () => this.saveDocument());
    }

    const openDocBtn = document.getElementById("openDocBtn");
    if (openDocBtn) {
      openDocBtn.addEventListener("click", () => this.openDocument());
    }

    // Export functions
    const exportPdfBtn = document.getElementById("exportPdf");
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener("click", () => this.exportToPDF());
    }

    const exportDocxBtn = document.getElementById("exportDocx");
    if (exportDocxBtn) {
      exportDocxBtn.addEventListener("click", () => this.exportToDOCX());
    }

    const saveCloudBtn = document.getElementById("saveCloud");
    if (saveCloudBtn) {
      saveCloudBtn.addEventListener("click", () => this.saveToCloud());
    }

    const printBtn = document.getElementById("printBtn");
    if (printBtn) {
      printBtn.addEventListener("click", () => window.print());
    }

    // Page Layout button
    const pageLayoutBtn = document.getElementById("pageLayoutBtn");
    if (pageLayoutBtn) {
      pageLayoutBtn.addEventListener("click", () => {
        this.showPageLayoutModal();
      });
    }

    // Quick Styles button
    const quickStylesBtn = document.getElementById("quickStylesBtn");
    if (quickStylesBtn) {
      quickStylesBtn.addEventListener("click", () => {
        this.showQuickStylesModal();
      });
    }

    // New feature buttons (AI, Templates, Advanced Formatting, Email Share)
    const aiAssistantBtn = document.getElementById("aiAssistantBtn");
    if (aiAssistantBtn) {
      aiAssistantBtn.addEventListener("click", () => {
        this.toggleAIAssistantPanel();
      });
    }

    const templatesBtn = document.getElementById("templatesBtn");
    if (templatesBtn) {
      templatesBtn.addEventListener("click", () => {
        this.showTemplatesModal();
      });
    }

    const advancedFormattingBtn = document.getElementById(
      "advancedFormattingBtn",
    );
    if (advancedFormattingBtn) {
      advancedFormattingBtn.addEventListener("click", () => {
        this.showAdvancedFormattingModal();
      });
    }

    const emailShareBtn = document.getElementById("emailShareBtn");
    if (emailShareBtn) {
      emailShareBtn.addEventListener("click", () => {
        this.showEmailShareModal();
      });
    }

    // Page Layout modal event listeners
    const closePageLayoutModal = document.getElementById(
      "closePageLayoutModal",
    );
    if (closePageLayoutModal) {
      closePageLayoutModal.addEventListener("click", () => {
        this.hidePageLayoutModal();
      });
    }

    const cancelPageLayoutBtn = document.getElementById("cancelPageLayoutBtn");
    if (cancelPageLayoutBtn) {
      cancelPageLayoutBtn.addEventListener("click", () => {
        this.hidePageLayoutModal();
      });
    }

    const applyPageLayoutBtn = document.getElementById("applyPageLayoutBtn");
    if (applyPageLayoutBtn) {
      applyPageLayoutBtn.addEventListener("click", () => {
        this.applyPageLayout();
      });
    }

    // Quick Styles modal event listeners
    const closeQuickStylesModal = document.getElementById(
      "closeQuickStylesModal",
    );
    if (closeQuickStylesModal) {
      closeQuickStylesModal.addEventListener("click", () => {
        this.hideQuickStylesModal();
      });
    }

    const cancelQuickStylesBtn = document.getElementById(
      "cancelQuickStylesBtn",
    );
    if (cancelQuickStylesBtn) {
      cancelQuickStylesBtn.addEventListener("click", () => {
        this.hideQuickStylesModal();
      });
    }

    // Style buttons in Quick Styles modal
    document.querySelectorAll(".style-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const style = e.target.closest(".style-btn").dataset.style;
        this.applyStyle(style);
        this.hideQuickStylesModal();
      });
    });

    // Templates modal event listeners
    const closeTemplatesModal = document.getElementById("closeTemplatesModal");
    if (closeTemplatesModal) {
      closeTemplatesModal.addEventListener("click", () => {
        this.hideTemplatesModal();
      });
    }

    const cancelTemplatesBtn = document.getElementById("cancelTemplatesBtn");
    if (cancelTemplatesBtn) {
      cancelTemplatesBtn.addEventListener("click", () => {
        this.hideTemplatesModal();
      });
    }

    // Advanced Formatting modal event listeners
    const closeAdvancedFormattingModal = document.getElementById("closeAdvancedFormattingModal");
    if (closeAdvancedFormattingModal) {
      closeAdvancedFormattingModal.addEventListener("click", () => {
        this.hideAdvancedFormattingModal();
      });
    }

    const cancelAdvancedFormattingBtn = document.getElementById("cancelAdvancedFormattingBtn");
    if (cancelAdvancedFormattingBtn) {
      cancelAdvancedFormattingBtn.addEventListener("click", () => {
        this.hideAdvancedFormattingModal();
      });
    }

    const applyAdvancedFormattingBtn = document.getElementById("applyAdvancedFormattingBtn");
    if (applyAdvancedFormattingBtn) {
      applyAdvancedFormattingBtn.addEventListener("click", () => {
        this.applyAdvancedFormatting();
      });
    }

    // Advanced formatting buttons
    const formatStrikethrough = document.getElementById("formatStrikethrough");
    if (formatStrikethrough) {
      formatStrikethrough.addEventListener("click", () => {
        this.executeCommand("strikeThrough");
      });
    }

    const formatSuperscript = document.getElementById("formatSuperscript");
    if (formatSuperscript) {
      formatSuperscript.addEventListener("click", () => {
        this.executeCommand("superscript");
      });
    }

    const formatSubscript = document.getElementById("formatSubscript");
    if (formatSubscript) {
      formatSubscript.addEventListener("click", () => {
        this.executeCommand("subscript");
      });
    }

    const lineSpacing = document.getElementById("lineSpacing");
    if (lineSpacing) {
      lineSpacing.addEventListener("change", (e) => {
        this.applyLineSpacing(e.target.value);
      });
    }

    const formatUppercase = document.getElementById("formatUppercase");
    if (formatUppercase) {
      formatUppercase.addEventListener("click", () => {
        this.transformText("uppercase");
      });
    }

    const formatLowercase = document.getElementById("formatLowercase");
    if (formatLowercase) {
      formatLowercase.addEventListener("click", () => {
        this.transformText("lowercase");
      });
    }

    const formatCapitalize = document.getElementById("formatCapitalize");
    if (formatCapitalize) {
      formatCapitalize.addEventListener("click", () => {
        this.transformText("capitalize");
      });
    }

    // Email Share modal event listeners
    const closeEmailShareModal = document.getElementById("closeEmailShareModal");
    if (closeEmailShareModal) {
      closeEmailShareModal.addEventListener("click", () => {
        this.hideEmailShareModal();
      });
    }

    const cancelEmailShareBtn = document.getElementById("cancelEmailShareBtn");
    if (cancelEmailShareBtn) {
      cancelEmailShareBtn.addEventListener("click", () => {
        this.hideEmailShareModal();
      });
    }

    const sendEmailBtn = document.getElementById("sendEmailBtn");
    if (sendEmailBtn) {
      sendEmailBtn.addEventListener("click", () => {
        this.sendEmail();
      });
    }

    // AI Assistant panel event listeners
    const closeAIAssistantBtn = document.getElementById("closeAIAssistantBtn");
    if (closeAIAssistantBtn) {
      closeAIAssistantBtn.addEventListener("click", () => {
        this.hideAIAssistantPanel();
      });
    }

    const checkGrammarBtn = document.getElementById("checkGrammarBtn");
    if (checkGrammarBtn) {
      checkGrammarBtn.addEventListener("click", () => {
        this.checkGrammarAndStyle();
      });
    }

    const refreshStatsBtn = document.getElementById("refreshStatsBtn");
    if (refreshStatsBtn) {
      refreshStatsBtn.addEventListener("click", () => {
        this.updateAIStats();
      });
    }

    const improveTextBtn = document.getElementById("improveTextBtn");
    if (improveTextBtn) {
      improveTextBtn.addEventListener("click", () => {
        this.improveSelectedText();
      });
    }

    const makeShorterBtn = document.getElementById("makeShorterBtn");
    if (makeShorterBtn) {
      makeShorterBtn.addEventListener("click", () => {
        this.makeTextShorter();
      });
    }

    const makeLongerBtn = document.getElementById("makeLongerBtn");
    if (makeLongerBtn) {
      makeLongerBtn.addEventListener("click", () => {
        this.makeTextLonger();
      });
    }

    const changeToneBtn = document.getElementById("changeToneBtn");
    if (changeToneBtn) {
      changeToneBtn.addEventListener("click", () => {
        this.changeTextTone();
      });
    }

    const summarizeBtn = document.getElementById("summarizeBtn");
    if (summarizeBtn) {
      summarizeBtn.addEventListener("click", () => {
        this.summarizeDocument();
      });
    }

    const generateTitleBtn = document.getElementById("generateTitleBtn");
    if (generateTitleBtn) {
      generateTitleBtn.addEventListener("click", () => {
        this.generateTitle();
      });
    }

    const expandIdeasBtn = document.getElementById("expandIdeasBtn");
    if (expandIdeasBtn) {
      expandIdeasBtn.addEventListener("click", () => {
        this.expandIdeas();
      });
    }

    // Close modals when clicking outside
    document.addEventListener("click", (e) => {
      // Templates modal
      const templatesModal = document.getElementById("templatesModal");
      if (templatesModal && templatesModal.classList.contains("active")) {
        if (e.target === templatesModal) {
          this.hideTemplatesModal();
        }
      }
      
      // Advanced Formatting modal
      const advancedFormattingModal = document.getElementById("advancedFormattingModal");
      if (advancedFormattingModal && advancedFormattingModal.classList.contains("active")) {
        if (e.target === advancedFormattingModal) {
          this.hideAdvancedFormattingModal();
        }
      }
      
      // Email Share modal
      const emailShareModal = document.getElementById("emailShareModal");
      if (emailShareModal && emailShareModal.classList.contains("active")) {
        if (e.target === emailShareModal) {
          this.hideEmailShareModal();
        }
      }
    });

    // Document tab clicks and context menu
    document.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (tab) {
        const docId = tab.dataset.docId;
        if (docId && !e.target.closest(".tab-close")) {
          this.switchDocument(docId);
        }
      }

      // Tab close
      if (e.target.closest(".tab-close")) {
        e.stopPropagation();
        const tab = e.target.closest(".tab");
        const docId = tab.dataset.docId;
        this.closeDocument(docId);
      }
    });

    // Context menu for tabs
    document.addEventListener("contextmenu", (e) => {
      if (e.target.closest(".tab")) {
        e.preventDefault();
        this.showTabContextMenu(e.target.closest(".tab"), e.clientX, e.clientY);
      }
    });

    // Hide context menu on click outside
    document.addEventListener("click", (e) => {
      // Don't hide if clicking on the context menu itself
      if (!e.target.closest("#tabContextMenu")) {
        this.hideTabContextMenu();
      }
    });

    // Editor events
    this.editor.addEventListener("input", () => {
      this.handleEditorInput();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "n":
            e.preventDefault();
            this.addNewDocument();
            break;
          case "o":
            e.preventDefault();
            this.openDocument();
            break;
          case "s":
            e.preventDefault();
            this.saveDocument();
            break;
          case "z":
            e.preventDefault();
            this.undo();
            break;
          case "f":
            e.preventDefault();
            this.showFindModal();
            break;
          case "h":
            e.preventDefault();
            this.showReplaceModal();
            break;
          case "p":
            e.preventDefault();
            this.window.print();
            break;
          case "\\":
            e.preventDefault();
            this.toggleSidebar();
            break;
        }
      } else if (e.key === "F2") {
        e.preventDefault();
        this.renameCurrentDocument();
      }
    });

    // Help button
    const helpFab = document.getElementById("helpFab");
    if (helpFab) {
      helpFab.addEventListener("click", () => this.showHelpModal());
    }

    // Zoom controls
    const zoomInBtn = document.getElementById("zoomInBtn");
    if (zoomInBtn) {
      zoomInBtn.addEventListener("click", () => this.zoomIn());
    }

    const zoomOutBtn = document.getElementById("zoomOutBtn");
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener("click", () => this.zoomOut());
    }

    // Modal close buttons
    const closeFindBtn = document.getElementById("closeFindBtn");
    if (closeFindBtn) {
      closeFindBtn.addEventListener("click", () => this.hideFindModal());
    }

    const closeReplaceBtn = document.getElementById("closeReplaceBtn");
    if (closeReplaceBtn) {
      closeReplaceBtn.addEventListener("click", () => this.hideReplaceModal());
    }

    // Find functionality
    const findNextBtn = document.getElementById("findNextBtn");
    if (findNextBtn) {
      findNextBtn.addEventListener("click", () => this.findNext());
    }

    const findPrevBtn = document.getElementById("findPrevBtn");
    if (findPrevBtn) {
      findPrevBtn.addEventListener("click", () => this.findPrevious());
    }

    const replaceBtnModal = document.getElementById("replaceBtnModal");
    if (replaceBtnModal) {
      replaceBtnModal.addEventListener("click", () => this.replaceCurrent());
    }

    const replaceAllBtn = document.getElementById("replaceAllBtn");
    if (replaceAllBtn) {
      replaceAllBtn.addEventListener("click", () => this.replaceAll());
    }

    // Clear recent documents
    const clearRecentBtn = document.getElementById("clearRecentBtn");
    if (clearRecentBtn) {
      clearRecentBtn.addEventListener("click", () =>
        this.clearRecentDocuments(),
      );
    }

    // Rename modal
    const closeRenameModal = document.getElementById("closeRenameModal");
    if (closeRenameModal) {
      closeRenameModal.addEventListener("click", () => {
        this.hideRenameModal();
      });
    }

    const cancelRenameBtn = document.getElementById("cancelRenameBtn");
    if (cancelRenameBtn) {
      cancelRenameBtn.addEventListener("click", () => {
        this.hideRenameModal();
      });
    }

    const confirmRenameBtn = document.getElementById("confirmRenameBtn");
    if (confirmRenameBtn) {
      confirmRenameBtn.addEventListener("click", () => {
        this.confirmRename();
      });
    }

    // Help modal
    const closeHelpModal = document.getElementById("closeHelpModal");
    if (closeHelpModal) {
      closeHelpModal.addEventListener("click", () => {
        this.hideHelpModal();
      });
    }

    const closeHelpBtn = document.getElementById("closeHelpBtn");
    if (closeHelpBtn) {
      closeHelpBtn.addEventListener("click", () => {
        this.hideHelpModal();
      });
    }

    // Spell check button
    const spellCheckBtn = document.getElementById("spellCheckBtn");
    if (spellCheckBtn) {
      spellCheckBtn.addEventListener("click", () => this.toggleSpellCheck());
    }

    // Help modal tabs
    document.querySelectorAll(".help-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        this.switchHelpTab(e.target.dataset.tab);
      });
    });

    // Context menu item clicks with event delegation
    document.addEventListener("click", (e) => {
      const contextMenuItem = e.target.closest(".context-menu-item");
      if (contextMenuItem && contextMenuItem.closest("#tabContextMenu")) {
        const action = contextMenuItem.textContent.trim().toLowerCase();
        if (action.includes("rename")) {
          this.renameCurrentDocument();
        } else if (action.includes("duplicate")) {
          this.duplicateCurrentDocument();
        } else if (action.includes("close")) {
          this.closeCurrentDocument();
        }
      }
    });
  }

  // All existing methods from the original implementation are preserved exactly
  startEditor() {
    const welcomeScreen = document.getElementById("welcomeScreen");
    const editorContainer = document.getElementById("editorContainer");

    if (!welcomeScreen || !editorContainer) {
      console.error("❌ Missing critical DOM elements for editor transition!");
      return;
    }

    // Add fade-out animation
    welcomeScreen.style.transition = "opacity 0.3s ease-out";
    welcomeScreen.style.opacity = "0";

    setTimeout(() => {
      welcomeScreen.classList.remove("active");
      welcomeScreen.style.opacity = "1"; // Reset for next time
      editorContainer.style.display = "flex";
      editorContainer.style.opacity = "0";
      editorContainer.style.transition = "opacity 0.3s ease-in";

      setTimeout(() => {
        editorContainer.style.opacity = "1";
        if (this.editor) {
          this.editor.focus();
        }
        this.showToast("Welcome to CharlesWebEditor!", "success");
      }, 50);
    }, 300);
  }

  showTour() {
    this.showToast("Starting interactive tour...", "success");
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    this.setTheme(this.currentTheme);
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    const themeIcon = document.getElementById("themeIcon");
    if (themeIcon) {
      themeIcon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
    }

    // Update editor page background
    if (this.page) {
      if (theme === "dark") {
        this.page.style.background = "#1e293b";
        this.page.style.color = "#f8fafc";
      } else {
        this.page.style.background = "white";
        this.page.style.color = "black";
      }
    }

    localStorage.setItem("editor_theme", theme);
    this.showToast(`Switched to ${theme} mode`, "success");
  }

  saveToCloud() {
    this.showToast("🔄 Saving to Google Drive...", "success");

    // Check if user is already authenticated
    const accessToken = localStorage.getItem("gdrive_access_token");
    const refreshToken = localStorage.getItem("gdrive_refresh_token");
    const tokenExpiry = localStorage.getItem("gdrive_token_expiry");

    if (accessToken) {
      // Check if token is expired
      const now = Date.now();
      if (tokenExpiry && now > parseInt(tokenExpiry)) {
        // Token expired, try to refresh
        if (refreshToken) {
          this.refreshGoogleDriveToken(refreshToken);
        } else {
          // Need to re-authenticate
          this.authenticateWithGoogleDrive();
        }
      } else {
        // Token is still valid, upload directly
        this.uploadToGoogleDrive(accessToken);
      }
    } else {
      // No authentication yet, initiate setup
      this.authenticateWithGoogleDrive();
    }
  }

  authenticateWithGoogleDrive() {
    const storedClientId = localStorage.getItem("gdrive_client_id");

    if (storedClientId) {
      // Already configured, use stored Client ID
      this.initiateGoogleOAuthFlow(storedClientId);
    } else {
      // First time setup - show setup dialog
      this.showGoogleDriveSetupDialog();
    }
  }

  showGoogleDriveSetupDialog() {
    // Create a more user-friendly setup experience
    const setupText = `Google Drive Cloud Storage Setup

To enable automatic saving to Google Drive, please follow these steps:

STEP 1: Create Google Cloud Project
1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Click "APIs & Services" → "Library"
4. Search and enable "Google Drive API"

STEP 2: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Select "Web application"
4. Add authorized redirect URI: ${window.location.origin}
5. Click "Create"

STEP 3: Copy Your Client ID
1. From the credentials page, copy the "Client ID"
2. Paste it below

Enter your Google Client ID:`;

    const clientId = prompt(setupText);

    if (clientId && clientId.trim()) {
      localStorage.setItem("gdrive_client_id", clientId.trim());
      this.showToast(
        "✅ Client ID saved! Initiating authentication...",
        "success",
      );
      setTimeout(() => this.initiateGoogleOAuthFlow(clientId.trim()), 1000);
    } else if (clientId === null) {
      // User clicked cancel
      this.showToast("Google Drive setup cancelled", "warning");
    } else {
      this.showToast("Please enter a valid Client ID", "error");
    }
  }

  initiateGoogleOAuthFlow(clientId) {
    const redirectUri = window.location.origin;
    const scope = "https://www.googleapis.com/auth/drive.file";
    const state = Math.random().toString(36).substring(7);

    localStorage.setItem("gdrive_oauth_state", state);

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${state}` +
      `&access_type=offline` +
      `&prompt=consent`;

    // Store client ID for future reference
    localStorage.setItem("gdrive_client_id", clientId);

    // Open Google OAuth in new window
    const authWindow = window.open(
      authUrl,
      "google_auth",
      "width=500,height=600",
    );

    // Listen for the OAuth callback
    const checkClosed = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkClosed);
        this.showToast("Authentication window closed", "warning");
      }
    }, 1000);

    this.showToast("📲 Opening Google authentication...", "info");
  }

  refreshGoogleDriveToken(refreshToken) {
    const clientId = localStorage.getItem("gdrive_client_id");
    const clientSecret = localStorage.getItem("gdrive_client_secret");

    if (!clientId) {
      this.authenticateWithGoogleDrive();
      return;
    }

    const tokenData = {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/drive.file",
    };

    if (clientSecret) {
      tokenData.client_secret = clientSecret;
    }

    fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(tokenData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.access_token) {
          localStorage.setItem("gdrive_access_token", data.access_token);
          if (data.refresh_token) {
            localStorage.setItem("gdrive_refresh_token", data.refresh_token);
          }
          const expiryTime = Date.now() + data.expires_in * 1000;
          localStorage.setItem("gdrive_token_expiry", expiryTime.toString());

          this.uploadToGoogleDrive(data.access_token);
        } else {
          // Refresh failed, re-authenticate
          this.authenticateWithGoogleDrive();
        }
      })
      .catch((error) => {
        console.error("Google Drive token refresh error:", error);
        this.authenticateWithGoogleDrive();
      });
  }

  uploadToGoogleDrive(accessToken) {
    const fileName =
      (this.currentDoc.name || "document").replace(/[^\w\s-]/g, "") + ".html";
    const fileContent = this.currentDoc.content || this.editor.innerHTML;

    // First, create file metadata
    const metadata = {
      name: fileName,
      mimeType: "text/html",
    };

    // Create multipart form data
    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const multipartRequestBody =
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: text/html\r\n\r\n" +
      fileContent +
      close_delim;

    // Upload to Google Drive using Google Drive API
    fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": 'multipart/related; boundary="' + boundary + '"',
        },
        body: multipartRequestBody,
      },
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          this.showToast(
            "✅ Document saved to Google Drive successfully!",
            "success",
          );
          this.currentDoc.lastSave = new Date();

          // Update status bar
          const timestamp = new Date().toLocaleTimeString();
          this.updateSaveStatus(`✓ Google Drive (${timestamp})`);

          // Store file ID for future reference
          localStorage.setItem(`gdrive_file_${this.currentDocId}`, data.id);
        } else {
          throw new Error("Upload failed: " + JSON.stringify(data));
        }
      })
      .catch((error) => {
        console.error("Google Drive upload error:", error);
        this.showToast(
          "⚠️ Failed to save to Google Drive. Check console for details.",
          "error",
        );
      });
  }

  showHelpModal() {
    const modal = document.getElementById("helpModal");
    if (modal) {
      modal.classList.add("active");
    }
  }

  hideHelpModal() {
    const modal = document.getElementById("helpModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  switchHelpTab(tabName) {
    // Switch active tab button
    document.querySelectorAll(".help-tab").forEach((tab) => {
      tab.classList.remove("active");
      if (tab.dataset.tab === tabName) {
        tab.classList.add("active");
      }
    });

    // Switch active tab content
    document.querySelectorAll(".help-tab-content").forEach((content) => {
      content.classList.remove("active");
      if (content.dataset.tab === tabName) {
        content.classList.add("active");
      }
    });
  }

  showFindModal() {
    const modal = document.getElementById("findModal");
    if (modal) {
      modal.classList.add("active");
    }
  }

  hideFindModal() {
    const modal = document.getElementById("findModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  showReplaceModal() {
    const modal = document.getElementById("replaceModal");
    if (modal) {
      modal.classList.add("active");
    }
  }

  hideReplaceModal() {
    const modal = document.getElementById("replaceModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  // Missing methods that are referenced in event listeners
  addNewDocument() {
    const docId = "doc" + Date.now();
    const docName = `Document ${Object.keys(this.documents).length + 1}`;

    this.documents[docId] = {
      id: docId,
      name: docName,
      content: "",
      history: [],
      historyIndex: -1,
      lastSave: null,
    };

    const tab = document.createElement("div");
    tab.className = "tab";
    tab.dataset.docId = docId;
    tab.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <span>${docName}</span>
            <span class="tab-close"><i class="fas fa-times"></i></span>
        `;

    document.getElementById("documentTabs").appendChild(tab);
    this.switchDocument(docId);
  }

  insertImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = document.createElement("img");
          img.src = event.target.result;
          img.className = "editor-image";
          img.style.maxWidth = "300px";
          img.style.height = "auto";
          img.style.margin = "10px 0";

          this.executeCommand("insertHTML", img.outerHTML);
          this.saveDocumentState();
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  }

  insertTable() {
    const rows = prompt("Enter number of rows:", "3");
    const cols = prompt("Enter number of columns:", "3");

    if (rows && cols) {
      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.margin = "10px 0";

      for (let i = 0; i < parseInt(rows); i++) {
        const row = document.createElement("tr");

        for (let j = 0; j < parseInt(cols); j++) {
          const cell = document.createElement("td");
          cell.innerHTML = "&nbsp;";
          cell.style.border = "1px solid #ccc";
          cell.style.padding = "8px";
          row.appendChild(cell);
        }

        table.appendChild(row);
      }

      this.executeCommand("insertHTML", table.outerHTML);
      this.saveDocumentState();
    }
  }

  insertLink() {
    const url = prompt("Enter the URL:", "https://");
    const text = prompt("Enter link text:", "Click here");

    if (url && text) {
      const link = document.createElement("a");
      link.href = url;
      link.textContent = text;
      link.style.color = "#2563eb";
      link.style.textDecoration = "underline";

      this.executeCommand("insertHTML", link.outerHTML);
      this.saveDocumentState();
      this.showToast("Link inserted successfully", "success");
    }
  }

  toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("collapsed");
    const btn = document.getElementById("toggleSidebarBtn");
    btn.classList.toggle("active");
  }

  findNext() {
    const findText = document.getElementById("findInput").value;
    if (!findText) {
      this.showToast("Please enter text to find", "warning");
      return;
    }

    // Get the current selection or start from beginning
    const selection = window.getSelection();
    let startNode = selection.anchorNode;
    let startOffset = selection.anchorOffset;

    // If no selection, start from the beginning of the editor
    if (!startNode || !this.editor.contains(startNode)) {
      startNode = this.editor;
      startOffset = 0;
    }

    // Get all text content
    const editorText = this.editor.textContent || this.editor.innerText;

    // Find the current position in the text
    let currentPosition = 0;
    const walker = document.createTreeWalker(
      this.editor,
      NodeFilter.SHOW_TEXT,
      null,
      false,
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node === startNode) {
        currentPosition += startOffset;
        break;
      }
      currentPosition += node.textContent.length;
    }

    // Search for the text (case-insensitive)
    const searchText = findText.toLowerCase();
    const lowerText = editorText.toLowerCase();
    const foundIndex = lowerText.indexOf(searchText, currentPosition + 1);

    if (foundIndex === -1) {
      // Try from the beginning
      const foundFromStart = lowerText.indexOf(searchText, 0);
      if (foundFromStart === -1) {
        this.showToast(`"${findText}" not found`, "warning");
        return;
      }
      // Found from start, select it
      this.selectTextAtPosition(
        foundFromStart,
        foundFromStart + findText.length,
      );
      this.showToast(`Found "${findText}" (wrapped to beginning)`, "success");
    } else {
      // Found, select it
      this.selectTextAtPosition(foundIndex, foundIndex + findText.length);
      this.showToast(`Found "${findText}"`, "success");
    }
  }

  findPrevious() {
    const findText = document.getElementById("findInput").value;
    if (!findText) {
      this.showToast("Please enter text to find", "warning");
      return;
    }

    // Get the current selection
    const selection = window.getSelection();
    let startNode = selection.anchorNode;
    let startOffset = selection.anchorOffset;

    // Get all text content
    const editorText = this.editor.textContent || this.editor.innerText;

    // Find the current position in the text
    let currentPosition = 0;
    const walker = document.createTreeWalker(
      this.editor,
      NodeFilter.SHOW_TEXT,
      null,
      false,
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node === startNode) {
        currentPosition += startOffset;
        break;
      }
      currentPosition += node.textContent.length;
    }

    // If at the beginning, start from the end
    if (currentPosition === 0) {
      currentPosition = editorText.length;
    }

    // Search backwards for the text (case-insensitive)
    const searchText = findText.toLowerCase();
    const lowerText = editorText.toLowerCase();
    const foundIndex = lowerText.lastIndexOf(searchText, currentPosition - 2);

    if (foundIndex === -1) {
      // Try from the end
      const foundFromEnd = lowerText.lastIndexOf(searchText);
      if (foundFromEnd === -1) {
        this.showToast(`"${findText}" not found`, "warning");
        return;
      }
      // Found from end, select it
      this.selectTextAtPosition(foundFromEnd, foundFromEnd + findText.length);
      this.showToast(`Found "${findText}" (wrapped to end)`, "success");
    } else {
      // Found, select it
      this.selectTextAtPosition(foundIndex, foundIndex + findText.length);
      this.showToast(`Found "${findText}"`, "success");
    }
  }

  // Helper function to select text at a specific position
  selectTextAtPosition(start, end) {
    const range = document.createRange();
    const selection = window.getSelection();

    // Walk through text nodes to find the right position
    const walker = document.createTreeWalker(
      this.editor,
      NodeFilter.SHOW_TEXT,
      null,
      false,
    );

    let currentPos = 0;
    let startNode = null,
      startOffset = 0;
    let endNode = null,
      endOffset = 0;
    let node;

    while ((node = walker.nextNode())) {
      const nodeLength = node.textContent.length;

      if (!startNode && currentPos + nodeLength >= start) {
        startNode = node;
        startOffset = start - currentPos;
      }

      if (!endNode && currentPos + nodeLength >= end) {
        endNode = node;
        endOffset = end - currentPos;
        break;
      }

      currentPos += nodeLength;
    }

    if (startNode && endNode) {
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      selection.removeAllRanges();
      selection.addRange(range);

      // Scroll the selection into view
      const rect = range.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        startNode.parentElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }

  replaceCurrent() {
    const findText = document.getElementById("replaceFindInput").value;
    const replaceText = document.getElementById("replaceInput").value;

    if (!findText) {
      this.showToast("Please enter text to find", "warning");
      return;
    }

    const selection = window.getSelection();
    const selectedText = selection.toString();

    if (selectedText && selectedText.toLowerCase() === findText.toLowerCase()) {
      // Replace the selected text
      this.executeCommand("insertText", replaceText);
      this.saveDocumentState();
      this.showToast("Text replaced", "success");

      // Find next occurrence
      setTimeout(() => {
        this.findNextInReplace();
      }, 100);
    } else {
      // Find first occurrence
      this.findNextInReplace();
    }
  }

  // Helper function for find in replace modal
  findNextInReplace() {
    const findText = document.getElementById("replaceFindInput").value;
    if (!findText) {
      this.showToast("Please enter text to find", "warning");
      return;
    }

    // Get the current selection or start from beginning
    const selection = window.getSelection();
    let startNode = selection.anchorNode;
    let startOffset = selection.anchorOffset;

    if (!startNode || !this.editor.contains(startNode)) {
      startNode = this.editor;
      startOffset = 0;
    }

    const editorText = this.editor.textContent || this.editor.innerText;

    let currentPosition = 0;
    const walker = document.createTreeWalker(
      this.editor,
      NodeFilter.SHOW_TEXT,
      null,
      false,
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node === startNode) {
        currentPosition += startOffset;
        break;
      }
      currentPosition += node.textContent.length;
    }

    const searchText = findText.toLowerCase();
    const lowerText = editorText.toLowerCase();
    const foundIndex = lowerText.indexOf(searchText, currentPosition + 1);

    if (foundIndex === -1) {
      const foundFromStart = lowerText.indexOf(searchText, 0);
      if (foundFromStart === -1) {
        this.showToast(`"${findText}" not found`, "warning");
        return;
      }
      this.selectTextAtPosition(
        foundFromStart,
        foundFromStart + findText.length,
      );
      this.showToast(`Found "${findText}" (wrapped to beginning)`, "success");
    } else {
      this.selectTextAtPosition(foundIndex, foundIndex + findText.length);
      this.showToast(`Found "${findText}"`, "success");
    }
  }

  replaceAll() {
    const findText = document.getElementById("replaceFindInput").value;
    const replaceText = document.getElementById("replaceInput").value;

    if (!findText) {
      this.showToast("Please enter text to find", "warning");
      return;
    }

    // Get the text content
    let content = this.editor.textContent || this.editor.innerText;

    // Count occurrences
    const searchText = findText.toLowerCase();
    const lowerContent = content.toLowerCase();
    let count = 0;
    let pos = 0;

    while ((pos = lowerContent.indexOf(searchText, pos)) !== -1) {
      count++;
      pos += searchText.length;
    }

    if (count === 0) {
      this.showToast(`"${findText}" not found`, "warning");
      return;
    }

    // Replace all occurrences (case-insensitive)
    const regex = new RegExp(
      findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi",
    );
    content = content.replace(regex, replaceText);

    // Update the editor content
    this.editor.textContent = content;
    this.saveDocumentState();
    this.showToast(
      `Replaced ${count} occurrence${count > 1 ? "s" : ""} of "${findText}"`,
      "success",
    );
  }

  clearRecentDocuments() {
    if (confirm("Are you sure you want to clear all recent documents?")) {
      this.recentDocuments = [];
      localStorage.removeItem("charles_editor_recent_docs");
      this.updateRecentDocumentsList();
      this.showToast("Recent documents cleared", "success");
    }
  }

  confirmRename() {
    const newName = document.getElementById("renameInput").value.trim();

    if (!newName) {
      this.showToast("Please enter a document name", "error");
      return;
    }

    // Update document name
    this.currentDoc.name = newName;

    // Update tab display
    const tab = document.querySelector(
      `.tab[data-doc-id="${this.currentDocId}"]`,
    );
    if (tab) {
      tab.querySelector("span").textContent = newName;
    }

    // Save to localStorage
    localStorage.setItem(
      `charles_editor_doc_${this.currentDocId}_name`,
      newName,
    );

    this.hideRenameModal();
    this.showToast(`Document renamed to "${newName}"`, "success");
  }

  hideRenameModal() {
    const modal = document.getElementById("renameModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  switchDocument(docId) {
    if (!this.documents[docId]) return;

    this.currentDoc.content = this.editor.innerHTML;

    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.remove("active");
      if (tab.dataset.docId === docId) {
        tab.classList.add("active");
      }
    });

    this.currentDocId = docId;
    this.currentDoc = this.documents[docId];

    this.editor.innerHTML = this.currentDoc.content || "<p>New document</p>";

    this.updateWordCount();
    this.updateStatusBar();

    this.showToast(`Switched to ${this.currentDoc.name}`, "success");
  }

  closeDocument(docId) {
    if (Object.keys(this.documents).length <= 1) {
      this.showToast("Cannot close the last document", "error");
      return;
    }

    this.documents[docId].content = this.editor.innerHTML;

    const tab = document.querySelector(`.tab[data-doc-id="${docId}"]`);
    if (tab) tab.remove();

    delete this.documents[docId];

    const remainingDocId = Object.keys(this.documents)[0];
    this.switchDocument(remainingDocId);
  }

  saveDocumentState() {
    const sanitizeHTML = (html) => {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      temp.querySelectorAll("script, style").forEach((el) => el.remove());
      temp.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
        });
      });
      return temp.innerHTML;
    };
    const content = sanitizeHTML(this.editor.innerHTML);
    this.currentDoc.content = content;
    if (!this.currentDoc.history) {
      this.currentDoc.history = [];
      this.currentDoc.historyIndex = -1;
    }
    if (this.currentDoc.historyIndex < this.currentDoc.history.length - 1) {
      this.currentDoc.history = this.currentDoc.history.slice(
        0,
        this.currentDoc.historyIndex + 1,
      );
    }
    if (
      this.currentDoc.history.length === 0 ||
      this.currentDoc.history[this.currentDoc.history.length - 1] !== content
    ) {
      this.currentDoc.history.push(content);
      this.currentDoc.historyIndex = this.currentDoc.history.length - 1;
    }
    localStorage.setItem(`charles_editor_doc_${this.currentDocId}`, content);
    localStorage.setItem(
      `charles_editor_doc_${this.currentDocId}_name`,
      this.currentDoc.name,
    );
    this.currentDoc.lastSave = new Date();
    this.updateSaveStatus("Auto-saved");

    // Save to recent documents
    this.saveToRecent(this.currentDoc);
  }

  loadFromLocalStorage() {
    const savedContent = localStorage.getItem(
      `charles_editor_doc_${this.currentDocId}`,
    );
    if (savedContent) {
      this.currentDoc.content = savedContent;
      this.editor.innerHTML = savedContent;

      const savedName = localStorage.getItem(
        `charles_editor_doc_${this.currentDocId}_name`,
      );
      if (savedName) {
        this.currentDoc.name = savedName;
        const tab = document.querySelector(
          `.tab[data-doc-id="${this.currentDocId}"]`,
        );
        if (tab) {
          tab.querySelector("span").textContent = savedName;
        }
      }
    }
  }

  loadRecentDocuments() {
    const recent = localStorage.getItem("charles_editor_recent_docs");
    this.recentDocuments = recent ? JSON.parse(recent) : [];
  }

  saveToRecent(document) {
    const recentDoc = {
      id: document.id,
      name: document.name,
      lastModified: document.lastSave || new Date().toISOString(),
      contentPreview: (document.content || "")
        .replace(/<[^>]*>/g, "")
        .substring(0, 100),
    };

    // Remove if already exists
    this.recentDocuments = this.recentDocuments.filter(
      (doc) => doc.id !== document.id,
    );

    // Add to beginning
    this.recentDocuments.unshift(recentDoc);

    // Keep only last 10
    this.recentDocuments = this.recentDocuments.slice(0, 10);

    // Save to localStorage
    localStorage.setItem(
      "charles_editor_recent_docs",
      JSON.stringify(this.recentDocuments),
    );

    this.updateRecentDocumentsList();
  }

  updateRecentDocumentsList() {
    const recentList = document.getElementById("recentList");
    if (!recentList) return;

    if (this.recentDocuments.length === 0) {
      recentList.innerHTML =
        '<div class="empty-recent">No recent documents</div>';
      return;
    }

    recentList.innerHTML = this.recentDocuments
      .map((doc) => {
        const date = new Date(doc.lastModified);
        const timeAgo = this.getTimeAgo(date);

        return `
                <div class="recent-item" data-doc-id="${doc.id}">
                    <div class="recent-item-info">
                        <div class="recent-item-name">${doc.name}</div>
                        <div class="recent-item-meta">${timeAgo} • ${doc.contentPreview}...</div>
                    </div>
                    <button class="recent-item-action" onclick="window.charlesEditor.openRecentDocument('${doc.id}')">
                        Open
                    </button>
                </div>
            `;
      })
      .join("");
  }

  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return date.toLocaleDateString();
  }

  openRecentDocument(docId) {
    const recentDoc = this.recentDocuments.find((doc) => doc.id === docId);
    if (!recentDoc) return;

    // Check if document exists in current session
    if (this.documents[docId]) {
      this.switchDocument(docId);
      return;
    }

    // Create new document from recent
    this.documents[docId] = {
      id: docId,
      name: recentDoc.name,
      content: recentDoc.content || "",
      history: [],
      historyIndex: -1,
      lastSave: recentDoc.lastModified,
    };

    // Create tab
    const tab = document.createElement("div");
    tab.className = "tab";
    tab.dataset.docId = docId;
    tab.innerHTML = `
            <span>${recentDoc.name}</span>
            <button class="tab-close">×</button>
        `;
    document.getElementById("documentTabs").appendChild(tab);

    this.switchDocument(docId);
    this.showToast(`Opened: ${recentDoc.name}`, "success");
  }

  switchSidebarTab(tabName) {
    document.querySelectorAll(".sidebar-tab").forEach((tab) => {
      tab.classList.remove("active");
      if (tab.dataset.tab === tabName) {
        tab.classList.add("active");
      }
    });

    document.querySelectorAll(".sidebar-tab-content").forEach((content) => {
      content.classList.remove("active");
      if (content.dataset.tab === tabName) {
        content.classList.add("active");
      }
    });
  }

  applyStyle(style) {
    switch (style) {
      case "heading1":
        this.executeCommand("formatBlock", "<h1>");
        break;
      case "heading2":
        this.executeCommand("formatBlock", "<h2>");
        break;
      case "heading3":
        this.executeCommand("formatBlock", "<h3>");
        break;
      case "normal":
        this.executeCommand("formatBlock", "<p>");
        break;
    }
    this.saveDocumentState();
  }

  updateTemplatesList() {
    const templatesList = document.getElementById("templatesList");

    templatesList.innerHTML = `
            <div class="template-grid">
                ${this.templates
                  .map(
                    (template) => `
                    <div class="template-item" onclick="window.charlesEditor.applyTemplate('${template.id}')">
                        <div class="template-icon">
                            <i class="${template.icon}"></i>
                        </div>
                        <div class="template-name">${template.name}</div>
                        <div class="template-description">${template.description}</div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `;
  }

  applyTemplate(templateId) {
    const template = this.templates.find((t) => t.id === templateId);
    if (!template) return;

    this.editor.innerHTML = template.content;
    this.saveDocumentState();
    this.showToast(`Applied ${template.name} template`, "success");
  }

  // Page Layout Modal Functions
  showPageLayoutModal() {
    const modal = document.getElementById("pageLayoutModal");
    if (modal) {
      modal.classList.add("active");
      // Set current values
      const pageSizeSelect = document.getElementById("pageSizeSelectModal");
      const pageOrientation = document.getElementById("pageOrientationModal");
      const marginTop = document.getElementById("marginTopModal");
      const marginBottom = document.getElementById("marginBottomModal");
      const marginLeft = document.getElementById("marginLeftModal");
      const marginRight = document.getElementById("marginRightModal");

      if (pageSizeSelect) pageSizeSelect.value = this.currentPageSize || "a4";
      if (pageOrientation)
        pageOrientation.value = this.currentPageOrientation || "portrait";
      if (marginTop) marginTop.value = this.currentMarginTop || 25;
      if (marginBottom) marginBottom.value = this.currentMarginBottom || 25;
      if (marginLeft) marginLeft.value = this.currentMarginLeft || 25;
      if (marginRight) marginRight.value = this.currentMarginRight || 25;
    }
  }

  hidePageLayoutModal() {
    const modal = document.getElementById("pageLayoutModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  applyPageLayout() {
    const pageSizeSelect = document.getElementById("pageSizeSelectModal");
    const pageOrientation = document.getElementById("pageOrientationModal");
    const marginTop = document.getElementById("marginTopModal");
    const marginBottom = document.getElementById("marginBottomModal");
    const marginLeft = document.getElementById("marginLeftModal");
    const marginRight = document.getElementById("marginRightModal");

    if (pageSizeSelect) this.currentPageSize = pageSizeSelect.value;
    if (pageOrientation) this.currentPageOrientation = pageOrientation.value;
    if (marginTop) this.currentMarginTop = parseInt(marginTop.value);
    if (marginBottom) this.currentMarginBottom = parseInt(marginBottom.value);
    if (marginLeft) this.currentMarginLeft = parseInt(marginLeft.value);
    if (marginRight) this.currentMarginRight = parseInt(marginRight.value);

    // Apply page size
    const page = document.getElementById("page");
    if (page) {
      page.className = "page";
      if (this.currentPageSize === "a4") {
        page.classList.add("a4");
      } else if (this.currentPageSize === "letter") {
        page.classList.add("letter");
      } else if (this.currentPageSize === "legal") {
        page.classList.add("legal");
      }
    }

    // Apply margins to editor
    const editor = document.getElementById("editor");
    if (editor) {
      editor.style.paddingTop = `${this.currentMarginTop}px`;
      editor.style.paddingBottom = `${this.currentMarginBottom}px`;
      editor.style.paddingLeft = `${this.currentMarginLeft}px`;
      editor.style.paddingRight = `${this.currentMarginRight}px`;
    }

    this.hidePageLayoutModal();
    this.showToast("✅ Page layout applied successfully!", "success");
  }

  // Quick Styles Modal Functions
  showQuickStylesModal() {
    const modal = document.getElementById("quickStylesModal");
    if (modal) {
      modal.classList.add("active");
    }
  }

  hideQuickStylesModal() {
    const modal = document.getElementById("quickStylesModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  // Templates Modal Functions
  showTemplatesModal() {
    const modal = document.getElementById("templatesModal");
    const templatesList = document.getElementById("templatesModalList");
    
    if (modal && templatesList) {
      // Populate templates list
      templatesList.innerHTML = `
        ${this.templates
          .map(
            (template) => `
            <div class="template-item" style="border: 1px solid var(--border-primary); border-radius: 8px; padding: 15px; cursor: pointer; transition: all 0.2s; background: var(--bg-primary);" 
                 onclick="window.charlesEditor.applyTemplateFromModal('${template.id}')"
                 onmouseover="this.style.background='var(--bg-secondary)'"
                 onmouseout="this.style.background='var(--bg-primary)'">
                <div style="font-size: 32px; color: var(--primary-color); margin-bottom: 10px; text-align: center;">
                    <i class="${template.icon}"></i>
                </div>
                <div style="font-weight: 600; margin-bottom: 5px; text-align: center; color: var(--text-primary);">
                    ${template.name}
                </div>
                <div style="font-size: 12px; color: var(--text-secondary); text-align: center;">
                    ${template.description}
                </div>
            </div>
        `,
          )
          .join("")}
      `;
      modal.classList.add("active");
    }
  }

  hideTemplatesModal() {
    const modal = document.getElementById("templatesModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  applyTemplateFromModal(templateId) {
    this.applyTemplate(templateId);
    this.hideTemplatesModal();
  }

  // Advanced Formatting Modal Functions
  showAdvancedFormattingModal() {
    const modal = document.getElementById("advancedFormattingModal");
    if (modal) {
      // Reset form values
      const lineSpacing = document.getElementById("lineSpacing");
      if (lineSpacing) lineSpacing.value = "2";
      const paragraphSpacingBefore = document.getElementById("paragraphSpacingBefore");
      if (paragraphSpacingBefore) paragraphSpacingBefore.value = "0";
      const paragraphSpacingAfter = document.getElementById("paragraphSpacingAfter");
      if (paragraphSpacingAfter) paragraphSpacingAfter.value = "12";
      
      modal.classList.add("active");
    }
  }

  hideAdvancedFormattingModal() {
    const modal = document.getElementById("advancedFormattingModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  applyLineSpacing(value) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.extractContents();
      const span = document.createElement("span");
      span.style.lineHeight = value;
      span.appendChild(selectedText);
      range.insertNode(span);
      this.saveDocumentState();
      this.showToast(`Line spacing set to ${value}`, "success");
    } else {
      // Apply to entire editor
      this.editor.style.lineHeight = value;
      this.saveDocumentState();
      this.showToast(`Line spacing set to ${value}`, "success");
    }
  }

  transformText(transform) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();
      let transformedText;
      
      switch (transform) {
        case "uppercase":
          transformedText = selectedText.toUpperCase();
          break;
        case "lowercase":
          transformedText = selectedText.toLowerCase();
          break;
        case "capitalize":
          transformedText = selectedText.replace(/\b\w/g, (char) => char.toUpperCase());
          break;
        default:
          return;
      }
      
      range.deleteContents();
      range.insertNode(document.createTextNode(transformedText));
      this.saveDocumentState();
      this.showToast(`Text transformed to ${transform}`, "success");
    } else {
      this.showToast("Please select text to transform", "warning");
    }
  }

  applyAdvancedFormatting() {
    const paragraphSpacingBefore = document.getElementById("paragraphSpacingBefore");
    const paragraphSpacingAfter = document.getElementById("paragraphSpacingAfter");
    
    if (paragraphSpacingBefore && paragraphSpacingAfter) {
      const before = paragraphSpacingBefore.value;
      const after = paragraphSpacingAfter.value;
      
      // Apply to selected paragraphs or all paragraphs
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const paragraphs = range.commonAncestorContainer.parentElement.querySelectorAll("p");
        paragraphs.forEach((p) => {
          p.style.marginTop = before + "pt";
          p.style.marginBottom = after + "pt";
        });
      } else {
        // Apply to all paragraphs
        const paragraphs = this.editor.querySelectorAll("p");
        paragraphs.forEach((p) => {
          p.style.marginTop = before + "pt";
          p.style.marginBottom = after + "pt";
        });
      }
      
      this.saveDocumentState();
      this.showToast("Advanced formatting applied", "success");
      this.hideAdvancedFormattingModal();
    }
  }

  // Email Share Modal Functions
  showEmailShareModal() {
    const modal = document.getElementById("emailShareModal");
    if (modal) {
      // Set default subject
      const emailSubject = document.getElementById("emailSubject");
      if (emailSubject) {
        emailSubject.value = `Document from CharlesWebEditor - ${this.currentDoc.name}`;
      }
      
      // Clear other fields
      const emailTo = document.getElementById("emailTo");
      if (emailTo) emailTo.value = "";
      const emailMessage = document.getElementById("emailMessage");
      if (emailMessage) emailMessage.value = "";
      
      modal.classList.add("active");
    }
  }

  hideEmailShareModal() {
    const modal = document.getElementById("emailShareModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  sendEmail() {
    const emailTo = document.getElementById("emailTo");
    const emailSubject = document.getElementById("emailSubject");
    const emailMessage = document.getElementById("emailMessage");
    const emailIncludeDocument = document.getElementById("emailIncludeDocument");
    
    if (!emailTo || !emailTo.value.trim()) {
      this.showToast("Please enter recipient email address", "warning");
      return;
    }
    
    if (!emailSubject || !emailSubject.value.trim()) {
      this.showToast("Please enter email subject", "warning");
      return;
    }
    
    const recipients = emailTo.value.split(",").map((email) => email.trim());
    const subject = emailSubject.value;
    const message = emailMessage ? emailMessage.value : "";
    const includeDocument = emailIncludeDocument ? emailIncludeDocument.checked : true;
    
    // Create mailto link
    let mailtoLink = `mailto:${recipients.join(",")}?`;
    mailtoLink += `subject=${encodeURIComponent(subject)}`;
    
    if (message) {
      mailtoLink += `&body=${encodeURIComponent(message)}`;
    }
    
    if (includeDocument) {
      const documentContent = this.editor.innerHTML;
      const documentText = this.editor.innerText;
      const bodyText = message 
        ? `${message}\n\n--- Document Content ---\n\n${documentText}`
        : `--- Document Content ---\n\n${documentText}`;
      mailtoLink = `mailto:${recipients.join(",")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    }
    
    // Open email client
    window.location.href = mailtoLink;
    
    this.showToast("Opening email client...", "success");
    this.hideEmailShareModal();
  }

  // AI Assistant Panel Functions
  toggleAIAssistantPanel() {
    const panel = document.getElementById("aiAssistantPanel");
    if (panel) {
      if (panel.classList.contains("visible")) {
        this.hideAIAssistantPanel();
      } else {
        this.showAIAssistantPanel();
      }
    }
  }

  showAIAssistantPanel() {
    const panel = document.getElementById("aiAssistantPanel");
    if (panel) {
      panel.classList.add("visible");
      this.updateAIStats();
      
      // Update stats when editor content changes
      if (!this.aiStatsUpdateInterval) {
        this.aiStatsUpdateInterval = setInterval(() => {
          if (panel.classList.contains("visible")) {
            this.updateAIStats();
          }
        }, 2000); // Update every 2 seconds
      }
    }
  }

  hideAIAssistantPanel() {
    const panel = document.getElementById("aiAssistantPanel");
    if (panel) {
      panel.classList.remove("visible");
      
      // Clear update interval when panel is closed
      if (this.aiStatsUpdateInterval) {
        clearInterval(this.aiStatsUpdateInterval);
        this.aiStatsUpdateInterval = null;
      }
    }
  }


  updateAIStats() {
    const text = this.editor.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const paragraphs = this.editor.querySelectorAll("p").length || 1;
    const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words/min

    const aiWordCount = document.getElementById("aiWordCount");
    const aiCharCount = document.getElementById("aiCharCount");
    const aiParagraphCount = document.getElementById("aiParagraphCount");
    const aiReadingTime = document.getElementById("aiReadingTime");

    if (aiWordCount) aiWordCount.textContent = words;
    if (aiCharCount) aiCharCount.textContent = chars;
    if (aiParagraphCount) aiParagraphCount.textContent = paragraphs;
    if (aiReadingTime) aiReadingTime.textContent = readingTime + " min";
  }

  checkGrammarAndStyle() {
    const checkBtn = document.getElementById("checkGrammarBtn");
    const statusIndicator = document.getElementById("grammarStatusIndicator");
    const statusText = document.getElementById("grammarStatusText");
    const suggestionsDiv = document.getElementById("grammarSuggestions");

    if (!checkBtn || !statusIndicator || !statusText || !suggestionsDiv) return;

    // Show checking status
    checkBtn.disabled = true;
    statusIndicator.className = "status-indicator checking";
    statusText.textContent = "Analyzing text...";
    suggestionsDiv.style.display = "none";
    suggestionsDiv.innerHTML = "";

    // Simulate analysis (in a real app, this would call an AI API)
    setTimeout(() => {
      const text = this.editor.innerText || "";
      const suggestions = this.analyzeText(text);

      if (suggestions.length === 0) {
        statusIndicator.className = "status-indicator success";
        statusText.textContent = "No issues found!";
        suggestionsDiv.style.display = "block";
        suggestionsDiv.innerHTML = '<div class="no-suggestions">✨ Your text looks great! No suggestions at this time.</div>';
      } else {
        statusIndicator.className = "status-indicator warning";
        statusText.textContent = `Found ${suggestions.length} suggestion${suggestions.length > 1 ? 's' : ''}`;
        suggestionsDiv.style.display = "block";
        suggestionsDiv.innerHTML = suggestions.map((suggestion, index) => `
          <div class="grammar-suggestion">
            <div class="suggestion-type">
              <i class="fas fa-${suggestion.icon}"></i>
              ${suggestion.type}
            </div>
            <div class="suggestion-message">${suggestion.message}</div>
            ${suggestion.suggestion ? `<div style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">Suggestion: "${suggestion.suggestion}"</div>` : ''}
            ${suggestion.action ? `<button class="apply-suggestion-btn" onclick="window.charlesEditor.applySuggestion(${index})">Apply</button>` : ''}
          </div>
        `).join("");
      }

      checkBtn.disabled = false;
    }, 1500);
  }

  analyzeText(text) {
    const suggestions = [];
    
    // Check for common issues
    // 1. Check for repeated words
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i].toLowerCase() === words[i + 1].toLowerCase() && words[i].length > 2) {
        suggestions.push({
          type: "Repetition",
          icon: "redo",
          message: `Repeated word: "${words[i]}"`,
          suggestion: `Consider removing the duplicate "${words[i]}"`,
          action: "remove"
        });
        break; // Only show one repetition suggestion
      }
    }

    // 2. Check for very long sentences (over 50 words)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    sentences.forEach((sentence, index) => {
      const wordCount = sentence.trim().split(/\s+/).length;
      if (wordCount > 50) {
        suggestions.push({
          type: "Style",
          icon: "edit",
          message: `Long sentence (${wordCount} words) - consider breaking it into shorter sentences`,
          suggestion: "Break into 2-3 shorter sentences for better readability"
        });
      }
    });

    // 3. Check for passive voice indicators
    const passiveIndicators = /\b(was|were|is|are|been|being)\s+\w+ed\b/gi;
    if (passiveIndicators.test(text)) {
      suggestions.push({
        type: "Style",
        icon: "magic",
        message: "Consider using active voice for more engaging writing",
        suggestion: "Rewrite sentences to use active voice where possible"
      });
    }

    // 4. Check for common typos/patterns
    if (/\bteh\b/i.test(text)) {
      suggestions.push({
        type: "Spelling",
        icon: "spell-check",
        message: 'Possible typo: "teh" should be "the"',
        suggestion: "the",
        action: "replace"
      });
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  applySuggestion(index) {
    // This would apply the suggestion based on the index
    // For now, just show a message
    this.showToast("Suggestion applied (simulated)", "success");
  }

  improveSelectedText() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().trim().length > 0) {
      const selectedText = selection.toString();
      this.showAIResponse("Improving text...", () => {
        // Simulate text improvement
        const improved = this.improveText(selectedText);
        return `Improved version:\n\n"${improved}"\n\nWould you like to replace the selected text with this improved version?`;
      });
    } else {
      this.showToast("Please select text to improve", "warning");
    }
  }

  improveText(text) {
    // Basic text improvements (in a real app, this would use AI)
    let improved = text;
    
    // Remove extra spaces
    improved = improved.replace(/\s+/g, " ");
    
    // Capitalize first letter
    improved = improved.trim();
    if (improved.length > 0) {
      improved = improved.charAt(0).toUpperCase() + improved.slice(1);
    }
    
    // Ensure proper punctuation
    if (!/[.!?]$/.test(improved.trim())) {
      improved = improved.trim() + ".";
    }
    
    return improved;
  }

  makeTextShorter() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().trim().length > 0) {
      const selectedText = selection.toString();
      this.showAIResponse("Making text shorter...", () => {
        const shortened = this.shortenText(selectedText);
        return `Shorter version:\n\n"${shortened}"\n\nThis version is ${Math.round((1 - shortened.length / selectedText.length) * 100)}% shorter.`;
      });
    } else {
      this.showToast("Please select text to shorten", "warning");
    }
  }

  shortenText(text) {
    // Remove filler words and simplify (basic implementation)
    const fillerWords = /\b(very|really|quite|rather|pretty|somewhat|extremely|incredibly)\s+/gi;
    let shortened = text.replace(fillerWords, "");
    
    // Remove redundant phrases
    shortened = shortened.replace(/\b(due to the fact that|because of the fact that)\b/gi, "because");
    shortened = shortened.replace(/\b(at this point in time)\b/gi, "now");
    shortened = shortened.replace(/\b(in order to)\b/gi, "to");
    
    // Clean up extra spaces
    shortened = shortened.replace(/\s+/g, " ").trim();
    
    return shortened || text; // Return original if too short
  }

  makeTextLonger() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().trim().length > 0) {
      const selectedText = selection.toString();
      this.showAIResponse("Expanding text...", () => {
        const expanded = this.expandText(selectedText);
        return `Expanded version:\n\n"${expanded}"\n\nThis version is ${Math.round((expanded.length / selectedText.length - 1) * 100)}% longer.`;
      });
    } else {
      this.showToast("Please select text to expand", "warning");
    }
  }

  expandText(text) {
    // Add descriptive words and expand phrases (basic implementation)
    let expanded = text;
    
    // Expand common abbreviations
    expanded = expanded.replace(/\b(etc\.)\b/gi, "and so on");
    expanded = expanded.replace(/\b(i\.e\.)\b/gi, "that is");
    expanded = expanded.replace(/\b(e\.g\.)\b/gi, "for example");
    
    // Add descriptive adjectives where appropriate
    expanded = expanded.replace(/\b(important)\b/gi, "significantly important");
    expanded = expanded.replace(/\b(good)\b/gi, "quite good");
    
    return expanded;
  }

  changeTextTone() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().trim().length > 0) {
      const selectedText = selection.toString();
      this.showAIResponse("Changing tone...", () => {
        return `Tone options for your text:\n\n1. Professional: More formal and business-appropriate\n2. Casual: Friendly and conversational\n3. Academic: Scholarly and precise\n4. Creative: Engaging and expressive\n\nSelect a tone to apply the transformation.`;
      });
    } else {
      this.showToast("Please select text to change tone", "warning");
    }
  }

  summarizeDocument() {
    const text = this.editor.innerText || "";
    if (text.trim().length < 50) {
      this.showToast("Document is too short to summarize", "warning");
      return;
    }

    this.showAIResponse("Summarizing document...", () => {
      const summary = this.createSummary(text);
      return `Document Summary:\n\n${summary}\n\nThis summary captures the key points of your ${text.split(/\s+/).length}-word document.`;
    });
  }

  createSummary(text) {
    // Basic summarization (first and last sentences + key points)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length <= 3) {
      return text; // Too short to summarize
    }
    
    const firstSentence = sentences[0].trim();
    const lastSentence = sentences[sentences.length - 1].trim();
    const middleSentence = sentences[Math.floor(sentences.length / 2)].trim();
    
    return `${firstSentence}. ${middleSentence}. ${lastSentence}.`;
  }

  generateTitle() {
    const text = this.editor.innerText || "";
    if (text.trim().length < 20) {
      this.showToast("Document is too short to generate a title", "warning");
      return;
    }

    this.showAIResponse("Generating title...", () => {
      const title = this.generateTitleFromText(text);
      return `Suggested Title:\n\n"${title}"\n\nThis title is based on the main topic and key words in your document.`;
    });
  }

  generateTitleFromText(text) {
    // Extract first sentence or create from key words
    const firstSentence = text.split(/[.!?]+/)[0].trim();
    if (firstSentence.length <= 60) {
      return firstSentence;
    }
    
    // Create title from first few words
    const words = firstSentence.split(/\s+/).slice(0, 8);
    return words.join(" ") + "...";
  }

  expandIdeas() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().trim().length > 0) {
      const selectedText = selection.toString();
      this.showAIResponse("Expanding ideas...", () => {
        return `Ideas to expand "${selectedText}":\n\n1. Provide examples and case studies\n2. Add supporting evidence or data\n3. Include related concepts or perspectives\n4. Explain the implications or consequences\n5. Compare with similar ideas or alternatives\n\nUse these suggestions to develop your ideas further.`;
      });
    } else {
      this.showToast("Please select text to expand ideas", "warning");
    }
  }

  showAIResponse(loadingMessage, callback) {
    const responseSection = document.getElementById("aiResponseSection");
    const responseDiv = document.getElementById("aiResponse");
    
    if (!responseSection || !responseDiv) return;
    
    responseSection.style.display = "block";
    responseDiv.textContent = loadingMessage;
    responseDiv.style.fontStyle = "italic";
    responseDiv.style.color = "var(--text-secondary)";
    
    // Simulate AI processing
    setTimeout(() => {
      const response = callback();
      responseDiv.textContent = response;
      responseDiv.style.fontStyle = "normal";
      responseDiv.style.color = "var(--text-primary)";
      
      // Scroll to response
      responseSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 1500);
  }

  applyStyle(styleName) {
    const editor = document.getElementById("editor");
    if (!editor) return;

    // Remove existing style classes
    editor.classList.remove(
      "style-heading1",
      "style-heading2",
      "style-heading3",
      "style-normal",
      "style-quote",
      "style-code",
    );

    // Apply new style
    switch (styleName) {
      case "heading1":
        document.execCommand("formatBlock", false, "h1");
        editor.classList.add("style-heading1");
        break;
      case "heading2":
        document.execCommand("formatBlock", false, "h2");
        editor.classList.add("style-heading2");
        break;
      case "heading3":
        document.execCommand("formatBlock", false, "h3");
        editor.classList.add("style-heading3");
        break;
      case "normal":
        document.execCommand("formatBlock", false, "p");
        editor.classList.add("style-normal");
        break;
      case "quote":
        document.execCommand("formatBlock", false, "blockquote");
        editor.classList.add("style-quote");
        break;
      case "code":
        document.execCommand("formatBlock", false, "pre");
        editor.classList.add("style-code");
        break;
    }

    this.saveDocumentState();
    this.showToast(`✅ Applied ${styleName} style`, "success");
  }

  updateWordCount() {
    const text = this.editor.innerText || this.editor.textContent;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    document.getElementById("wordCount").textContent = words;
    document.getElementById("charCount").textContent = characters;
    document.getElementById("readingTime").textContent = readingTime;
  }

  updateStatusBar() {
    const fontFamily = document.getElementById("fontFamily").value;
    const fontSize = document.getElementById("fontSize").value;
    document.getElementById("currentFont").textContent =
      `${fontFamily}, ${fontSize}`;
  }

  updateSaveStatus(status) {
    const statusElement = document.getElementById("saveStatus");
    const spinnerElement = document.getElementById("autosaveSpinner");

    statusElement.textContent = status;

    if (status === "Auto-saved") {
      spinnerElement.style.display = "none";
    } else if (status === "Saving...") {
      spinnerElement.style.display = "inline-block";
    }
  }

  autoSave() {
    this.updateSaveStatus("Saving...");
    setTimeout(() => {
      this.saveDocumentState();
    }, 500);
  }

  handleEditorInput() {
    this.updateWordCount();
    this.saveDocumentState();
  }

  showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    toastMessage.textContent = message;
    toast.className = `toast ${type} active`;

    setTimeout(() => {
      toast.classList.remove("active");
    }, 3000);
  }

  executeCommand(command, value = null) {
    document.execCommand(command, false, value);
    this.editor.focus();
  }

  // Missing essential methods
  undo() {
    if (!this.currentDoc.history) return;
    if (this.currentDoc.historyIndex > 0) {
      this.currentDoc.historyIndex--;
      const prevContent = this.currentDoc.history[this.currentDoc.historyIndex];
      this.editor.innerHTML = prevContent;
      this.currentDoc.content = prevContent;
      this.updateWordCount();
      this.updateStatusBar();
      this.updateSaveStatus("Unsaved changes...");
    } else {
      this.showToast("No more undo steps", "warning");
    }
  }

  redo() {
    if (!this.currentDoc.history) return;
    if (this.currentDoc.historyIndex < this.currentDoc.history.length - 1) {
      this.currentDoc.historyIndex++;
      const nextContent = this.currentDoc.history[this.currentDoc.historyIndex];
      this.editor.innerHTML = nextContent;
      this.currentDoc.content = nextContent;
      this.updateWordCount();
      this.updateStatusBar();
      this.updateSaveStatus("Unsaved changes...");
    } else {
      this.showToast("No more redo steps", "warning");
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    this.setTheme(this.currentTheme);
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    const themeIcon = document.getElementById("themeIcon");
    if (themeIcon) {
      themeIcon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
    }

    // Update editor page background
    if (this.page) {
      if (theme === "dark") {
        this.page.style.background = "#1e293b";
        this.page.style.color = "#f8fafc";
      } else {
        this.page.style.background = "white";
        this.page.style.color = "black";
      }
    }

    localStorage.setItem("editor_theme", theme);
    this.showToast(`Switched to ${theme} mode`, "success");
  }

  exportToPDF() {
    this.showToast("Exporting to PDF...", "success");

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF("p", "mm", "a4");

      // Get the editor content as text
      const textContent =
        this.editor.innerText || this.editor.textContent || "";
      const lines = doc.splitTextToSize(textContent, 190);

      let yPosition = 20;
      const pageHeight = 277;

      lines.forEach((line) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 10, yPosition);
        yPosition += 7;
      });

      doc.save((this.currentDoc.name || "document") + ".pdf");
      this.showToast("PDF exported successfully!", "success");
    } catch (error) {
      console.error("PDF export error:", error);
      this.showToast("PDF export failed. Please try again.", "error");
    }
  }

  exportToDOCX() {
    this.showToast("Exporting to DOCX...", "success");

    try {
      const content = this.editor.innerHTML;
      const blob = new Blob([content], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (this.currentDoc.name || "document") + ".html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showToast("Document exported successfully!", "success");
    } catch (error) {
      console.error("DOCX export error:", error);
      this.showToast("Export failed. Please try again.", "error");
    }
  }

  changeLanguage(lang) {
    localStorage.setItem("editor_language", lang);
    this.showToast(`Language changed to ${lang.toUpperCase()}`, "success");
  }

  setPageSize(size) {
    this.page.className = "page " + size;
    this.showToast(`Page size changed to ${size.toUpperCase()}`, "success");
  }

  setPageOrientation(orientation) {
    if (orientation === "landscape") {
      this.page.style.transform = "rotate(90deg)";
      this.page.style.margin = "50px auto";
    } else {
      this.page.style.transform = "none";
      this.page.style.margin = "20px auto";
    }
    this.showToast(`Page orientation changed to ${orientation}`, "success");
  }

  toggleSpellCheck() {
    this.spellCheckEnabled = !this.spellCheckEnabled;
    this.editor.spellcheck = this.spellCheckEnabled;

    const btn = document.getElementById("spellCheckBtn");
    if (this.spellCheckEnabled) {
      btn.classList.add("active");
      this.showToast("Spell check enabled", "success");
    } else {
      btn.classList.remove("active");
      this.showToast("Spell check disabled", "success");
    }
  }

  openDocument() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.html,.docx";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          this.editor.innerHTML = content;
          this.saveDocumentState();
          this.showToast(`Opened "${file.name}" successfully`, "success");
        };
        reader.readAsText(file);
      }
    };

    input.click();
  }

  saveDocument() {
    this.saveDocumentState();
    this.showToast("Document saved successfully", "success");
  }

  zoomIn() {
    if (this.zoomLevel < 200) {
      this.zoomLevel += 10;
      this.updateZoom();
    }
  }

  zoomOut() {
    if (this.zoomLevel > 50) {
      this.zoomLevel -= 10;
      this.updateZoom();
    }
  }

  updateZoom() {
    this.page.style.transform = `scale(${this.zoomLevel / 100})`;
    document.getElementById("zoomPercent").textContent = `${this.zoomLevel}%`;
  }

  // Context menu methods for tabs
  showTabContextMenu(tab, x, y) {
    this.contextMenuTab = tab;
    this.contextMenuDocId = tab.dataset.docId;

    let contextMenu = document.getElementById("tabContextMenu");
    if (!contextMenu) {
      contextMenu = document.createElement("div");
      contextMenu.id = "tabContextMenu";
      contextMenu.className = "context-menu";
      contextMenu.innerHTML = `
                <button class="context-menu-item" onclick="window.charlesEditor.renameCurrentDocument()">
                    <i class="fas fa-edit"></i> Rename
                </button>
                <button class="context-menu-item" onclick="window.charlesEditor.duplicateCurrentDocument()">
                    <i class="fas fa-copy"></i> Duplicate
                </button>
                <button class="context-menu-item" onclick="window.charlesEditor.closeCurrentDocument()">
                    <i class="fas fa-times"></i> Close
                </button>
            `;
      document.body.appendChild(contextMenu);
    }

    contextMenu.style.left = x + "px";
    contextMenu.style.top = y + "px";
    contextMenu.style.display = "block";
  }

  hideTabContextMenu() {
    const contextMenu = document.getElementById("tabContextMenu");
    if (contextMenu) {
      contextMenu.style.display = "none";
    }
  }

  renameCurrentDocument() {
    this.hideTabContextMenu();
    const doc = this.documents[this.contextMenuDocId || this.currentDocId];
    if (!doc) return;

    const newName = prompt("Enter new document name:", doc.name);
    if (newName && newName.trim()) {
      doc.name = newName.trim();

      const tab = document.querySelector(
        `.tab[data-doc-id="${this.contextMenuDocId || this.currentDocId}"]`,
      );
      if (tab) {
        tab.querySelector("span").textContent = doc.name;
      }

      localStorage.setItem(
        `charles_editor_doc_${this.contextMenuDocId || this.currentDocId}_name`,
        doc.name,
      );
      this.showToast(`Document renamed to "${doc.name}"`, "success");
    }
  }

  duplicateCurrentDocument() {
    const originalDoc =
      this.documents[this.contextMenuDocId || this.currentDocId];
    if (!originalDoc) return;

    const newDocId = "doc" + Date.now();
    const newDocName = originalDoc.name + " (Copy)";

    this.documents[newDocId] = {
      id: newDocId,
      name: newDocName,
      content: originalDoc.content,
      history: [...(originalDoc.history || [])],
      historyIndex: originalDoc.historyIndex || 0,
      lastSave: new Date(),
    };

    const tab = document.createElement("div");
    tab.className = "tab";
    tab.dataset.docId = newDocId;
    tab.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <span>${newDocName}</span>
            <span class="tab-close"><i class="fas fa-times"></i></span>
        `;

    document.getElementById("documentTabs").appendChild(tab);
    this.hideTabContextMenu();
    this.switchDocument(newDocId);
    this.showToast(`Document duplicated as "${newDocName}"`, "success");
  }

  closeCurrentDocument() {
    const docId = this.contextMenuDocId || this.currentDocId;
    this.closeDocument(docId);
    this.hideTabContextMenu();
  }
}

// Handle OAuth callback from Google Drive
function handleOAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const state = urlParams.get("state");
  const storedState = localStorage.getItem("gdrive_oauth_state");

  if (code && state && state === storedState) {
    // Clear the state
    localStorage.removeItem("gdrive_oauth_state");

    // Exchange code for tokens
    const clientId = localStorage.getItem("gdrive_client_id");
    if (!clientId) {
      console.error("No client ID found");
      return;
    }

    // Note: In production, this should be done server-side
    // For client-side only, we'll use the code directly
    // This is a simplified version - proper implementation needs a backend

    const tokenData = {
      code: code,
      client_id: clientId,
      redirect_uri: window.location.origin,
      grant_type: "authorization_code",
    };

    fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(tokenData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.access_token) {
          localStorage.setItem("gdrive_access_token", data.access_token);
          if (data.refresh_token) {
            localStorage.setItem("gdrive_refresh_token", data.refresh_token);
          }
          const expiryTime = Date.now() + data.expires_in * 1000;
          localStorage.setItem("gdrive_token_expiry", expiryTime.toString());

          // Clean up URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );

          // Show success message
          if (window.charlesEditor) {
            window.charlesEditor.showToast(
              "✅ Google Drive authentication successful!",
              "success",
            );
            // Attempt to upload the current document
            setTimeout(() => {
              window.charlesEditor.uploadToGoogleDrive(data.access_token);
            }, 1000);
          }
        } else {
          console.error("Failed to get access token:", data);
          if (window.charlesEditor) {
            window.charlesEditor.showToast(
              "❌ Authentication failed. Please try again.",
              "error",
            );
          }
        }
      })
      .catch((error) => {
        console.error("Token exchange error:", error);
        if (window.charlesEditor) {
          window.charlesEditor.showToast(
            "❌ Authentication error. Note: Client-side OAuth has limitations.",
            "error",
          );
        }
      });
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  try {
    window.charlesEditor = new CharlesWebEditor();
    // Alias for backward compatibility with inline handlers
    window.charliesEditor = window.charlesEditor;

    // Check for OAuth callback
    handleOAuthCallback();
  } catch (error) {
    console.error("❌ Failed to initialize CharlesWebEditor:", error);

    // Show user-friendly error message
    document.body.innerHTML = `
      <div style="max-width:600px;margin:100px auto;padding:40px;
           background:#fee2e2;border:2px solid #dc2626;border-radius:10px;
           font-family:system-ui,sans-serif;text-align:center;">
        <h1 style="color:#dc2626;margin-bottom:20px;">⚠️ Initialization Error</h1>
        <p style="font-size:1.1em;color:#333;margin-bottom:15px;">
          CharlesWebEditor failed to load properly.
        </p>
        <p style="font-size:0.9em;color:#666;margin-bottom:25px;">
          Error: ${error.message}
        </p>
        <button onclick="location.reload()"
                style="padding:12px 24px;background:#dc2626;color:white;
                border:none;border-radius:6px;cursor:pointer;font-size:1em;
                font-weight:600;">
          Reload Page
        </button>
      </div>
    `;
  }
});

// Handle errors gracefully
window.addEventListener("error", (event) => {
  console.error("CharlesWebEditor error:", event.error);
});

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});
