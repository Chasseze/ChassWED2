// CharlesWebEditor main JS
// Main Editor Class
class CharlesWebEditor {
    constructor() {
        this.currentDocId = 'doc1';
        this.documents = {
            'doc1': {
                id: 'doc1',
                name: 'Document 1',
                content: '',
                history: [],
                historyIndex: -1,
                lastSave: null
            }
        };
        this.currentDoc = this.documents['doc1'];
        
        // Editor DOM elements
        this.editor = document.getElementById('editor');
        this.page = document.getElementById('page');
        this.pageContainer = document.getElementById('pageContainer');
        
        // State variables
        this.zoomLevel = 100;
        this.spellCheckEnabled = false;
        this.selectedImage = null;
        this.currentTheme = localStorage.getItem('editor_theme') || 'light';
        
        // Templates
        this.templates = [
            {
                id: 'blank',
                name: 'Blank Document',
                description: 'Start with a clean slate',
                icon: 'fas fa-file',
                content: '<p>Start typing here...</p>'
            },
            {
                id: 'resume',
                name: 'Professional Resume',
                description: 'Modern resume template',
                icon: 'fas fa-user-tie',
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
                `
            },
            {
                id: 'letter',
                name: 'Business Letter',
                description: 'Professional letter format',
                icon: 'fas fa-envelope',
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
                    <p>Your Title (if applicable)</p>
                `
            },
            {
                id: 'report',
                name: 'Project Report',
                description: 'Structured report format',
                icon: 'fas fa-chart-bar',
                content: `
                    <h1>Project Report: [Project Title]</h1>
                    
                    <p><strong>Date:</strong> [Date]<br>
                    <strong>Prepared by:</strong> [Your Name]<br>
                    <strong>Department:</strong> [Department]</p>
                    
                    <h2>Executive Summary</h2>
                    <p>[Brief overview of the project, objectives, methodology, and key findings. This section should provide a complete picture in 2-3 paragraphs.]</p>
                    
                    <h2>Introduction</h2>
                    <p>[Background information, project scope, and objectives. Explain why this project was initiated and what it aims to achieve.]</p>
                    
                    <h2>Methodology</h2>
                    <p>[Detailed description of the approach, methods, and tools used. Explain the data collection process and analysis techniques.]</p>
                    
                    <h2>Findings</h2>
                    <p>[Present the main findings and results. Use bullet points or numbered lists for clarity.]</p>
                    <ul>
                        <li>Key finding 1 with supporting data</li>
                        <li>Key finding 2 with supporting data</li>
                        <li>Key finding 3 with supporting data</li>
                    </ul>
                    
                    <h2>Analysis</h2>
                    <p>[Interpretation of the findings. Explain what the results mean and their implications.]</p>
                    
                    <h2>Recommendations</h2>
                    <p>[Actionable recommendations based on the findings. Be specific and practical.]</p>
                    <ol>
                        <li>Recommendation 1 with implementation details</li>
                        <li>Recommendation 2 with implementation details</li>
                        <li>Recommendation 3 with implementation details</li>
                    </ol>
                    
                    <h2>Conclusion</h2>
                    <p>[Summary of the project and its significance. Reiterate the most important points and future implications.]</p>
                    
                    <h2>Appendices</h2>
                    <p>[Additional information, data tables, charts, or supplementary materials.]</p>
                `
            },
            {
                id: 'meeting',
                name: 'Meeting Notes',
                description: 'Organized meeting format',
                icon: 'fas fa-users',
                content: `
                    <h1>Meeting Notes</h1>
                    
                    <p><strong>Date:</strong> [Date]<br>
                    <strong>Time:</strong> [Time]<br>
                    <strong>Location:</strong> [Location/Virtual Platform]<br>
                    <strong>Attendees:</strong> [List of attendees]</p>
                    
                    <h2>Agenda</h2>
                    <ol>
                        <li>[Agenda item 1]</li>
                        <li>[Agenda item 2]</li>
                        <li>[Agenda item 3]</li>
                    </ol>
                    
                    <h2>Discussion Summary</h2>
                    <h3>[Agenda Item 1]</h3>
                    <p>[Summary of discussion, key points raised, and decisions made]</p>
                    
                    <h3>[Agenda Item 2]</h3>
                    <p>[Summary of discussion, key points raised, and decisions made]</p>
                    
                    <h3>[Agenda Item 3]</h3>
                    <p>[Summary of discussion, key points raised, and decisions made]</p>
                    
                    <h2>Action Items</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f0f0f0;">
                            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Action Item</th>
                            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Responsible</th>
                            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Deadline</th>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ccc; padding: 8px;">[Action item 1]</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">[Person responsible]</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">[Date]</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ccc; padding: 8px;">[Action item 2]</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">[Person responsible]</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">[Date]</td>
                        </tr>
                    </table>
                    
                    <h2>Next Meeting</h2>
                    <p><strong>Date:</strong> [Next meeting date]<br>
                    <strong>Time:</strong> [Next meeting time]<br>
                    <strong>Location:</strong> [Next meeting location]</p>
                `
            },
            {
                id: 'invoice',
                name: 'Invoice Template',
                description: 'Professional invoice format',
                icon: 'fas fa-file-invoice',
                content: `
                    <h1 style="text-align: center;">INVOICE</h1>
                    
                    <table style="width: 100%; margin: 30px 0;">
                        <tr>
                            <td style="width: 50%;">
                                <strong>[Your Company Name]</strong><br>
                                [Your Address]<br>
                                [City, State ZIP]<br>
                                [Your Email]<br>
                                [Your Phone]
                            </td>
                            <td style="width: 50%; text-align: right;">
                                <strong>Invoice #:</strong> [Invoice Number]<br>
                                <strong>Date:</strong> [Current Date]<br>
                                <strong>Due Date:</strong> [Due Date]
                            </td>
                        </tr>
                    </table>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr style="background: #f0f0f0;">
                            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Description</th>
                            <th style="border: 1px solid #ccc; padding: 8px; text-align: center;">Quantity</th>
                            <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Unit Price</th>
                            <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Total</th>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ccc; padding: 8px;">[Item/Service 1]</td>
                            <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">[Qty]</td>
                            <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">[$$]</td>
                            <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">[$$]</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ccc; padding: 8px;">[Item/Service 2]</td>
                            <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">[Qty]</td>
                            <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">[$$]</td>
                            <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">[$$]</td>
                        </tr>
                        <tr>
                            <td colspan="3" style="border: 1px solid #ccc; padding: 8px; text-align: right;"><strong>Subtotal:</strong></td>
                            <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">[$$]</td>
                        </tr>
                        <tr>
                            <td colspan="3" style="border: 1px solid #ccc; padding: 8px; text-align: right;"><strong>Tax:</strong></td>
                            <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">[$$]</td>
                        </tr>
                        <tr style="background: #f0f0f0; font-weight: bold;">
                            <td colspan="3" style="border: 1px solid #ccc; padding: 8px; text-align: right;">Total:</td>
                            <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">[$$]</td>
                        </tr>
                    </table>
                    
                    <p><strong>Payment Terms:</strong> Net 30 days<br>
                    <strong>Payment Methods:</strong> [Accepted payment methods]<br>
                    <strong>Thank you for your business!</strong></p>
                `
            }
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
    }
    
    setupEventListeners() {
        // Welcome screen buttons
        document.getElementById('startEditorBtn').addEventListener('click', () => {
            this.startEditor();
        });
        
        document.getElementById('tourBtn').addEventListener('click', () => {
            this.showTour();
        });
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // File Operations
        document.getElementById('newDocBtn').addEventListener('click', () => {
            this.addNewDocument();
        });
        
        document.getElementById('openDocBtn').addEventListener('click', () => {
            this.openDocument();
        });
        
        // Close buttons for modals
        document.getElementById('closeFindBtn').addEventListener('click', () => {
            this.hideFindModal();
        });
        
        document.getElementById('closeReplaceBtn').addEventListener('click', () => {
            this.hideReplaceModal();
        });
        
        // Font family and size
        document.getElementById('fontFamily').addEventListener('change', (e) => {
            this.executeCommand('fontName', e.target.value);
            this.saveDocumentState();
        });
        
        document.getElementById('fontSize').addEventListener('change', (e) => {
            this.executeCommand('fontSize', e.target.value);
            this.saveDocumentState();
        });
        
        // Text formatting buttons
        document.querySelectorAll('[data-command]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const command = e.target.closest('[data-command]').dataset.command;
                this.executeCommand(command);
                this.saveDocumentState();
            });
        });
        
        document.getElementById('textColor').addEventListener('input', (e) => {
            this.executeCommand('foreColor', e.target.value);
            this.saveDocumentState();
        });
        
        document.getElementById('highlightColor').addEventListener('input', (e) => {
            this.executeCommand('backColor', e.target.value);
            this.saveDocumentState();
        });
        
        // Image insertion
        document.getElementById('insertImageBtn').addEventListener('click', () => {
            this.insertImage();
        });
        
        // Table insertion
        document.getElementById('insertTableBtn').addEventListener('click', () => {
            this.insertTable();
        });
        
        // Link insertion
        document.getElementById('insertLinkBtn').addEventListener('click', () => {
            this.insertLink();
        });
        
        // Find and replace
        document.getElementById('findBtn').addEventListener('click', () => {
            this.showFindModal();
        });
        
        document.getElementById('replaceBtn').addEventListener('click', () => {
            this.showReplaceModal();
        });
        
        // Modal controls
        document.getElementById('closeFindModal').addEventListener('click', () => {
            this.hideFindModal();
        });
        
        document.getElementById('closeReplaceModal').addEventListener('click', () => {
            this.hideReplaceModal();
        });
        
        // Find functionality
        document.getElementById('findNextBtn').addEventListener('click', () => {
            this.findNext();
        });
        
        document.getElementById('findPrevBtn').addEventListener('click', () => {
            this.findPrevious();
        });
        
        document.getElementById('replaceBtnModal').addEventListener('click', () => {
            this.replaceCurrent();
        });
        
        document.getElementById('replaceAllBtn').addEventListener('click', () => {
            this.replaceAll();
        });
        
        // Document management
        document.getElementById('addTabBtn').addEventListener('click', () => {
            this.addNewDocument();
        });
        
        // Save and export
        document.getElementById('saveDocBtn').addEventListener('click', () => {
            this.saveDocument();
        });
        
        document.getElementById('saveCloud').addEventListener('click', () => {
            this.saveToCloud();
        });


        
        document.getElementById('exportDocx').addEventListener('click', () => {
            this.exportToDocx();
        });
        
        document.getElementById('exportPdf').addEventListener('click', () => {
            this.exportToPDF();
        });
        
        document.getElementById('printBtn').addEventListener('click', () => {
            window.print();
        });
        
        // Undo/Redo
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undo();
        });
        
        document.getElementById('redoBtn').addEventListener('click', () => {
            this.redo();
        });
        
        // Spell check
        document.getElementById('spellCheckBtn').addEventListener('click', () => {
            this.toggleSpellCheck();
        });
        
        // Page layout
        document.getElementById('toggleSidebarBtn').addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        document.getElementById('pageSize').addEventListener('change', (e) => {
            this.setPageSize(e.target.value);
        });
        
        document.getElementById('pageSizeSelect').addEventListener('change', (e) => {
            this.setPageSize(e.target.value);
        });
        
        document.getElementById('pageOrientation').addEventListener('change', (e) => {
            this.setPageOrientation(e.target.value);
        });
        
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });
        
        // Sidebar tabs
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchSidebarTab(e.target.dataset.tab);
            });
        });
        
        // Quick styles
        document.querySelectorAll('[data-style]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyStyle(e.target.closest('[data-style]').dataset.style);
            });
        });
        
        // Clear recent documents
        document.getElementById('clearRecentBtn').addEventListener('click', () => {
            this.clearRecentDocuments();
        });
        
        // Rename modal
        document.getElementById('closeRenameModal').addEventListener('click', () => {
            this.hideRenameModal();
        });
        
        document.getElementById('cancelRenameBtn').addEventListener('click', () => {
            this.hideRenameModal();
        });
        
        document.getElementById('confirmRenameBtn').addEventListener('click', () => {
            this.confirmRename();
        });
        
        // Context menu for tabs
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.tab')) {
                e.preventDefault();
                this.showTabContextMenu(e.target.closest('.tab'), e.clientX, e.clientY);
            } else {
                this.hideTabContextMenu();
            }
        });
        
        // Hide context menu on click outside
        document.addEventListener('click', () => {
            this.hideTabContextMenu();
        });
        
        // Zoom controls
        document.getElementById('zoomInBtn').addEventListener('click', () => {
            this.zoomIn();
        });
        
        document.getElementById('zoomOutBtn').addEventListener('click', () => {
            this.zoomOut();
        });
        
        // Help button
        document.getElementById('helpFab').addEventListener('click', () => {
            this.showHelpModal();
        });
        
        document.getElementById('closeHelpModal').addEventListener('click', () => {
            this.hideHelpModal();
        });
        
        document.getElementById('closeHelpBtn').addEventListener('click', () => {
            this.hideHelpModal();
        });
        
        // Help modal tabs
        document.querySelectorAll('.help-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchHelpTab(tabName);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'n':
                        e.preventDefault();
                        this.addNewDocument();
                        break;
                    case 'o':
                        e.preventDefault();
                        this.openDocument();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveDocument();
                        break;
                    case 'p':
                        e.preventDefault();
                        window.print();
                        break;
                    case '\\':
                        e.preventDefault();
                        this.toggleSidebar();
                        break;
                }
            } else if (e.key === 'F2') {
                e.preventDefault();
                // Get the active tab
                const activeTab = document.querySelector('.tab.active');
                if (activeTab) {
                    this.contextMenuDocId = activeTab.dataset.docId;
                    this.showRenameModal();
                }
            }
        });
        
        // Editor events
        this.editor.addEventListener('input', () => {
            this.updateWordCount();
            this.saveDocumentState();
        });
        
        document.addEventListener('click', (e) => {
            // Prevent tab selection during context menu
            if (e.target.closest('.tab') && !e.ctrlKey && !e.metaKey) {
                const tab = e.target.closest('.tab');
                const docId = tab.dataset.docId;
                if (docId && docId !== this.currentDocId && !e.target.closest('.tab-close')) {
                    this.switchDocument(docId);
                }
            }
            
            // Close tab
            if (e.target.closest('.tab-close')) {
                e.stopPropagation();
                const tab = e.target.closest('.tab');
                const docId = tab.dataset.docId;
                this.closeDocument(docId);
            }
            
            // Hide context menu
            this.hideTabContextMenu();
        });
    }
    
    executeCommand(command, value = null) {
        document.execCommand(command, false, value);
        this.editor.focus();
    }
    
    insertImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.className = 'editor-image';
                    img.style.maxWidth = '300px';
                    img.style.height = 'auto';
                    img.style.margin = '10px 0';
                    
                    this.executeCommand('insertHTML', img.outerHTML);
                    this.saveDocumentState();
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    }
    
    selectImage(img) {
        if (this.selectedImage) {
            this.selectedImage.classList.remove('selected');
        }
        this.selectedImage = img;
        img.classList.add('selected');
    }
    
    insertTable() {
        const rows = prompt('Enter number of rows:', '3');
        const cols = prompt('Enter number of columns:', '3');
        
        if (rows && cols) {
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.margin = '10px 0';
            
            for (let i = 0; i < parseInt(rows); i++) {
                const row = document.createElement('tr');
                
                for (let j = 0; j < parseInt(cols); j++) {
                    const cell = document.createElement('td');
                    cell.innerHTML = '&nbsp;';
                    cell.style.border = '1px solid #ccc';
                    cell.style.padding = '8px';
                    row.appendChild(cell);
                }
                
                table.appendChild(row);
            }
            
            this.executeCommand('insertHTML', table.outerHTML);
            this.saveDocumentState();
        }
    }
    
    insertLink() {
        const url = prompt('Enter the URL:', 'https://');
        const text = prompt('Enter link text:', 'Click here');
        
        if (url && text) {
            const link = document.createElement('a');
            link.href = url;
            link.textContent = text;
            link.style.color = '#2563eb';
            link.style.textDecoration = 'underline';
            
            this.executeCommand('insertHTML', link.outerHTML);
            this.saveDocumentState();
            this.showToast('Link inserted successfully', 'success');
        }
    }
    
    openDocument() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.html,.docx';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target.result;
                    
                    // Create new document with file content
                    const docId = 'doc' + Date.now();
                    const docName = file.name.split('.')[0];
                    
                    this.documents[docId] = {
                        id: docId,
                        name: docName,
                        content: content,
                        history: [content],
                        historyIndex: 0,
                        lastSave: new Date()
                    };
                    
                    const tab = document.createElement('div');
                    tab.className = 'tab';
                    tab.dataset.docId = docId;
                    tab.innerHTML = `
                        <i class="fas fa-file-alt"></i>
                        <span>${docName}</span>
                        <span class="tab-close"><i class="fas fa-times"></i></span>
                    `;
                    
                    document.getElementById('documentTabs').appendChild(tab);
                    
                    this.switchDocument(docId);
                    this.showToast(`Opened "${docName}" successfully`, 'success');
                };
                
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
    
    exportToDocx() {
        this.showToast('Exporting to DOCX format...', 'success');
        
        // Since we don't have a native DOCX library, we'll create a simple solution
        // For production, consider using docx.js or similar
        const content = this.editor.innerHTML;
        
        // Create a Word-compatible XML format
        const docxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        ${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </w:body>
</w:document>`;
        
        // For now, export as HTML which can be opened in Word
        const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (this.currentDoc.name || 'document') + '.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Document exported as DOCX-compatible format! Check your downloads!', 'success');
    }
    
    changeLanguage(lang) {
        // Save language preference
        localStorage.setItem('editor_language', lang);
        this.showToast(`Language changed to ${lang.toUpperCase()}`, 'success');
        
        // In a production app, you would load language pack here
        // For now, this is a placeholder for future localization
    }
    
    showFindModal() {
        document.getElementById('findModal').classList.add('active');
        document.getElementById('findInput').focus();
    }
    
    hideFindModal() {
        document.getElementById('findModal').classList.remove('active');
    }
    
    showReplaceModal() {
        document.getElementById('replaceModal').classList.add('active');
        document.getElementById('replaceFindInput').focus();
    }
    
    hideReplaceModal() {
        document.getElementById('replaceModal').classList.remove('active');
    }
    
    findNext() {
        const findText = document.getElementById('findInput').value;
        if (!findText) return;
        
        const content = this.editor.innerHTML;
        const regex = new RegExp(findText, 'gi');
        const match = regex.exec(content);
        
        if (match) {
            this.showToast(`Found "${findText}"`, 'success');
        } else {
            this.showToast(`"${findText}" not found`, 'warning');
        }
    }
    
    findPrevious() {
        this.findNext();
    }
    
    replaceCurrent() {
        const findText = document.getElementById('replaceFindInput').value;
        const replaceText = document.getElementById('replaceInput').value;
        
        if (!findText) return;
        
        const selection = window.getSelection();
        if (selection.toString().toLowerCase() === findText.toLowerCase()) {
            this.executeCommand('insertText', replaceText);
            this.saveDocumentState();
        } else {
            this.findNext();
        }
    }
    
    replaceAll() {
        const findText = document.getElementById('replaceFindInput').value;
        const replaceText = document.getElementById('replaceInput').value;
        
        if (!findText) return;
        
        let content = this.editor.innerHTML;
        const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        content = content.replace(regex, replaceText);
        
        this.editor.innerHTML = content;
        this.saveDocumentState();
        this.showToast(`Replaced all occurrences of "${findText}"`, 'success');
    }
    
    addNewDocument() {
        const docId = 'doc' + Date.now();
        const docName = `Document ${Object.keys(this.documents).length + 1}`;
        
        this.documents[docId] = {
            id: docId,
            name: docName,
            content: '',
            history: [],
            historyIndex: -1,
            lastSave: null
        };
        
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.docId = docId;
        tab.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <span>${docName}</span>
            <span class="tab-close"><i class="fas fa-times"></i></span>
        `;
        
        document.getElementById('documentTabs').appendChild(tab);
        
        this.switchDocument(docId);
    }
    
    switchDocument(docId) {
        if (!this.documents[docId]) return;
        
        // Save current document to recent
        this.saveToRecent(this.currentDoc);
        
        this.currentDoc.content = this.editor.innerHTML;
        
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.docId === docId) {
                tab.classList.add('active');
            }
        });
        
        this.currentDocId = docId;
        this.currentDoc = this.documents[docId];
        
        this.editor.innerHTML = this.currentDoc.content || '<p>New document</p>';
        
        this.updateWordCount();
        this.updateStatusBar();
        
        this.showToast(`Switched to ${this.currentDoc.name}`, 'success');
    }
    
    closeDocument(docId) {
        if (Object.keys(this.documents).length <= 1) {
            this.showToast('Cannot close the last document', 'error');
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
            const temp = document.createElement('div');
            temp.innerHTML = html;
            temp.querySelectorAll('script, style').forEach(el => el.remove());
            temp.querySelectorAll('*').forEach(el => {
                [...el.attributes].forEach(attr => {
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
            this.currentDoc.history = this.currentDoc.history.slice(0, this.currentDoc.historyIndex + 1);
        }
        if (this.currentDoc.history.length === 0 || this.currentDoc.history[this.currentDoc.history.length - 1] !== content) {
            this.currentDoc.history.push(content);
            this.currentDoc.historyIndex = this.currentDoc.history.length - 1;
        }
        localStorage.setItem(`charles_editor_doc_${this.currentDocId}`, content);
        localStorage.setItem(`charles_editor_doc_${this.currentDocId}_name`, this.currentDoc.name);
        this.currentDoc.lastSave = new Date();
        this.updateSaveStatus('Auto-saved');
        
        // Save to recent documents
        this.saveToRecent(this.currentDoc);
    }
    
    saveDocument() {
        this.saveDocumentState();
        this.showToast('Document saved successfully', 'success');
    }
    
    loadFromLocalStorage() {
        const savedContent = localStorage.getItem(`charles_editor_doc_${this.currentDocId}`);
        if (savedContent) {
            this.currentDoc.content = savedContent;
            this.editor.innerHTML = savedContent;
            
            const savedName = localStorage.getItem(`charles_editor_doc_${this.currentDocId}_name`);
            if (savedName) {
                this.currentDoc.name = savedName;
                const tab = document.querySelector(`.tab[data-doc-id="${this.currentDocId}"]`);
                if (tab) {
                    tab.querySelector('span').textContent = savedName;
                }
            }
        }
    }
    
    autoSave() {
        this.updateSaveStatus('Saving...');
        setTimeout(() => {
            this.saveDocumentState();
        }, 500);
    }
    
saveToCloud() {
        this.showToast('🔄 Saving to Google Drive...', 'success');
        
        // Check if user is already authenticated
        const accessToken = localStorage.getItem('gdrive_access_token');
        const refreshToken = localStorage.getItem('gdrive_refresh_token');
        const tokenExpiry = localStorage.getItem('gdrive_token_expiry');
        
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
        const storedClientId = localStorage.getItem('gdrive_client_id');
        
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
            localStorage.setItem('gdrive_client_id', clientId.trim());
            this.showToast('✅ Client ID saved! Initiating authentication...', 'success');
            setTimeout(() => this.initiateGoogleOAuthFlow(clientId.trim()), 1000);
        } else if (clientId === null) {
            // User clicked cancel
            this.showToast('Google Drive setup cancelled', 'warning');
        } else {
            this.showToast('Please enter a valid Client ID', 'error');
        }
    }
    
    initiateGoogleOAuthFlow(clientId) {
        const redirectUri = window.location.origin;
        const scope = 'https://www.googleapis.com/auth/drive.file';
        const state = Math.random().toString(36).substring(7);
        
        localStorage.setItem('gdrive_oauth_state', state);
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent(scope)}` +
            `&state=${state}` +
            `&access_type=offline` +
            `&prompt=consent`;
        
        // Store client ID for future reference
        localStorage.setItem('gdrive_client_id', clientId);
        
        // Open Google OAuth in new window
        const authWindow = window.open(authUrl, 'google_auth', 'width=500,height=600');
        
        // Listen for the OAuth callback
        const checkClosed = setInterval(() => {
            if (authWindow.closed) {
                clearInterval(checkClosed);
                this.showToast('Authentication window closed', 'warning');
            }
        }, 1000);
        
        this.showToast('📲 Opening Google authentication...', 'info');
    }
    
    initiateDeviceCodeFlow(clientId) {
        // Simplified device code flow
        this.showToast('🔐 Starting authentication...', 'info');
        
        fetch('https://login.microsoftonline.com/common/oauth2/v2.0/devicecode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: clientId,
                scope: 'Files.ReadWrite.All offline_access'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.device_code) {
                localStorage.setItem('onedrive_device_code', data.device_code);
                this.showAuthenticationPrompt(data, clientId);
            } else {
                throw new Error('Failed to get device code');
            }
        })
        .catch(error => {
            console.error('Device code error:', error);
            this.showToast('Authentication setup failed. Please try again.', 'error');
        });
    }
    
    showAuthenticationPrompt(deviceData, clientId) {
        const message = `📱 Authentication Required

Please visit this URL on any device:
${deviceData.verification_uri}

And enter this code:
${deviceData.user_code}

You have ${deviceData.expires_in} seconds.

Click OK once you've completed authentication.`;

        alert(message);
        
        // Poll for token
        this.pollForToken(deviceData.device_code, clientId, deviceData.interval);
    }
    
    pollForToken(deviceCode, clientId, interval) {
        const maxAttempts = 120; // 2 minutes max
        let attempts = 0;
        
        const pollInterval = setInterval(() => {
            attempts++;
            
            if (attempts > maxAttempts) {
                clearInterval(pollInterval);
                this.showToast('Authentication timeout. Please try again.', 'error');
                return;
            }
            
            fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                    device_code: deviceCode,
                    client_id: clientId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.access_token) {
                    clearInterval(pollInterval);
                    localStorage.setItem('onedrive_access_token', data.access_token);
                    if (data.refresh_token) {
                        localStorage.setItem('onedrive_refresh_token', data.refresh_token);
                    }
                    // Set expiry (usually 1 hour)
                    const expiryTime = Date.now() + (data.expires_in * 1000);
                    localStorage.setItem('onedrive_token_expiry', expiryTime.toString());
                    
                    this.showToast('✅ Successfully authenticated with OneDrive!', 'success');
                    
                    // Now upload the document
                    setTimeout(() => this.uploadToOneDrive(data.access_token), 1000);
                } else if (data.error && data.error !== 'authorization_pending') {
                    clearInterval(pollInterval);
                    this.showToast(`Authentication failed: ${data.error_description}`, 'error');
                }
            })
            .catch(error => {
                console.error('Token poll error:', error);
            });
        }, (interval || 5) * 1000);
    }
    
    refreshGoogleDriveToken(refreshToken) {
        const clientId = localStorage.getItem('gdrive_client_id');
        const clientSecret = localStorage.getItem('gdrive_client_secret');
        
        if (!clientId) {
            this.authenticateWithGoogleDrive();
            return;
        }
        
        const tokenData = {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/drive.file'
        };
        
        if (clientSecret) {
            tokenData.client_secret = clientSecret;
        }
        
        fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(tokenData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.access_token) {
                localStorage.setItem('gdrive_access_token', data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem('gdrive_refresh_token', data.refresh_token);
                }
                const expiryTime = Date.now() + (data.expires_in * 1000);
                localStorage.setItem('gdrive_token_expiry', expiryTime.toString());
                
                this.uploadToGoogleDrive(data.access_token);
            } else {
                // Refresh failed, re-authenticate
                this.authenticateWithGoogleDrive();
            }
        })
        .catch(error => {
            console.error('Google Drive token refresh error:', error);
            this.authenticateWithGoogleDrive();
        });
    }
    
    generateCodeChallenge() {
        // Generate a random code verifier for PKCE
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
    }
    
    uploadToGoogleDrive(accessToken) {
        const fileName = (this.currentDoc.name || 'document').replace(/[^\w\s-]/g, '') + '.html';
        const fileContent = this.currentDoc.content || this.editor.innerHTML;
        
        // First, create file metadata
        const metadata = {
            name: fileName,
            parents: ['appDataFolder'] // Save in app-specific folder
        };
        
        // Create multipart form data
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([fileContent], { type: 'text/html' }));
        
        // Upload to Google Drive using Google Drive API
        fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: form
        })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                this.showToast('✅ Document saved to Google Drive successfully!', 'success');
                this.currentDoc.lastSave = new Date();
                
                // Update status bar
                const timestamp = new Date().toLocaleTimeString();
                this.updateSaveStatus(`✓ Google Drive (${timestamp})`);
                
                // Store file ID for future reference
                localStorage.setItem(`gdrive_file_${this.currentDocId}`, data.id);
            } else {
                throw new Error('Upload failed');
            }
        })
        .catch(error => {
            console.error('Google Drive upload error:', error);
            this.showToast('⚠️ Failed to save to Google Drive. Check console for details.', 'error');
        });
    }
    
    exportToPDF() {
        const btn = document.getElementById('exportPdf');
        btn.classList.add('loading');
        this.showToast('Generating PDF with WYSIWYG formatting...', 'info');
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Get the editor content as HTML
        const editorContent = this.editor.innerHTML;
        
        // Create a temporary container to extract text with proper formatting
        const temp = document.createElement('div');
        temp.innerHTML = editorContent;
        
        // Use html2canvas or fallback to text with basic formatting
        const canvas = document.createElement('canvas');
        canvas.width = 210 * 4; // A4 width in pixels (approx)
        canvas.height = 297 * 4; // A4 height in pixels (approx)
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Extract formatted text and images
        let yPosition = 20;
        const pageWidth = 190;
        const pageHeight = 277;
        const margin = 10;
        
        // Process each element in the editor
        Array.from(temp.children).forEach((element) => {
            const tagName = element.tagName.toLowerCase();
            const text = element.innerText || element.textContent || '';
            
            if (yPosition > pageHeight) {
                doc.addPage();
                yPosition = margin;
            }
            
            switch(tagName) {
                case 'h1':
                    doc.setFontSize(28);
                    doc.setFont(undefined, 'bold');
                    yPosition += 10;
                    doc.text(text || '', margin, yPosition);
                    yPosition += 15;
                    break;
                    
                case 'h2':
                    doc.setFontSize(22);
                    doc.setFont(undefined, 'bold');
                    yPosition += 8;
                    doc.text(text || '', margin, yPosition);
                    yPosition += 12;
                    break;
                    
                case 'h3':
                    doc.setFontSize(18);
                    doc.setFont(undefined, 'bold');
                    yPosition += 6;
                    doc.text(text || '', margin, yPosition);
                    yPosition += 10;
                    break;
                    
                case 'p':
                    doc.setFontSize(11);
                    doc.setFont(undefined, 'normal');
                    const lines = doc.splitTextToSize(text || '', pageWidth);
                    doc.text(lines, margin, yPosition);
                    yPosition += (lines.length * 5) + 3;
                    break;
                    
                case 'ul':
                case 'ol':
                    doc.setFontSize(11);
                    doc.setFont(undefined, 'normal');
                    const items = element.querySelectorAll('li');
                    items.forEach((li, index) => {
                        const itemText = li.innerText || li.textContent || '';
                        const isOrdered = tagName === 'ol';
                        const bullet = isOrdered ? `${index + 1}. ` : '• ';
                        const lines = doc.splitTextToSize(bullet + itemText, pageWidth - 5);
                        doc.text(lines, margin + 5, yPosition);
                        yPosition += (lines.length * 5) + 2;
                    });
                    break;
                    
                case 'table':
                    doc.setFontSize(10);
                    const rows = element.querySelectorAll('tr');
                    rows.forEach(row => {
                        const cells = row.querySelectorAll('td, th');
                        let cellX = margin;
                        cells.forEach(cell => {
                            const cellText = cell.innerText || cell.textContent || '';
                            doc.rect(cellX, yPosition, 40, 10);
                            doc.text(cellText.substring(0, 10), cellX + 2, yPosition + 7);
                            cellX += 40;
                        });
                        yPosition += 10;
                    });
                    break;
                    
                case 'img':
                    if (element.src && yPosition + 40 < pageHeight) {
                        try {
                            doc.addImage(element.src, 'JPEG', margin, yPosition, 80, 40);
                            yPosition += 45;
                        } catch(e) {
                            console.log('Could not add image to PDF');
                        }
                    }
                    break;
            }
        });
        
        doc.save((this.currentDoc.name || 'document') + '.pdf');
        btn.classList.remove('loading');
        this.showToast('PDF exported successfully with formatting! Check your downloads!', 'success');
    }
    
    undo() {
        if (!this.currentDoc.history) return;
        if (this.currentDoc.historyIndex > 0) {
            this.currentDoc.historyIndex--;
            const prevContent = this.currentDoc.history[this.currentDoc.historyIndex];
            this.editor.innerHTML = prevContent;
            this.currentDoc.content = prevContent;
            this.updateWordCount();
            this.updateStatusBar();
            this.updateSaveStatus('Unsaved changes...');
        } else {
            this.showToast('No more undo steps', 'warning');
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
            this.updateSaveStatus('Unsaved changes...');
        } else {
            this.showToast('No more redo steps', 'warning');
        }
    }
    
    toggleSpellCheck() {
        this.spellCheckEnabled = !this.spellCheckEnabled;
        this.editor.spellcheck = this.spellCheckEnabled;
        
        const btn = document.getElementById('spellCheckBtn');
        if (this.spellCheckEnabled) {
            btn.classList.add('active');
            this.showToast('Spell check enabled', 'success');
        } else {
            btn.classList.remove('active');
            this.showToast('Spell check disabled', 'success');
        }
    }
    
    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('collapsed');
        const btn = document.getElementById('toggleSidebarBtn');
        btn.classList.toggle('active');
    }
    
    switchSidebarTab(tabName) {
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });
        
        document.querySelectorAll('.sidebar-tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.dataset.tab === tabName) {
                content.classList.add('active');
            }
        });
    }
    
    setPageSize(size) {
        this.page.className = 'page ' + size;
    }
    
    setPageOrientation(orientation) {
        if (orientation === 'landscape') {
            this.page.style.transform = 'rotate(90deg)';
            this.page.style.margin = '50px auto';
        } else {
            this.page.style.transform = 'none';
            this.page.style.margin = '20px auto';
        }
    }
    
    applyStyle(style) {
        switch(style) {
            case 'heading1':
                this.executeCommand('formatBlock', '<h1>');
                break;
            case 'heading2':
                this.executeCommand('formatBlock', '<h2>');
                break;
            case 'heading3':
                this.executeCommand('formatBlock', '<h3>');
                break;
            case 'normal':
                this.executeCommand('formatBlock', '<p>');
                break;
        }
        this.saveDocumentState();
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
        document.getElementById('zoomPercent').textContent = `${this.zoomLevel}%`;
    }
    
    updateWordCount() {
        const text = this.editor.innerText || this.editor.textContent;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, '').length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length;
        const readingTime = Math.max(1, Math.ceil(words / 200)); // Average reading speed
        
        // Update basic stats
        document.getElementById('wordCount').textContent = words;
        document.getElementById('charCount').textContent = characters;
        document.getElementById('readingTime').textContent = readingTime;
        
        // Add hover tooltip with more details
        const wordCountElement = document.getElementById('wordCount');
        wordCountElement.title = `
            Characters (no spaces): ${charactersNoSpaces}
            Sentences: ${sentences}
            Paragraphs: ${paragraphs}
        `;
    }
    
    updateStatusBar() {
        const fontFamily = document.getElementById('fontFamily').value;
        const fontSize = document.getElementById('fontSize').value;
        document.getElementById('currentFont').textContent = `${fontFamily}, ${fontSize}`;
    }
    
    updateSaveStatus(status) {
        const statusElement = document.getElementById('saveStatus');
        const spinnerElement = document.getElementById('autosaveSpinner');
        const statusContainer = statusElement.parentElement;
        
        // Remove all status classes
        statusContainer.classList.remove('autosave-indicator', 'saving', 'saved', 'error');
        
        statusElement.textContent = status;
        
        if (status === 'Auto-saved') {
            statusContainer.classList.add('autosave-indicator', 'saved');
            spinnerElement.style.display = 'none';
        } else if (status === 'Saving...' || status.includes('OneDrive')) {
            statusContainer.classList.add('autosave-indicator', 'saving');
            spinnerElement.style.display = 'inline-block';
        } else if (status === 'Unsaved changes...') {
            statusContainer.classList.add('autosave-indicator');
            spinnerElement.style.display = 'none';
        } else if (status.includes('failed') || status.includes('error')) {
            statusContainer.classList.add('autosave-indicator', 'error');
            spinnerElement.style.display = 'none';
        }
    }
    
    showHelpModal() {
        document.getElementById('helpModal').classList.add('active');
    }
    
    hideHelpModal() {
        document.getElementById('helpModal').classList.remove('active');
    }
    
    switchHelpTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.help-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });
        
        // Update tab content
        document.querySelectorAll('.help-tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.dataset.tab === tabName) {
                content.classList.add('active');
            }
        });
    }
    
    startEditor() {
        document.getElementById('welcomeScreen').classList.remove('active');
        document.getElementById('editorContainer').style.display = 'flex';
        this.editor.focus();
        this.showToast('Welcome to CharlesWebEditor!', 'success');
    }
    
    showTour() {
        // Make sure editor is open before starting tour
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (welcomeScreen.classList.contains('active')) {
            this.startEditor();
            // Wait a bit for transition to complete
            setTimeout(() => {
                this.startTourNow();
            }, 500);
        } else {
            this.startTourNow();
        }
    }
    
    startTourNow() {
        // Simple tour implementation without external library
        this.currentTourStep = 0;
        this.tourSteps = [
            {
                element: '.toolbar',
                title: 'Formatting Toolbar',
                content: 'Access all formatting options here - bold, italic, fonts, colors, and more.'
            },
            {
                element: '#documentTabs',
                title: 'Document Tabs',
                content: 'Work with multiple documents at once. Click the + button to create a new document.'
            },
            {
                element: '#editor',
                title: 'Editor Area',
                content: 'This is your main editing area. You can type, format text, and create beautiful documents here.'
            },
            {
                element: '#sidebar',
                title: 'Sidebar Panel',
                content: 'Find page layout options, styles, and document history here.'
            },
            {
                element: '.status-bar',
                title: 'Status Bar',
                content: 'View word count, save status, and zoom controls here.'
            }
        ];
        
        this.showTourStep();
    }
    
    showTourStep() {
        if (this.currentTourStep >= this.tourSteps.length) {
            this.endTour();
            return;
        }
        
        const step = this.tourSteps[this.currentTourStep];
        const element = document.querySelector(step.element);
        
        if (element) {
            // Remove previous tour highlights
            document.querySelectorAll('.tour-highlight, .tour-tooltip').forEach(el => el.remove());
            
            // Highlight current element
            element.classList.add('tour-highlight');
            
            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'tour-tooltip';
            tooltip.innerHTML = `
                <div class="tour-tooltip-content">
                    <h3>${step.title}</h3>
                    <p>${step.content}</p>
                    <div class="tour-tooltip-actions">
                        <button class="btn btn-secondary" id="tourSkip">Skip Tour</button>
                        <button class="btn btn-primary" id="tourNext">
                            ${this.currentTourStep === this.tourSteps.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                    <div class="tour-progress">${this.currentTourStep + 1} / ${this.tourSteps.length}</div>
                </div>
            `;
            
            document.body.appendChild(tooltip);
            
            // Position tooltip
            const rect = element.getBoundingClientRect();
            tooltip.style.position = 'fixed';
            tooltip.style.zIndex = '10000';
            
            // Add event listeners
            document.getElementById('tourNext').addEventListener('click', () => {
                this.currentTourStep++;
                this.showTourStep();
            });
            
            document.getElementById('tourSkip').addEventListener('click', () => {
                this.endTour();
            });
            
            // Scroll element into view if needed
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    endTour() {
        document.querySelectorAll('.tour-highlight, .tour-tooltip').forEach(el => el.remove());
        this.showToast('Tour completed! Enjoy using CharlesWebEditor!', 'success');
    }
    
    loadRecentDocuments() {
        const recent = localStorage.getItem('charles_editor_recent_docs');
        this.recentDocuments = recent ? JSON.parse(recent) : [];
    }
    
    saveToRecent(document) {
        const recentDoc = {
            id: document.id,
            name: document.name,
            lastModified: document.lastSave || new Date().toISOString(),
            contentPreview: (document.content || '').replace(/<[^>]*>/g, '').substring(0, 100)
        };
        
        // Remove if already exists
        this.recentDocuments = this.recentDocuments.filter(doc => doc.id !== document.id);
        
        // Add to beginning
        this.recentDocuments.unshift(recentDoc);
        
        // Keep only last 10
        this.recentDocuments = this.recentDocuments.slice(0, 10);
        
        // Save to localStorage
        localStorage.setItem('charles_editor_recent_docs', JSON.stringify(this.recentDocuments));
        
        this.updateRecentDocumentsList();
    }
    
    updateRecentDocumentsList() {
        const recentList = document.getElementById('recentList');
        
        if (this.recentDocuments.length === 0) {
            recentList.innerHTML = '<div class="empty-recent">No recent documents</div>';
            return;
        }
        
        recentList.innerHTML = this.recentDocuments.map(doc => {
            const date = new Date(doc.lastModified);
            const timeAgo = this.getTimeAgo(date);
            
            return `
                <div class="recent-item" data-doc-id="${doc.id}">
                    <div class="recent-item-info">
                        <div class="recent-item-name">${doc.name}</div>
                        <div class="recent-item-meta">${timeAgo} • ${doc.contentPreview}...</div>
                    </div>
                    <button class="recent-item-action" onclick="window.charliesEditor.openRecentDocument('${doc.id}')">
                        Open
                    </button>
                </div>
            `;
        }).join('');
    }
    
    openRecentDocument(docId) {
        // Find document in recent list
        const recentDoc = this.recentDocuments.find(doc => doc.id === docId);
        if (!recentDoc) return;
        
        // Check if document exists in current session
        if (!this.documents[docId]) {
            // Recreate document from recent data
            this.documents[docId] = {
                id: docId,
                name: recentDoc.name,
                content: localStorage.getItem(`charles_editor_doc_${docId}`) || '<p>Document content not available</p>',
                history: [],
                historyIndex: -1,
                lastSave: recentDoc.lastModified
            };
            
            // Create tab
            const tab = document.createElement('div');
            tab.className = 'tab';
            tab.dataset.docId = docId;
            tab.innerHTML = `
                <i class="fas fa-file-alt"></i>
                <span>${recentDoc.name}</span>
                <span class="tab-close"><i class="fas fa-times"></i></span>
            `;
            
            document.getElementById('documentTabs').appendChild(tab);
        }
        
        this.switchDocument(docId);
        this.showToast(`Opened "${recentDoc.name}"`, 'success');
    }
    
    clearRecentDocuments() {
        if (confirm('Are you sure you want to clear all recent documents?')) {
            this.recentDocuments = [];
            localStorage.removeItem('charles_editor_recent_docs');
            this.updateRecentDocumentsList();
            this.showToast('Recent documents cleared', 'success');
        }
    }
    
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        
        return date.toLocaleDateString();
    }
    
    showTabContextMenu(tab, x, y) {
        this.contextMenuTab = tab;
        this.contextMenuDocId = tab.dataset.docId;
        
        // Create context menu if it doesn't exist
        let contextMenu = document.getElementById('tabContextMenu');
        if (!contextMenu) {
            contextMenu = document.createElement('div');
            contextMenu.id = 'tabContextMenu';
            contextMenu.className = 'context-menu';
            contextMenu.innerHTML = `
                <button class="context-menu-item" onclick="window.charliesEditor.showRenameModal()">
                    <i class="fas fa-edit"></i> Rename
                </button>
                <button class="context-menu-item" onclick="window.charliesEditor.duplicateDocument()">
                    <i class="fas fa-copy"></i> Duplicate
                </button>
                <button class="context-menu-item" onclick="window.charliesEditor.closeDocumentFromMenu()">
                    <i class="fas fa-times"></i> Close
                </button>
            `;
            document.body.appendChild(contextMenu);
        }
        
        // Position and show menu
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.style.display = 'block';
    }
    
    hideTabContextMenu() {
        const contextMenu = document.getElementById('tabContextMenu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
    }
    
    showRenameModal() {
        const doc = this.documents[this.contextMenuDocId];
        if (!doc) return;
        
        document.getElementById('renameInput').value = doc.name;
        document.getElementById('renameModal').classList.add('active');
        document.getElementById('renameInput').focus();
        document.getElementById('renameInput').select();
        
        this.hideTabContextMenu();
    }
    
    hideRenameModal() {
        document.getElementById('renameModal').classList.remove('active');
    }
    
    confirmRename() {
        const newName = document.getElementById('renameInput').value.trim();
        
        if (!newName) {
            this.showToast('Please enter a document name', 'error');
            return;
        }
        
        const doc = this.documents[this.contextMenuDocId];
        if (!doc) return;
        
        // Update document name
        doc.name = newName;
        
        // Update tab display
        const tab = document.querySelector(`.tab[data-doc-id="${this.contextMenuDocId}"]`);
        if (tab) {
            tab.querySelector('span').textContent = newName;
        }
        
        // Save to localStorage
        localStorage.setItem(`charles_editor_doc_${this.contextMenuDocId}_name`, newName);
        
        // Update recent documents if exists
        const recentIndex = this.recentDocuments.findIndex(d => d.id === this.contextMenuDocId);
        if (recentIndex !== -1) {
            this.recentDocuments[recentIndex].name = newName;
            localStorage.setItem('charles_editor_recent_docs', JSON.stringify(this.recentDocuments));
            this.updateRecentDocumentsList();
        }
        
        this.hideRenameModal();
        this.showToast(`Document renamed to "${newName}"`, 'success');
    }
    
    duplicateDocument() {
        const originalDoc = this.documents[this.contextMenuDocId];
        if (!originalDoc) return;
        
        const newDocId = 'doc' + Date.now();
        const newDocName = originalDoc.name + ' (Copy)';
        
        this.documents[newDocId] = {
            id: newDocId,
            name: newDocName,
            content: originalDoc.content,
            history: [...(originalDoc.history || [])],
            historyIndex: originalDoc.historyIndex || 0,
            lastSave: new Date()
        };
        
        // Create tab
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.docId = newDocId;
        tab.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <span>${newDocName}</span>
            <span class="tab-close"><i class="fas fa-times"></i></span>
        `;
        
        document.getElementById('documentTabs').appendChild(tab);
        
        this.hideTabContextMenu();
        this.switchDocument(newDocId);
        this.showToast(`Document duplicated as "${newDocName}"`, 'success');
    }
    
    closeDocumentFromMenu() {
        this.closeDocument(this.contextMenuDocId);
        this.hideTabContextMenu();
    }
    
    updateTemplatesList() {
        const templatesList = document.getElementById('templatesList');
        
        templatesList.innerHTML = `
            <div class="template-grid">
                ${this.templates.map(template => `
                    <div class="template-item" onclick="window.charliesEditor.applyTemplate('${template.id}')">
                        <div class="template-icon">
                            <i class="${template.icon}"></i>
                        </div>
                        <div class="template-name">${template.name}</div>
                        <div class="template-description">${template.description}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    applyTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;
        
        // Create new document with template content
        const docId = 'doc' + Date.now();
        const docName = template.name;
        
        this.documents[docId] = {
            id: docId,
            name: docName,
            content: template.content,
            history: [template.content],
            historyIndex: 0,
            lastSave: new Date()
        };
        
        // Create tab
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.docId = docId;
        tab.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <span>${docName}</span>
            <span class="tab-close"><i class="fas fa-times"></i></span>
        `;
        
        document.getElementById('documentTabs').appendChild(tab);
        
        // Switch to the new document
        this.switchDocument(docId);
        
        this.showToast(`Template "${template.name}" applied`, 'success');
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        // Save preference
        localStorage.setItem('editor_theme', theme);
        
        // Update editor page background for better visibility
        const editorPage = document.getElementById('page');
        if (editorPage) {
            if (theme === 'dark') {
                editorPage.style.background = '#1e293b';
                editorPage.style.color = '#f8fafc';
            } else {
                editorPage.style.background = 'white';
                editorPage.style.color = 'black';
            }
        }
        
        this.showToast(`Switched to ${theme} mode`, 'success');
    }
    
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the editor
document.addEventListener('DOMContentLoaded', () => {
    const editor = new CharlesWebEditor();
    window.charliesEditor = editor;
    
    // Welcome screen auto-dismiss after 2 seconds
    setTimeout(() => {
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (welcomeScreen.classList.contains('active')) {
            document.getElementById('startEditorBtn').click();
        }
    }, 2000);
});
