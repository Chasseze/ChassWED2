const WebEditorTemplates = [
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
