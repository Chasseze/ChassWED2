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

    // Templates
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

    // New feature buttons (AI, Templates, Advanced Formatting, Email Share)
    const aiAssistantBtn = document.getElementById("aiAssistantBtn");
    if (aiAssistantBtn) {
      aiAssistantBtn.addEventListener("click", () => {
        this.showToast("🤖 AI Assistant feature coming soon!", "info");
      });
    }

    const templatesBtn = document.getElementById("templatesBtn");
    if (templatesBtn) {
      templatesBtn.addEventListener("click", () => {
        this.showToast("📄 Document Templates feature coming soon!", "info");
      });
    }

    const advancedFormattingBtn = document.getElementById(
      "advancedFormattingBtn",
    );
    if (advancedFormattingBtn) {
      advancedFormattingBtn.addEventListener("click", () => {
        this.showToast("✨ Advanced Formatting feature coming soon!", "info");
      });
    }

    const emailShareBtn = document.getElementById("emailShareBtn");
    if (emailShareBtn) {
      emailShareBtn.addEventListener("click", () => {
        this.showToast("📧 Email Sharing feature coming soon!", "info");
      });
    }

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
                    <button class="recent-item-action" onclick="window.charliesEditor.openRecentDocument('${doc.id}')">
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
                    <div class="template-item" onclick="window.charliesEditor.applyTemplate('${template.id}')">
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
                <button class="context-menu-item" onclick="window.charliesEditor.renameCurrentDocument()">
                    <i class="fas fa-edit"></i> Rename
                </button>
                <button class="context-menu-item" onclick="window.charliesEditor.duplicateCurrentDocument()">
                    <i class="fas fa-copy"></i> Duplicate
                </button>
                <button class="context-menu-item" onclick="window.charliesEditor.closeCurrentDocument()">
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
